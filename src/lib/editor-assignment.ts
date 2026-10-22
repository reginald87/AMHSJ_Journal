import { prisma } from '@/lib/prisma';
import { Role } from '@prisma/client';

export const EDITOR_ROLES: Role[] = [
  'EDITOR',
  'EDITOR_IN_CHIEF',
  'DEPUTY_EDITOR_IN_CHIEF',
  'ASSOCIATE_EDITOR',
  'INTERNATIONAL_EDITOR',
  'ADMIN',
];

export interface AssignableEditor {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  role: Role;
}

/**
 * Resolves the list of users who may be assigned as handling editor.
 * An editor is either a user holding an editorial role on the journal or a
 * user whose account role is one of the editorial roles.
 */
export async function getAssignableEditors(): Promise<AssignableEditor[]> {
  const editorialRoles = await prisma.editorialRole.findMany({
    where: { isActive: true, role: { in: EDITOR_ROLES } },
    include: {
      user: {
        select: { id: true, firstName: true, lastName: true, email: true, role: true, status: true },
      },
    },
    orderBy: [{ role: 'asc' }],
  });

  const editors = new Map<string, AssignableEditor>();

  for (const entry of editorialRoles) {
    if (!entry.user) continue;
    if (entry.user.status !== 'ACTIVE') continue;
    editors.set(entry.user.id, {
      id: entry.user.id,
      firstName: entry.user.firstName,
      lastName: entry.user.lastName,
      email: entry.user.email,
      role: entry.role,
    });
  }

  const usersWithEditorRole = await prisma.user.findMany({
    where: { role: { in: EDITOR_ROLES }, status: 'ACTIVE' },
    select: { id: true, firstName: true, lastName: true, email: true, role: true },
    orderBy: [{ role: 'asc' }, { lastName: 'asc' }],
  });

  for (const user of usersWithEditorRole) {
    if (editors.has(user.id)) continue;
    editors.set(user.id, {
      id: user.id,
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      role: user.role,
    });
  }

  return Array.from(editors.values());
}

/**
 * Validates an `assignedEditorId` payload. The id must reference a real user
 * account that is allowed to act as an editor, otherwise the manuscript update
 * would fail the `Manuscript_assignedEditorId_fkey` foreign key constraint.
 */
export async function resolveAssignedEditor(
  assignedEditorId: string
): Promise<{ ok: true; editor: AssignableEditor } | { ok: false; error: string }> {
  const editor = await prisma.user.findUnique({
    where: { id: assignedEditorId },
    select: { id: true, firstName: true, lastName: true, email: true, role: true, status: true },
  });

  if (!editor) {
    return { ok: false, error: 'Selected editor does not exist' };
  }

  if (!EDITOR_ROLES.includes(editor.role)) {
    return { ok: false, error: `${editor.firstName} ${editor.lastName} is not an editor` };
  }

  if (editor.status !== 'ACTIVE') {
    return { ok: false, error: `${editor.firstName} ${editor.lastName} is not an active user` };
  }

  return {
    ok: true,
    editor: {
      id: editor.id,
      firstName: editor.firstName,
      lastName: editor.lastName,
      email: editor.email,
      role: editor.role,
    },
  };
}
