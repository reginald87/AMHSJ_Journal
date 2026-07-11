import { Metadata } from 'next';
import Link from 'next/link';
import { BookOpen, Award, Globe, Users, Calendar, Search, Shield, FileText, GraduationCap, HeartPulse } from 'lucide-react';
import { cn } from '@/lib/utils';

export const metadata: Metadata = {
  title: 'About AMHSJ',
  description: 'Learn about Advances in Medicine and Health Sciences Journal - our mission, scope, editorial policies, and commitment to open access publishing.',
};

const stats = [
  { value: '2018', label: 'Founded', icon: Calendar },
  { value: '50+', label: 'Countries', icon: Globe },
  { value: '500+', label: 'Published Articles', icon: FileText },
  { value: '150+', label: 'Editorial Board', icon: Users },
  { value: '2.5', label: 'Impact Factor (2024)', icon: Award },
  { value: '100%', label: 'Open Access', icon: Globe },
];

const aimsAndScope = [
  'Original research articles across all medical and health science disciplines',
  'Systematic reviews and meta-analyses with clinical relevance',
  'Clinical trials and observational studies',
  'Case reports and case series with educational value',
  'Reviews on emerging medical technologies and treatments',
  'Public health research and epidemiology studies',
  'Medical education and training innovations',
  'Health policy and healthcare systems research',
  'Translational and basic science research with clinical applications',
  'Ethical, legal, and social issues in medicine and healthcare',
];

const editorialPolicies = [
  { title: 'Peer Review', description: 'All manuscripts undergo rigorous double-blind peer review by at least two independent experts in the field.' },
  { title: 'Open Access', description: 'All articles are freely available immediately upon publication under the Creative Commons Attribution 4.0 International (CC BY 4.0) license.' },
  { title: 'Publication Ethics', description: 'We follow COPE guidelines and require declarations of conflicts of interest, funding sources, and ethical approvals.' },
  { title: 'Data Availability', description: 'Authors are encouraged to deposit data in public repositories and provide data availability statements.' },
  { title: 'Authorship', description: 'All authors must meet ICMJE criteria and approve the final manuscript version.' },
  { title: 'Corrections & Retractions', description: 'We follow COPE guidelines for corrections, expressions of concern, and retractions when necessary.' },
];

const indexing = [
  'PubMed/MEDLINE',
  'Scopus',
  'Web of Science (ESCI)',
  'DOAJ (Directory of Open Access Journals)',
  'Google Scholar',
  'Crossref',
  'Europe PMC',
  'Index Medicus',
  'EMBASE',
  'CABI',
];

