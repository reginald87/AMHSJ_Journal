import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import bcrypt from 'bcryptjs';
import { sendEmail, getVerificationEmailTemplate } from '@/lib/email';
import { rateLimit, rateLimitResponse } from '@/lib/rate-limit';
import { createLogger } from '@/lib/logger';

const logger = createLogger('Register');

export async function POST(request: NextRequest) {
  try {
    const ip = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 'unknown';
    const rl = rateLimit(`register:${ip}`, { limit: 5, windowMs: 15 * 60_000 });
    if (!rl.allowed) {
      return NextResponse.json({ error: 'Too many registration attempts. Please try again later.' }, {
        status: 429,
        headers: rateLimitResponse(rl.remaining, Date.now() + 15 * 60_000),
      });
    }

    const body = await request.json();
    const {
      firstName,
      middleName,
      lastName,
      email,
      password,
      affiliation,
      department,
      orcid,
      country,
      role,
    } = body;

    if (!firstName || !lastName || !email || !password || !affiliation) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const allowedRoles = ['AUTHOR', 'REVIEWER'];
    const userRole = allowedRoles.includes(role) ? role : 'AUTHOR';

    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      return NextResponse.json({ error: 'Email already registered' }, { status: 400 });
    }

    if (orcid) {
      const existingOrcid = await prisma.user.findUnique({ where: { orcid } });
      if (existingOrcid) {
        return NextResponse.json({ error: 'ORCID already registered' }, { status: 400 });
      }
    }

    const passwordHash = await bcrypt.hash(password, 12);

    const verificationToken = crypto.randomUUID();
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000);

    const user = await prisma.user.create({
      data: {
        firstName,
        middleName: middleName || null,
        lastName,
        email,
        passwordHash,
        affiliation,
        department: department || null,
        orcid: orcid || null,
        country: country || null,
        role: userRole,
        status: 'PENDING_VERIFICATION',
        emailVerifications: {
          create: {
            token: verificationToken,
            expiresAt,
          },
        },
      },
    });

    await sendVerificationEmail(user, verificationToken);

    return NextResponse.json({
      message: 'Registration successful. Please check your email to verify your account.',
      userId: user.id,
    }, { status: 201 });
  } catch (error) {
    logger.error('Registration error', error);
    return NextResponse.json({ error: 'Registration failed' }, { status: 500 });
  }
}

interface UserWithEmail {
  email: string;
  id: string;
}

async function sendVerificationEmail(user: UserWithEmail, token: string) {
  try {
    const template = getVerificationEmailTemplate(token, '');
    await sendEmail({ to: user.email, subject: template.subject, html: template.html });
  } catch (e) {
    logger.error('Failed to send verification email', e);
  }
}