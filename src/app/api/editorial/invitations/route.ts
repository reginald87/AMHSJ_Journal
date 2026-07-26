import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { sendEmail, getReviewInvitationEmailTemplate } from '@/lib/email';
import { createLogger } from '@/lib/logger';

const logger = createLogger('EditorialInvitations');

const ALLOWED_ROLES = ['EDITOR', 'EDITOR_IN_CHIEF', 'DEPUTY_EDITOR_IN_CHIEF', 'ASSOCIATE_EDITOR', 'ADMIN'];

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !ALLOWED_ROLES.includes(session.user.role)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { manuscriptId, reviewerId, message, dueDate } = body;

    if (!manuscriptId || !reviewerId || !dueDate) {
      return NextResponse.json({ error: 'Missing required fields: manuscriptId, reviewerId, dueDate' }, { status: 400 });
    }

    const [manuscript, reviewer] = await Promise.all([
      prisma.manuscript.findUnique({ where: { id: manuscriptId } }),
      prisma.user.findUnique({ where: { id: reviewerId } }),
    ]);

    if (!manuscript) {
      return NextResponse.json({ error: 'Manuscript not found' }, { status: 404 });
    }

    if (!reviewer) {
      return NextResponse.json({ error: 'Reviewer not found' }, { status: 404 });
    }

    const existingInvitation = await prisma.reviewInvitation.findFirst({
      where: {
        manuscriptId,
        reviewerId,
        status: { in: ['PENDING', 'ACCEPTED'] },
      },
    });

    if (existingInvitation) {
      return NextResponse.json({ error: 'Reviewer already invited for this manuscript' }, { status: 409 });
    }

    const invitation = await prisma.reviewInvitation.create({
      data: {
        manuscriptId,
        reviewerId,
        invitedById: session.user.id,
        message: message || null,
        dueDate: new Date(dueDate),
        status: 'PENDING',
      },
    });

    try {
      const emailTemplate = getReviewInvitationEmailTemplate(
        manuscript.id,
        manuscript.title,
        reviewer.firstName,
        new Date(dueDate)
      );
      await sendEmail({
        to: reviewer.email,
        subject: emailTemplate.subject,
        html: emailTemplate.html,
      });
    } catch (emailError) {
      logger.error('Failed to send invitation email', emailError);
    }

    try {
      await prisma.notification.create({
        data: {
          userId: reviewerId,
          type: 'REVIEW_INVITATION',
          title: 'Review Invitation',
          message: `You have been invited to review "${manuscript.title}".`,
          data: JSON.stringify({ manuscriptId, invitationId: invitation.id }),
        },
      });
    } catch (notifError) {
      logger.error('Failed to create notification', notifError);
    }

    return NextResponse.json(invitation, { status: 201 });
  } catch (error) {
    logger.error('Error creating invitation', error);
    return NextResponse.json({ error: 'Failed to create invitation' }, { status: 500 });
  }
}
