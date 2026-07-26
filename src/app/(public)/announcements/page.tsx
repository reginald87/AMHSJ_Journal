import { prisma } from '@/lib/prisma';
import { Badge } from '@/components/ui/Badge';
import { Card, CardContent } from '@/components/ui/Card';
import { Megaphone, Calendar } from 'lucide-react';

export const dynamic = 'force-dynamic';

function formatDate(date: Date | string): string {
  return new Date(date).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

export default async function AnnouncementsPage() {
  const announcements = await prisma.announcement.findMany({
    where: { isPublished: true },
    orderBy: { publishedAt: 'desc' },
    take: 50,
  });

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-navy-950">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="mb-10">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 bg-navy-900 rounded-xl flex items-center justify-center">
              <Megaphone className="w-6 h-6 text-gold-400" />
            </div>
            <h1 className="text-3xl font-bold text-navy-900 dark:text-white">Announcements</h1>
          </div>
          <p className="text-slate-600 dark:text-slate-400">
            Latest news and updates from AMHSJ.
          </p>
        </div>

        {announcements.length === 0 ? (
          <Card className="bg-white dark:bg-navy-900 border-slate-200 dark:border-navy-800">
            <CardContent className="py-16 text-center">
              <Megaphone className="w-12 h-12 text-slate-300 dark:text-slate-600 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-navy-900 dark:text-white mb-2">No announcements yet</h3>
              <p className="text-slate-500 dark:text-slate-400">Check back soon for updates.</p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-6">
            {announcements.map((a) => (
              <Card key={a.id} className="bg-white dark:bg-navy-900 border-slate-200 dark:border-navy-800">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between gap-4 mb-3">
                    <h2 className="text-xl font-semibold text-navy-900 dark:text-white">{a.title}</h2>
                    <Badge variant="navy" size="sm" className="flex-shrink-0">{a.type}</Badge>
                  </div>
                  {a.publishedAt && (
                    <div className="flex items-center gap-1.5 text-sm text-slate-500 dark:text-slate-400 mb-4">
                      <Calendar className="w-3.5 h-3.5" />
                      {formatDate(a.publishedAt)}
                    </div>
                  )}
                  <div className="prose prose-slate dark:prose-invert max-w-none text-slate-700 dark:text-slate-300 text-sm leading-relaxed whitespace-pre-wrap">
                    {a.content}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
