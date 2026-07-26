import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { sendEmail, getDecisionEmailTemplate } from '@/lib/email';
import { createLogger } from '@/lib/logger';

const logger = createLogger('EditorialDecisions');

const ALLOWED_ROLES = ['EDITOR', 'EDITOR_IN_CHIEF', 'DEPUTY_EDITOR_IN_CHIEF', 'ASSOCIATE_EDITOR', 'ADMIN'];

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !ALLOWED_ROLES.includes(session.user.role)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { manuscriptId, decision, notes, notesToAuthor } = body;

    if (!manuscriptId || !decision) {
      return NextResponse.json({ error: 'Missing required fields: manuscriptId, decision' }, { status: 400 });
    }

    const validDecisions = ['ACCEPT', 'MINOR_REVISION', 'MAJOR_REVISION', 'REJECT'];
    if (!validDecisions.includes(decision)) {
      return NextResponse.json({ error: `Invalid decision. Must be one of: ${validDecisions.join(', ')}` }, { status: 400 });
    }

    const manuscript = await prisma.manuscript.findUnique({
      where: { id: manuscriptId },
      include: {
        correspondingAuthor: { select: { id: true, firstName: true, lastName: true, email: true } },
      },
    });

    if (!manuscript) {
      return NextResponse.json({ error: 'Manuscript not found' }, { status: 404 });
    }

    const statusMap: Record<string, string> = {
      ACCEPT: 'ACCEPTED',
      MINOR_REVISION: 'UNDER_REVISION',
      MAJOR_REVISION: 'UNDER_REVISION',
      REJECT: 'REJECTED',
    };

    const [editorialDecision] = await prisma.$transaction([
      prisma.editorialDecision.create({
        data: {
          manuscriptId,
          editorId: session.user.id,
          decision,
          notes: notes || null,
          notesToAuthor: notesToAuthor || null,
        },
      }),
      prisma.manuscript.update({
        where: { id: manuscriptId },
        data: { status: statusMap[decision] as 'ACCEPTED' | 'UNDER_REVISION' | 'REJECTED' },
      }),
    ]);

    try {
      const emailTemplate = getDecisionEmailTemplate(
        decision,
        manuscript.id,
        manuscript.title,
        manuscript.correspondingAuthor.firstName,
        notesToAuthor
      );
      await sendEmail({
        to: manuscript.correspondingAuthor.email,
        subject: emailTemplate.subject,
        html: emailTemplate.html,
      });
    } catch (emailError) {
      logger.error('Failed to send decision email', emailError);
    }

    try {
      await prisma.notification.create({
        data: {
          userId: manuscript.correspondingAuthorId,
          type: 'MANUSCRIPT_DECISION',
          title: 'Manuscript Decision',
          message: `A decision has been made on your manuscript "${manuscript.title}". Decision: ${decision.replace('_', ' ')}.`,
          data: JSON.stringify({ manuscriptId, decision }),
        },
      });
    } catch (notifError) {
      logger.error('Failed to create notification', notifError);
    }

    return NextResponse.json(editorialDecision, { status: 201 });
  } catch (error) {
    logger.error('Error recording decision', error);
    return NextResponse.json({ error: 'Failed to record decision' }, { status: 500 });
  }
}
