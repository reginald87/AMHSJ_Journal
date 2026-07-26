import { Button } from '@/components/ui/Button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { ArticleCard } from '@/components/journal/ArticleCard';
import { HeroCarousel } from '@/components/journal/HeroCarousel';
import { prisma } from '@/lib/prisma';
import {
  Users, Award, Globe, Shield, Clock, ArrowRight,
  Search, FileText, GraduationCap, HeartPulse,
} from 'lucide-react';
import Link from 'next/link';

export const dynamic = 'force-dynamic';

const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  Users, Award, Globe, Shield, Clock, ArrowRight,
  Search, FileText, GraduationCap, HeartPulse,
};

interface HeroStat {
  value: string;
  label: string;
  icon?: string;
}

interface Feature {
  title: string;
  description: string;
  icon: string;
}

interface Indexer {
  name: string;
  color: string;
}

interface CarouselSlide {
  id: number;
  image: string;
  title: string;
  subtitle: string;
  ctaText?: string;
  ctaHref?: string;
}

async function getJournalData() {
  return prisma.journal.findFirst({
    where: { isActive: true },
    select: {
      heroBadge: true,
      heroTitle: true,
      heroSubtitle: true,
      heroISSN: true,
      heroImpactFactor: true,
      homepageStats: true,
      homepageFeatures: true,
      homepageIndexers: true,
      homepageCtaHeading: true,
      homepageCtaText: true,
      heroCarousel: true,
      scopeAreas: true,
    },
  });
}

async function getLatestArticles() {
  return prisma.article.findMany({
    where: {
      isPublished: true,
      publishedAt: { not: null },
    },
    orderBy: { publishedAt: 'desc' },
    take: 6,
    include: {
      authors: {
        select: { id: true, firstName: true, lastName: true },
        orderBy: { position: 'asc' },
      },
      volume: { select: { number: true, year: true } },
    },
  });
}

async function getEditorialBoard() {
  const roles = await prisma.editorialRole.findMany({
    where: {
      isActive: true,
      role: { in: ['EDITOR_IN_CHIEF', 'DEPUTY_EDITOR_IN_CHIEF', 'ASSOCIATE_EDITOR'] },
    },
    include: {
      user: {
        select: {
          firstName: true,
          lastName: true,
          affiliation: true,
          department: true,
        },
      },
    },
    orderBy: { role: 'asc' },
    take: 6,
  });

  return roles.map((r) => {
    const roleLabel: Record<string, string> = {
      EDITOR_IN_CHIEF: 'Editor-in-Chief',
      DEPUTY_EDITOR_IN_CHIEF: 'Deputy Editor-in-Chief',
      ASSOCIATE_EDITOR: 'Associate Editor',
    };
    return {
      name: `${r.user.firstName} ${r.user.lastName}`,
      role: roleLabel[r.role] ?? r.role,
      affiliation: r.user.affiliation ?? '',
      specialty: r.user.department ?? '',
    };
  });
}

const statsIcons: Record<string, React.ComponentType<{ className?: string }>> = {
  FileText, Users, Globe, Award,
};

