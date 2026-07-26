'use client';

import { cn } from '@/lib/utils';

interface StatCardProps {
  title: string;
  value: number;
  icon: string;
  color: 'blue' | 'amber' | 'green' | 'purple';
}

export function StatCard({ title, value, icon: IconName, color }: StatCardProps) {
  const colors = {
    blue: 'bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400',
    amber: 'bg-amber-100 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400',
    green: 'bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400',
    purple: 'bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400',
  };

  const icons: Record<string, React.ReactNode> = {
    FileText: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>,
    Clock: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>,
    CheckCircle: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>,
    BookOpen: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" /></svg>,
  };

  return (
    <div className="bg-white dark:bg-navy-900 rounded-xl border border-slate-200 dark:border-navy-800 p-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-slate-500 dark:text-slate-400">{title}</p>
          <p className="text-3xl font-bold text-navy-900 dark:text-white mt-1">{value}</p>
        </div>
        <div className={cn('w-12 h-12 rounded-xl flex items-center justify-center', colors[color])}>
          {icons[IconName]}
        </div>
      </div>
    </div>
  );
}

interface ManuscriptRowProps {
  id: string;
  title: string;
  type: string;
  status: string;
  submitted: string;
  lastAction: string;
}

const statusVariants: Record<string, string> = {
  SUBMITTED: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400',
  UNDER_REVIEW: 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400',
  UNDER_REVISION: 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400',
  ACCEPTED: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400',
  REJECTED: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400',
  PUBLISHED: 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400',
  WITHDRAWN: 'bg-slate-100 text-slate-800 dark:bg-slate-900/30 dark:text-slate-400',
};

export function ManuscriptRow({ id, title, type, status, submitted, lastAction }: ManuscriptRowProps) {
  return (
    <tr className="hover:bg-slate-50 dark:hover:bg-navy-800/50">
      <td className="px-6 py-4">
        <a href={`/dashboard/manuscripts/${id}`} className="font-medium text-navy-900 dark:text-white hover:text-gold-600 dark:hover:text-gold-400">
          {title}
        </a>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">{id}</p>
      </td>
      <td className="px-6 py-4 text-sm text-slate-600 dark:text-slate-400">{type}</td>
      <td className="px-6 py-4">
        <span className={cn('inline-flex px-2 py-1 text-xs font-medium rounded-full', statusVariants[status])}>
          {status?.replace(/_/g, ' ') || status}
        </span>
      </td>
      <td className="px-6 py-4 text-sm text-slate-600 dark:text-slate-400">{submitted}</td>
      <td className="px-6 py-4 text-right">
        <a href={`/dashboard/manuscripts/${id}`} className="text-sm text-gold-600 hover:text-gold-700 font-medium">
          View
        </a>
      </td>
    </tr>
  );
}