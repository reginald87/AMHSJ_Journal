import { Metadata } from 'next';
import { Badge } from '@/components/ui/Badge';
import { Shield, CheckCircle, AlertTriangle, BookOpen, Scale, Eye } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Publication Ethics',
  description: 'Ethical guidelines and policies for authors, reviewers, and editors at AMHSJ.',
};

const principles = [
  {
    icon: Shield,
    title: 'Research Integrity',
    items: [
      'All research must be conducted with honesty and transparency.',
      'Data must not be fabricated, falsified, or manipulated.',
      'Proper credit must be given to prior work through appropriate citations.',
      'Overlapping or duplicate submissions to multiple journals are prohibited.',
    ],
  },
  {
    icon: Eye,
    title: 'Transparency & Disclosure',
    items: [
      'All conflicts of interest must be disclosed at the time of submission.',
      'Funding sources must be acknowledged in the manuscript.',
      'Clinical trials must be registered before patient enrollment.',
      'Data availability statements are required for all research articles.',
    ],
  },
  {
    icon: Scale,
    title: 'Fairness & Impartiality',
    items: [
      'Manuscripts are evaluated solely on scientific merit and relevance.',
      'The peer review process is double-blind to ensure impartiality.',
      'Editorial decisions are made independently of commercial or political interests.',
      'Diversity and inclusion are valued in authorship and peer review.',
    ],
  },
  {
    icon: BookOpen,
    title: 'Authorship Standards',
    items: [
      'All authors must meet the ICMJE criteria for authorship.',
      'All listed authors must have made a substantive contribution to the work.',
      'The corresponding author is responsible for the integrity of the entire manuscript.',
      'Ghost or gift authorship is strictly prohibited.',
    ],
  },
];

const misconduct = [
  {
    title: 'Plagiarism',
    description: 'Presenting another person\'s ideas, data, or text as one\'s own without proper attribution. All manuscripts are screened using industry-standard plagiarism detection tools.',
    severity: 'Manuscript rejection and potential ban from future submissions.',
  },
  {
    title: 'Data Fabrication & Falsification',
    description: 'Making up research data or manipulating research results to support hypotheses. This includes selective reporting of data.',
    severity: 'Immediate rejection, retraction of published articles, and notification of the author\'s institution.',
  },
  {
    title: 'Duplicate Submission',
    description: 'Submitting the same manuscript to multiple journals simultaneously or publishing the same work in multiple journals without disclosure.',
    severity: 'Immediate rejection and retraction if published.',
  },
  {
    title: 'Undisclosed Conflicts of Interest',
    description: 'Failure to disclose financial, personal, or professional relationships that could influence the research or its interpretation.',
    severity: 'Request for correction, or retraction if the undisclosed conflict is material.',
  },
];

const process = [
  { step: 'Complaint Received', description: 'Any concerns about published or submitted manuscripts can be reported to the Editor-in-Chief at ethics@amhsj.org.' },
  { step: 'Initial Assessment', description: 'The Editor-in-Chief evaluates the complaint and determines whether a formal investigation is warranted.' },
  { step: 'Investigation', description: 'A confidential investigation is conducted, involving the authors, reviewers, and/or institutional authorities as needed.' },
  { step: 'COPE Consultation', description: 'For complex cases, guidance is sought from the Committee on Publication Ethics (COPE).' },
  { step: 'Resolution', description: 'Appropriate action is taken, which may include correction, expression of concern, or retraction of the published article.' },
  { step: 'Notification', description: 'All parties involved are notified of the outcome. Retractions are published transparently in the journal.' },
];

