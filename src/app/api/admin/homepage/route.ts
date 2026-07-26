import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { createLogger } from '@/lib/logger';

const logger = createLogger('AdminHomepage');

export async function GET() {
  try {
    const journal = await prisma.journal.findFirst({ where: { isActive: true } });
    if (!journal) return NextResponse.json({ error: 'No journal found' }, { status: 404 });
    
    return NextResponse.json({
      heroBadge: journal.heroBadge,
      heroTitle: journal.heroTitle || journal.name,
      heroSubtitle: journal.heroSubtitle || journal.description || '',
      heroISSN: journal.heroISSN,
      heroImpactFactor: journal.heroImpactFactor,
      homepageStats: JSON.parse(journal.homepageStats || '[]'),
      homepageFeatures: JSON.parse(journal.homepageFeatures || '[]'),
      homepageIndexers: JSON.parse(journal.homepageIndexers || '[]'),
      homepageCtaHeading: journal.homepageCtaHeading,
      homepageCtaText: journal.homepageCtaText,
      heroCarousel: JSON.parse(journal.heroCarousel || '[]'),
    });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch homepage settings' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const journal = await prisma.journal.findFirst({ where: { isActive: true } });
    if (!journal) return NextResponse.json({ error: 'No journal found' }, { status: 404 });

    await prisma.journal.update({
      where: { id: journal.id },
      data: {
        heroBadge: body.heroBadge,
        heroTitle: body.heroTitle,
        heroSubtitle: body.heroSubtitle,
        heroISSN: body.heroISSN,
        heroImpactFactor: body.heroImpactFactor,
        homepageStats: JSON.stringify(body.homepageStats || []),
        homepageFeatures: JSON.stringify(body.homepageFeatures || []),
        homepageIndexers: JSON.stringify(body.homepageIndexers || []),
        homepageCtaHeading: body.homepageCtaHeading,
        homepageCtaText: body.homepageCtaText,
        heroCarousel: JSON.stringify(body.heroCarousel || []),
      },
    });

    return NextResponse.json({ message: 'Homepage settings saved' });
  } catch (error) {
    logger.error('PUT /api/admin/homepage failed', error);
    const message = error instanceof Error ? error.message : 'Failed to save homepage settings';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}