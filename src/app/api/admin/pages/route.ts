import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { slugify } from '@/lib/utils';
import { createLogger } from '@/lib/logger';

const logger = createLogger('AdminPages');

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const pages = await prisma.page.findMany({
      orderBy: { updatedAt: 'desc' },
    });

    return NextResponse.json(pages);
  } catch (error) {
    logger.error('Error fetching pages', error);
    return NextResponse.json({ error: 'Failed to fetch pages' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { slug, title, content, sections, isPublished, metaTitle, metaDescription } = body;

    if (!slug || !title) {
      return NextResponse.json({ error: 'Slug and title are required' }, { status: 400 });
    }

    const cleanSlug = slugify(slug);
    const existing = await prisma.page.findUnique({ where: { slug: cleanSlug } });
    if (existing) {
      return NextResponse.json({ error: 'A page with this slug already exists' }, { status: 400 });
    }

    const page = await prisma.page.create({
      data: {
        slug: cleanSlug,
        title,
        content: content ?? '',
        sections: sections !== undefined ? (typeof sections === 'string' ? sections : JSON.stringify(sections)) : undefined,
        isPublished: isPublished ?? true,
        metaTitle,
        metaDescription,
      },
    });

    return NextResponse.json(page, { status: 201 });
  } catch (error) {
    logger.error('Error creating page', error);
    return NextResponse.json({ error: 'Failed to create page' }, { status: 500 });
  }
}