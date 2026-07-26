import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { join } from 'path';
import { existsSync, createReadStream } from 'fs';
import { createLogger } from '@/lib/logger';

const logger = createLogger('ArticleDownload');

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;
    const article = await prisma.article.findUnique({
      where: { slug },
      include: {
        manuscript: {
          include: {
            files: { where: { fileType: 'MANUSCRIPT' }, take: 1, orderBy: { version: 'desc' } },
          },
        },
      },
    });

    if (!article) {
      return NextResponse.json({ error: 'Article not found' }, { status: 404 });
    }

    let filePath: string | null = null;

    if (article.publishedPdfUrl) {
      const relativePath = article.publishedPdfUrl.startsWith('/') ? article.publishedPdfUrl.slice(1) : article.publishedPdfUrl;
      const fullPath = join(process.cwd(), /* turbopackIgnore: true */ relativePath);
      if (existsSync(fullPath)) {
        filePath = fullPath;
      }
    }

    if (!filePath && article.manuscript?.files?.[0]?.fileUrl) {
      const fileUrl = article.manuscript.files[0].fileUrl;
      const relativePath = fileUrl.startsWith('/') ? fileUrl.slice(1) : fileUrl;
      const fullPath = join(process.cwd(), /* turbopackIgnore: true */ relativePath);
      if (existsSync(fullPath)) {
        filePath = fullPath;
      }
    }

    if (!filePath) {
      return NextResponse.json({ error: 'PDF not available' }, { status: 404 });
    }

    await prisma.articleMetric.update({
      where: { articleId: article.id },
      data: { downloads: { increment: 1 } },
    }).catch(() => {});

    const stream = createReadStream(filePath);
    const webStream = new ReadableStream({
      start(controller) {
        stream.on('data', (chunk) => controller.enqueue(chunk));
        stream.on('end', () => controller.close());
        stream.on('error', (err) => controller.error(err));
      },
    });

    return new NextResponse(webStream, {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="${slug}.pdf"`,
      },
    });
  } catch (error) {
    logger.error('Download error', error);
    return NextResponse.json({ error: 'Download failed' }, { status: 500 });
  }
}