export default function AboutPage() {
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
              Leading International Medical Journal
            </span>
            
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white leading-tight mb-6">
              About Advances in Medicine and Health Sciences Journal
            </h1>
            
            <p className="text-xl sm:text-2xl text-slate-300 mb-8 leading-relaxed">
              A peer-reviewed, open-access journal dedicated to publishing high-quality research 
              across all disciplines of medicine and health sciences.
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
        
        <div className="absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-t from-white dark:from-navy-950 to-transparent" />
      </section>

      {/* Key Statistics */}
      <section className="py-16 bg-slate-50 dark:bg-navy-950">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6">
            {stats.map((stat, index) => (
              <div key={index} className="bg-white rounded-xl p-6 shadow-sm border border-slate-200 dark:border-navy-800 dark:bg-navy-900 hover:shadow-md transition-shadow animate-slide-up" style={{ animationDelay: `${index * 100}ms` }}>
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-navy-100 dark:bg-navy-800 rounded-xl flex items-center justify-center text-navy-700 dark:text-navy-300">
                    <stat.icon className="w-6 h-6" />
                  </div>
                  <div>
                    <p className="text-3xl font-bold text-navy-900 dark:text-white">{stat.value}</p>
                    <p className="text-sm text-slate-600 dark:text-slate-400">{stat.label}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Mission & Vision */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <span className="inline-flex items-center gap-2 px-4 py-2 bg-navy-100 dark:bg-navy-800 text-navy-700 dark:text-navy-300 text-sm font-medium rounded-full mb-4">
              Our Mission & Vision
            </span>
            <h2 className="text-3xl sm:text-4xl font-bold text-navy-900 dark:text-white mb-4">
              Advancing Global Health Through Scientific Excellence
            </h2>
            <p className="text-slate-600 dark:text-slate-400 max-w-2xl mx-auto">
              We are committed to accelerating the dissemination of high-quality medical research 
              to improve patient outcomes and advance scientific knowledge worldwide.
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 gap-8">
            <div className="bg-white rounded-xl p-8 shadow-sm border border-slate-200 dark:border-navy-800 dark:bg-navy-900">
              <div className="w-14 h-14 bg-navy-100 dark:bg-navy-800 rounded-xl flex items-center justify-center text-navy-700 dark:text-navy-300 mb-4">
                <Search className="w-7 h-7" />
              </div>
              <h3 className="text-xl font-bold text-navy-900 dark:text-white mb-3">Our Mission</h3>
              <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
                To publish high-quality, peer-reviewed medical research that advances scientific knowledge 
                and improves patient care globally. We strive to be the premier open-access journal 
                for physicians, researchers, and healthcare professionals seeking cutting-edge medical evidence.
              </p>
            </div>
            
            <div className="bg-white rounded-xl p-8 shadow-sm border border-slate-200 dark:border-navy-800 dark:bg-navy-900">
              <div className="w-14 h-14 bg-gold-100 dark:bg-gold-900/30 rounded-xl flex items-center justify-center text-gold-700 dark:text-gold-400 mb-4">
                <GraduationCap className="w-7 h-7" />
              </div>
              <h3 className="text-xl font-bold text-navy-900 dark:text-white mb-3">Our Vision</h3>
              <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
                To become the leading international medical journal recognized for scientific rigor, 
                ethical publishing practices, and rapid dissemination of research that transforms 
                clinical practice and improves health outcomes across diverse populations worldwide.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Aims & Scope */}
      <section className="py-20 bg-slate-50 dark:bg-navy-950">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <span className="inline-flex items-center gap-2 px-4 py-2 bg-navy-100 dark:bg-navy-800 text-navy-700 dark:text-navy-300 text-sm font-medium rounded-full mb-4">
              Aims & Scope
            </span>
            <h2 className="text-3xl sm:text-4xl font-bold text-navy-900 dark:text-white mb-4">
              What We Publish
            </h2>
            <p className="text-slate-600 dark:text-slate-400 max-w-2xl mx-auto">
              AMHSJ welcomes original research articles, reviews, case reports, and short communications 
              across the full spectrum of medical and health sciences.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {aimsAndScope.map((area, index) => (
              <div key={index} className="bg-white border border-slate-200 rounded-xl p-4 hover:border-gold-300 hover:shadow-md transition-all animate-slide-up" style={{ animationDelay: `${index * 50}ms` }}>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-navy-100 dark:bg-navy-800 rounded-lg flex items-center justify-center text-navy-700 dark:text-navy-300 flex-shrink-0">
                    <HeartPulse className="w-5 h-5" />
                  </div>
                  <span className="text-sm font-medium text-navy-900 dark:text-white">{area}</span>
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
            <span className="inline-flex items-center gap-2 px-4 py-2 bg-navy-100 dark:bg-navy-800 text-navy-700 dark:text-navy-300 text-sm font-medium rounded-full mb-4">
              Editorial Policies
            </span>
            <h2 className="text-3xl sm:text-4xl font-bold text-navy-900 dark:text-white mb-4">
              Commitment to Excellence
            </h2>
            <p className="text-slate-600 dark:text-slate-400 max-w-2xl mx-auto">
              We adhere to the highest standards of publication ethics and scientific rigor.
            </p>
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

      {/* Indexing */}
      <section className="py-20 bg-slate-50 dark:bg-navy-950">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <span className="inline-flex items-center gap-2 px-4 py-2 bg-navy-100 dark:bg-navy-800 text-navy-700 dark:text-navy-300 text-sm font-medium rounded-full mb-4">
              Indexing & Abstracting
            </span>
            <h2 className="text-3xl sm:text-4xl font-bold text-navy-900 dark:text-white mb-4">
              Widely Indexed & Recognized
            </h2>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-4xl mx-auto">
            {indexing.map((indexer) => (
              <div key={indexer} className="bg-white rounded-xl p-6 text-center shadow-sm border border-slate-200 dark:border-navy-800 dark:bg-navy-900 hover:shadow-md transition-shadow">
                <div className="w-16 h-16 rounded-xl bg-navy-100 dark:bg-navy-800 flex items-center justify-center mx-auto mb-4">
                  <span className="text-navy-700 dark:text-navy-300 font-bold text-lg">{indexer.charAt(0)}</span>
                </div>
                <p className="font-semibold text-navy-900 dark:text-white">{indexer}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* History */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <span className="inline-flex items-center gap-2 px-4 py-2 bg-navy-100 dark:bg-navy-800 text-navy-700 dark:text-navy-300 text-sm font-medium rounded-full mb-4">
              Our History
            </span>
            <h2 className="text-3xl sm:text-4xl font-bold text-navy-900 dark:text-white mb-4">
              A Legacy of Excellence
            </h2>
          </div>
          
          <div className="max-w-3xl mx-auto space-y-8">
            {[
              { year: '2018', title: 'Journal Founded', description: 'AMHSJ was established to address the growing need for rapid, open-access publication of high-quality medical research across all disciplines.' },
              { year: '2019', title: 'First Issue Published', description: 'The inaugural issue featured groundbreaking research in cardiology, oncology, and infectious diseases from researchers across 20 countries.' },
              { year: '2020', title: 'Indexed in DOAJ', description: 'Achieved Directory of Open Access Journals indexing, recognizing our commitment to open access best practices and publishing standards.' },
              { year: '2021', title: 'PubMed/MEDLINE Indexing', description: 'Achieved MEDLINE indexing, significantly increasing global visibility and accessibility of published research.' },
              { year: '2022', title: 'Scopus & Web of Science', description: 'Indexed in Scopus and Web of Science (ESCI), establishing AMHSJ as a globally recognized medical journal.' },
              { year: '2023', title: 'Impact Factor 2.5', description: 'Received first official Impact Factor of 2.5, reflecting the growing citation impact and quality of published research.' },
              { year: '2024', title: 'Global Expansion', description: 'Expanded editorial board to 150+ experts from 50+ countries, representing the full diversity of global medical research.' },
            ].map((item, index) => (
              <div key={index} className="flex gap-6 animate-slide-up" style={{ animationDelay: `${index * 100}ms` }}>
                <div className="flex-shrink-0 w-20 text-right pr-6">
                  <p className="text-2xl font-bold text-gold-400">{item.year}</p>
                </div>
                <div className="flex-1 border-l-2 border-gold-400/30 pl-6">
                  <h3 className="font-semibold text-navy-900 dark:text-white mb-1">{item.title}</h3>
                  <p className="text-slate-600 dark:text-slate-400">{item.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 gradient-navy">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <span className="inline-flex items-center gap-2 px-4 py-2 bg-gold-500/20 text-gold-400 rounded-full text-sm font-medium mb-4">
            Ready to Publish?
          </span>
          <h2 className="text-3xl sm:text-4xl font-bold text-white mb-6">
            Submit Your Research Today
          </h2>
          <p className="text-slate-300 text-lg mb-8 max-w-2xl mx-auto">
            Join thousands of researchers who trust AMHSJ for rapid, rigorous, 
            and impactful publication of their work.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/submit" className="px-8 py-4 bg-gold-400 text-navy-950 font-bold rounded-lg hover:bg-gold-300 transition-colors text-lg">
              Start New Submission
            </Link>
            <Link href="/guidelines" className="px-8 py-4 border-2 border-white text-white rounded-lg hover:bg-white/10 transition-colors text-lg">
              View Author Guidelines
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}