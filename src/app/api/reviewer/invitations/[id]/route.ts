import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { createLogger } from '@/lib/logger';

const logger = createLogger('ReviewerInvitation');

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    const body = await request.json();
    const { action, response: responseText } = body;

    if (!action || !['accept', 'decline'].includes(action)) {
      return NextResponse.json({ error: 'Invalid action. Must be "accept" or "decline".' }, { status: 400 });
    }

    const invitation = await prisma.reviewInvitation.findUnique({
      where: { id },
      include: {
        manuscript: { select: { id: true, title: true } },
      },
    });

    if (!invitation) {
      return NextResponse.json({ error: 'Invitation not found' }, { status: 404 });
    }

    if (invitation.reviewerId !== session.user.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    if (invitation.status !== 'PENDING') {
      return NextResponse.json({ error: 'Invitation has already been responded to' }, { status: 400 });
    }

    const newStatus = action === 'accept' ? 'ACCEPTED' : 'DECLINED';

    const result = await prisma.$transaction(async (tx) => {
      const updatedInvitation = await tx.reviewInvitation.update({
        where: { id },
        data: {
          status: newStatus,
          response: responseText || null,
          respondedAt: new Date(),
        },
      });

      let review = null;
      if (action === 'accept') {
        review = await tx.review.create({
          data: {
            manuscriptId: invitation.manuscriptId,
            reviewerId: session.user.id,
            invitationId: invitation.id,
            round: invitation.round,
            status: 'PENDING',
            dueDate: invitation.dueDate,
          },
        });
      }

      return { invitation: updatedInvitation, review };
    });

    try {
      const manuscript = await prisma.manuscript.findUnique({
        where: { id: invitation.manuscriptId },
        select: { assignedEditorId: true },
      });

      if (manuscript?.assignedEditorId) {
        const reviewer = await prisma.user.findUnique({
          where: { id: session.user.id },
          select: { firstName: true, lastName: true },
        });

        await prisma.notification.create({
          data: {
            userId: manuscript.assignedEditorId,
            type: 'REVIEW_INVITATION_RESPONSE',
            title: 'Review Invitation Response',
            message: `${reviewer?.firstName} ${reviewer?.lastName} has ${newStatus.toLowerCase()} the review invitation for "${invitation.manuscript.title}".`,
            data: JSON.stringify({ manuscriptId: invitation.manuscriptId, invitationId: id, action: newStatus }),
          },
        });
      }
    } catch (notifError) {
      logger.error('Failed to create notification', notifError);
    }

    return NextResponse.json(result);
  } catch (error) {
    logger.error('Error responding to invitation', error);
    return NextResponse.json({ error: 'Failed to respond to invitation' }, { status: 500 });
  }
}
