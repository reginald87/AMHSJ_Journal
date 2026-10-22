import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { sendEmail, getDecisionEmailTemplate, getEditorAssignedEmailTemplate, getEditorAssignmentNoticeEmailTemplate } from '@/lib/email';
import { resolveAssignedEditor, type AssignableEditor } from '@/lib/editor-assignment';
import { getManuscriptRecipients, notifyManuscriptAuthors } from '@/lib/manuscript-notify';
import { createLogger } from '@/lib/logger';

const logger = createLogger('EditorialManuscript');

const ALLOWED_ROLES = ['EDITOR', 'EDITOR_IN_CHIEF', 'DEPUTY_EDITOR_IN_CHIEF', 'ASSOCIATE_EDITOR', 'ADMIN'];

const DECISION_BY_STATUS: Record<string, 'ACCEPT' | 'MINOR_REVISION' | 'MAJOR_REVISION' | 'REJECT'> = {
  ACCEPTED: 'ACCEPT',
  REJECTED: 'REJECT',
  UNDER_REVISION: 'MAJOR_REVISION',
};

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !ALLOWED_ROLES.includes(session.user.role)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    const body = await request.json();
    const { status, assignedEditorId, notesToAuthor } = body;

    const manuscript = await prisma.manuscript.findUnique({
      where: { id },
      include: {
        correspondingAuthor: { select: { id: true, firstName: true, lastName: true, email: true } },
      },
    });

    if (!manuscript) {
      return NextResponse.json({ error: 'Manuscript not found' }, { status: 404 });
    }

    let assignedEditor: AssignableEditor | null = null;

    if (assignedEditorId !== undefined && assignedEditorId !== null && assignedEditorId !== '') {
      const resolved = await resolveAssignedEditor(assignedEditorId);
      if (!resolved.ok) {
        return NextResponse.json({ error: resolved.error }, { status: 400 });
      }
      assignedEditor = resolved.editor;
    }

    const updateData: Record<string, unknown> = {};
    if (status) updateData.status = status;
    if (assignedEditorId !== undefined) {
      updateData.assignedEditorId = assignedEditorId || null;
    }

    const statusChanged = Boolean(status) && status !== manuscript.status;
    const editorChanged = assignedEditor !== null && assignedEditor.id !== manuscript.assignedEditorId;

    const updatedManuscript = await prisma.$transaction(async (tx) => {
      const updated = await tx.manuscript.update({
        where: { id },
        data: updateData,
        select: { id: true, title: true, status: true, assignedEditorId: true },
      });

      if (statusChanged) {
        if (manuscript.status === 'PUBLISHED' && status !== 'PUBLISHED') {
          await tx.article.updateMany({
            where: { manuscriptId: id },
            data: { isPublished: false, publishedAt: null },
          });
        }

        const decisionValue = DECISION_BY_STATUS[status] || 'MINOR_REVISION';

        await tx.editorialDecision.create({
          data: {
            manuscriptId: id,
            editorId: session.user.id,
            decision: decisionValue,
            notesToAuthor: notesToAuthor || null,
          },
        });
      }

      return updated;
    });

    if (editorChanged && assignedEditor) {
      await notifyEditorAssigned({
        manuscriptId: id,
        manuscriptTitle: manuscript.title,
        authorName: `${manuscript.correspondingAuthor.firstName} ${manuscript.correspondingAuthor.lastName}`,
        editorFirstName: assignedEditor.firstName,
        editorName: `${assignedEditor.firstName} ${assignedEditor.lastName}`,
        editorEmail: assignedEditor.email,
      });
    }

    if (statusChanged) {
      const decisionValue = DECISION_BY_STATUS[status] || 'MINOR_REVISION';

      await notifyDecision({
        manuscriptId: id,
        manuscriptTitle: manuscript.title,
        decision: decisionValue,
        status,
        notesToAuthor,
      });
    }

    return NextResponse.json(updatedManuscript);
  } catch (error) {
    logger.error('Error updating manuscript', error);
    return NextResponse.json({ error: 'Failed to update manuscript' }, { status: 500 });
  }
}

async function notifyEditorAssigned({
  manuscriptId,
  manuscriptTitle,
  authorName,
  editorFirstName,
  editorName,
  editorEmail,
}: {
  manuscriptId: string;
  manuscriptTitle: string;
  authorName: string;
  editorFirstName: string;
  editorName: string;
  editorEmail: string;
}) {
  try {
    const recipients = await getManuscriptRecipients(manuscriptId);

    await notifyManuscriptAuthors({
      recipients,
      type: 'MANUSCRIPT_EDITOR_ASSIGNED',
      title: 'Editor Assigned',
      message: `An editor (${editorName}) has been assigned to your manuscript "${manuscriptTitle}".`,
      data: { manuscriptId, editorName },
      email: (recipient) =>
        getEditorAssignedEmailTemplate(manuscriptId, manuscriptTitle, recipient.firstName, editorName),
    });

    try {
      const template = getEditorAssignmentNoticeEmailTemplate(
        manuscriptId,
        manuscriptTitle,
        editorFirstName,
        authorName
      );
      await sendEmail({
        to: editorEmail,
        subject: template.subject,
        html: template.html,
      });
    } catch (emailError) {
      logger.error('Failed to send editor assignment email', emailError);
    }
  } catch (error) {
    logger.error('Failed to notify editor assignment', error);
  }
}

async function notifyDecision({
  manuscriptId,
  manuscriptTitle,
  decision,
  status,
  notesToAuthor,
}: {
  manuscriptId: string;
  manuscriptTitle: string;
  decision: 'ACCEPT' | 'MINOR_REVISION' | 'MAJOR_REVISION' | 'REJECT';
  status: string;
  notesToAuthor?: string;
}) {
  try {
    const recipients = await getManuscriptRecipients(manuscriptId);

    await notifyManuscriptAuthors({
      recipients,
      type: 'MANUSCRIPT_DECISION',
      title: decision === 'ACCEPT' ? 'Manuscript Accepted' : 'Manuscript Decision',
      message: `A decision has been made on your manuscript "${manuscriptTitle}". Status: ${status}.`,
      data: { manuscriptId, decision: status },
      email: (recipient) =>
        getDecisionEmailTemplate(decision, manuscriptId, manuscriptTitle, recipient.firstName, notesToAuthor),
    });
  } catch (error) {
    logger.error('Failed to notify decision', error);
  }
}
