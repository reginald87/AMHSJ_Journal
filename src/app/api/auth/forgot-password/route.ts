import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { generatePasswordResetToken, sendPasswordResetEmail } from '@/lib/auth-utils';
import { rateLimit, rateLimitResponse } from '@/lib/rate-limit';
import { createLogger } from '@/lib/logger';

const logger = createLogger('ForgotPassword');

export async function POST(request: NextRequest) {
  try {
    const ip = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 'unknown';
    const rl = rateLimit(`forgot-password:${ip}`, { limit: 3, windowMs: 15 * 60_000 });
    if (!rl.allowed) {
      return NextResponse.json({ error: 'Too many attempts. Please try again later.' }, {
        status: 429,
        headers: rateLimitResponse(rl.remaining, Date.now() + 15 * 60_000),
      });
    }

    const { email } = await request.json();
    if (!email || typeof email !== 'string') {
      return NextResponse.json({ error: 'Email is required' }, { status: 400 });
    }

    const user = await prisma.user.findUnique({
      where: { email: email.toLowerCase().trim() },
    });

    if (!user) {
      return NextResponse.json({ message: 'If an account exists with that email, a reset link has been sent.' });
    }

    const token = await generatePasswordResetToken(user.id);
    await sendPasswordResetEmail(user.email, token);

    return NextResponse.json({ message: 'If an account exists with that email, a reset link has been sent.' });
  } catch (error) {
    logger.error('Forgot password error', error);
    return NextResponse.json({ error: 'Failed to process request' }, { status: 500 });
  }
}
