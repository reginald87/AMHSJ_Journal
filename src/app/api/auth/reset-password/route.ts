import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import bcrypt from 'bcryptjs';
import { verifyPasswordResetToken, usePasswordResetToken } from '@/lib/auth-utils';
import { createLogger } from '@/lib/logger';

const logger = createLogger('ResetPassword');

export async function POST(request: NextRequest) {
  try {
    const { token, password } = await request.json();

    if (!token || !password) {
      return NextResponse.json({ error: 'Token and password are required' }, { status: 400 });
    }

    if (password.length < 8) {
      return NextResponse.json({ error: 'Password must be at least 8 characters' }, { status: 400 });
    }

    const userId = await verifyPasswordResetToken(token);
    if (!userId) {
      return NextResponse.json({ error: 'Invalid or expired reset token' }, { status: 400 });
    }

    const passwordHash = await bcrypt.hash(password, 12);

    await prisma.user.update({
      where: { id: userId },
      data: { passwordHash },
    });

    await usePasswordResetToken(token);

    return NextResponse.json({ message: 'Password reset successful. You can now sign in.' });
  } catch (error) {
    logger.error('Reset password error', error);
    return NextResponse.json({ error: 'Failed to reset password' }, { status: 500 });
  }
}
