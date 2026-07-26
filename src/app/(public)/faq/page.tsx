import { Metadata } from 'next';
import { Badge } from '@/components/ui/Badge';
import { ChevronDown } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Frequently Asked Questions',
  description: 'Answers to common questions about submitting to and publishing in AMHSJ.',
};

const faqs = [
  {
    category: 'Submission',
    items: [
      { q: 'How do I submit a manuscript?', a: 'Create an author account at /register, then use the submission wizard at /submit. The 5-step process guides you through entering details, adding co-authors, uploading files, making declarations, and reviewing before final submission.' },
      { q: 'Is there a submission fee?', a: 'No. AMHSJ charges no submission fees. A modest article processing charge (APC) applies only upon acceptance, with full waivers available for authors from low-income countries.' },
      { q: 'Can I submit a manuscript that is under review elsewhere?', a: 'No. AMHSJ requires that manuscripts are not under consideration by any other journal. Simultaneous submissions are considered a breach of publication ethics.' },
      { q: 'What file formats are accepted?', a: 'We accept Microsoft Word (.docx) as the preferred format, LaTeX with PDF output, and PDF for initial submissions. Figures should be provided as separate high-resolution files (minimum 300 DPI).' },
      { q: 'How long does the review process take?', a: 'Initial editorial screening takes 1–2 weeks. Peer review typically takes 4–6 weeks. You will receive a decision within 6–8 weeks of submission. Revisions may require an additional 2–4 weeks.' },
    ],
  },
  {
    category: 'Peer Review',
    items: [
      { q: 'What type of peer review does AMHSJ use?', a: 'AMHSJ uses a double-blind peer review process. Neither the authors nor the reviewers know each other\'s identities throughout the review process.' },
      { q: 'How many reviewers evaluate my manuscript?', a: 'Each manuscript is reviewed by at least two independent experts in the relevant field. In some cases, the editor may invite additional reviewers for specialized topics.' },
      { q: 'Can I suggest reviewers for my manuscript?', a: 'Yes. You may suggest up to 3 potential reviewers with relevant expertise. You must not suggest anyone with a conflict of interest. The editorial team has the final say on reviewer selection.' },
      { q: 'What happens if reviewers give conflicting recommendations?', a: 'When reviewers disagree, the editor may seek an additional review, make an independent assessment, or convene an editorial board discussion before reaching a decision.' },
    ],
  },
  {
    category: 'Publication',
    items: [
      { q: 'What happens after my manuscript is accepted?', a: 'Accepted manuscripts enter the production process: copyediting, typesetting, author proofreading, and final publication. Articles are published online within 2 weeks of final acceptance.' },
      { q: 'What license are articles published under?', a: 'All articles are published under the Creative Commons Attribution 4.0 International (CC BY 4.0) license, ensuring immediate and unrestricted access.' },
      { q: 'How do I track my submission?', a: 'Log in to your author dashboard at /dashboard to track the status of your manuscript at every stage, from submission through review to publication.' },
      { q: 'Can I request corrections after publication?', a: 'Yes. If you identify errors in your published article, contact the editorial office. Minor corrections are published as corrigenda; major issues may require a formal erratum or retraction.' },
    ],
  },
  {
    category: 'Account & Access',
    items: [
      { q: 'I forgot my password. How do I reset it?', a: 'Visit the login page at /login and click "Forgot Password." A reset link will be sent to your registered email address.' },
      { q: 'How do I update my profile information?', a: 'Log in and navigate to your profile settings in the dashboard. You can update your name, affiliation, ORCID, and other details.' },
      { q: 'Can I access articles without an account?', a: 'Yes. AMHSJ is a fully open-access journal. All published articles are freely available to anyone without requiring an account or subscription.' },
    ],
  },
];

export default function FAQPage() {
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-navy-950">
      {/* Hero */}
      <section className="gradient-navy relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('/grid.svg')] bg-center opacity-5" />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 sm:py-32">
          <div className="max-w-3xl animate-fade-in">
            <span className="inline-flex items-center gap-2 px-4 py-2 bg-gold-500/20 text-gold-400 rounded-full text-sm font-medium mb-6">
              Help Center
            </span>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white leading-tight mb-6">
              Frequently Asked Questions
            </h1>
            <p className="text-xl sm:text-2xl text-slate-300 leading-relaxed">
              Find answers to common questions about submitting, publishing, and accessing AMHSJ.
            </p>
          </div>
        </div>
        <div className="absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-t from-slate-50 dark:from-navy-950 to-transparent" />
      </section>

      {/* Quick Nav */}
      <section className="py-8 bg-white dark:bg-navy-900 border-b border-slate-200 dark:border-navy-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-wrap gap-3 justify-center text-sm">
            {faqs.map((cat) => (
              <a
                key={cat.category}
                href={`#${cat.category.toLowerCase()}`}
                className="px-4 py-2 rounded-lg bg-slate-100 dark:bg-navy-800 text-slate-700 dark:text-slate-300 hover:bg-navy-100 dark:hover:bg-navy-700 transition-colors"
              >
                {cat.category}
              </a>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ Sections */}
      {faqs.map((cat, ci) => (
        <section
          key={cat.category}
          id={cat.category.toLowerCase()}
          className={`py-16 ${ci % 2 === 1 ? 'bg-white dark:bg-navy-900 border-t border-slate-200 dark:border-navy-800' : ''}`}
        >
          <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
            <Badge variant="navy" size="lg" className="px-4 py-2 text-sm mb-6">{cat.category}</Badge>
            <div className="space-y-4">
              {cat.items.map((faq, fi) => (
                <details key={fi} className="group bg-white dark:bg-navy-900 rounded-xl border border-slate-200 dark:border-navy-800 overflow-hidden">
                  <summary className="flex items-center justify-between px-6 py-4 cursor-pointer font-semibold text-navy-900 dark:text-white hover:bg-slate-50 dark:hover:bg-navy-800 transition-colors list-none">
                    {faq.q}
                    <ChevronDown className="w-5 h-5 text-slate-400 group-open:rotate-180 transition-transform flex-shrink-0 ml-4" />
                  </summary>
                  <div className="px-6 pb-4 text-sm text-slate-600 dark:text-slate-400 leading-relaxed border-t border-slate-100 dark:border-navy-800 pt-4">
                    {faq.a}
                  </div>
                </details>
              ))}
            </div>
          </div>
        </section>
      ))}
    </div>
  );
}
