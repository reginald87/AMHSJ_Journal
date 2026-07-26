import { Metadata } from 'next';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import { DashboardPageClient } from '@/components/dashboard/pages/DashboardPageClient';

export const metadata: Metadata = {
  title: 'Dashboard',
  description: 'Author Dashboard - Manage your manuscripts',
};

export const dynamic = 'force-dynamic';

export default async function DashboardPage() {
  const session = await getServerSession(authOptions);
  
  if (!session) {
    redirect('/login');
  }

  // Type assertion using unknown first to satisfy TypeScript
  const sessionUser = session.user as unknown as {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
    role: string;
    orcid?: string;
    affiliation?: string;
  };

  const manuscripts = await prisma.manuscript.findMany({
    where: { correspondingAuthorId: sessionUser.id },
    orderBy: { submittedAt: 'desc' },
    take: 5,
    include: {
      journal: { select: { name: true, shortName: true } },
    },
  });

  const stats = await Promise.all([
    prisma.manuscript.count({ where: { correspondingAuthorId: sessionUser.id, status: 'SUBMITTED' } }),
    prisma.manuscript.count({ where: { correspondingAuthorId: sessionUser.id, status: 'UNDER_REVIEW' } }),
    prisma.manuscript.count({ where: { correspondingAuthorId: sessionUser.id, status: 'ACCEPTED' } }),
    prisma.manuscript.count({ where: { correspondingAuthorId: sessionUser.id, status: 'PUBLISHED' } }),
  ]);

  const user = {
    id: sessionUser.id,
    email: sessionUser.email ?? '',
    name: `${sessionUser.firstName} ${sessionUser.lastName}`,
    role: sessionUser.role,
    firstName: sessionUser.firstName,
    lastName: sessionUser.lastName,
    orcid: sessionUser.orcid ?? undefined,
    affiliation: sessionUser.affiliation ?? undefined,
  };

  const initialManuscripts = manuscripts.map((m) => ({
    id: m.id,
    title: m.title,
    articleType: m.articleType,
    status: m.status,
    submittedAt: m.submittedAt.toISOString(),
    journal: m.journal,
  }));

  return <DashboardPageClient initialStats={stats} initialManuscripts={initialManuscripts} user={user} />;
}