import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import bcrypt from 'bcryptjs';
import { createLogger } from '@/lib/logger';

const logger = createLogger('EditorialBoard');

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const editorialBoard = await prisma.editorialRole.findMany({
      where: { isActive: true },
      include: {
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            middleName: true,
            email: true,
            affiliation: true,
            department: true,
            orcid: true,
            bio: true,
          },
        },
      },
      orderBy: [
        { role: 'asc' },
        { user: { lastName: 'asc' } },
      ],
    });

    return NextResponse.json(editorialBoard);
  } catch (error) {
    logger.error('Error fetching editorial board', error);
    return NextResponse.json({ error: 'Failed to fetch editorial board' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const {
      firstName,
      lastName,
      middleName,
      email,
      affiliation,
      department,
      orcid,
      bio,
      role,
      isActive = true,
      password,
    } = body;

    if (!firstName || !lastName || !email || !affiliation || !role) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const journal = await prisma.journal.findFirst({ where: { isActive: true } });
    if (!journal) {
      return NextResponse.json({ error: 'No active journal found' }, { status: 400 });
    }

    let user = await prisma.user.findUnique({ where: { email } });
    const userData = {
      firstName,
      lastName,
      middleName: middleName || null,
      affiliation,
      department: department || null,
      orcid: orcid || null,
      bio: bio || null,
    };
    if (!user) {
      const tempPassword = password || 'changeme123';
      user = await prisma.user.create({
        data: {
          email,
          ...userData,
          role: 'EDITOR',
          status: 'ACTIVE',
          passwordHash: await bcrypt.hash(tempPassword, 12),
          emailVerified: new Date(),
        },
      });
    } else {
      user = await prisma.user.update({
        where: { email },
        data: userData,
      });
      if (password && user.passwordHash !== (await bcrypt.hash(password, 12))) {
        await prisma.user.update({
          where: { email },
          data: { passwordHash: await bcrypt.hash(password, 12) },
        });
      }
    }

    const editorialRole = await prisma.editorialRole.create({
      data: {
        userId: user.id,
        journalId: journal.id,
        role,
        isActive,
      },
      include: { user: true },
    });

    return NextResponse.json(editorialRole, { status: 201 });
  } catch (error) {
    logger.error('Error creating editorial board member', error);
    return NextResponse.json({ error: 'Failed to create editorial board member' }, { status: 500 });
  }
}
