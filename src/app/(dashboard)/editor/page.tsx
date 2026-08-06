import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import { ManuscriptStatusPieChart, SubmissionTrendChart } from '@/components/ui/Charts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';

export const dynamic = 'force-dynamic';

export default async function EditorPage() {
  const session = await getServerSession(authOptions);
  if (!session) redirect('/login');

  const role = session.user?.role;
  if (role === 'ADMIN') {
    redirect('/admin');
  }

  const [statusCounts, trendData] = await Promise.all([
    prisma.manuscript.groupBy({ by: ['status'], _count: { status: true } }).then((rows) => {
      const counts: Record<string, number> = {};
      for (const r of rows) counts[r.status] = r._count.status;
      return counts;
    }),
    prisma.$queryRaw<{ month: string; count: bigint }[]>`
      SELECT strftime('%Y-%m', submittedAt) as month, COUNT(*) as count
      FROM Manuscript
      WHERE submittedAt IS NOT NULL
      GROUP BY month
      ORDER BY month DESC
      LIMIT 12
    `,
  ]);

  const total = Object.values(statusCounts).reduce((a, b) => a + b, 0);

  const trend = trendData
    .reverse()
    .map((r) => ({ month: r.month.slice(5), count: Number(r.count) }));

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold text-navy-900 dark:text-white">
          Editorial Dashboard
        </h1>
        <p className="text-slate-600 dark:text-slate-400 mt-1">
          Manage manuscripts and the editorial workflow
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Submitted', value: statusCounts['SUBMITTED'] || 0, color: 'bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400' },
          { label: 'Under Review', value: statusCounts['UNDER_REVIEW'] || 0, color: 'bg-amber-100 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400' },
          { label: 'Accepted', value: statusCounts['ACCEPTED'] || 0, color: 'bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400' },
          { label: 'Published', value: statusCounts['PUBLISHED'] || 0, color: 'bg-teal-100 dark:bg-teal-900/30 text-teal-600 dark:text-teal-400' },
        ].map((stat) => (
          <div key={stat.label} className="bg-white dark:bg-navy-900 rounded-xl border border-slate-200 dark:border-navy-800 p-6">
            <p className="text-sm font-medium text-slate-500 dark:text-slate-400">{stat.label}</p>
            <p className="text-3xl font-bold text-navy-900 dark:text-white mt-1">{stat.value}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="bg-white dark:bg-navy-900 border-slate-200 dark:border-navy-800">
          <CardHeader>
            <CardTitle className="text-lg">Status Distribution ({total} total)</CardTitle>
          </CardHeader>
          <CardContent>
            <ManuscriptStatusPieChart statusCounts={statusCounts} />
          </CardContent>
        </Card>
        <Card className="bg-white dark:bg-navy-900 border-slate-200 dark:border-navy-800">
          <CardHeader>
            <CardTitle className="text-lg">Submission Trend</CardTitle>
          </CardHeader>
          <CardContent>
            <SubmissionTrendChart data={trend} />
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <a href="/editor/manuscripts" className="bg-white dark:bg-navy-900 rounded-xl border border-slate-200 dark:border-navy-800 p-6 hover:border-gold-300 transition-colors">
          <h3 className="font-semibold text-navy-900 dark:text-white">All Manuscripts</h3>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">View and manage submissions</p>
        </a>
        <a href="/editor/reviewers" className="bg-white dark:bg-navy-900 rounded-xl border border-slate-200 dark:border-navy-800 p-6 hover:border-gold-300 transition-colors">
          <h3 className="font-semibold text-navy-900 dark:text-white">Reviewer Management</h3>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Assign and track reviewers</p>
        </a>
        <a href="/editor/volumes" className="bg-white dark:bg-navy-900 rounded-xl border border-slate-200 dark:border-navy-800 p-6 hover:border-gold-300 transition-colors">
          <h3 className="font-semibold text-navy-900 dark:text-white">Volumes</h3>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Manage journal volumes</p>
        </a>
      </div>
    </div>
  );
}
