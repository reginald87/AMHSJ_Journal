import { prisma } from '@/lib/prisma';
import { createLogger } from '@/lib/logger';

const logger = createLogger('Notify');

export async function createNotification({
  userId,
  type,
  title,
  message,
  data,
}: {
  userId: string;
  type: string;
  title: string;
  message: string;
  data?: string;
}) {
  try {
    await prisma.notification.create({
      data: { userId, type, title, message, data },
    });
  } catch (e) {
    logger.error('Failed to create notification', e);
  }
}
