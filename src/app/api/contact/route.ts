import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { createLogger } from '@/lib/logger';

const logger = createLogger('ContactAPI');

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const { firstName, lastName, email, affiliation, subject, message } = body;

    if (!firstName || !lastName || !email || !subject || !message) {
      return NextResponse.json({ error: 'All required fields must be filled' }, { status: 400 });
    }

    if (typeof email !== 'string' || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return NextResponse.json({ error: 'Invalid email address' }, { status: 400 });
    }

    if (typeof message !== 'string' || message.trim().length < 10) {
      return NextResponse.json({ error: 'Message must be at least 10 characters' }, { status: 400 });
    }

    await prisma.contactMessage.create({
      data: {
        firstName: String(firstName).trim(),
        lastName: String(lastName).trim(),
        email: String(email).trim().toLowerCase(),
        affiliation: affiliation ? String(affiliation).trim() : null,
        subject: String(subject).trim(),
        message: String(message).trim(),
      },
    });

    return NextResponse.json({ success: true, message: 'Message sent successfully' });
  } catch (error) {
    logger.error('Error saving contact message', error);
    return NextResponse.json({ error: 'Failed to send message' }, { status: 500 });
  }
}
