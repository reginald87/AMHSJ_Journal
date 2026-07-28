import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { readFile } from 'fs/promises';
import { join } from 'path';
import { existsSync } from 'fs';

export async function GET(_request: NextRequest) {
  try {
    const journal = await prisma.journal.findFirst({
      where: { isActive: true },
      include: { settings: true },
    });

    if (!journal?.settings?.manuscriptTemplate) {
      return NextResponse.json({ error: 'No template available' }, { status: 404 });
    }

    const templatePath = journal.settings.manuscriptTemplate;
    const filename = templatePath.split('/').pop() || 'manuscript-template.docx';
    const filepath = join(process.cwd(), 'uploads', 'templates', filename);

    if (!existsSync(filepath)) {
      return NextResponse.json({ error: 'Template file not found' }, { status: 404 });
    }

    const buffer = await readFile(filepath);

    const ext = filename.split('.').pop()?.toLowerCase() || 'docx';
    const mimeTypes: Record<string, string> = {
      doc: 'application/msword',
      docx: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      pdf: 'application/pdf',
    };

    return new NextResponse(buffer, {
      headers: {
        'Content-Type': mimeTypes[ext] || 'application/octet-stream',
        'Content-Disposition': `attachment; filename="${filename}"`,
        'Cache-Control': 'public, max-age=3600',
      },
    });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to serve template' }, { status: 500 });
  }
}
