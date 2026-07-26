import { Metadata } from 'next';
import Link from 'next/link';
import { Award, Shield, Users, Globe, Mail, MapPin, ExternalLink } from 'lucide-react';
import { prisma } from '@/lib/prisma';
import { Prisma } from '@prisma/client';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'Journal Masthead',
  description: 'Complete information about AMHSJ editorial structure, publication details, and leadership team.',
};

type EditorialMember = Prisma.EditorialRoleGetPayload<{ include: { user: true } }>;

const CONTACT_EMAIL = 'amhsj@bayelsamedicaluniversity.edu.ng';
const CONTACT_ADDRESS = 'Bayelsa Medical University, Yenagoa, Bayelsa State, Nigeria';

async function getMasthead() {
  const members = await prisma.editorialRole.findMany({
    where: { isActive: true },
    include: { user: true },
    orderBy: [
      { role: 'asc' },
      { user: { lastName: 'asc' } },
    ],
  });

  const grouped = members.reduce((acc, m) => {
    if (!acc[m.role]) acc[m.role] = [];
    acc[m.role].push(m);
    return acc;
  }, {} as Record<string, EditorialMember[]>);

  return grouped;
}

export default async function MastheadPage() {
  const board = await getMasthead();

  const eic = board['EDITOR_IN_CHIEF']?.[0];
  const deputy = board['DEPUTY_EDITOR_IN_CHIEF']?.[0];
  const editors = board['EDITOR'] || [];
  const associateEditors = board['ASSOCIATE_EDITOR'] || [];
  const international = board['INTERNATIONAL_EDITOR'] || [];

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-navy-950">
      {/* Hero */}
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
              Editorial Structure
            </span>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white leading-tight mb-6">Journal Masthead</h1>
            <p className="text-xl sm:text-2xl text-slate-300 leading-relaxed">
              Complete information about AMHSJ&apos;s editorial structure, publication details, and leadership team.
            </p>
          </div>
        </div>
        <div className="absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-t from-white dark:from-navy-950 to-transparent" />
      </section>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-16 space-y-12">
        {/* Editor-in-Chief */}
        {eic && (
          <section>
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 bg-gold-100 dark:bg-gold-900/30 rounded-xl flex items-center justify-center"><Award className="w-5 h-5 text-gold-600 dark:text-gold-400" /></div>
              <h2 className="text-xl font-bold text-navy-900 dark:text-white">Editor-in-Chief</h2>
            </div>
            <div className="bg-white dark:bg-navy-900 rounded-xl border border-slate-200 dark:border-navy-800 p-6">
              <div className="flex items-start gap-4">
                <div className="w-14 h-14 bg-navy-100 dark:bg-navy-800 rounded-full flex items-center justify-center text-navy-700 dark:text-navy-300 font-bold text-lg flex-shrink-0">
                  {eic.user.firstName?.[0]}{eic.user.lastName?.[0]}
                </div>
                <div>
                  <h3 className="text-lg font-bold text-navy-900 dark:text-white">{eic.user.firstName} {eic.user.lastName}</h3>
                  <p className="text-sm text-slate-500 dark:text-slate-400">Editor-in-Chief</p>
                  {eic.user.affiliation && <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">{eic.user.affiliation}</p>}
                  {eic.user.bio && <p className="text-sm text-slate-600 dark:text-slate-400 mt-3 leading-relaxed">{eic.user.bio}</p>}
                  <div className="flex items-center gap-4 mt-3 flex-wrap text-sm text-slate-500 dark:text-slate-400">
                    <span className="flex items-center gap-1.5"><Mail className="w-3.5 h-3.5" /> {eic.user.email}</span>
                    {eic.user.orcid && (
                      <a href={`https://orcid.org/${eic.user.orcid}`} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1.5 text-green-600 dark:text-green-400 hover:underline">
                        <ExternalLink className="w-3.5 h-3.5" /> ORCID
                      </a>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </section>
        )}

        {/* Deputy Editor-in-Chief */}
        {deputy && (
          <section>
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 bg-gold-100 dark:bg-gold-900/30 rounded-xl flex items-center justify-center"><Shield className="w-5 h-5 text-gold-600 dark:text-gold-400" /></div>
              <h2 className="text-xl font-bold text-navy-900 dark:text-white">Deputy Editor-in-Chief</h2>
            </div>
            <div className="bg-white dark:bg-navy-900 rounded-xl border border-slate-200 dark:border-navy-800 p-6">
              <div className="flex items-start gap-4">
                <div className="w-14 h-14 bg-navy-100 dark:bg-navy-800 rounded-full flex items-center justify-center text-navy-700 dark:text-navy-300 font-bold text-lg flex-shrink-0">
                  {deputy.user.firstName?.[0]}{deputy.user.lastName?.[0]}
                </div>
                <div>
                  <h3 className="text-lg font-bold text-navy-900 dark:text-white">{deputy.user.firstName} {deputy.user.lastName}</h3>
                  <p className="text-sm text-slate-500 dark:text-slate-400">Deputy Editor-in-Chief</p>
                  {deputy.user.affiliation && <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">{deputy.user.affiliation}</p>}
                  {deputy.user.bio && <p className="text-sm text-slate-600 dark:text-slate-400 mt-3 leading-relaxed">{deputy.user.bio}</p>}
                  <div className="flex items-center gap-4 mt-3 flex-wrap text-sm text-slate-500 dark:text-slate-400">
                    <span className="flex items-center gap-1.5"><Mail className="w-3.5 h-3.5" /> {deputy.user.email}</span>
                    {deputy.user.orcid && (
                      <a href={`https://orcid.org/${deputy.user.orcid}`} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1.5 text-green-600 dark:text-green-400 hover:underline">
                        <ExternalLink className="w-3.5 h-3.5" /> ORCID
                      </a>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </section>
        )}

        {/* Editors */}
        {(editors.length > 0 || associateEditors.length > 0) && (
          <section>
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 bg-navy-100 dark:bg-navy-800 rounded-xl flex items-center justify-center"><Users className="w-5 h-5 text-navy-700 dark:text-navy-300" /></div>
              <h2 className="text-xl font-bold text-navy-900 dark:text-white">Editors</h2>
            </div>
            <div className="grid sm:grid-cols-2 gap-4">
              {[...editors, ...associateEditors].map((member) => (
                <div key={member.id} className="bg-white dark:bg-navy-900 rounded-xl border border-slate-200 dark:border-navy-800 p-5">
                  <div className="flex items-start gap-3">
                    <div className="w-11 h-11 bg-navy-100 dark:bg-navy-800 rounded-full flex items-center justify-center text-navy-700 dark:text-navy-300 font-bold text-sm flex-shrink-0">
                      {member.user.firstName?.[0]}{member.user.lastName?.[0]}
                    </div>
                    <div>
                      <h3 className="font-semibold text-navy-900 dark:text-white">{member.user.firstName} {member.user.lastName}</h3>
                      <p className="text-xs text-slate-500 dark:text-slate-400">{member.role === 'ASSOCIATE_EDITOR' ? 'Associate Editor' : 'Editor'}</p>
                      {member.user.affiliation && <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">{member.user.affiliation}</p>}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* International Advisory Board */}
        {international.length > 0 && (
          <section>
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 bg-teal-100 dark:bg-teal-900/30 rounded-xl flex items-center justify-center"><Globe className="w-5 h-5 text-teal-600 dark:text-teal-400" /></div>
              <h2 className="text-xl font-bold text-navy-900 dark:text-white">International Editorial Advisory Board</h2>
            </div>
            <p className="text-slate-600 dark:text-slate-400 text-sm mb-4">International experts contributing to our peer review process</p>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {international.map((member) => (
                <div key={member.id} className="bg-white dark:bg-navy-900 rounded-xl border border-slate-200 dark:border-navy-800 p-5">
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 bg-teal-100 dark:bg-teal-900/30 rounded-full flex items-center justify-center text-teal-700 dark:text-teal-400 font-bold text-sm flex-shrink-0">
                      {member.user.firstName?.[0]}{member.user.lastName?.[0]}
                    </div>
                    <div>
                      <h3 className="font-semibold text-navy-900 dark:text-white text-sm">{member.user.firstName} {member.user.lastName}</h3>
                      {member.user.affiliation && <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">{member.user.affiliation}</p>}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Empty state */}
        {Object.keys(board).length === 0 && (
          <div className="text-center py-16 bg-white dark:bg-navy-900 rounded-xl border border-slate-200 dark:border-navy-800">
            <Users className="w-16 h-16 mx-auto text-slate-400 dark:text-slate-500 mb-4" />
            <h2 className="text-xl font-semibold text-navy-900 dark:text-white mb-2">No masthead data yet</h2>
            <p className="text-slate-600 dark:text-slate-400">Board members will appear here once added via the admin panel.</p>
          </div>
        )}

        {/* Contact Information */}
        <section className="bg-white dark:bg-navy-900 rounded-xl border border-slate-200 dark:border-navy-800 p-8">
          <h2 className="text-xl font-bold text-navy-900 dark:text-white mb-6">Contact Information</h2>
          <div className="grid sm:grid-cols-2 gap-6">
            <div className="flex items-start gap-3">
              <Mail className="w-5 h-5 text-navy-700 dark:text-navy-300 mt-0.5" />
              <div>
                <p className="font-medium text-navy-900 dark:text-white text-sm">Editor-in-Chief</p>
                <a href={`mailto:${CONTACT_EMAIL}`} className="text-sm text-gold-600 dark:text-gold-400 hover:underline">{CONTACT_EMAIL}</a>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <MapPin className="w-5 h-5 text-navy-700 dark:text-navy-300 mt-0.5" />
              <div>
                <p className="font-medium text-navy-900 dark:text-white text-sm">Address</p>
                <p className="text-sm text-slate-600 dark:text-slate-400">{CONTACT_ADDRESS}</p>
              </div>
            </div>
          </div>
        </section>

        {/* About AMHSJ */}
        <section className="bg-white dark:bg-navy-900 rounded-xl border border-slate-200 dark:border-navy-800 p-8">
          <h2 className="text-xl font-bold text-navy-900 dark:text-white mb-4">About AMHSJ</h2>
          <p className="text-slate-600 dark:text-slate-400 leading-relaxed mb-4">
            The Advances in Medicine &amp; Health Sciences Journal (AMHSJ) is an international peer-reviewed journal published by volumes. It disseminates high-quality research across all medical and health science specialties from researchers worldwide.
          </p>
          <p className="text-slate-600 dark:text-slate-400 leading-relaxed mb-4">
            Content is published open access and immediately free to read and download.
          </p>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            CC BY-NC-ND 3.0 — Except where otherwise noted, content is licensed under a Creative Commons Attribution-NonCommercial-NoDerivs 3.0 License.
          </p>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-2">
            <strong>Bayelsa Medical University</strong> is the official publisher of AMHSJ.
          </p>
        </section>

        {/* CTA */}
        <section className="text-center py-8">
          <Link href="/editorial-board" className="text-gold-600 dark:text-gold-400 hover:underline font-medium">View Full Editorial Board →</Link>
          <span className="mx-4 text-slate-300 dark:text-slate-600">|</span>
          <Link href="/guidelines" className="text-gold-600 dark:text-gold-400 hover:underline font-medium">Submission Guidelines →</Link>
        </section>
      </div>
    </div>
  );
}
