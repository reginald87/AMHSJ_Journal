import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import { Button } from '@/components/ui/Button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { ArticleCard } from '@/components/journal/ArticleCard';
import { prisma } from '@/lib/prisma';
import { BookOpen, Users, Award, Globe, Shield, Clock, ArrowRight, Search, FileText, GraduationCap, HeartPulse } from 'lucide-react';
import Link from 'next/link';

async function getLatestArticles() {
  const articles = await prisma.article.findMany({
    where: {
      status: 'PUBLISHED',
      publishedAt: { not: null },
    },
    orderBy: { publishedAt: 'desc' },
    take: 6,
    include: {
      authors: {
        select: { id: true, firstName: true, lastName: true },
        orderBy: { position: 'asc' },
      },
      issue: {
        include: {
          volume: { select: { number: true, year: true } },
        },
      },
    },
  });
  return articles;
}

const stats = [
  { value: '500+', label: 'Published Articles', icon: FileText },
  { value: '150+', label: 'Editorial Board Members', icon: Users },
  { value: '50+', label: 'Countries Represented', icon: Globe },
  { value: '2.5', label: 'Impact Factor (2024)', icon: Award },
];

const features = [
  {
    icon: Search,
    title: 'Rigorous Peer Review',
    description: 'Double-blind peer review process with expert reviewers from leading institutions worldwide.',
  },
  {
    icon: Clock,
    title: 'Fast Publication',
    description: 'First decision within 4 weeks. Accepted articles published online within 2 weeks of acceptance.',
  },
  {
    icon: Globe,
    title: 'Open Access',
    description: 'All articles freely available online immediately upon publication under CC BY 4.0 license.',
  },
  {
    icon: Shield,
    title: 'Ethical Standards',
    description: 'COPE member adhering to highest ethical standards in publication and research integrity.',
  },
  {
    icon: HeartPulse,
    title: 'Medical Focus',
    description: 'Comprehensive coverage of clinical medicine, biomedical research, and health sciences.',
  },
  {
    icon: GraduationCap,
    title: 'Global Reach',
    description: 'Indexed in PubMed, Scopus, Web of Science, and other major databases.',
  },
];

const scopeAreas = [
  'Internal Medicine & Subspecialties',
  'Cardiology & Cardiovascular Surgery',
  'Neurology & Neurosurgery',
  'Oncology & Hematology',
  'Pediatrics & Neonatology',
  'Surgery & Surgical Specialties',
  'Radiology & Medical Imaging',
  'Pathology & Laboratory Medicine',
  'Pharmacology & Therapeutics',
  'Public Health & Epidemiology',
  'Medical Education & Training',
  'Health Policy & Systems',
];

const editorialBoard = [
  { name: 'Prof. James Anderson', role: 'Editor-in-Chief', affiliation: 'Harvard Medical School, USA', specialty: 'Cardiology' },
  { name: 'Prof. Maria Rodriguez', role: 'Deputy Editor', affiliation: 'University of Barcelona, Spain', specialty: 'Neurology' },
  { name: 'Prof. Kenji Tanaka', role: 'Associate Editor', affiliation: 'University of Tokyo, Japan', specialty: 'Oncology' },
  { name: 'Prof. Sarah Johnson', role: 'Associate Editor', affiliation: 'Johns Hopkins University, USA', specialty: 'Pediatrics' },
  { name: 'Prof. Ahmed Hassan', role: 'Associate Editor', affiliation: 'Cairo University, Egypt', specialty: 'Internal Medicine' },
  { name: 'Prof. Wei Chen', role: 'Associate Editor', affiliation: 'Peking University, China', specialty: 'Surgery' },
];

