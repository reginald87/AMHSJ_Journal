import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { sendEmail, getDecisionEmailTemplate, getEditorAssignedEmailTemplate, getEditorAssignmentNoticeEmailTemplate } from '@/lib/email';
import { resolveAssignedEditor, type AssignableEditor } from '@/lib/editor-assignment';
import { getManuscriptRecipients, notifyManuscriptAuthors } from '@/lib/manuscript-notify';
import { createLogger } from '@/lib/logger';

const logger = createLogger('AdminManuscript');

const MANAGER_ROLES = ['ADMIN', 'EDITOR_ASSISTANT'];

const DECISION_BY_STATUS: Record<string, 'ACCEPT' | 'MINOR_REVISION' | 'MAJOR_REVISION' | 'REJECT'> = {
  ACCEPTED: 'ACCEPT',
  REJECTED: 'REJECT',
  UNDER_REVISION: 'MAJOR_REVISION',
};

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !MANAGER_ROLES.includes(session.user.role)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    const manuscript = await prisma.manuscript.findUnique({
      where: { id },
      include: {
        correspondingAuthor: { select: { id: true, firstName: true, lastName: true, email: true } },
        authors: { select: { firstName: true, lastName: true, email: true } },
        assignedEditor: { select: { id: true, firstName: true, lastName: true } },
        files: { select: { id: true, fileName: true, fileUrl: true, fileSize: true, mimeType: true, fileType: true, isPrimary: true, version: true } },
        reviews: { include: { reviewer: { select: { firstName: true, lastName: true } } } },
      },
    });

    if (!manuscript) {
      return NextResponse.json({ error: 'Manuscript not found' }, { status: 404 });
    }

    return NextResponse.json(manuscript);
  } catch (error) {
    logger.error('Error fetching manuscript', error);
    return NextResponse.json({ error: 'Failed to fetch manuscript' }, { status: 500 });
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !MANAGER_ROLES.includes(session.user.role)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    const body = await request.json();
    const { status, assignedEditorId, title, abstract, keywords, coverLetter, notesToAuthor } = body;

    const current = await prisma.manuscript.findUnique({
      where: { id },
      select: {
        status: true,
        assignedEditorId: true,
        title: true,
        correspondingAuthor: { select: { id: true, firstName: true, lastName: true, email: true } },
      },
    });
    if (!current) {
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
    if (title !== undefined) updateData.title = title;
    if (abstract !== undefined) updateData.abstract = abstract;
    if (keywords !== undefined) updateData.keywords = typeof keywords === 'string' ? keywords : JSON.stringify(keywords);
    if (coverLetter !== undefined) updateData.coverLetter = coverLetter;

    if (Object.keys(updateData).length === 0) {
      return NextResponse.json({ error: 'No fields to update' }, { status: 400 });
    }

    const statusChanged = Boolean(status) && status !== current.status;
    const editorChanged = assignedEditor !== null && assignedEditor.id !== current.assignedEditorId;

    const manuscript = await prisma.$transaction(async (tx) => {
      const updated = await tx.manuscript.update({
        where: { id },
        data: updateData,
        select: { id: true, title: true, status: true, assignedEditorId: true, abstract: true, keywords: true, coverLetter: true },
      });

      if (statusChanged) {
        if (current.status === 'PUBLISHED' && status !== 'PUBLISHED') {
          await tx.article.updateMany({
            where: { manuscriptId: id },
            data: { isPublished: false, publishedAt: null },
          });
        }
      }

      return updated;
    });

    if (editorChanged && assignedEditor) {
      await notifyEditorAssigned({
        manuscriptId: id,
        manuscriptTitle: manuscript.title,
        authorName: `${current.correspondingAuthor.firstName} ${current.correspondingAuthor.lastName}`,
        editorFirstName: assignedEditor.firstName,
        editorName: `${assignedEditor.firstName} ${assignedEditor.lastName}`,
        editorEmail: assignedEditor.email,
      });
    }

    if (statusChanged) {
      await notifyDecision({
        manuscriptId: id,
        manuscriptTitle: manuscript.title,
        decision: DECISION_BY_STATUS[status] || 'MINOR_REVISION',
        status,
        notesToAuthor,
      });
    }

    return NextResponse.json(manuscript);
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

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !MANAGER_ROLES.includes(session.user.role)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;

    const manuscript = await prisma.manuscript.findUnique({
      where: { id },
      select: { id: true, status: true },
    });

    if (!manuscript) {
      return NextResponse.json({ error: 'Manuscript not found' }, { status: 404 });
    }

    if (manuscript.status === 'PUBLISHED') {
      return NextResponse.json({ error: 'Cannot delete a published manuscript. Unpublish it first.' }, { status: 400 });
    }

    await prisma.$transaction(async (tx) => {
      await tx.review.deleteMany({ where: { manuscriptId: id } });
      await tx.reviewInvitation.deleteMany({ where: { manuscriptId: id } });
      await tx.editorialDecision.deleteMany({ where: { manuscriptId: id } });
      await tx.editorialNote.deleteMany({ where: { manuscriptId: id } });
      await tx.manuscriptVersion.deleteMany({ where: { manuscriptId: id } });
      await tx.manuscriptFile.deleteMany({ where: { manuscriptId: id } });
      await tx.manuscriptAuthor.deleteMany({ where: { manuscriptId: id } });
      await tx.manuscript.delete({ where: { id } });
    });

    return NextResponse.json({ message: 'Manuscript deleted' });
  } catch (error) {
    logger.error('Error deleting manuscript', error);
    return NextResponse.json({ error: 'Failed to delete manuscript' }, { status: 500 });
  }
}
