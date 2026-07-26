import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { slugify } from '@/lib/utils';
import { createLogger } from '@/lib/logger';

const logger = createLogger('AdminPage');

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    const page = await prisma.page.findUnique({ where: { id } }) ||
                 await prisma.page.findFirst({ where: { slug: id } });

    if (!page) {
      return NextResponse.json({ error: 'Page not found' }, { status: 404 });
    }

    return NextResponse.json(page);
  } catch (error) {
    logger.error('Error fetching page', error);
    return NextResponse.json({ error: 'Failed to fetch page' }, { status: 500 });
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    const body = await request.json();
    const { slug, title, content, sections, isPublished, metaTitle, metaDescription, description } = body;

    if (!title) {
      return NextResponse.json({ error: 'Title is required' }, { status: 400 });
    }

    // Try to find existing page by ID or slug
    const existing = await prisma.page.findUnique({ where: { id } }) ||
                     await prisma.page.findFirst({ where: { slug: id } });

    const cleanSlug = slug ? slugify(slug) : (existing?.slug || slugify(title));

    // Check for conflicting slug (if updating existing page)
    if (existing) {
      const conflictingSlug = await prisma.page.findFirst({
        where: { slug: cleanSlug, id: { not: existing.id } },
      });
      if (conflictingSlug) {
        return NextResponse.json({ error: 'A page with this slug already exists' }, { status: 400 });
      }
    } else {
      // For new page, check if slug already exists
      const conflictingSlug = await prisma.page.findFirst({
        where: { slug: cleanSlug },
      });
      if (conflictingSlug) {
        return NextResponse.json({ error: 'A page with this slug already exists' }, { status: 400 });
      }
    }

    let page;
    if (existing) {
      // Update existing page
      page = await prisma.page.update({
        where: { id: existing.id },
        data: {
          slug: cleanSlug,
          title,
          description: description ?? existing.description,
          content: content ?? existing.content,
          sections: sections !== undefined ? (typeof sections === 'string' ? sections : JSON.stringify(sections)) : existing.sections,
          metaTitle: metaTitle ?? existing.metaTitle,
          metaDescription: metaDescription ?? existing.metaDescription,
          isPublished: isPublished ?? existing.isPublished,
        },
      });
    } else {
      // Create new page
      page = await prisma.page.create({
        data: {
          slug: cleanSlug,
          title,
          description: description ?? null,
          content: content ?? '',
          sections: sections !== undefined ? (typeof sections === 'string' ? sections : JSON.stringify(sections)) : undefined,
          isPublished: isPublished ?? true,
          metaTitle: metaTitle ?? null,
          metaDescription: metaDescription ?? null,
        },
      });
    }

    return NextResponse.json(page);
  } catch (error) {
    logger.error('Error updating/creating page', error);
    return NextResponse.json({ error: 'Failed to save page', details: error instanceof Error ? error.message : String(error) }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;

    const existing = await prisma.page.findUnique({ where: { id } }) ||
                     await prisma.page.findFirst({ where: { slug: id } });

    if (!existing) {
      return NextResponse.json({ error: 'Page not found' }, { status: 404 });
    }

    await prisma.page.delete({ where: { id: existing.id } });
    return NextResponse.json({ message: 'Page deleted successfully' });
  } catch (error) {
    logger.error('Error deleting page', error);
    return NextResponse.json({ error: 'Failed to delete page' }, { status: 500 });
  }
}
