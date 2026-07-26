import { prisma } from '@/lib/prisma';
import crypto from 'crypto';
import { sendEmail } from './email';

export async function generateVerificationToken(userId: string): Promise<string> {
  const token = crypto.randomBytes(32).toString('hex');
  const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

  await prisma.emailVerification.create({
    data: {
      userId,
      token,
      expiresAt,
    },
  });

  return token;
}

export async function verifyEmailToken(token: string): Promise<boolean> {
  const verification = await prisma.emailVerification.findUnique({
    where: { token },
    include: { user: true },
  });

  if (!verification) return false;
  if (verification.expiresAt < new Date()) {
    await prisma.emailVerification.delete({ where: { id: verification.id } });
    return false;
  }

  await prisma.user.update({
    where: { id: verification.userId },
    data: {
      status: 'ACTIVE',
      emailVerified: new Date(),
      emailVerifiedAt: new Date(),
    },
  });

  await prisma.emailVerification.delete({ where: { id: verification.id } });
  return true;
}

export async function generatePasswordResetToken(userId: string): Promise<string> {
  const token = crypto.randomBytes(32).toString('hex');
  const expiresAt = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

  await prisma.passwordReset.create({
    data: {
      userId,
      token,
      expiresAt,
    },
  });

  return token;
}

export async function verifyPasswordResetToken(token: string): Promise<string | null> {
  const reset = await prisma.passwordReset.findUnique({
    where: { token },
    include: { user: true },
  });

  if (!reset || reset.used || reset.expiresAt < new Date()) return null;

  return reset.userId;
}

export async function usePasswordResetToken(token: string): Promise<void> {
  await prisma.passwordReset.update({
    where: { token },
    data: { used: true },
  });
}

export async function sendVerificationEmail(email: string, token: string): Promise<void> {
  const verifyUrl = `${process.env.NEXTAUTH_URL}/verify-email?token=${token}`;
  
  await sendEmail({
    to: email,
    subject: 'Verify your AMHSJ Account',
    html: `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
        </head>
        <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #1a1a2e; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="background: linear-gradient(135deg, #0f172a 0%, #1e3a5f 100%); padding: 40px 30px; border-radius: 12px 12px 0 0; text-align: center;">
            <h1 style="color: #fbbf24; margin: 0; font-size: 28px; font-weight: 700;">Advances in Medicine and Health Sciences Journal</h1>
            <p style="color: #94a3b8; margin: 10px 0 0;">AMHSJ</p>
          </div>
          <div style="background: #ffffff; padding: 40px 30px; border: 1px solid #e2e8f0; border-top: none; border-radius: 0 0 12px 12px;">
            <h2 style="color: #0f172a; margin: 0 0 20px; font-size: 24px;">Verify Your Email Address</h2>
            <p style="color: #475569; margin: 0 0 20px; font-size: 16px;">Welcome to AMHSJ! Please click the button below to verify your email address and activate your account.</p>
            <div style="text-align: center; margin: 30px 0;">
              <a href="${verifyUrl}" style="display: inline-block; background: linear-gradient(135deg, #0f172a 0%, #1e3a5f 100%); color: #fbbf24; padding: 16px 32px; border-radius: 8px; text-decoration: none; font-weight: 600; font-size: 16px; border: 2px solid #fbbf24;">Verify Email Address</a>
            </div>
            <p style="color: #94a3b8; font-size: 14px; margin: 20px 0 0;">Or copy this link: <a href="${verifyUrl}" style="color: #0f172a;">${verifyUrl}</a></p>
            <p style="color: #94a3b8; font-size: 14px; margin: 20px 0 0;">This link expires in 24 hours.</p>
            <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 30px 0;">
            <p style="color: #94a3b8; font-size: 12px; margin: 0;">If you didn't create an account, please ignore this email.</p>
          </div>
        </body>
      </html>
    `,
  });
}

export async function sendPasswordResetEmail(email: string, token: string): Promise<void> {
  const resetUrl = `${process.env.NEXTAUTH_URL}/reset-password?token=${token}`;
  
  await sendEmail({
    to: email,
    subject: 'Reset your AMHSJ Password',
    html: `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
        </head>
        <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #1a1a2e; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="background: linear-gradient(135deg, #0f172a 0%, #1e3a5f 100%); padding: 40px 30px; border-radius: 12px 12px 0 0; text-align: center;">
            <h1 style="color: #fbbf24; margin: 0; font-size: 28px; font-weight: 700;">Advances in Medicine and Health Sciences Journal</h1>
            <p style="color: #94a3b8; margin: 10px 0 0;">AMHSJ</p>
          </div>
          <div style="background: #ffffff; padding: 40px 30px; border: 1px solid #e2e8f0; border-top: none; border-radius: 0 0 12px 12px;">
            <h2 style="color: #0f172a; margin: 0 0 20px; font-size: 24px;">Reset Your Password</h2>
            <p style="color: #475569; margin: 0 0 20px; font-size: 16px;">You requested to reset your password. Click the button below to create a new password.</p>
            <div style="text-align: center; margin: 30px 0;">
              <a href="${resetUrl}" style="display: inline-block; background: linear-gradient(135deg, #0f172a 0%, #1e3a5f 100%); color: #fbbf24; padding: 16px 32px; border-radius: 8px; text-decoration: none; font-weight: 600; font-size: 16px; border: 2px solid #fbbf24;">Reset Password</a>
            </div>
            <p style="color: #94a3b8; font-size: 14px; margin: 20px 0 0;">Or copy this link: <a href="${resetUrl}" style="color: #0f172a;">${resetUrl}</a></p>
            <p style="color: #94a3b8; font-size: 14px; margin: 20px 0 0;">This link expires in 1 hour.</p>
            <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 30px 0;">
            <p style="color: #94a3b8; font-size: 12px; margin: 0;">If you didn't request this, please ignore this email.</p>
          </div>
        </body>
      </html>
    `,
  });
}