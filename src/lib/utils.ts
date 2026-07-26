import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDate(date: Date | string, options?: Intl.DateTimeFormatOptions): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  return d.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    ...options,
  });
}

export function slugify(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

export function getStatusVariant(status: string): 'default' | 'success' | 'warning' | 'danger' | 'info' {
  const statusMap: Record<string, 'default' | 'success' | 'warning' | 'danger' | 'info'> = {
    SUBMITTED: 'info',
    UNDER_REVIEW: 'warning',
    UNDER_REVISION: 'warning',
    ACCEPTED: 'success',
    REJECTED: 'danger',
    PUBLISHED: 'success',
    WITHDRAWN: 'default',
    PENDING: 'info',
    INVITED: 'info',
    ACCEPTED_INVITATION: 'success',
    DECLINED: 'danger',
    COMPLETED: 'success',
    OVERDUE: 'danger',
  };
  return statusMap[status] || 'default';
}

export function getRoleBadgeVariant(role: string): 'navy' | 'gold' | 'success' | 'warning' | 'danger' | 'info' {
  const roleMap: Record<string, 'navy' | 'gold' | 'success' | 'warning' | 'danger' | 'info'> = {
    ADMIN: 'danger',
    EDITOR_IN_CHIEF: 'gold',
    DEPUTY_EDITOR_IN_CHIEF: 'gold',
    ASSOCIATE_EDITOR: 'navy',
    EDITOR: 'navy',
    REVIEWER: 'success',
    AUTHOR: 'info',
  };
  return roleMap[role] || 'default';
}

