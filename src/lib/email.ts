import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_SERVER_HOST,
  port: Number(process.env.EMAIL_SERVER_PORT),
  secure: false,
  auth: {
    user: process.env.EMAIL_SERVER_USER,
    pass: process.env.EMAIL_SERVER_PASSWORD,
  },
});

export async function sendEmail({
  to,
  subject,
  html,
  text,
}: {
  to: string;
  subject: string;
  html: string;
  text?: string;
}): Promise<void> {
  await transporter.sendMail({
    from: process.env.EMAIL_FROM || 'noreply@amhsj.org',
    to,
    subject,
    html,
    text: text || html.replace(/<[^>]*>/g, ''),
  });
}

export function getVerificationEmailTemplate(token: string, firstName: string): { subject: string; html: string } {
  const verifyUrl = `${process.env.NEXTAUTH_URL}/verify-email?token=${token}`;
  
  return {
    subject: 'Verify your AMHSJ account',
    html: `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #1e293b; max-width: 600px; margin: 0 auto; padding: 20px;">
  <div style="background: linear-gradient(135deg, #0f172a 0%, #1e3a5f 100%); padding: 40px 30px; text-align: center; border-radius: 12px 12px 0 0;">
    <h1 style="color: #fbbf24; margin: 0; font-size: 28px; font-weight: 700;">Advances in Medicine and Health Sciences Journal</h1>
    <p style="color: #94a3b8; margin: 8px 0 0; font-size: 14px;">AMHSJ</p>
  </div>
  <div style="background: #ffffff; padding: 40px 30px; border: 1px solid #e2e8f0; border-top: none; border-radius: 0 0 12px 12px;">
    <h2 style="color: #0f172a; margin: 0 0 16px; font-size: 24px;">Welcome to AMHSJ, ${firstName}!</h2>
    <p style="color: #475569; margin: 0 0 24px; font-size: 16px;">Thank you for registering. Please verify your email address to activate your account and access the author dashboard.</p>
    <div style="text-align: center; margin: 32px 0;">
      <a href="${verifyUrl}" style="background: linear-gradient(135deg, #0f172a 0%, #1e3a5f 100%); color: #fbbf24; padding: 16px 32px; border-radius: 8px; text-decoration: none; font-weight: 600; font-size: 16px; display: inline-block; border: 2px solid #fbbf24;">Verify Email Address</a>
    </div>
    <p style="color: #94a3b8; font-size: 14px; margin: 24px 0 0;">This link expires in 24 hours. If you didn't create an account, please ignore this email.</p>
    <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 32px 0;">
    <p style="color: #94a3b8; font-size: 12px; margin: 0; text-align: center;">Advances in Medicine and Health Sciences Journal<br>Your University Press</p>
  </div>
</body>
</html>
    `,
  };
}

export function getPasswordResetEmailTemplate(token: string, firstName: string): { subject: string; html: string } {
  const resetUrl = `${process.env.NEXTAUTH_URL}/reset-password?token=${token}`;
  
  return {
    subject: 'Reset your AMHSJ password',
    html: `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #1e293b; max-width: 600px; margin: 0 auto; padding: 20px;">
  <div style="background: linear-gradient(135deg, #0f172a 0%, #1e3a5f 100%); padding: 40px 30px; text-align: center; border-radius: 12px 12px 0 0;">
    <h1 style="color: #fbbf24; margin: 0; font-size: 28px; font-weight: 700;">Advances in Medicine and Health Sciences Journal</h1>
    <p style="color: #94a3b8; margin: 8px 0 0; font-size: 14px;">AMHSJ</p>
  </div>
  <div style="background: #ffffff; padding: 40px 30px; border: 1px solid #e2e8f0; border-top: none; border-radius: 0 0 12px 12px;">
    <h2 style="color: #0f172a; margin: 0 0 16px; font-size: 24px;">Password Reset Request</h2>
    <p style="color: #475569; margin: 0 0 24px; font-size: 16px;">Hi ${firstName},</p>
    <p style="color: #475569; margin: 0 0 24px; font-size: 16px;">You requested to reset your password. Click the button below to create a new password.</p>
    <div style="text-align: center; margin: 32px 0;">
      <a href="${resetUrl}" style="background: linear-gradient(135deg, #0f172a 0%, #1e3a5f 100%); color: #fbbf24; padding: 16px 32px; border-radius: 8px; text-decoration: none; font-weight: 600; font-size: 16px; display: inline-block; border: 2px solid #fbbf24;">Reset Password</a>
    </div>
    <p style="color: #94a3b8; font-size: 14px; margin: 24px 0 0;">This link expires in 1 hour. If you didn't request this, please ignore this email.</p>
    <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 32px 0;">
    <p style="color: #94a3b8; font-size: 12px; margin: 0; text-align: center;">Advances in Medicine and Health Sciences Journal</p>
  </div>
</body>
</html>
    `,
  };
}

