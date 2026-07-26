import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { extractManuscriptText, extractMetadata } from '@/lib/manuscript-extract';
import { createLogger } from '@/lib/logger';

const logger = createLogger('ManuscriptParse');

export const runtime = 'nodejs';
export const maxDuration = 60;

const ALLOWED = [
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
];

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    const allowedRoles = ['AUTHOR', 'EDITOR', 'EDITOR_IN_CHIEF', 'DEPUTY_EDITOR_IN_CHIEF', 'ASSOCIATE_EDITOR', 'ADMIN'];

    if (!session || !allowedRoles.includes(session.user.role)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const formData = await request.formData();
    const file = formData.get('file') as File | null;

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }

    const mime = file.type || '';
    const name = file.name.toLowerCase();

    if (!ALLOWED.includes(mime) && !name.endsWith('.pdf') && !name.endsWith('.doc') && !name.endsWith('.docx')) {
      return NextResponse.json({ error: 'Unsupported file type. Upload a PDF, DOC, or DOCX.' }, { status: 415 });
    }

    if (file.size > 50 * 1024 * 1024) {
      return NextResponse.json({ error: 'File exceeds the 50MB limit.' }, { status: 413 });
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    const text = await extractManuscriptText(buffer, mime, name);

    if (!text || text.trim().length === 0) {
      return NextResponse.json(
        { metadata: { title: '', abstract: '', keywords: '', authors: [] }, note: 'No text could be extracted from this file.' },
        { status: 200 },
      );
    }

    const metadata = extractMetadata(text);
    return NextResponse.json({ metadata }, { status: 200 });
  } catch (error) {
    logger.error('Manuscript parse error', error);
    return NextResponse.json({ error: 'Failed to parse manuscript' }, { status: 500 });
  }
}
