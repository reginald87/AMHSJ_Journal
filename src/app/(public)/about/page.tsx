import { Metadata } from 'next';
import Link from 'next/link';
import { BookOpen, Award, Globe, Users, Calendar, Search, Shield, FileText, GraduationCap, HeartPulse, Clock, CheckCircle, Mail, Building, ChevronRight } from 'lucide-react';
import { Badge } from '@/components/ui/Badge';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'About AMHSJ',
  description: 'Learn about Advances in Medicine and Health Sciences Journal - our mission, scope, editorial policies, and commitment to open access publishing.',
};

interface AboutSections {
  heroTitle?: string;
  heroSubtitle?: string;
  issn?: string;
  impactFactor?: string;
  missionTitle?: string;
  missionDescription?: string;
  visionTitle?: string;
  visionDescription?: string;
  aimsAndScope?: { category: string; items: string[] }[];
  editorialPolicies?: { title: string; description: string }[];
  indexing?: string[];
  history?: { year: string; title: string; description: string }[];
  ctaHeading?: string;
  ctaText?: string;
  stats?: { value: string; label: string }[];
  benefits?: { title: string; description: string }[];
  contactEmail?: string;
  contactAddress?: string;
}

const STAT_ICONS = [FileText, Globe, Search, Clock, CheckCircle, Globe];

async function getAboutPage() {
  const page = await prisma.page.findUnique({ where: { slug: 'about' } });
  if (!page || !page.sections) return null;
  try {
    return { title: page.title, ...JSON.parse(page.sections) as AboutSections };
  } catch {
    return null;
  }
}