export function getManuscriptSubmissionEmailTemplate(manuscriptId: string, title: string, firstName: string): { subject: string; html: string } {
  return {
    subject: `Manuscript Submitted: ${title}`,
    html: `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #1e293b; max-width: 600px; margin: 0 auto; padding: 20px;">
  <div style="background: linear-gradient(135deg, #0f172a 0%, #1e3a5f 100%); padding: 40px 30px; text-align: center; border-radius: 12px 12px 0 0;">
    <h1 style="color: #fbbf24; margin: 0; font-size: 28px; font-weight: 700;">Advances in Medicine and Health Sciences Journal</h1>
  </div>
  <div style="background: #ffffff; padding: 40px 30px; border: 1px solid #e2e8f0; border-top: none; border-radius: 0 0 12px 12px;">
    <h2 style="color: #0f172a; margin: 0 0 16px; font-size: 24px;">Manuscript Successfully Submitted</h2>
    <p style="color: #475569; margin: 0 0 24px; font-size: 16px;">Dear ${firstName},</p>
    <p style="color: #475569; margin: 0 0 16px; font-size: 16px;">Your manuscript has been successfully submitted to <strong>Advances in Medicine and Health Sciences Journal</strong>.</p>
    <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 20px; margin: 24px 0;">
      <p style="margin: 0 0 8px; color: #0f172a; font-weight: 600;">Manuscript ID: ${manuscriptId}</p>
      <p style="margin: 0; color: #475569;">Title: ${title}</p>
      <p style="margin: 8px 0 0; color: #475569;">Status: <span style="background: #dbeafe; color: #1e40af; padding: 4px 12px; border-radius: 9999px; font-size: 12px; font-weight: 600;">Submitted</span></p>
    </div>
    <p style="color: #475569; margin: 24px 0 0; font-size: 16px;">You can track the progress of your manuscript in your <a href="${process.env.NEXTAUTH_URL}/dashboard/manuscripts" style="color: #0f172a; font-weight: 600;">author dashboard</a>.</p>
    <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 32px 0;">
    <p style="color: #94a3b8; font-size: 12px; margin: 0; text-align: center;">Advances in Medicine and Health Sciences Journal</p>
  </div>
</body>
</html>
    `,
  };
}

export function getReviewInvitationEmailTemplate(manuscriptId: string, title: string, firstName: string, dueDate: Date): { subject: string; html: string } {
  const acceptUrl = `${process.env.NEXTAUTH_URL}/review/invite/${manuscriptId}/accept`;
  const declineUrl = `${process.env.NEXTAUTH_URL}/review/invite/${manuscriptId}/decline`;
  
  return {
    subject: `Review Invitation: ${title}`,
    html: `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #1e293b; max-width: 600px; margin: 0 auto; padding: 20px;">
  <div style="background: linear-gradient(135deg, #0f172a 0%, #1e3a5f 100%); padding: 40px 30px; text-align: center; border-radius: 12px 12px 0 0;">
    <h1 style="color: #fbbf24; margin: 0; font-size: 28px; font-weight: 700;">Advances in Medicine and Health Sciences Journal</h1>
  </div>
  <div style="background: #ffffff; padding: 40px 30px; border: 1px solid #e2e8f0; border-top: none; border-radius: 0 0 12px 12px;">
    <h2 style="color: #0f172a; margin: 0 0 16px; font-size: 24px;">Peer Review Invitation</h2>
    <p style="color: #475569; margin: 0 0 24px; font-size: 16px;">Dear Dr. ${firstName},</p>
    <p style="color: #475569; margin: 0 0 16px; font-size: 16px;">You have been invited to review the following manuscript for <strong>Advances in Medicine and Health Sciences Journal</strong>.</p>
    <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 20px; margin: 24px 0;">
      <p style="margin: 0 0 8px; color: #0f172a; font-weight: 600;">Manuscript ID: ${manuscriptId}</p>
      <p style="margin: 0 0 8px; color: #475569;">Title: ${title}</p>
      <p style="margin: 0; color: #475569;">Due Date: ${dueDate.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
    </div>
    <div style="display: flex; gap: 16px; justify-content: center; margin: 32px 0; flex-wrap: wrap;">
      <a href="${acceptUrl}" style="background: #059669; color: white; padding: 14px 28px; border-radius: 8px; text-decoration: none; font-weight: 600; font-size: 16px;">Accept Review</a>
      <a href="${declineUrl}" style="background: #dc2626; color: white; padding: 14px 28px; border-radius: 8px; text-decoration: none; font-weight: 600; font-size: 16px;">Decline</a>
    </div>
    <p style="color: #94a3b8; font-size: 14px; margin: 24px 0 0; text-align: center;">Please respond within 7 days.</p>
    <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 32px 0;">
    <p style="color: #94a3b8; font-size: 12px; margin: 0; text-align: center;">Advances in Medicine and Health Sciences Journal</p>
  </div>
</body>
</html>
    `,
  };
}

