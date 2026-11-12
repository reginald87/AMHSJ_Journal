import { prisma } from '@/lib/prisma';
import { createNotification } from '@/lib/notify';
import {
  sendEmail,
  getDecisionEmailTemplate,
  getManuscriptStatusEmailTemplate,
  getManuscriptSubmissionEmailTemplate,
  getPublicationEmailTemplate,
} from '@/lib/email';
import { createLogger } from '@/lib/logger';

const logger = createLogger('ManuscriptNotify');

export type ManuscriptStatus =
  | 'SUBMITTED'
  | 'UNDER_REVIEW'
  | 'UNDER_REVISION'
  | 'ACCEPTED'
  | 'REJECTED'
  | 'PUBLISHED'
  | 'WITHDRAWN';

export type ManuscriptDecision = 'ACCEPT' | 'MINOR_REVISION' | 'MAJOR_REVISION' | 'REJECT';

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

const STATUS_NOTIFICATION: Record<ManuscriptStatus, { type: string; title: string; message: (title: string) => string }> = {
  SUBMITTED: {
    type: 'MANUSCRIPT_SUBMITTED',
    title: 'Manuscript Submitted',
    message: (title) => `Your manuscript "${title}" has been submitted and is awaiting editorial assignment.`,
  },
  UNDER_REVIEW: {
    type: 'MANUSCRIPT_UNDER_REVIEW',
    title: 'Manuscript Under Review',
    message: (title) => `Your manuscript "${title}" is now under review.`,
  },
  UNDER_REVISION: {
    type: 'MANUSCRIPT_DECISION',
    title: 'Revision Requested',
    message: (title) => `Your manuscript "${title}" requires revision. Please review the editor's comments.`,
  },
  ACCEPTED: {
    type: 'MANUSCRIPT_DECISION',
    title: 'Manuscript Accepted',
    message: (title) => `Your manuscript "${title}" has been accepted for publication.`,
  },
  REJECTED: {
    type: 'MANUSCRIPT_DECISION',
    title: 'Manuscript Rejected',
    message: (title) => `A decision has been made on your manuscript "${title}".`,
  },
  PUBLISHED: {
    type: 'MANUSCRIPT_PUBLISHED',
    title: 'Manuscript Published',
    message: (title) => `Your manuscript "${title}" has been published.`,
  },
  WITHDRAWN: {
    type: 'MANUSCRIPT_WITHDRAWN',
    title: 'Manuscript Withdrawn',
    message: (title) => `Your manuscript "${title}" has been withdrawn from the editorial process.`,
  },
};

function getStatusEmail({
  status,
  manuscriptId,
  manuscriptTitle,
  firstName,
  decision,
  notesToAuthor,
  doi,
  volumeLabel,
  articleUrl,
}: {
  status: ManuscriptStatus;
  manuscriptId: string;
  manuscriptTitle: string;
  firstName: string;
  decision?: ManuscriptDecision;
  notesToAuthor?: string | null;
  doi?: string | null;
  volumeLabel?: string | null;
  articleUrl?: string | null;
}): ManuscriptAuthorEmail {
  if (status === 'SUBMITTED') {
    return getManuscriptSubmissionEmailTemplate(manuscriptId, manuscriptTitle, firstName);
  }

  if (status === 'PUBLISHED' && doi && volumeLabel && articleUrl) {
    return getPublicationEmailTemplate(manuscriptId, manuscriptTitle, firstName, doi, volumeLabel, articleUrl);
  }

  if (status === 'UNDER_REVISION' || status === 'ACCEPTED' || status === 'REJECTED') {
    const decisionValue: ManuscriptDecision =
      decision || (status === 'ACCEPTED' ? 'ACCEPT' : status === 'REJECTED' ? 'REJECT' : 'MAJOR_REVISION');
    return getDecisionEmailTemplate(
      decisionValue,
      manuscriptId,
      manuscriptTitle,
      firstName,
      notesToAuthor || undefined
    );
  }

  return getManuscriptStatusEmailTemplate(status, manuscriptId, manuscriptTitle, firstName, {
    notes: notesToAuthor || undefined,
    doi: doi || undefined,
    volumeLabel: volumeLabel || undefined,
    articleUrl: articleUrl || undefined,
  });
}

/**
 * Notifies every author (in-app where an account exists, plus email) about a
 * manuscript status change. Failures are logged but never block the workflow.
 */
export async function notifyManuscriptStatusChange({
  manuscriptId,
  manuscriptTitle,
  status,
  decision,
  notesToAuthor,
  doi,
  volumeLabel,
  articleUrl,
}: {
  manuscriptId: string;
  manuscriptTitle: string;
  status: ManuscriptStatus;
  decision?: ManuscriptDecision;
  notesToAuthor?: string | null;
  doi?: string | null;
  volumeLabel?: string | null;
  articleUrl?: string | null;
}): Promise<void> {
  try {
    const recipients = await getManuscriptRecipients(manuscriptId);
    const meta = STATUS_NOTIFICATION[status];

    await notifyManuscriptAuthors({
      recipients,
      type: meta.type,
      title: meta.title,
      message: meta.message(manuscriptTitle),
      data: { manuscriptId, status },
      email: (recipient) =>
        getStatusEmail({
          status,
          manuscriptId,
          manuscriptTitle,
          firstName: recipient.firstName,
          decision,
          notesToAuthor,
          doi,
          volumeLabel,
          articleUrl,
        }),
    });
  } catch (e) {
    logger.error(`Failed to notify authors about status "${status}"`, e);
  }
}