export default async function AboutPage() {
  const data = await getAboutPage();
  const s: AboutSections = data ?? {};

  const heroTitle = s.heroTitle ?? 'About the Journal';
  const heroSubtitle = s.heroSubtitle ?? 'Advances in Medicine & Health Sciences Journal - The Official Journal of Bayelsa Medical University';
  const issn = s.issn ?? 'XXXX-XXXX';
  const impactFactor = s.impactFactor ?? '';
  const missionTitle = s.missionTitle ?? 'Our Mission';
  const missionDescription = s.missionDescription ?? 'Advances in Medicine and Health Sciences Journal (AMHSJ) is an international, peer-reviewed, open-access journal committed to the advancement and dissemination of scholarly knowledge across the expansive field of medicine and health sciences.\n\nThe journal serves as a dynamic platform for the exchange of high-quality scientific findings that shape clinical practice, influence health policy, and drive innovation in health systems worldwide.\n\nOur mission is to foster evidence-based practice, encourage interdisciplinary research, and enhance public health outcomes by publishing robust, impactful studies. AMHSJ is devoted to promoting scientific dialogue among researchers, academicians, healthcare providers, policymakers, and students through the publication of original research articles, systematic reviews, clinical case reports, brief communications, editorials, book reviews, and commentaries.';
  const visionTitle = s.visionTitle ?? 'Our Vision';
  const visionDescription = s.visionDescription ?? 'To become a leading international journal recognized for scientific rigor, ethical publishing practices, and rapid dissemination of research that transforms clinical practice and improves health outcomes across diverse populations worldwide.';
  const aimsAndScope = s.aimsAndScope ?? [
    { category: 'Medicine & Clinical Sciences', items: ['General and Internal Medicine', 'Surgery and Surgical Specialties', 'Family and Community Medicine', 'Pediatrics and Adolescent Health', 'Obstetrics and Gynecology', 'Psychiatry and Mental Health', 'Emergency and Critical Care', 'Infectious Diseases', 'Chronic Diseases', 'Geriatric Care'] },
    { category: 'Public Health & Allied Sciences', items: ['Public and Community Health', 'Epidemiology and Biostatistics', 'Environmental Health', 'Health Promotion', 'Global Health Systems', 'Disaster Medicine', 'Social Determinants of Health', 'Healthcare Management', 'Health Economics', 'Digital Health'] },
    { category: 'Nursing, Pharmacy & Rehabilitation', items: ['Nursing Science and Midwifery', 'Clinical Pharmacy', 'Pharmacology and Toxicology', 'Physiotherapy', 'Rehabilitation Sciences', 'Complementary Medicine', 'Drug Development', 'Biomedical Engineering', 'Assistive Technology', 'Therapeutics'] },
    { category: 'Biomedical & Life Sciences', items: ['Anatomy and Physiology', 'Biochemistry and Molecular Biology', 'Microbiology and Immunology', 'Genetics and Genomics', 'Cancer Biology', 'Neurosciences', 'Biotechnology', 'Medical Laboratory Science', 'Molecular Diagnostics', 'Developmental Biology'] },
    { category: 'Nutrition & Food Science', items: ['Human Nutrition and Dietetics', 'Public Health Nutrition', 'Food Safety', 'Nutritional Epidemiology', 'Agriculture and Food Security', 'Veterinary Public Health', 'Food Science', 'Nutritional Biochemistry', 'Clinical Nutrition', 'Community Nutrition'] },
    { category: 'Interdisciplinary & Emerging Fields', items: ['Scientific Ethics', 'Research Integrity', 'Climate Change and Health', 'Population Health', 'Health Policy Innovation', 'Precision Medicine', 'Translational Research', 'AI in Medicine', 'Telemedicine', 'Health Informatics'] },
  ];
  const editorialPolicies = s.editorialPolicies ?? [
    { title: 'Open Access', description: 'Fully open-access publishing model ensuring all published articles are immediately and permanently available online without any subscription or access fees.' },
    { title: 'Licensing', description: 'Creative Commons Attribution-NonCommercial-NoDerivs 3.0 License (CC BY-NC-ND 3.0) - readers may read, download, copy, distribute, print, search, and link to the full text, provided proper credit is given, the work is not altered, and it is not used commercially.' },
    { title: 'Peer Review', description: 'Double-blind peer review process. Reviewers are selected based on their subject-matter expertise and must declare any potential conflicts of interest before reviewing submissions.' },
    { title: 'Publication Ethics', description: 'We follow COPE guidelines. Authors are expected to disclose any conflicts of interest, funding sources, and ethical approval for studies involving human or animal subjects.' },
    { title: 'Plagiarism Policy', description: 'All manuscripts must contain original, unpublished content and demonstrate at least 80% text uniqueness. Single source similarity should not be greater than 3%. Manuscripts with more than 30% similarity will be rejected outright.' },
    { title: 'Publisher', description: 'Bayelsa Medical University, Yenagoa, Bayelsa State, Nigeria' },
  ];
  const indexing = s.indexing ?? [];
  const history = s.history ?? [];
  const stats = s.stats ?? [
    { value: 'XXXX-XXXX', label: 'ISSN' },
    { value: 'English', label: 'Language' },
    { value: 'Double-blind', label: 'Review Process' },
    { value: '~4 weeks', label: 'Review Timeline' },
    { value: 'No charges', label: 'APCs' },
    { value: '100%', label: 'Open Access' },
  ];
  const ctaHeading = s.ctaHeading ?? 'Ready to Submit Your Research?';
  const ctaText = s.ctaText ?? 'Join the global community of researchers contributing to advances in medicine and health. Submit your original research, reviews, or case studies to AMHSJ.';
  const benefits = s.benefits ?? [
    { title: 'Rapid Review', description: 'Fair peer review leading to timely publication' },
    { title: 'Free Publication', description: 'No Article Processing Charges (APCs)' },
    { title: 'Global Visibility', description: 'Open-access indexing and digital dissemination' },
    { title: 'Enhanced Reach', description: 'Social media promotion and citation potential' },
    { title: 'Free Copies', description: 'PDF and hard copies provided free of charge' },
    { title: 'Recognition', description: 'Opportunities for scholarly collaboration' },
  ];
  const contactEmail = s.contactEmail ?? 'amhsj@bayelsamedicaluniversity.edu.ng';
  const contactAddress = s.contactAddress ?? 'Bayelsa Medical University, Yenagoa, Bayelsa State, Nigeria';

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
              Official Journal of Bayelsa Medical University
            </span>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white leading-tight mb-6">{heroTitle}</h1>
            <p className="text-xl sm:text-2xl text-slate-300 mb-8 leading-relaxed">{heroSubtitle}</p>
            <div className="flex flex-col sm:flex-row gap-4 mb-12">
              <Link href="/register" className="px-8 py-3 bg-gold-400 text-navy-950 font-semibold rounded-lg hover:bg-gold-300 transition-colors text-center">Submit Research</Link>
              <Link href="/guidelines" className="px-8 py-3 border-2 border-white text-white rounded-lg hover:bg-white/10 transition-colors text-center">View Guidelines</Link>
            </div>
            <div className="flex flex-wrap gap-8 text-sm text-slate-400">
              <span className="flex items-center gap-2"><FileText className="w-4 h-4" /><span>ISSN: {issn}</span></span>
              <span className="flex items-center gap-2"><Shield className="w-4 h-4" /><span>Double-blind Peer Review</span></span>
              <span className="flex items-center gap-2"><CheckCircle className="w-4 h-4" /><span>Open Access</span></span>
            </div>
          </div>
        </div>
        <div className="absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-t from-white dark:from-navy-950 to-transparent" />
      </section>

      {/* Key Statistics */}
      <section className="py-16 bg-slate-50 dark:bg-navy-950">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6">
            {stats.map((stat, index) => (
              <div key={index} className="bg-white rounded-xl p-6 shadow-sm border border-slate-200 dark:border-navy-800 dark:bg-navy-900 hover:shadow-md transition-shadow animate-slide-up text-center" style={{ animationDelay: `${index * 100}ms` }}>
                <div className="w-10 h-10 bg-navy-100 dark:bg-navy-800 rounded-xl flex items-center justify-center text-navy-700 dark:text-navy-300 mx-auto mb-3">
                  {(() => { const Icon = STAT_ICONS[index % STAT_ICONS.length]; return <Icon className="w-5 h-5" />; })()}
                </div>
                <p className="text-lg font-bold text-navy-900 dark:text-white leading-snug">{stat.value}</p>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Mission & Vision */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <span className="mb-4 block"><Badge variant="navy" size="lg" className="px-4 py-2 text-sm">Our Mission &amp; Vision</Badge></span>
            <h2 className="text-3xl sm:text-4xl font-bold text-navy-900 dark:text-white mb-4">Advancing Global Health Through Scientific Excellence</h2>
            <p className="text-slate-600 dark:text-slate-400 max-w-2xl mx-auto">We are committed to accelerating the dissemination of high-quality medical research to improve patient outcomes and advance scientific knowledge worldwide.</p>
          </div>
          <div className="grid md:grid-cols-2 gap-8">
            <div className="bg-white rounded-xl p-8 shadow-sm border border-slate-200 dark:border-navy-800 dark:bg-navy-900">
              <div className="w-14 h-14 bg-navy-100 dark:bg-navy-800 rounded-xl flex items-center justify-center text-navy-700 dark:text-navy-300 mb-4"><Search className="w-7 h-7" /></div>
              <h3 className="text-xl font-bold text-navy-900 dark:text-white mb-3">{missionTitle}</h3>
              <div className="text-slate-600 dark:text-slate-400 leading-relaxed whitespace-pre-line">{missionDescription}</div>
            </div>
            <div className="bg-white rounded-xl p-8 shadow-sm border border-slate-200 dark:border-navy-800 dark:bg-navy-900">
              <div className="w-14 h-14 bg-gold-100 dark:bg-gold-900/30 rounded-xl flex items-center justify-center text-gold-700 dark:text-gold-400 mb-4"><GraduationCap className="w-7 h-7" /></div>
              <h3 className="text-xl font-bold text-navy-900 dark:text-white mb-3">{visionTitle}</h3>
              <p className="text-slate-600 dark:text-slate-400 leading-relaxed">{visionDescription}</p>
            </div>
          </div>
        </div>
      </section>

      {/* Aims & Scope */}
      <section className="py-20 bg-slate-50 dark:bg-navy-950">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <span className="mb-4 block"><Badge variant="navy" size="lg" className="px-4 py-2 text-sm">Scope of the Journal</Badge></span>
            <h2 className="text-3xl sm:text-4xl font-bold text-navy-900 dark:text-white mb-4">What We Publish</h2>
            <p className="text-slate-600 dark:text-slate-400 max-w-2xl mx-auto">AMHSJ welcomes submissions that span the entire spectrum of medicine and health sciences. Topics of interest include, but are not limited to:</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {aimsAndScope.map((group, groupIndex) => (
              <div key={groupIndex} className="bg-white dark:bg-navy-900 border border-slate-200 dark:border-navy-700 rounded-xl overflow-hidden hover:shadow-md transition-all animate-slide-up" style={{ animationDelay: `${groupIndex * 100}ms` }}>
                <div className="px-6 py-4 bg-navy-50 dark:bg-navy-800 border-b border-slate-200 dark:border-navy-700">
                  <h3 className="font-bold text-navy-900 dark:text-white text-sm">{group.category}</h3>
                </div>
                <div className="p-4">
                  <ul className="space-y-2">
                    {group.items.map((item, itemIndex) => (
                      <li key={itemIndex} className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400">
                        <HeartPulse className="w-3.5 h-3.5 text-gold-500 flex-shrink-0" />
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Editorial Policies */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <span className="mb-4 block"><Badge variant="navy" size="lg" className="px-4 py-2 text-sm">Journal Details</Badge></span>
            <h2 className="text-3xl sm:text-4xl font-bold text-navy-900 dark:text-white mb-4">Policies &amp; Standards</h2>
            <p className="text-slate-600 dark:text-slate-400 max-w-2xl mx-auto">We adhere to the highest standards of publication ethics and scientific rigor.</p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {editorialPolicies.map((policy, index) => (
              <div key={index} className="bg-white rounded-xl p-6 shadow-sm border border-slate-200 dark:border-navy-800 dark:bg-navy-900 animate-slide-up" style={{ animationDelay: `${index * 100}ms` }}>
                <h3 className="font-semibold text-navy-900 dark:text-white mb-2">{policy.title}</h3>
                <p className="text-slate-600 dark:text-slate-400">{policy.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Benefits to Authors */}
      <section className="py-20 bg-slate-50 dark:bg-navy-950">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <span className="mb-4 block"><Badge variant="navy" size="lg" className="px-4 py-2 text-sm">Benefits to Authors</Badge></span>
            <h2 className="text-3xl sm:text-4xl font-bold text-navy-900 dark:text-white mb-4">Why Publish with AMHSJ?</h2>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-5xl mx-auto">
            {benefits.map((benefit, index) => (
              <div key={index} className="bg-white rounded-xl p-6 shadow-sm border border-slate-200 dark:border-navy-800 dark:bg-navy-900 animate-slide-up" style={{ animationDelay: `${index * 100}ms` }}>
                <div className="w-12 h-12 bg-green-100 dark:bg-green-900/30 rounded-xl flex items-center justify-center text-green-700 dark:text-green-400 mb-4"><CheckCircle className="w-6 h-6" /></div>
                <h3 className="font-semibold text-navy-900 dark:text-white mb-2">{benefit.title}</h3>
                <p className="text-slate-600 dark:text-slate-400">{benefit.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* History Timeline */}
      {history.length > 0 && (
        <section className="py-20 bg-slate-50 dark:bg-navy-950">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <span className="mb-4 block"><Badge variant="navy" size="lg" className="px-4 py-2 text-sm">Our Journey</Badge></span>
              <h2 className="text-3xl sm:text-4xl font-bold text-navy-900 dark:text-white mb-4">Journal History</h2>
              <p className="text-slate-600 dark:text-slate-400 max-w-2xl mx-auto">Milestones in the development and growth of AMHSJ since its founding.</p>
            </div>
            <div className="relative">
              <div className="absolute left-8 top-0 bottom-0 w-0.5 bg-gradient-to-b from-gold-400 via-navy-400 to-slate-200 dark:from-gold-500 dark:via-navy-600 dark:to-navy-800" />
              <div className="space-y-12">
                {history.map((item, index) => (
                  <div key={index} className="relative pl-20 animate-slide-up" style={{ animationDelay: `${index * 150}ms` }}>
                    <div className="absolute left-4 w-9 h-9 bg-gold-500 rounded-full flex items-center justify-center text-white font-bold text-sm shadow-lg z-10">
                      <Calendar className="w-4 h-4" />
                    </div>
                    <div className="bg-white dark:bg-navy-900 rounded-xl p-6 shadow-sm border border-slate-200 dark:border-navy-800 hover:shadow-md transition-shadow">
                      <span className="inline-block px-3 py-1 bg-gold-100 dark:bg-gold-900/30 text-gold-700 dark:text-gold-400 text-sm font-semibold rounded-full mb-3">{item.year}</span>
                      <h3 className="text-lg font-bold text-navy-900 dark:text-white mb-2">{item.title}</h3>
                      <p className="text-slate-600 dark:text-slate-400 leading-relaxed">{item.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Contact Information */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <span className="mb-4 block"><Badge variant="navy" size="lg" className="px-4 py-2 text-sm">Contact Information</Badge></span>
            <h2 className="text-3xl sm:text-4xl font-bold text-navy-900 dark:text-white mb-4">Editorial Office</h2>
          </div>
          <div className="max-w-2xl mx-auto">
            <div className="bg-white rounded-xl p-8 shadow-sm border border-slate-200 dark:border-navy-800 dark:bg-navy-900">
              <div className="space-y-4">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-navy-100 dark:bg-navy-800 rounded-xl flex items-center justify-center text-navy-700 dark:text-navy-300"><Mail className="w-6 h-6" /></div>
                  <div>
                    <p className="font-medium text-navy-900 dark:text-white">Email</p>
                    <p className="text-slate-600 dark:text-slate-400">{contactEmail}</p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-navy-100 dark:bg-navy-800 rounded-xl flex items-center justify-center text-navy-700 dark:text-navy-300"><Building className="w-6 h-6" /></div>
                  <div>
                    <p className="font-medium text-navy-900 dark:text-white">Address</p>
                    <p className="text-slate-600 dark:text-slate-400">{contactAddress}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 gradient-navy">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <span className="mb-4 inline-block"><Badge variant="gold" size="lg" className="px-4 py-2 text-sm">Ready to Publish?</Badge></span>
          <h2 className="text-3xl sm:text-4xl font-bold text-white mb-6">{ctaHeading}</h2>
          <p className="text-slate-300 text-lg mb-8 max-w-2xl mx-auto">{ctaText}</p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/register" className="px-8 py-4 bg-gold-400 text-navy-950 font-bold rounded-lg hover:bg-gold-300 transition-colors text-lg">Submit Research Paper</Link>
            <Link href="/guidelines" className="px-8 py-4 border-2 border-white text-white rounded-lg hover:bg-white/10 transition-colors text-lg">View Guidelines</Link>
          </div>
        </div>
      </section>
    </div>
  );
}
