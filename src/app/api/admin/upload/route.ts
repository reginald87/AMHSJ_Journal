import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { writeFile, mkdir } from 'fs/promises';
import { join } from 'path';
import { existsSync } from 'fs';
import { createLogger } from '@/lib/logger';

const logger = createLogger('AdminUpload');

const IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'image/svg+xml'];
const DOC_TYPES = [
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'application/pdf',
];
const MAX_SIZE = 10 * 1024 * 1024;

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const formData = await request.formData();
    const file = formData.get('file') as File | null;
    const folder = (formData.get('folder') as string) || 'carousel';

    if (!file || file.size === 0) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }

    const safeFolder = folder.replace(/[^a-zA-Z0-9_-]/g, '');
    const isTemplate = safeFolder === 'templates';
    const allowedTypes = isTemplate ? [...IMAGE_TYPES, ...DOC_TYPES] : IMAGE_TYPES;

    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json(
        { error: isTemplate ? 'File must be DOC, DOCX, PDF, or an image' : 'File must be an image (JPEG, PNG, GIF, WebP, or SVG)' },
        { status: 400 },
      );
    }

    if (file.size > MAX_SIZE) {
      return NextResponse.json({ error: 'File must be less than 10MB' }, { status: 400 });
    }

    const uploadDir = join(process.cwd(), 'uploads', safeFolder);
    if (!existsSync(uploadDir)) {
      await mkdir(uploadDir, { recursive: true });
    }

    const ext = file.name.split('.').pop() || 'jpg';
    const timestamp = Date.now();
    const random = Math.random().toString(36).substring(2, 8);
    const filename = `${timestamp}-${random}.${ext}`;
    const filePath = join(uploadDir, filename);
    const buffer = Buffer.from(await file.arrayBuffer());
    await writeFile(filePath, buffer);

    const imageUrl = `/uploads/${safeFolder}/${filename}`;

    return NextResponse.json({ url: imageUrl, filename });
  } catch (error) {
    logger.error('Error uploading file', error);
    return NextResponse.json({ error: 'Failed to upload file' }, { status: 500 });
  }
}