export default function EthicsPage() {
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-navy-950">
      {/* Hero */}
      <section className="gradient-navy relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('/grid.svg')] bg-center opacity-5" />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 sm:py-32">
          <div className="max-w-3xl animate-fade-in">
            <span className="inline-flex items-center gap-2 px-4 py-2 bg-gold-500/20 text-gold-400 rounded-full text-sm font-medium mb-6">
              <Shield className="w-4 h-4" />
              Publication Ethics
            </span>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white leading-tight mb-6">
              Publication Ethics & Policies
            </h1>
            <p className="text-xl sm:text-2xl text-slate-300 leading-relaxed">
              AMHSJ is committed to upholding the highest standards of publication ethics. 
              We follow the guidelines established by the Committee on Publication Ethics (COPE).
            </p>
          </div>
        </div>
        <div className="absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-t from-slate-50 dark:from-navy-950 to-transparent" />
      </section>

      {/* COPE Badge */}
      <section className="py-8 bg-white dark:bg-navy-900 border-b border-slate-200 dark:border-navy-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <p className="text-sm text-slate-600 dark:text-slate-400">
            AMHSJ is a member of the{' '}
            <a href="https://publicationethics.org" target="_blank" rel="noopener noreferrer" className="text-navy-700 dark:text-gold-400 font-semibold hover:underline">
              Committee on Publication Ethics (COPE)
            </a>
            {' '}and adheres to its Core Practices and guidelines.
          </p>
        </div>
      </section>

      {/* Core Principles */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <Badge variant="navy" size="lg" className="px-4 py-2 text-sm mb-4">Core Standards</Badge>
            <h2 className="text-3xl sm:text-4xl font-bold text-navy-900 dark:text-white mb-4">
              Ethical Principles
            </h2>
            <p className="text-slate-600 dark:text-slate-400 max-w-2xl mx-auto">
              Our ethical standards apply to all participants in the publishing process: authors, reviewers, and editors.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-6 max-w-5xl mx-auto">
            {principles.map((section, i) => (
              <div key={i} className="bg-white dark:bg-navy-900 rounded-xl p-6 shadow-sm border border-slate-200 dark:border-navy-800">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 bg-navy-100 dark:bg-navy-800 rounded-lg flex items-center justify-center text-navy-700 dark:text-gold-400">
                    <section.icon className="w-5 h-5" />
                  </div>
                  <h3 className="font-bold text-navy-900 dark:text-white">{section.title}</h3>
                </div>
                <ul className="space-y-2">
                  {section.items.map((item, j) => (
                    <li key={j} className="flex items-start gap-2 text-sm text-slate-600 dark:text-slate-400">
                      <CheckCircle className="w-4 h-4 text-green-600 dark:text-green-400 flex-shrink-0 mt-0.5" />
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Research Misconduct */}
      <section className="py-20 bg-white dark:bg-navy-900 border-t border-slate-200 dark:border-navy-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <Badge variant="navy" size="lg" className="px-4 py-2 text-sm mb-4">Zero Tolerance</Badge>
            <h2 className="text-3xl sm:text-4xl font-bold text-navy-900 dark:text-white mb-4">
              Research Misconduct
            </h2>
            <p className="text-slate-600 dark:text-slate-400 max-w-2xl mx-auto">
              AMHSJ maintains a strict zero-tolerance policy toward research misconduct.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-6 max-w-5xl mx-auto">
            {misconduct.map((item, i) => (
              <div key={i} className="bg-slate-50 dark:bg-navy-950 rounded-xl p-6 border border-slate-200 dark:border-navy-800">
                <div className="flex items-start gap-3 mb-3">
                  <AlertTriangle className="w-5 h-5 text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" />
                  <h3 className="font-bold text-navy-900 dark:text-white">{item.title}</h3>
                </div>
                <p className="text-slate-600 dark:text-slate-400 text-sm leading-relaxed mb-3">{item.description}</p>
                <p className="text-xs font-medium text-red-700 dark:text-red-400 bg-red-50 dark:bg-red-900/20 px-3 py-1.5 rounded-lg inline-block">
                  Consequence: {item.severity}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Ethics Process */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <Badge variant="navy" size="lg" className="px-4 py-2 text-sm mb-4">How It Works</Badge>
            <h2 className="text-3xl sm:text-4xl font-bold text-navy-900 dark:text-white mb-4">
              Ethics Complaint Process
            </h2>
          </div>

          <div className="max-w-3xl mx-auto">
            <div className="relative">
              <div className="absolute left-6 top-0 bottom-0 w-0.5 bg-navy-200 dark:bg-navy-700" />
              <div className="space-y-6">
                {process.map((item, i) => (
                  <div key={i} className="relative flex gap-6">
                    <div className="w-12 h-12 bg-navy-900 dark:bg-navy-700 text-gold-400 rounded-full flex items-center justify-center font-bold text-sm flex-shrink-0 z-10">
                      {i + 1}
                    </div>
                    <div className="flex-1 bg-white dark:bg-navy-900 rounded-xl p-5 shadow-sm border border-slate-200 dark:border-navy-800">
                      <h3 className="font-bold text-navy-900 dark:text-white mb-1">{item.step}</h3>
                      <p className="text-slate-600 dark:text-slate-400 text-sm">{item.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
