import { prisma } from '@/lib/prisma';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { FileText, Users, BookOpen, Clock, CheckCircle, XCircle } from 'lucide-react';
import { ManuscriptStatusPieChart, SubmissionTrendChart, ArticleTypeBarChart } from '@/components/ui/Charts';

export const dynamic = 'force-dynamic';

async function getStats() {
  const [totalUsers, totalManuscripts, totalArticles, totalVolumes, manuscriptsByStatus, recentSubmissions, submissionsByMonth, articlesByType] = await Promise.all([
    prisma.user.count(),
    prisma.manuscript.count(),
    prisma.article.count(),
    prisma.volume.count(),
    prisma.manuscript.groupBy({ by: ['status'], _count: { status: true } }),
    prisma.manuscript.findMany({
      orderBy: { submittedAt: 'desc' },
      take: 10,
      select: {
        id: true,
        title: true,
        status: true,
        submittedAt: true,
        correspondingAuthor: { select: { firstName: true, lastName: true } },
      },
    }),
    prisma.$queryRaw<{ month: string; count: bigint }[]>`
      SELECT strftime('%Y-%m', submittedAt) as month, COUNT(*) as count
      FROM Manuscript
      WHERE submittedAt IS NOT NULL
      GROUP BY month
      ORDER BY month DESC
      LIMIT 12
    `,
    prisma.manuscript.groupBy({ by: ['articleType'], _count: { articleType: true } }),
  ]);

  const statusCounts: Record<string, number> = {};
  for (const row of manuscriptsByStatus) {
    statusCounts[row.status] = row._count.status;
  }

  const trendData = submissionsByMonth
    .reverse()
    .map((r) => ({ month: r.month.slice(5), count: Number(r.count) }));

  const typeData = articlesByType
    .map((r) => ({ type: r.articleType?.replace(/_/g, ' ') || 'Unknown', count: r._count.articleType }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 10);

  return { totalUsers, totalManuscripts, totalArticles, totalVolumes, statusCounts, recentSubmissions, trendData, typeData };
}

const statusColors: Record<string, string> = {
  SUBMITTED: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400',
  UNDER_REVIEW: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400',
  UNDER_REVISION: 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400',
  ACCEPTED: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400',
  REJECTED: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400',
  PUBLISHED: 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400',
  WITHDRAWN: 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400',
};

export default async function AdminAnalyticsPage() {
  const stats = await getStats();

  const statCards = [
    { label: 'Total Users', value: stats.totalUsers, icon: Users, color: 'bg-blue-100 text-blue-700' },
    { label: 'Manuscripts', value: stats.totalManuscripts, icon: FileText, color: 'bg-gold-100 text-gold-700' },
    { label: 'Published Articles', value: stats.totalArticles, icon: CheckCircle, color: 'bg-green-100 text-green-700' },
    { label: 'Volumes', value: stats.totalVolumes, icon: BookOpen, color: 'bg-purple-100 text-purple-700' },
  ];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-navy-900 dark:text-white">Analytics</h1>
        <p className="text-slate-600 dark:text-slate-400 text-sm mt-1">Platform overview and manuscript statistics.</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((s) => (
          <Card key={s.label} className="bg-white dark:bg-navy-900 border-slate-200 dark:border-navy-800">
            <CardContent className="p-5">
              <div className="flex items-center gap-4">
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${s.color}`}>
                  <s.icon className="w-6 h-6" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-navy-900 dark:text-white">{s.value}</p>
                  <p className="text-sm text-slate-500 dark:text-slate-400">{s.label}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="bg-white dark:bg-navy-900 border-slate-200 dark:border-navy-800">
          <CardHeader>
            <CardTitle className="text-lg">Manuscripts by Status</CardTitle>
          </CardHeader>
          <CardContent>
            <ManuscriptStatusPieChart statusCounts={stats.statusCounts} />
          </CardContent>
        </Card>

        <Card className="bg-white dark:bg-navy-900 border-slate-200 dark:border-navy-800">
          <CardHeader>
            <CardTitle className="text-lg">Submission Trend</CardTitle>
          </CardHeader>
          <CardContent>
            <SubmissionTrendChart data={stats.trendData} />
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="bg-white dark:bg-navy-900 border-slate-200 dark:border-navy-800">
          <CardHeader>
            <CardTitle className="text-lg">Articles by Type</CardTitle>
          </CardHeader>
          <CardContent>
            <ArticleTypeBarChart data={stats.typeData} />
          </CardContent>
        </Card>

        <Card className="bg-white dark:bg-navy-900 border-slate-200 dark:border-navy-800">
          <CardHeader>
            <CardTitle className="text-lg">Recent Submissions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {stats.recentSubmissions.length === 0 ? (
                <p className="text-sm text-slate-500 dark:text-slate-400 text-center py-4">No submissions yet</p>
              ) : (
                stats.recentSubmissions.map((m) => (
                  <div key={m.id} className="flex items-start justify-between gap-3 py-2 border-b border-slate-100 dark:border-navy-800 last:border-0">
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-navy-900 dark:text-white truncate">{m.title}</p>
                      <p className="text-xs text-slate-500 dark:text-slate-400">
                        {m.correspondingAuthor.firstName} {m.correspondingAuthor.lastName} &middot; {new Date(m.submittedAt).toLocaleDateString()}
                      </p>
                    </div>
                    <span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium whitespace-nowrap ${statusColors[m.status] || 'bg-gray-100 text-gray-800'}`}>
                      {m.status.replace(/_/g, ' ')}
                    </span>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
