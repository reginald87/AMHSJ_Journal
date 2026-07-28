import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { createLogger } from '@/lib/logger';

const logger = createLogger('AdminSettings');

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const journal = await prisma.journal.findFirst({
      where: { isActive: true },
      include: { settings: true },
    });

    if (!journal) {
      return NextResponse.json({ error: 'No active journal found' }, { status: 404 });
    }

    return NextResponse.json({
      journalName: journal.name,
      shortName: journal.shortName,
      issnPrint: journal.issnPrint ?? '',
      issnOnline: journal.issnOnline ?? '',
      doiPrefix: journal.doiPrefix ?? '',
      description: journal.description ?? '',
      scope: journal.scope ?? '',
      aims: journal.aims ?? '',
      website: journal.website ?? '',
      email: journal.email,
      logo: journal.logo ?? '',
      coverImage: journal.coverImage ?? '',
      submissionOpen: journal.settings?.submissionOpen ?? true,
      requireCoverLetter: journal.settings?.requireCoverLetter ?? true,
      requireEthicsApproval: journal.settings?.requireEthicsApproval ?? true,
      reviewType: journal.settings?.reviewType ?? 'DOUBLE_BLIND',
      reviewDeadlineDays: journal.settings?.reviewDeadlineDays ?? 21,
      maxReviewers: journal.settings?.maxReviewers ?? 3,
      enableORCID: journal.settings?.enableORCID ?? true,
      referenceStyle: journal.settings?.referenceStyle ?? 'VANCOUVER',
      manuscriptTemplate: journal.settings?.manuscriptTemplate ?? '',
    });
  } catch (error) {
    logger.error('Error fetching settings', error);
    return NextResponse.json({ error: 'Failed to fetch settings' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const journal = await prisma.journal.findFirst({
      where: { isActive: true },
    });

    if (!journal) {
      return NextResponse.json({ error: 'No active journal found' }, { status: 404 });
    }

    await prisma.journal.update({
      where: { id: journal.id },
      data: {
        name: body.journalName,
        shortName: body.shortName,
        issnPrint: body.issnPrint || null,
        issnOnline: body.issnOnline || null,
        doiPrefix: body.doiPrefix || null,
        description: body.description || null,
        scope: body.scope || null,
        aims: body.aims || null,
        website: body.website || null,
        email: body.email,
        logo: body.logo || null,
        coverImage: body.coverImage || null,
      },
    });

    await prisma.journalSetting.upsert({
      where: { journalId: journal.id },
      create: {
        journalId: journal.id,
        submissionOpen: body.submissionOpen ?? true,
        requireCoverLetter: body.requireCoverLetter ?? true,
        requireEthicsApproval: body.requireEthicsApproval ?? true,
        reviewType: body.reviewType ?? 'DOUBLE_BLIND',
        reviewDeadlineDays: body.reviewDeadlineDays ?? 21,
        maxReviewers: body.maxReviewers ?? 3,
        enableORCID: body.enableORCID ?? true,
        referenceStyle: body.referenceStyle ?? 'VANCOUVER',
        manuscriptTemplate: body.manuscriptTemplate ?? null,
      },
      update: {
        submissionOpen: body.submissionOpen ?? true,
        requireCoverLetter: body.requireCoverLetter ?? true,
        requireEthicsApproval: body.requireEthicsApproval ?? true,
        reviewType: body.reviewType ?? 'DOUBLE_BLIND',
        reviewDeadlineDays: body.reviewDeadlineDays ?? 21,
        maxReviewers: body.maxReviewers ?? 3,
        enableORCID: body.enableORCID ?? true,
        referenceStyle: body.referenceStyle ?? 'VANCOUVER',
        manuscriptTemplate: body.manuscriptTemplate ?? null,
      },
    });

    return NextResponse.json({ message: 'Settings saved successfully' });
  } catch (error) {
    logger.error('Error saving settings', error);
    return NextResponse.json({ error: 'Failed to save settings' }, { status: 500 });
  }
}
