import { Metadata } from 'next';
import Link from 'next/link';
import { getServerSession } from 'next-auth';
import { redirect } from 'next/navigation';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { Badge } from '@/components/ui/Badge';
import { Card, CardContent } from '@/components/ui/Card';
import { FileText, ArrowRight } from 'lucide-react';
import { CreatePageButton } from './CreatePageButton';
import { DeletePageButton } from './DeletePageButton';

export const metadata: Metadata = {
  title: 'CMS Pages | Admin Dashboard',
  description: 'Manage static content pages such as About, Guidelines, and Contact.',
};

export const dynamic = 'force-dynamic';

function formatDate(date: Date): string {
  return new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(date);
}

export default async function AdminPagesListPage() {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== 'ADMIN') {
    redirect('/');
  }

  const pages = await prisma.page.findMany({
    orderBy: { slug: 'asc' },
    select: {
      id: true,
      slug: true,
      title: true,
      isPublished: true,
      updatedAt: true,
    },
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-navy-900 dark:text-white">
            CMS Pages
          </h1>
          <p className="text-slate-600 dark:text-slate-400 mt-1">
            Manage static content pages such as About, Guidelines, and Contact.
          </p>
        </div>
        <CreatePageButton />
      </div>

      <Card>
        <CardContent className="p-0">
          {pages.length === 0 ? (
            <div className="px-6 py-16 text-center">
              <FileText className="mx-auto h-12 w-12 text-slate-300 dark:text-slate-600" />
              <h3 className="mt-4 text-lg font-semibold text-navy-900 dark:text-white">
                No pages yet
              </h3>
              <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">
                Pages can be created by saving content for a slug like <code className="font-mono">about</code>, <code className="font-mono">guidelines</code>, or <code className="font-mono">contact</code> from the edit screen.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-slate-200 dark:border-navy-800">
                    <th className="h-12 px-6 text-left font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                      Slug
                    </th>
                    <th className="h-12 px-6 text-left font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                      Title
                    </th>
                    <th className="h-12 px-6 text-left font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="h-12 px-6 text-left font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                      Updated
                    </th>
                    <th className="h-12 px-6 text-right font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 dark:divide-navy-800">
                  {pages.map((page) => (
                    <tr
                      key={page.id}
                      className="hover:bg-slate-50 dark:hover:bg-navy-800/50 transition-colors"
                    >
                      <td className="px-6 py-4 font-mono text-slate-700 dark:text-slate-300">
                        {page.slug}
                      </td>
                      <td className="px-6 py-4 text-navy-900 dark:text-white">
                        {page.title}
                      </td>
                      <td className="px-6 py-4">
                        <Badge variant={page.isPublished ? 'success' : 'warning'} size="sm">
                          {page.isPublished ? 'Published' : 'Draft'}
                        </Badge>
                      </td>
                      <td className="px-6 py-4 text-slate-600 dark:text-slate-400">
                        {formatDate(page.updatedAt)}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <Link
                            href={`/admin/pages/${page.slug}`}
                            className="inline-flex items-center gap-1 text-sm font-medium text-gold-600 hover:text-gold-700 dark:text-gold-400 dark:hover:text-gold-300"
                          >
                            Edit
                            <ArrowRight className="w-4 h-4" />
                          </Link>
                          <DeletePageButton pageId={page.id} pageSlug={page.slug} />
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
