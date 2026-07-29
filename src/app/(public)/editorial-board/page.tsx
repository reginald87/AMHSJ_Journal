import { Metadata } from 'next';
import Link from 'next/link';
import { Shield, Award, Users, Stethoscope, Globe } from 'lucide-react';
import { cn } from '@/lib/utils';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'Editorial Board',
  description: 'Meet the editorial board of Advances in Medicine and Health Sciences Journal - leading experts from world-renowned institutions.',
};

const editorialRoles = [
  { role: 'EDITOR_IN_CHIEF', label: 'Editor-in-Chief', icon: Award, color: 'text-gold-400', bgColor: 'bg-gold-100 dark:bg-gold-900/30' },
  { role: 'DEPUTY_EDITOR_IN_CHIEF', label: 'Deputy Editor-in-Chief', icon: Shield, color: 'text-gold-400', bgColor: 'bg-gold-100 dark:bg-gold-900/30' },
  { role: 'ASSOCIATE_EDITOR', label: 'Associate Editor', icon: Users, color: 'text-navy-700 dark:text-navy-300', bgColor: 'bg-navy-100 dark:bg-navy-800' },
  { role: 'EDITOR', label: 'Editor', icon: Stethoscope, color: 'text-blue-600 dark:text-blue-400', bgColor: 'bg-blue-100 dark:bg-blue-900/30' },
  { role: 'INTERNATIONAL_EDITOR', label: 'International Editorial Advisory Board', icon: Globe, color: 'text-teal-600 dark:text-teal-400', bgColor: 'bg-teal-100 dark:bg-teal-900/30' },
  { role: 'REVIEWER', label: 'Reviewers', icon: Users, color: 'text-blue-600 dark:text-blue-400', bgColor: 'bg-blue-100 dark:bg-blue-900/30' },
];

const specialtyIcons: Record<string, React.ReactNode> = {};

async function getEditorialBoard() {
  const board = await prisma.editorialRole.findMany({
    where: { isActive: true },
    include: { user: true },
    orderBy: [
      { role: 'asc' },
      { user: { lastName: 'asc' } },
    ],
  });

  // Group by role
  const grouped = board.reduce((acc, member) => {
    if (!acc[member.role]) acc[member.role] = [];
    acc[member.role].push(member);
    return acc;
  }, {} as Record<string, typeof board>);

  return grouped;
}

import { Prisma } from '@prisma/client';

type EditorialRoleWithUser = Prisma.EditorialRoleGetPayload<{ include: { user: true } }>;

interface RoleSectionProps {
  role: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  color: string;
  bgColor: string;
  members: EditorialRoleWithUser[];
}

