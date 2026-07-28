import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { Prisma, ManuscriptStatus } from '@prisma/client';
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

    const body = await request.json();
    const { title, abstract, keywords, articleType, section, correspondingAuthorEmail, correspondingAuthorFirstName, correspondingAuthorLastName, status } = body;

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

    const manuscript = await prisma.manuscript.create({
      data: {
        journalId: journal.id,
        title,
        abstract,
        keywords: typeof keywords === 'string' ? keywords : JSON.stringify(keywords || []),
        articleType,
        section: section || null,
        status: (status as ManuscriptStatus) || 'SUBMITTED',
        correspondingAuthorId: authorId,
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
      },
      include: {
        correspondingAuthor: { select: { firstName: true, lastName: true, email: true } },
        authors: true,
      },
    });

    return NextResponse.json(manuscript, { status: 201 });
  } catch (error) {
    logger.error('Error creating manuscript', error);
    return NextResponse.json({ error: 'Failed to create manuscript' }, { status: 500 });
  }
}