import { prisma } from '@/lib/prisma';
import { createNotification } from '@/lib/notify';
import { sendEmail } from '@/lib/email';
import { createLogger } from '@/lib/logger';

const logger = createLogger('ManuscriptNotify');

export interface ManuscriptAuthorRecipient {
  userId: string | null;
  firstName: string;
  lastName: string;
  email: string;
}

export interface ManuscriptAuthorEmail {
  subject: string;
  html: string;
}

export async function getManuscriptRecipients(manuscriptId: string): Promise<ManuscriptAuthorRecipient[]> {
  const manuscript = await prisma.manuscript.findUnique({
    where: { id: manuscriptId },
    select: {
      correspondingAuthor: { select: { id: true, firstName: true, lastName: true, email: true } },
      authors: { select: { userId: true, firstName: true, lastName: true, email: true } },
    },
  });

  if (!manuscript) return [];

  const recipients = new Map<string, ManuscriptAuthorRecipient>();

  recipients.set(
    manuscript.correspondingAuthor.email.toLowerCase(),
    {
      userId: manuscript.correspondingAuthor.id,
      firstName: manuscript.correspondingAuthor.firstName,
      lastName: manuscript.correspondingAuthor.lastName,
      email: manuscript.correspondingAuthor.email,
    }
  );

  for (const author of manuscript.authors) {
    const key = author.email.toLowerCase();
    if (!author.email || recipients.has(key)) continue;
    recipients.set(key, {
      userId: author.userId,
      firstName: author.firstName,
      lastName: author.lastName,
      email: author.email,
    });
  }

  return Array.from(recipients.values());
}

/**
 * Creates an in-app notification for every registered author and sends them an
 * email. Failures are logged but never block the editorial workflow.
 */
export async function notifyManuscriptAuthors({
  recipients,
  type,
  title,
  message,
  data,
  email,
}: {
  recipients: ManuscriptAuthorRecipient[];
  type: string;
  title: string;
  message: string;
  data?: Record<string, unknown>;
  email?: (recipient: ManuscriptAuthorRecipient) => ManuscriptAuthorEmail | null;
}): Promise<void> {
  for (const recipient of recipients) {
    if (recipient.userId) {
      await createNotification({
        userId: recipient.userId,
        type,
        title,
        message,
        data: data ? JSON.stringify(data) : undefined,
      });
    }

    if (!email) continue;

    try {
      const template = email(recipient);
      if (!template) continue;

      await sendEmail({
        to: recipient.email,
        subject: template.subject,
        html: template.html,
      });
    } catch (e) {
      logger.error(`Failed to send "${type}" email to ${recipient.email}`, e);
    }
  }
}
