import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { Prisma, ManuscriptStatus } from '@prisma/client';
import { writeFile, mkdir } from 'fs/promises';
import { join } from 'path';
import { existsSync } from 'fs';
import { createLogger } from '@/lib/logger';

const logger = createLogger('AdminManuscripts');

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const search = searchParams.get('search');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');

    const where: Prisma.ManuscriptWhereInput = {};
    if (status && status !== 'all') {
      where.status = status as ManuscriptStatus;
    }
    if (search) {
      where.OR = [
        { title: { contains: search } },
        { id: { contains: search } },
      ];
    }

    const [manuscripts, total] = await Promise.all([
      prisma.manuscript.findMany({
        where,
        include: {
          journal: { select: { name: true, shortName: true } },
          correspondingAuthor: { select: { firstName: true, lastName: true, email: true } },
          authors: { select: { firstName: true, lastName: true, email: true } },
          assignedEditor: { select: { firstName: true, lastName: true } },
          files: { select: { id: true, fileName: true, fileUrl: true, fileSize: true, mimeType: true, fileType: true, isPrimary: true, version: true } },
          reviews: { select: { id: true, status: true, decision: true } },
        },
        orderBy: { submittedAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.manuscript.count({ where }),
    ]);

    return NextResponse.json({
      manuscripts,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    logger.error('Error fetching manuscripts', error);
    return NextResponse.json({ error: 'Failed to fetch manuscripts' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const formData = await request.formData();

    const title = formData.get('title') as string;
    const abstract = formData.get('abstract') as string;
    const keywords = formData.get('keywords') as string || '';
    const articleType = formData.get('articleType') as string;
    const section = formData.get('section') as string || null;
    const correspondingAuthorEmail = formData.get('correspondingAuthorEmail') as string || undefined;
    const correspondingAuthorFirstName = formData.get('correspondingAuthorFirstName') as string;
    const correspondingAuthorLastName = formData.get('correspondingAuthorLastName') as string;
    const status = formData.get('status') as string || undefined;
    const manuscriptFile = formData.get('manuscriptFile') as File | null;

    if (!title || !abstract || !articleType) {
      return NextResponse.json({ error: 'Missing required fields: title, abstract, articleType' }, { status: 400 });
    }

    const journal = await prisma.journal.findFirst({ where: { isActive: true } });
    if (!journal) {
      return NextResponse.json({ error: 'No active journal found' }, { status: 500 });
    }

    let authorId = session.user.id;
    let authorFirstName = correspondingAuthorFirstName || '';
    let authorLastName = correspondingAuthorLastName || '';
    let authorEmail = correspondingAuthorEmail || '';
    let authorAffiliation = '';

    if (correspondingAuthorEmail) {
      const existingUser = await prisma.user.findUnique({
        where: { email: correspondingAuthorEmail },
        select: { id: true, firstName: true, lastName: true, email: true, affiliation: true },
      });
      if (existingUser) {
        authorId = existingUser.id;
        authorFirstName = existingUser.firstName;
        authorLastName = existingUser.lastName;
        authorEmail = existingUser.email;
        authorAffiliation = existingUser.affiliation || '';
      } else {
        return NextResponse.json({ error: `No user found with email "${correspondingAuthorEmail}". Create the user account first.` }, { status: 400 });
      }
    } else {
      const adminUser = await prisma.user.findUnique({
        where: { id: session.user.id },
        select: { firstName: true, lastName: true, email: true, affiliation: true },
      });
      if (adminUser) {
        authorFirstName = adminUser.firstName;
        authorLastName = adminUser.lastName;
        authorEmail = adminUser.email;
        authorAffiliation = adminUser.affiliation || '';
      }
    }

    const uploadDir = join(process.cwd(), 'uploads', 'manuscripts');
    if (!existsSync(uploadDir)) {
      await mkdir(uploadDir, { recursive: true });
    }

    let manuscriptFileUrl = '';
    let manuscriptFileName = '';
    let manuscriptFileSize = 0;
    let manuscriptFileMime = '';

    if (manuscriptFile && manuscriptFile.size > 0) {
      const bytes = await manuscriptFile.arrayBuffer();
      const buffer = Buffer.from(bytes);
      const timestamp = Date.now();
      const filename = `${timestamp}-${manuscriptFile.name.replace(/[^a-zA-Z0-9.-]/g, '_')}`;
      const filepath = join(uploadDir, filename);
      await writeFile(filepath, buffer);
      manuscriptFileUrl = `/api/uploads/manuscripts/${filename}`;
      manuscriptFileName = manuscriptFile.name;
      manuscriptFileSize = buffer.length;
      manuscriptFileMime = manuscriptFile.type;
    }

    const manuscriptData: Prisma.ManuscriptCreateInput = {
      journal: { connect: { id: journal.id } },
      title,
      abstract,
      keywords: typeof keywords === 'string' ? keywords : JSON.stringify(keywords || []),
      articleType,
      section: section || null,
      status: (status as ManuscriptStatus) || 'SUBMITTED',
      correspondingAuthor: { connect: { id: authorId } },
      submittedAt: new Date(),
      authors: {
        create: {
          userId: authorId,
          firstName: authorFirstName,
          lastName: authorLastName,
          email: authorEmail,
          affiliation: authorAffiliation,
          position: 0,
          isCorresponding: true,
        },
      },
    };

    if (manuscriptFileUrl) {
      manuscriptData.files = {
        create: {
          fileName: manuscriptFileName,
          fileUrl: manuscriptFileUrl,
          fileSize: manuscriptFileSize,
          mimeType: manuscriptFileMime || 'application/pdf',
          fileType: 'MANUSCRIPT',
          version: 1,
          isPrimary: true,
        },
      };
      manuscriptData.versions = {
        create: {
          version: 1,
          title,
          abstract,
          keywords: typeof keywords === 'string' ? keywords : JSON.stringify(keywords || []),
          fileUrl: manuscriptFileUrl,
          fileName: manuscriptFileName,
          fileSize: manuscriptFileSize,
          submittedById: authorId,
        },
      };
    }

    const manuscript = await prisma.manuscript.create({
      data: manuscriptData,
      include: {
        correspondingAuthor: { select: { firstName: true, lastName: true, email: true } },
        authors: true,
        files: true,
      },
    });

    return NextResponse.json(manuscript, { status: 201 });
  } catch (error) {
    logger.error('Error creating manuscript', error);
    return NextResponse.json({ error: 'Failed to create manuscript' }, { status: 500 });
  }
}