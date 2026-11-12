import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { writeFile, mkdir } from 'fs/promises';
import { join } from 'path';
import { existsSync } from 'fs';
import { createHash } from 'crypto';
import { findDuplicateManuscript } from '@/lib/manuscript-duplicate';
import { notifyManuscriptStatusChange } from '@/lib/manuscript-notify';
import { rateLimit, rateLimitResponse } from '@/lib/rate-limit';
import { createLogger } from '@/lib/logger';

const logger = createLogger('Manuscripts');

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || !['AUTHOR', 'EDITOR', 'EDITOR_IN_CHIEF', 'DEPUTY_EDITOR_IN_CHIEF', 'ASSOCIATE_EDITOR', 'ADMIN'].includes(session.user.role)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const rl = rateLimit(`submit:${session.user.id}`, { limit: 10, windowMs: 60 * 60_000 });
    if (!rl.allowed) {
      return NextResponse.json({ error: 'Submission limit reached. Please try again later.' }, {
        status: 429,
        headers: rateLimitResponse(rl.remaining, Date.now() + 60 * 60_000),
      });
    }

    const formData = await request.formData();
    
    const title = formData.get('title') as string;
    const shortTitle = formData.get('shortTitle') as string;
    const articleType = formData.get('articleType') as string;
    const section = formData.get('section') as string;
    const abstract = formData.get('abstract') as string;
    const keywords = formData.get('keywords') as string;
    
    const correspondingAuthor = JSON.parse(formData.get('correspondingAuthor') as string);
    const coAuthors = JSON.parse(formData.get('coAuthors') as string || '[]');
    const coverLetter = formData.get('coverLetter') as string;
    const competingInterests = formData.get('competingInterests') as string;
    const fundingStatement = formData.get('fundingStatement') as string;
    const ethicsApproval = formData.get('ethicsApproval') as string;
    const dataAvailability = formData.get('dataAvailability') as string;
    const authorContributions = formData.get('authorContributions') as string;
    const acknowledgments = formData.get('acknowledgments') as string;

    const manuscriptFile = formData.get('manuscriptFile') as File | null;
    const supplementaryFiles = formData.getAll('supplementaryFiles') as File[];

    if (!title?.trim()) {
      return NextResponse.json({ error: 'Manuscript title is required' }, { status: 400 });
    }

    let manuscriptFileBuffer: Buffer | null = null;
    let manuscriptFileHash: string | null = null;

    if (manuscriptFile) {
      const bytes = await manuscriptFile.arrayBuffer();
      manuscriptFileBuffer = Buffer.from(bytes);
      manuscriptFileHash = createHash('sha256').update(manuscriptFileBuffer).digest('hex');
    }

    const duplicate = await findDuplicateManuscript({
      title,
      fileHash: manuscriptFileHash,
      authorId: session.user.id,
      authorEmails: [
        session.user.email || '',
        correspondingAuthor?.email || '',
        ...coAuthors.map((author: { email?: string }) => author.email || ''),
      ],
    });

    if (duplicate) {
      const error =
        duplicate.reason === 'file'
          ? `This manuscript file has already been submitted (manuscript ID: ${duplicate.id}).`
          : `You have already submitted a manuscript with this title (manuscript ID: ${duplicate.id}).`;
      return NextResponse.json({ error, manuscriptId: duplicate.id }, { status: 409 });
    }

    const uploadDir = join(process.cwd(), 'uploads', 'manuscripts');
    if (!existsSync(uploadDir)) {
      await mkdir(uploadDir, { recursive: true });
    }

    let manuscriptFileUrl = '';
    let manuscriptFileName = '';
    let manuscriptFileSize = 0;

    if (manuscriptFile && manuscriptFileBuffer) {
      const timestamp = Date.now();
      const filename = `${timestamp}-${manuscriptFile.name.replace(/[^a-zA-Z0-9.-]/g, '_')}`;
      const filepath = join(uploadDir, filename);
      await writeFile(filepath, manuscriptFileBuffer);
      manuscriptFileUrl = `/api/uploads/manuscripts/${filename}`;
      manuscriptFileName = manuscriptFile.name;
      manuscriptFileSize = manuscriptFileBuffer.length;
    }

    const journal = await prisma.journal.findFirst({ where: { isActive: true } });
    if (!journal) {
      return NextResponse.json({ error: 'No active journal found' }, { status: 500 });
    }

    const manuscript = await prisma.manuscript.create({
      data: {
        journalId: journal.id,
        title,
        shortTitle,
        articleType,
        section,
        abstract,
        keywords,
        coverLetter,
        correspondingAuthorId: session.user.id,
        status: 'SUBMITTED',
        fileHash: manuscriptFileHash,
        authors: {
          create: [
            {
              ...correspondingAuthor,
              userId: session.user.id,
              position: 0,
              isCorresponding: true,
            },
            ...coAuthors.map((author: Record<string, unknown>, index: number) => ({
              ...author,
              position: index + 1,
              isCorresponding: false,
            })),
          ],
        },
        files: {
          create: {
            fileName: manuscriptFileName,
            fileUrl: manuscriptFileUrl,
            fileSize: manuscriptFileSize,
            mimeType: manuscriptFile?.type || 'application/pdf',
            fileType: 'MANUSCRIPT',
            version: 1,
            isPrimary: true,
          },
        },
        versions: {
          create: {
            version: 1,
            title,
            abstract,
            keywords,
            fileUrl: manuscriptFileUrl,
            fileName: manuscriptFileName,
            fileSize: manuscriptFileSize,
            submittedById: session.user.id,
          },
        },
      },
      include: {
        authors: true,
      },
    });

    for (const suppFile of supplementaryFiles) {
      if (suppFile.size > 0) {
        const bytes = await suppFile.arrayBuffer();
        const buffer = Buffer.from(bytes);
        const timestamp = Date.now();
        const filename = `${timestamp}-supp-${suppFile.name.replace(/[^a-zA-Z0-9.-]/g, '_')}`;
        const filepath = join(uploadDir, filename);
        await writeFile(filepath, buffer);
        
        await prisma.manuscriptFile.create({
          data: {
            manuscriptId: manuscript.id,
            fileName: suppFile.name,
            fileUrl: `/api/uploads/manuscripts/${filename}`,
            fileSize: buffer.length,
            mimeType: suppFile.type,
            fileType: 'SUPPLEMENTARY',
            version: 1,
            isPrimary: false,
          },
        });
      }
    }

    await notifyManuscriptStatusChange({
      manuscriptId: manuscript.id,
      manuscriptTitle: manuscript.title,
      status: 'SUBMITTED',
    });

    return NextResponse.json({ 
      manuscriptId: manuscript.id,
      message: 'Manuscript submitted successfully' 
    }, { status: 201 });

  } catch (error) {
    logger.error('Submission error', error);
    return NextResponse.json({ error: 'Failed to submit manuscript' }, { status: 500 });
  }
}