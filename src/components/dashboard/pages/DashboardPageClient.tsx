'use client';

import Link from 'next/link';
import { StatCard, ManuscriptRow } from '@/components/dashboard/DashboardComponents';
import {
  FileText,
  Clock,
  CheckCircle,
  BookOpen,
} from 'lucide-react';

interface ManuscriptData {
  id: string;
  title: string;
  articleType: string;
  status: string;
  submittedAt: string;
  journal: { name: string; shortName: string };
}

interface DashboardPageClientProps {
  initialStats: number[];
  initialManuscripts: ManuscriptData[];
  user: { firstName: string; lastName: string; role: string; email: string };
}

export function DashboardPageClient({ initialStats, initialManuscripts, user }: DashboardPageClientProps) {
  const stats = [
    { title: 'Submitted', value: initialStats[0], icon: 'FileText', color: 'blue' as const },
    { title: 'Under Review', value: initialStats[1], icon: 'Clock', color: 'amber' as const },
    { title: 'Accepted', value: initialStats[2], icon: 'CheckCircle', color: 'green' as const },
    { title: 'Published', value: initialStats[3], icon: 'BookOpen', color: 'purple' as const },
  ];

  return (
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-navy-900 dark:text-white">
              Welcome back, {user.firstName}
            </h1>
            <p className="text-slate-600 dark:text-slate-400 mt-1">
              Manage your manuscripts and track submission progress
            </p>
          </div>
          <Link
            href="/submit"
            className="inline-flex items-center gap-2 px-4 py-2 bg-navy-900 text-white rounded-lg hover:bg-navy-800 text-sm font-medium"
          >
            New Submission
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {stats.map((stat, index) => (
            <StatCard key={index} {...stat} />
          ))}
        </div>

        <div className="bg-white dark:bg-navy-900 rounded-xl border border-slate-200 dark:border-navy-800">
          <div className="px-6 py-4 border-b border-slate-200 dark:border-navy-800 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <h2 className="text-lg font-semibold text-navy-900 dark:text-white">Your Manuscripts</h2>
            <Link href="/dashboard/manuscripts" className="text-sm text-gold-600 hover:text-gold-700 font-medium">
              View All
            </Link>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-slate-200 dark:border-navy-800">
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">Manuscript</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">Type</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">Submitted</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 dark:divide-navy-800">
                {initialManuscripts.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-6 py-12 text-center text-slate-500 dark:text-slate-400">
                      <div className="flex flex-col items-center gap-2">
                        <FileText className="w-12 h-12 text-slate-300 dark:text-slate-600" />
                        <p className="font-medium">No manuscripts yet</p>
                        <p className="text-sm">Start your first submission</p>
                        <Link href="/submit" className="mt-2 inline-flex items-center gap-2 px-4 py-2 bg-navy-900 text-white rounded-lg hover:bg-navy-800 text-sm font-medium">
                          New Submission
                        </Link>
                      </div>
                    </td>
                  </tr>
                ) : (
                  initialManuscripts.map((manuscript) => (
                    <ManuscriptRow
                      key={manuscript.id}
                      id={manuscript.id}
                      title={manuscript.title}
                      type={manuscript.articleType}
                      status={manuscript.status}
                      submitted={new Date(manuscript.submittedAt).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}
                      lastAction="In progress"
                    />
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white dark:bg-navy-900 rounded-xl border border-slate-200 dark:border-navy-800 p-6">
            <h3 className="text-lg font-semibold text-navy-900 dark:text-white mb-4">Quick Actions</h3>
            <div className="space-y-3">
              <Link href="/submit" className="flex items-center gap-3 p-3 rounded-lg border border-slate-200 dark:border-navy-700 hover:border-gold-300 dark:hover:border-gold-700 transition-colors">
                <span className="w-10 h-10 bg-gold-100 dark:bg-gold-900/30 rounded-lg flex items-center justify-center text-gold-600 dark:text-gold-400">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
                </span>
                <div>
                  <p className="font-medium text-navy-900 dark:text-white">New Submission</p>
                  <p className="text-sm text-slate-500 dark:text-slate-400">Start a new manuscript submission</p>
                </div>
              </Link>
              <Link href="/dashboard/manuscripts" className="flex items-center gap-3 p-3 rounded-lg border border-slate-200 dark:border-navy-700 hover:border-gold-300 dark:hover:border-gold-700 transition-colors">
                <span className="w-10 h-10 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center text-blue-600 dark:text-blue-400">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" /></svg>
                </span>
                <div>
                  <p className="font-medium text-navy-900 dark:text-white">View All Manuscripts</p>
                  <p className="text-sm text-slate-500 dark:text-slate-400">Track status and manage submissions</p>
                </div>
              </Link>
              <Link href="/dashboard/profile" className="flex items-center gap-3 p-3 rounded-lg border border-slate-200 dark:border-navy-700 hover:border-gold-300 dark:hover:border-gold-700 transition-colors">
                <span className="w-10 h-10 bg-green-100 dark:bg-green-900/30 rounded-lg flex items-center justify-center text-green-600 dark:text-green-400">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
                </span>
                <div>
                  <p className="font-medium text-navy-900 dark:text-white">Update Profile</p>
                  <p className="text-sm text-slate-500 dark:text-slate-400">Manage your account and preferences</p>
                </div>
              </Link>
            </div>
          </div>

          <div className="bg-white dark:bg-navy-900 rounded-xl border border-slate-200 dark:border-navy-800 p-6">
            <h3 className="text-lg font-semibold text-navy-900 dark:text-white mb-4">Journal Information</h3>
            <div className="space-y-3">
              <div className="flex justify-between"><span className="text-sm text-slate-600 dark:text-slate-400">Journal</span><span className="text-sm font-medium text-navy-900 dark:text-white">Advances in Medicine and Health Sciences Journal</span></div>
              <div className="flex justify-between"><span className="text-sm text-slate-600 dark:text-slate-400">ISSN (Print)</span><span className="text-sm font-medium text-navy-900 dark:text-white">2XXX-XXXX</span></div>
              <div className="flex justify-between"><span className="text-sm text-slate-600 dark:text-slate-400">ISSN (Online)</span><span className="text-sm font-medium text-navy-900 dark:text-white">2XXX-XXXX</span></div>
              <div className="flex justify-between"><span className="text-sm text-slate-600 dark:text-slate-400">Current Volume</span><span className="text-sm font-medium text-navy-900 dark:text-white">Vol. 5 (2024)</span></div>
              <div className="flex justify-between"><span className="text-sm text-slate-600 dark:text-slate-400">Open Access</span><span className="text-sm font-medium text-navy-900 dark:text-white">Yes (CC BY 4.0)</span></div>
              <div className="flex justify-between"><span className="text-sm text-slate-600 dark:text-slate-400">Average Time to First Decision</span><span className="text-sm font-medium text-navy-900 dark:text-white">28 days</span></div>
            </div>
          </div>
        </div>
      </div>
  );
}