export default async function HomePage() {
  const [journal, latestArticles, editorialBoard] = await Promise.all([
    getJournalData(),
    getLatestArticles(),
    getEditorialBoard(),
  ]);

  if (!journal) return null;

  const stats: HeroStat[] = JSON.parse(journal.homepageStats || '[]');
  const features: Feature[] = JSON.parse(journal.homepageFeatures || '[]');
  const indexers: Indexer[] = JSON.parse(journal.homepageIndexers || '[]');
  const scopeAreas: string[] = JSON.parse(journal.scopeAreas || '[]');
  const heroSlides: CarouselSlide[] = JSON.parse(journal.heroCarousel || '[]');
  
  // If heroSlides is null/undefined/empty, try to use a fallback
  const slidesToUse = heroSlides && heroSlides.length > 0 ? heroSlides : [];
 
   return (
     <div className="min-h-screen bg-white">
       <main>
         <HeroCarousel slides={heroSlides} />

        <section className="py-16 bg-slate-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              {stats.map((stat, index) => {
                const Icon = statsIcons[stat.icon ?? 'FileText'] ?? FileText;
                return (
                  <div key={index} className="bg-white rounded-xl p-6 shadow-sm border border-slate-200 hover:shadow-md transition-shadow animate-slide-up" style={{ animationDelay: `${index * 100}ms` }}>
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-navy-100 rounded-xl flex items-center justify-center text-navy-700">
                        <Icon className="w-6 h-6" />
                      </div>
                      <div>
                        <p className="text-3xl font-bold text-navy-900">{stat.value}</p>
                        <p className="text-sm text-slate-600">{stat.label}</p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        <section className="py-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <Badge variant="navy" className="mb-4">Latest Research</Badge>
              <h2 className="text-3xl sm:text-4xl font-bold text-navy-900 mb-4">
                Latest Articles
              </h2>
              <p className="text-slate-600 max-w-2xl mx-auto">
                Recently published peer-reviewed research from AMHSJ.
              </p>
            </div>

            {latestArticles.length === 0 ? (
              <div className="text-center py-16 bg-white rounded-xl border border-slate-200">
                <h3 className="text-xl font-semibold text-navy-900 mb-2">
                  No articles published yet
                </h3>
                <p className="text-slate-600 mb-6">
                  Check back soon, or submit your manuscript to be the first.
                </p>
                <Link href="/submit">
                  <Button variant="gold">Submit Manuscript</Button>
                </Link>
              </div>
            ) : (
              <>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-10">
                  {latestArticles.map((article) => (
                    <ArticleCard key={article.id} article={article} />
                  ))}
                </div>
                <div className="text-center">
                  <Link href="/articles">
                    <Button variant="outline" size="lg">
                      View All Articles
                    </Button>
                  </Link>
                </div>
              </>
            )}
          </div>
        </section>

        <section className="py-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <Badge variant="navy" className="mb-4">Aims & Scope</Badge>
              <h2 className="text-3xl sm:text-4xl font-bold text-navy-900 mb-4">
                What We Publish
              </h2>
              <p className="text-slate-600 max-w-2xl mx-auto">
                AMHSJ welcomes original research articles, reviews, case reports, and 
                short communications across the full spectrum of medical and health sciences.
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {scopeAreas.map((area, index) => (
                <div key={index} className="bg-white border border-slate-200 rounded-xl p-4 hover:border-gold-300 hover:shadow-md transition-all animate-slide-up" style={{ animationDelay: `${index * 50}ms` }}>
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-navy-100 rounded-lg flex items-center justify-center text-navy-700 flex-shrink-0">
                      <HeartPulse className="w-5 h-5" />
                    </div>
                    <span className="text-sm font-medium text-navy-900">{area}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="py-20 bg-slate-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <Badge variant="navy" className="mb-4">Key Features</Badge>
              <h2 className="text-3xl sm:text-4xl font-bold text-navy-900 mb-4">
                Why Publish with AMHSJ?
              </h2>
              <p className="text-slate-600 max-w-2xl mx-auto">
                We are committed to providing authors with a seamless publishing experience 
                and readers with high-quality, trustworthy research.
              </p>
            </div>
            
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {features.map((feature, index) => {
                const Icon = iconMap[feature.icon] ?? Search;
                return (
                  <Card key={index} className="h-full animate-slide-up" style={{ animationDelay: `${index * 100}ms` }}>
                    <CardHeader>
                      <div className="w-12 h-12 bg-navy-100 rounded-xl flex items-center justify-center text-navy-700 mb-4">
                        <Icon className="w-6 h-6" />
                      </div>
                      <CardTitle className="text-lg">{feature.title}</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-slate-600 dark:text-slate-300">{feature.description}</p>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </div>
        </section>

        <section className="py-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <Badge variant="navy" className="mb-4">Editorial Leadership</Badge>
              <h2 className="text-3xl sm:text-4xl font-bold text-navy-900 mb-4">
                Our Editorial Board
              </h2>
              <p className="text-slate-600 max-w-2xl mx-auto">
                Led by distinguished experts from world-renowned institutions, 
                our editorial board ensures the highest standards of scientific rigor.
              </p>
            </div>
            
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {editorialBoard.map((member, index) => (
                <Card key={index} className="animate-slide-up" style={{ animationDelay: `${index * 100}ms` }}>
                  <CardContent className="pt-6">
                    <div className="flex items-start gap-4">
                      <div className="w-14 h-14 bg-gradient-to-br from-navy-900 to-navy-700 rounded-xl flex items-center justify-center text-gold-400 font-bold text-lg flex-shrink-0">
                        {member.name.split(' ').map(n => n[0]).join('')}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-navy-900 dark:text-white">{member.name}</h3>
                        <p className="text-gold-600 dark:text-gold-400 text-sm font-medium mb-1">{member.role}</p>
                        <p className="text-slate-600 dark:text-slate-400 text-sm mb-1">{member.affiliation}</p>
                        {member.specialty && <Badge variant="outline" size="sm" className="mt-2">{member.specialty}</Badge>}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
            
            <div className="text-center mt-10">
              <Link href="/editorial-board">
                <Button variant="outline" size="lg">
                  View Full Editorial Board <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </Link>
            </div>
          </div>
        </section>

        <section className="py-20 bg-slate-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <Badge variant="navy" className="mb-4">Indexing & Metrics</Badge>
              <h2 className="text-3xl sm:text-4xl font-bold text-navy-900 mb-4">
                Widely Indexed & Recognized
              </h2>
            </div>
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-4xl mx-auto">
              {indexers.map((indexer) => (
                <div key={indexer.name} className="bg-white rounded-xl p-6 text-center shadow-sm border border-slate-200 hover:shadow-md transition-shadow">
                  <div className={`w-16 h-16 rounded-xl ${indexer.color} flex items-center justify-center mx-auto mb-4`}>
                    <span className="text-white font-bold text-lg">{indexer.name.charAt(0)}</span>
                  </div>
                  <p className="font-semibold text-navy-900">{indexer.name}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="py-20 gradient-navy">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <Badge variant="gold" className="mb-4">Ready to Publish?</Badge>
            <h2 className="text-3xl sm:text-4xl font-bold text-white mb-6">
              {journal.homepageCtaHeading}
            </h2>
            <p className="text-slate-300 text-lg mb-8 max-w-2xl mx-auto">
              {journal.homepageCtaText}
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/submit">
                <Button size="xl" variant="gold">Start New Submission</Button>
              </Link>
              <Link href="/guidelines">
                <Button size="xl" variant="outline" className="border-white text-white hover:bg-white/10">View Author Guidelines</Button>
              </Link>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
