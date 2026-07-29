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

    const [articleCount, publishedManuscripts, authorCount, countryCount, editorialCount] = await Promise.all([
      prisma.article.count({
        where: { isPublished: true, publishedAt: { not: null } },
      }),
      prisma.manuscript.count({
        where: { status: 'PUBLISHED' },
      }),
      prisma.manuscriptAuthor.findMany({
        where: { manuscript: { status: 'PUBLISHED' } },
        select: { email: true },
        distinct: ['email'],
      }),
      prisma.user.findMany({
        where: { country: { not: null } },
        select: { country: true },
        distinct: ['country'],
      }),
      prisma.editorialRole.count({
        where: { isActive: true },
      }),
    ]);

    const savedStats = JSON.parse(journal.homepageStats || '[]') as { value: string; label: string; icon?: string }[];
    const savedImpactStat = savedStats.find(s => s.label === 'Impact Factor');
    const impactValue = savedImpactStat?.value || journal.heroImpactFactor || '2.5';

    const publishedCount = Math.max(articleCount, publishedManuscripts);
    const computedStats = [
      { value: String(publishedCount), label: 'Published Articles', icon: 'FileText' },
      { value: authorCount.length >= 1000 ? `${(authorCount.length / 1000).toFixed(1)}k+` : String(authorCount.length), label: 'Active Authors', icon: 'Users' },
      { value: String(countryCount.length), label: 'Countries Represented', icon: 'Globe' },
      { value: String(editorialCount), label: 'Editorial Board', icon: 'Award' },
    ];

    const mergedStats = [
      ...computedStats,
      ...savedStats.filter(s => !['Published Articles', 'Active Authors', 'Countries Represented', 'Editorial Board'].includes(s.label)),
    ];

    return NextResponse.json({
      heroBadge: journal.heroBadge,
      heroTitle: journal.heroTitle || journal.name,
      heroSubtitle: journal.heroSubtitle || journal.description || '',
      heroISSN: journal.heroISSN,
      heroImpactFactor: impactValue,
      homepageStats: mergedStats,
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