import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { Prisma, Role } from '@prisma/client';
import bcrypt from 'bcryptjs';
import { createLogger } from '@/lib/logger';

const logger = createLogger('AdminUsers');

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const role = searchParams.get('role');
    const search = searchParams.get('search');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');

    const where: Prisma.UserWhereInput = {};
    if (role && role !== 'all') {
      where.role = role as Role;
    }
    if (search) {
      where.OR = [
        { firstName: { contains: search } },
        { lastName: { contains: search } },
        { email: { contains: search } },
      ];
    }

    const [users, total] = await Promise.all([
      prisma.user.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
        select: {
          id: true,
          email: true,
          firstName: true,
          lastName: true,
          middleName: true,
          affiliation: true,
          department: true,
          orcid: true,
          phone: true,
          country: true,
          bio: true,
          role: true,
          status: true,
          emailVerified: true,
          lastLoginAt: true,
          createdAt: true,
        },
      }),
      prisma.user.count({ where }),
    ]);

    return NextResponse.json({
      users,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    logger.error('Error fetching users', error);
    return NextResponse.json({ error: 'Failed to fetch users' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { email, password, firstName, lastName, middleName, role, affiliation, department, orcid, phone, country } = body;

    if (!email || !password || !firstName || !lastName) {
      return NextResponse.json({ error: 'Email, password, first name, and last name are required' }, { status: 400 });
    }

    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      return NextResponse.json({ error: 'A user with this email already exists' }, { status: 409 });
    }

    const passwordHash = await bcrypt.hash(password, 12);
    const allowedRoles = ['AUTHOR', 'REVIEWER', 'EDITOR', 'ADMIN', 'EDITOR_IN_CHIEF', 'DEPUTY_EDITOR_IN_CHIEF', 'ASSOCIATE_EDITOR'];
    const userRole = allowedRoles.includes(role) ? role : 'AUTHOR';

    const user = await prisma.user.create({
      data: {
        email,
        passwordHash,
        firstName,
        lastName,
        middleName: middleName || null,
        role: userRole,
        status: 'ACTIVE',
        emailVerified: new Date(),
        affiliation: affiliation || null,
        department: department || null,
        orcid: orcid || null,
        phone: phone || null,
        country: country || null,
      },
      select: { id: true, email: true, firstName: true, lastName: true, role: true, status: true },
    });

    return NextResponse.json(user, { status: 201 });
  } catch (error) {
    logger.error('Error creating user', error);
    return NextResponse.json({ error: 'Failed to create user' }, { status: 500 });
  }
}