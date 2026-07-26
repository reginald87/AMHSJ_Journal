import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { join } from 'path';
import { writeFile, mkdir } from 'fs/promises';
import { existsSync } from 'fs';
import { createLogger } from '@/lib/logger';

const logger = createLogger('AdminPublish');

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const formData = await request.formData();
    const manuscriptId = formData.get('manuscriptId') as string;
    const volumeId = formData.get('volumeId') as string;
    const doi = formData.get('doi') as string | null;
    const pageStart = formData.get('pageStart') as string | null;
    const pageEnd = formData.get('pageEnd') as string | null;
    const pdfFile = formData.get('publishedPdf') as File | null;
    const publishedAtStr = formData.get('publishedAt') as string | null;

    if (!manuscriptId || !volumeId) {
      return NextResponse.json({ error: 'Missing required fields: manuscriptId, volumeId' }, { status: 400 });
    }

    const manuscript = await prisma.manuscript.findUnique({
      where: { id: manuscriptId },
      include: {
        correspondingAuthor: true,
        authors: true,
        journal: { select: { doiPrefix: true, shortName: true } },
      },
    });

    if (!manuscript) {
      return NextResponse.json({ error: 'Manuscript not found' }, { status: 404 });
    }

    const volume = await prisma.volume.findUnique({ where: { id: volumeId } });
    if (!volume) {
      return NextResponse.json({ error: 'Volume not found' }, { status: 404 });
    }

    const generatedDoi = doi || `${manuscript.journal.doiPrefix || '10.5555'}/amhsj.${manuscript.id.slice(-8)}`;
    const slug = manuscript.title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '') + '-' + manuscript.id.slice(-6);

    const publishedAtDate = publishedAtStr ? new Date(publishedAtStr) : new Date();

    const existingArticle = await prisma.article.findUnique({ where: { manuscriptId } });
    if (existingArticle) {
      return NextResponse.json({ error: 'Manuscript has already been published' }, { status: 409 });
    }

    let publishedPdfUrl: string | null = null;

    if (pdfFile && pdfFile.size > 0) {
      const uploadDir = join(process.cwd(), 'uploads', 'published');
      if (!existsSync(uploadDir)) {
        await mkdir(uploadDir, { recursive: true });
      }

      const ext = pdfFile.name.split('.').pop() || 'pdf';
      const safeFilename = `${slug}.${ext}`;
      const filePath = join(uploadDir, safeFilename);
      const buffer = Buffer.from(await pdfFile.arrayBuffer());
      await writeFile(filePath, buffer);
      publishedPdfUrl = `/uploads/published/${safeFilename}`;
    }

    const article = await prisma.$transaction(async (tx) => {
      const createdArticle = await tx.article.create({
        data: {
          volumeId,
          manuscriptId,
          slug,
          title: manuscript.title,
          shortTitle: manuscript.shortTitle,
          abstract: manuscript.abstract,
          keywords: manuscript.keywords,
          articleType: manuscript.articleType,
          section: manuscript.section,
          doi: generatedDoi,
          pageStart: pageStart ? parseInt(pageStart) : null,
          pageEnd: pageEnd ? parseInt(pageEnd) : null,
          publishedPdfUrl,
          publishedAt: publishedAtDate,
          isPublished: true,
          copyrightYear: new Date().getFullYear(),
          copyrightHolder: manuscript.correspondingAuthor.affiliation || 'AMHSJ',
        },
      });

      for (let i = 0; i < manuscript.authors.length; i++) {
        const author = manuscript.authors[i];
        await tx.articleAuthor.create({
          data: {
            articleId: createdArticle.id,
            userId: author.userId,
            firstName: author.firstName,
            lastName: author.lastName,
            middleName: author.middleName,
            email: author.email,
            affiliation: author.affiliation,
            orcid: author.orcid,
            position: author.position,
            isCorresponding: author.isCorresponding,
          },
        });
      }

      await tx.articleMetric.create({
        data: {
          articleId: createdArticle.id,
          views: 0,
          downloads: 0,
          citations: 0,
          shares: 0,
          mentions: 0,
        },
      });

      await tx.manuscript.update({
        where: { id: manuscriptId },
        data: {
          status: 'PUBLISHED',
          doi: generatedDoi,
          publishedVersion: manuscript.acceptedVersion || manuscript.submittedVersion || manuscript.currentVersion.toString(),
        },
      });

      return createdArticle;
    });

    try {
      await prisma.notification.create({
        data: {
          userId: manuscript.correspondingAuthorId,
          type: 'MANUSCRIPT_PUBLISHED',
          title: 'Manuscript Published',
          message: `Your manuscript "${manuscript.title}" has been published in ${volume.title || `Volume ${volume.number}`}.`,
          data: JSON.stringify({ manuscriptId, articleId: article.id, doi: generatedDoi }),
        },
      });
    } catch (notifError) {
      logger.error('Failed to create notification', notifError);
    }

    return NextResponse.json(article, { status: 201 });
  } catch (error) {
    logger.error('Error publishing manuscript', error);
    return NextResponse.json({ error: 'Failed to publish manuscript' }, { status: 500 });
  }
}