export default async function HomePage() {
  const latestArticles = await getLatestArticles();

  return (
    <div className="min-h-screen bg-white">
      <Navbar />
      
      <main className="pt-16">
        <section className="relative overflow-hidden gradient-navy">
          <div className="absolute inset-0 bg-[url('/grid.svg')] bg-center opacity-5" />
          <div className="absolute inset-0 bg-gradient-to-r from-navy-900/50 to-navy-800/50" />
          
          <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 sm:py-32">
            <div className="max-w-3xl animate-fade-in">
              <Badge variant="gold" className="mb-6 inline-flex items-center gap-2 px-4 py-2 text-sm font-medium">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-gold-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-gold-500"></span>
                </span>
                Now Accepting Submissions for 2025 Issues
              </Badge>
              
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white leading-tight mb-6">
                Advances in Medicine and Health Sciences Journal
              </h1>
              
              <p className="text-xl sm:text-2xl text-slate-300 mb-8 leading-relaxed">
                A peer-reviewed, open-access journal publishing high-quality research 
                across all disciplines of medicine and health sciences.
              </p>
              
              <div className="flex flex-col sm:flex-row gap-4 mb-12">
                <Link href="/submit">
                  <Button size="xl" variant="gold">Submit Your Manuscript</Button>
                </Link>
                <Link href="/journal">
                  <Button size="xl" variant="outline" className="border-white text-white hover:bg-white/10">Browse Latest Articles</Button>
                </Link>
              </div>
              
              <div className="flex flex-wrap gap-8 text-sm text-slate-400">
                <span className="flex items-center gap-2">
                  <FileText className="w-4 h-4" />
                  <span>ISSN: 2XXX-XXXX (Print) | 2XXX-XXXX (Online)</span>
                </span>
                <span className="flex items-center gap-2">
                  <Award className="w-4 h-4" />
                  <span>Impact Factor: 2.5 (2024)</span>
                </span>
                <span className="flex items-center gap-2">
                  <Shield className="w-4 h-4" />
                  <span>COPE Member</span>
                </span>
              </div>
            </div>
          </div>
          
          <div className="absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-t from-white to-transparent" />
        </section>

        <section className="py-16 bg-slate-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              {stats.map((stat, index) => (
                <div key={index} className="bg-white rounded-xl p-6 shadow-sm border border-slate-200 hover:shadow-md transition-shadow animate-slide-up" style={{ animationDelay: `${index * 100}ms` }}>
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-navy-100 rounded-xl flex items-center justify-center text-navy-700">
                      <stat.icon className="w-6 h-6" />
                    </div>
                    <div>
                      <p className="text-3xl font-bold text-navy-900">{stat.value}</p>
                      <p className="text-sm text-slate-600">{stat.label}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
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
              {features.map((feature, index) => (
                <Card key={index} className="h-full animate-slide-up" style={{ animationDelay: `${index * 100}ms` }}>
                  <CardHeader>
                    <div className="w-12 h-12 bg-navy-100 rounded-xl flex items-center justify-center text-navy-700 mb-4">
                      <feature.icon className="w-6 h-6" />
                    </div>
                    <CardTitle className="text-lg">{feature.title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-slate-600">{feature.description}</p>
                  </CardContent>
                </Card>
              ))}
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
                        <h3 className="font-semibold text-navy-900">{member.name}</h3>
                        <p className="text-gold-600 text-sm font-medium mb-1">{member.role}</p>
                        <p className="text-slate-600 text-sm mb-1">{member.affiliation}</p>
                        <Badge variant="outline" size="sm" className="mt-2">{member.specialty}</Badge>
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

        <section className="py-20 gradient-navy">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <Badge variant="gold" className="mb-4">Ready to Publish?</Badge>
            <h2 className="text-3xl sm:text-4xl font-bold text-white mb-6">
              Submit Your Manuscript Today
            </h2>
            <p className="text-slate-300 text-lg mb-8 max-w-2xl mx-auto">
              Join thousands of researchers who trust AMHSJ for rapid, rigorous, 
              and impactful publication of their work.
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

        <section className="py-20 bg-slate-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <Badge variant="navy" className="mb-4">Indexing & Metrics</Badge>
              <h2 className="text-3xl sm:text-4xl font-bold text-navy-900 mb-4">
                Widely Indexed & Recognized
              </h2>
            </div>
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-4xl mx-auto">
              {[
                { name: 'PubMed', color: 'bg-blue-600' },
                { name: 'Scopus', color: 'bg-red-600' },
                { name: 'Web of Science', color: 'bg-purple-600' },
                { name: 'DOAJ', color: 'bg-green-600' },
                { name: 'Google Scholar', color: 'bg-slate-700' },
                { name: 'Crossref', color: 'bg-orange-600' },
                { name: 'Europe PMC', color: 'bg-teal-600' },
                { name: 'CNKI', color: 'bg-indigo-600' },
              ].map((indexer) => (
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
      </main>
      
      <Footer />
    </div>
  );
}