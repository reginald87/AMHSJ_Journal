import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { createLogger } from '@/lib/logger';

const logger = createLogger('ReviewerReviews');

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
    const {
      decision,
      originality,
      methodology,
      significance,
      clarity,
      commentsToEditor,
      commentsToAuthor,
      confidentialNotes,
    } = body;

    const review = await prisma.review.findUnique({
      where: { id },
      include: {
        manuscript: { select: { id: true, title: true, assignedEditorId: true } },
      },
    });

    if (!review) {
      return NextResponse.json({ error: 'Review not found' }, { status: 404 });
    }

    if (review.reviewerId !== session.user.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    if (review.status === 'COMPLETED') {
      return NextResponse.json({ error: 'Review has already been submitted' }, { status: 400 });
    }

    const updateData: Record<string, unknown> = {
      status: 'COMPLETED',
      submittedAt: new Date(),
    };

    if (decision) updateData.decision = decision;
    if (originality !== undefined) updateData.originality = originality;
    if (methodology !== undefined) updateData.methodology = methodology;
    if (significance !== undefined) updateData.significance = significance;
    if (clarity !== undefined) updateData.clarity = clarity;
    if (commentsToEditor !== undefined) updateData.commentsToEditor = commentsToEditor;
    if (commentsToAuthor !== undefined) updateData.commentsToAuthor = commentsToAuthor;
    if (confidentialNotes !== undefined) updateData.confidentialNotes = confidentialNotes;

    const updatedReview = await prisma.review.update({
      where: { id },
      data: updateData,
    });

    try {
      if (review.manuscript.assignedEditorId) {
        const reviewer = await prisma.user.findUnique({
          where: { id: session.user.id },
          select: { firstName: true, lastName: true },
        });

        await prisma.notification.create({
          data: {
            userId: review.manuscript.assignedEditorId,
            type: 'REVIEW_SUBMITTED',
            title: 'Review Submitted',
            message: `${reviewer?.firstName} ${reviewer?.lastName} has submitted a review for "${review.manuscript.title}".`,
            data: JSON.stringify({ manuscriptId: review.manuscriptId, reviewId: id }),
          },
        });
      }
    } catch (notifError) {
      logger.error('Failed to create notification', notifError);
    }

    return NextResponse.json(updatedReview);
  } catch (error) {
    logger.error('Error submitting review', error);
    return NextResponse.json({ error: 'Failed to submit review' }, { status: 500 });
  }
}