export function getDecisionEmailTemplate(decision: string, manuscriptId: string, title: string, firstName: string, notesToAuthor?: string): { subject: string; html: string } {
  const decisionColors: Record<string, { bg: string; text: string; border: string }> = {
    ACCEPT: { bg: '#dcfce7', text: '#166534', border: '#86efac' },
    MINOR_REVISION: { bg: '#fef3c7', text: '#92400e', border: '#fcd34d' },
    MAJOR_REVISION: { bg: '#fed7aa', text: '#9a3412', border: '#fb923c' },
    REJECT: { bg: '#fee2e2', text: '#991b1b', border: '#fca5a5' },
  };
  
  const colors = decisionColors[decision] || decisionColors.ACCEPT;
  const decisionLabel = decision.replace('_', ' ');
  
  return {
    subject: `Decision on Manuscript ${manuscriptId}: ${decisionLabel}`,
    html: `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #1e293b; max-width: 600px; margin: 0 auto; padding: 20px;">
  <div style="background: linear-gradient(135deg, #0f172a 0%, #1e3a5f 100%); padding: 40px 30px; text-align: center; border-radius: 12px 12px 0 0;">
    <h1 style="color: #fbbf24; margin: 0; font-size: 28px; font-weight: 700;">Advances in Medicine and Health Sciences Journal</h1>
  </div>
  <div style="background: #ffffff; padding: 40px 30px; border: 1px solid #e2e8f0; border-top: none; border-radius: 0 0 12px 12px;">
    <h2 style="color: #0f172a; margin: 0 0 16px; font-size: 24px;">Editorial Decision</h2>
    <p style="color: #475569; margin: 0 0 24px; font-size: 16px;">Dear ${firstName},</p>
    <p style="color: #475569; margin: 0 0 16px; font-size: 16px;">A decision has been made on your manuscript submitted to <strong>Advances in Medicine and Health Sciences Journal</strong>.</p>
    <div style="background: ${colors.bg}; border: 1px solid ${colors.border}; border-radius: 8px; padding: 20px; margin: 24px 0; text-align: center;">
      <p style="margin: 0 0 8px; color: ${colors.text}; font-weight: 600; font-size: 14px;">MANUSCRIPT ID: ${manuscriptId}</p>
      <p style="margin: 0 0 12px; color: ${colors.text};">Title: ${title}</p>
      <span style="background: ${colors.border}; color: ${colors.text}; padding: 8px 20px; border-radius: 9999px; font-weight: 700; font-size: 16px;">${decisionLabel}</span>
    </div>
    ${notesToAuthor ? `
    <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 20px; margin: 24px 0;">
      <h3 style="color: #0f172a; margin: 0 0 12px; font-size: 16px;">Editor Comments:</h3>
      <p style="color: #475569; margin: 0; white-space: pre-wrap;">${notesToAuthor}</p>
    </div>
    ` : ''}
    <p style="color: #475569; margin: 24px 0 0; font-size: 16px;">Log in to your <a href="${process.env.NEXTAUTH_URL}/dashboard/manuscripts" style="color: #0f172a; font-weight: 600;">author dashboard</a> for next steps.</p>
    <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 32px 0;">
    <p style="color: #94a3b8; font-size: 12px; margin: 0; text-align: center;">Advances in Medicine and Health Sciences Journal</p>
  </div>
</body>
</html>
    `,
  };
}