function RoleSection({ role, label, icon: Icon, color, bgColor, members }: RoleSectionProps) {
  if (!members || members.length === 0) return null;

  return (
    <section className="mb-16" id={role.toLowerCase().replace('_', '-')}>
      <div className="flex items-center gap-3 mb-8">
        <div className={cn('w-12 h-12 rounded-xl flex items-center justify-center', bgColor)}>
          <Icon className={cn('w-6 h-6', color)} />
        </div>
        <div>
          <h2 className="text-2xl font-bold text-navy-900 dark:text-white">{label}</h2>
          <p className="text-slate-600 dark:text-slate-400">{members.length} member{members.length !== 1 ? 's' : ''}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {members.map((member) => (
          <div key={member.id} className="bg-white dark:bg-navy-900 rounded-xl border border-slate-200 dark:border-navy-800 p-6 hover:shadow-md transition-shadow">
                <div className="flex items-start gap-4">
              <div className="w-16 h-16 bg-navy-100 dark:bg-navy-800 rounded-full flex items-center justify-center text-navy-700 dark:text-navy-300 font-bold text-xl flex-shrink-0">
                {member.user.firstName?.[0]}{member.user.lastName?.[0]}
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold text-navy-900 dark:text-white">
                  {member.user.firstName} {member.user.lastName}
                </h3>
                {member.user.affiliation && (
                  <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">{member.user.affiliation}</p>
                )}
                {member.user.department && (
                  <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">{member.user.department}</p>
                )}
                {member.user.bio && (
                  <p className="text-sm text-slate-600 dark:text-slate-400 mt-3 leading-relaxed">{member.user.bio}</p>
                )}
                <div className="flex items-center gap-3 mt-3 flex-wrap">
                  {member.user.orcid && (
                    <a href={`https://orcid.org/${member.user.orcid}`} target="_blank" rel="noopener noreferrer" className="text-xs text-green-600 hover:text-green-700 dark:text-green-400 flex items-center gap-1">
                      <span className="font-bold">ORCID</span> {member.user.orcid}
                    </a>
                  )}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

export default async function EditorialBoardPage() {
  const board = await getEditorialBoard();

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-navy-950">
      {/* Hero Section */}
      <section className="gradient-navy relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('/grid.svg')] bg-center opacity-5" />
        <div className="absolute inset-0 bg-gradient-to-r from-navy-900/50 to-navy-800/50" />
        
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 sm:py-32">
          <div className="max-w-3xl animate-fade-in">
            <span className="inline-flex items-center gap-2 px-4 py-2 bg-gold-500/20 text-gold-400 rounded-full text-sm font-medium mb-6">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-gold-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-gold-500"></span>
              </span>
              Distinguished International Experts
            </span>
            
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white leading-tight mb-6">
              Editorial Board
            </h1>
            
            <p className="text-xl sm:text-2xl text-slate-300 mb-8 leading-relaxed">
              Our editorial board comprises distinguished experts from world-renowned institutions, 
              ensuring the highest standards of scientific rigor and editorial excellence.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 mb-12">
              <Link href="/submit" className="px-8 py-3 bg-gold-400 text-navy-950 font-semibold rounded-lg hover:bg-gold-300 transition-colors text-center">
                Submit Manuscript
              </Link>
              <Link href="/guidelines" className="px-8 py-3 border-2 border-white text-white rounded-lg hover:bg-white/10 transition-colors text-center">
                Author Guidelines
              </Link>
            </div>
            
            <div className="flex flex-wrap gap-8 text-sm text-slate-400">
              <span className="flex items-center gap-2">
                <Shield className="w-4 h-4" />
                <span>Double-Blind Peer Review</span>
              </span>
              <span className="flex items-center gap-2">
                <Users className="w-4 h-4" />
                <span>150+ Board Members</span>
              </span>
              <span className="flex items-center gap-2">
                <Globe className="w-4 h-4" />
                <span>50+ Countries</span>
              </span>
            </div>
          </div>
        </div>
        
        <div className="absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-t from-white dark:from-navy-950 to-transparent" />
      </section>

      {/* Editorial Board Members */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        {Object.keys(board).length === 0 ? (
          <div className="text-center py-16 bg-white dark:bg-navy-900 rounded-xl border border-slate-200 dark:border-navy-800">
            <Users className="w-16 h-16 mx-auto text-slate-400 dark:text-slate-500 mb-4" aria-hidden="true" />
            <h2 className="text-xl font-semibold text-navy-900 dark:text-white mb-2">No editorial board members yet</h2>
            <p className="text-slate-600 dark:text-slate-400 max-w-md mx-auto">
              We are currently building our editorial board. Please check back soon, or
              <Link href="/contact?subject=editorial-board" className="text-gold-600 hover:text-gold-700 dark:text-gold-400 dark:hover:text-gold-300 mx-1 underline-offset-2 hover:underline">
                apply to join
              </Link>
              if you are interested.
            </p>
          </div>
        ) : (
          editorialRoles.map(({ role, label, icon: Icon, color, bgColor }) => (
            <RoleSection
              key={role}
              role={role}
              label={label}
              icon={Icon}
              color={color}
              bgColor={bgColor}
              members={board[role] || []}
            />
          ))
        )}
      </div>

      {/* Join Editorial Board CTA */}
      <section className="py-20 gradient-navy">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl sm:text-4xl font-bold text-white mb-6">
            Join Our Editorial Board
          </h2>
          <p className="text-slate-300 text-lg mb-8 max-w-2xl mx-auto">
            We are always looking for distinguished experts to join our editorial board. 
            If you are a recognized expert in your field with a strong publication record, 
            we invite you to apply.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/contact?subject=editorial-board" className="px-8 py-3 bg-gold-400 text-navy-950 font-semibold rounded-lg hover:bg-gold-300 transition-colors">
              Apply to Join
            </Link>
            <Link href="/reviewers" className="px-8 py-3 border-2 border-white text-white rounded-lg hover:bg-white/10 transition-colors">
              Become a Reviewer
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}