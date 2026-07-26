import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import bcrypt from 'bcryptjs';
import { createLogger } from '@/lib/logger';

const logger = createLogger('AdminUser');

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    const body = await request.json();
    const { role, status, firstName, lastName, affiliation, department, orcid, phone, country, bio, password } = body;

    const data: Record<string, unknown> = {};
    if (role) data.role = role;
    if (status) data.status = status;
    if (firstName !== undefined) data.firstName = firstName;
    if (lastName !== undefined) data.lastName = lastName;
    if (affiliation !== undefined) data.affiliation = affiliation;
    if (department !== undefined) data.department = department || null;
    if (orcid !== undefined) data.orcid = orcid || null;
    if (phone !== undefined) data.phone = phone || null;
    if (country !== undefined) data.country = country || null;
    if (bio !== undefined) data.bio = bio || null;
    if (password && password.length >= 6) {
      data.passwordHash = await bcrypt.hash(password, 12);
    }

    if (Object.keys(data).length === 0) {
      return NextResponse.json({ error: 'No fields to update' }, { status: 400 });
    }

    const user = await prisma.user.update({
      where: { id },
      data,
      select: { id: true, email: true, firstName: true, lastName: true, role: true, status: true, affiliation: true, department: true, orcid: true, phone: true, country: true, bio: true },
    });

    return NextResponse.json(user);
  } catch (error) {
    logger.error('Error updating user', error);
    return NextResponse.json({ error: 'Failed to update user' }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;

    // Don't allow deleting yourself
    if (session.user.id === id) {
      return NextResponse.json({ error: 'Cannot delete your own account' }, { status: 400 });
    }

    await prisma.user.delete({ where: { id } });

    return NextResponse.json({ success: true });
  } catch (error) {
    logger.error('Error deleting user', error);
    return NextResponse.json({ error: 'Failed to delete user' }, { status: 500 });
  }
}
