import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { getAssignableEditors } from '@/lib/editor-assignment';
import { createLogger } from '@/lib/logger';

const logger = createLogger('EditorialEditors');

const ALLOWED_ROLES = ['EDITOR', 'EDITOR_IN_CHIEF', 'DEPUTY_EDITOR_IN_CHIEF', 'ASSOCIATE_EDITOR', 'ADMIN', 'EDITOR_ASSISTANT'];

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !ALLOWED_ROLES.includes(session.user.role)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const editors = await getAssignableEditors();

    return NextResponse.json(editors);
  } catch (error) {
    logger.error('Error fetching editors', error);
    return NextResponse.json({ error: 'Failed to fetch editors' }, { status: 500 });
  }
}
