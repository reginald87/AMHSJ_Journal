import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { createLogger } from '@/lib/logger';

const logger = createLogger('VerifyEmail');

export async function POST(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const token = searchParams.get('token');

    if (!token) {
      return NextResponse.json({ error: 'Verification token is required' }, { status: 400 });
    }

    const verification = await prisma.emailVerification.findUnique({
      where: { token },
      include: { user: true },
    });

    if (!verification) {
      return NextResponse.json({ error: 'Invalid or expired verification link' }, { status: 400 });
    }

    if (verification.expiresAt < new Date()) {
      await prisma.emailVerification.delete({ where: { id: verification.id } });
      return NextResponse.json({ error: 'Verification link has expired' }, { status: 400 });
    }

    if (verification.user.status === 'ACTIVE') {
      return NextResponse.json({ error: 'Account already verified' }, { status: 400 });
    }

    await prisma.$transaction([
      prisma.user.update({
        where: { id: verification.user.id },
        data: {
          status: 'ACTIVE',
          emailVerified: new Date(),
        },
      }),
      prisma.emailVerification.delete({ where: { id: verification.id } }),
    ]);

    return NextResponse.json({
      message: 'Email verified successfully! You can now sign in to your account.',
    });
  } catch (error) {
    logger.error('Verification error', error);
    return NextResponse.json({ error: 'Verification failed' }, { status: 500 });
  }
}