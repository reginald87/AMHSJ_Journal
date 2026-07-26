import { Metadata } from 'next';
import Link from 'next/link';
import { getServerSession } from 'next-auth';
import { redirect } from 'next/navigation';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Users, FileText, BookOpen, Globe, Clock, CheckCircle } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Admin Dashboard',
  description: 'AMHSJ Admin Dashboard - Overview',
};

export const dynamic = 'force-dynamic';

interface SessionUser {
  firstName: string;
  role: string;
}

export default async function AdminOverviewPage() {
  const session = await getServerSession(authOptions);
  if (!session || (session.user as SessionUser).role !== 'ADMIN') {
    redirect('/');
  }

  const stats = await Promise.all([
    prisma.user.count(),
    prisma.user.count({ where: { role: 'AUTHOR' } }),
    prisma.user.count({ where: { role: 'REVIEWER' } }),
    prisma.user.count({ where: { role: 'EDITOR' } }),
    prisma.manuscript.count(),
    prisma.manuscript.count({ where: { status: 'SUBMITTED' } }),
    prisma.manuscript.count({ where: { status: 'UNDER_REVIEW' } }),
    prisma.manuscript.count({ where: { status: 'ACCEPTED' } }),
    prisma.manuscript.count({ where: { status: 'PUBLISHED' } }),
    prisma.volume.count(),
    prisma.page.count(),
  ]);

  const [
    totalUsers, totalAuthors, totalReviewers, totalEditors,
    totalManuscripts, submitted, underReview, accepted, published,
    _totalVolumes, totalPages,
  ] = stats;

  const statCards = [
    { label: 'Total Users', value: totalUsers, icon: Users, bg: 'bg-blue-100 dark:bg-blue-900/30', text: 'text-blue-600 dark:text-blue-400' },
    { label: 'Authors', value: totalAuthors, icon: FileText, bg: 'bg-indigo-100 dark:bg-indigo-900/30', text: 'text-indigo-600 dark:text-indigo-400' },
    { label: 'Reviewers', value: totalReviewers, icon: Users, bg: 'bg-green-100 dark:bg-green-900/30', text: 'text-green-600 dark:text-green-400' },
    { label: 'Editors', value: totalEditors, icon: Users, bg: 'bg-purple-100 dark:bg-purple-900/30', text: 'text-purple-600 dark:text-purple-400' },
    { label: 'Manuscripts', value: totalManuscripts, icon: FileText, bg: 'bg-amber-100 dark:bg-amber-900/30', text: 'text-amber-600 dark:text-amber-400' },
    { label: 'Under Review', value: underReview, icon: Clock, bg: 'bg-orange-100 dark:bg-orange-900/30', text: 'text-orange-600 dark:text-orange-400' },
    { label: 'Published', value: published, icon: CheckCircle, bg: 'bg-teal-100 dark:bg-teal-900/30', text: 'text-teal-600 dark:text-teal-400' },
    { label: 'CMS Pages', value: totalPages, icon: Globe, bg: 'bg-cyan-100 dark:bg-cyan-900/30', text: 'text-cyan-600 dark:text-cyan-400' },
  ];

  const manuscriptStatus = [
    { label: 'Submitted', value: submitted, color: 'bg-blue-500' },
    { label: 'Under Review', value: underReview, color: 'bg-amber-500' },
    { label: 'Accepted', value: accepted, color: 'bg-green-500' },
    { label: 'Published', value: published, color: 'bg-teal-500' },
  ];

  const quickActions = [
    { label: 'CMS Pages', desc: 'Manage site content', href: '/admin/pages', icon: Globe, color: 'bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400' },
    { label: 'Editorial Board', desc: 'Manage editors and roles', href: '/admin/editorial-board', icon: Users, color: 'bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400' },
    { label: 'Manuscripts', desc: 'Review submissions', href: '/admin/manuscripts', icon: FileText, color: 'bg-amber-100 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400' },
    { label: 'Volumes', desc: 'Manage journal volumes', href: '/admin/volumes', icon: BookOpen, color: 'bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400' },
  ];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold text-navy-900 dark:text-white">
          Welcome back, {(session.user as SessionUser).firstName}
        </h1>
        <p className="text-slate-600 dark:text-slate-400 mt-1">
          Manage your journal content and editorial workflow
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((stat) => (
          <Card key={stat.label}>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-500 dark:text-slate-400">{stat.label}</p>
                  <p className="text-3xl font-bold text-navy-900 dark:text-white mt-1">{stat.value}</p>
                </div>
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${stat.bg} ${stat.text}`}>
                  <stat.icon className="w-6 h-6" />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="text-lg">Manuscript Status</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {manuscriptStatus.map((item) => (
                <div key={item.label} className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className={`w-3 h-3 rounded-full ${item.color}`} />
                    <span className="text-sm font-medium text-slate-600 dark:text-slate-400">{item.label}</span>
                  </div>
                  <span className="text-lg font-bold text-navy-900 dark:text-white">{item.value}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Quick Actions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {quickActions.map((action) => (
              <Link
                key={action.href}
                href={action.href}
                className="flex items-center gap-3 p-3 rounded-lg border border-slate-200 dark:border-navy-700 hover:border-gold-300 transition-colors"
              >
                <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${action.color}`}>
                  <action.icon className="w-5 h-5" />
                </div>
                <div>
                  <p className="font-medium text-navy-900 dark:text-white text-sm">{action.label}</p>
                  <p className="text-xs text-slate-500 dark:text-slate-400">{action.desc}</p>
                </div>
              </Link>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
