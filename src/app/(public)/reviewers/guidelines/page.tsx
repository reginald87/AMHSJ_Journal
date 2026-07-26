import { Metadata } from 'next';
import { Badge } from '@/components/ui/Badge';
import { BookOpen, CheckCircle } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Reviewer Guidelines',
  description: 'Guidelines for peer reviewers of the Advances in Medicine and Health Sciences Journal.',
};

const reviewCriteria = [
  { title: 'Originality & Novelty', description: 'Does the manuscript present original research or a novel perspective? Does it contribute new knowledge to the field?' },
  { title: 'Scientific Rigor', description: 'Is the study design appropriate? Are the methods described in sufficient detail for reproducibility? Are statistical analyses valid?' },
  { title: 'Clinical Relevance', description: 'Are the findings clinically meaningful? Do they have implications for patient care or health policy?' },
  { title: 'Clarity & Presentation', description: 'Is the manuscript well-written and logically organized? Are tables and figures clear and informative?' },
  { title: 'Literature Review', description: 'Is the background section comprehensive? Are references current, relevant, and correctly cited?' },
  { title: 'Ethical Compliance', description: 'Are ethical standards met? Is informed consent documented? Are conflicts of interest disclosed?' },
];

const timeline = [
  { days: '0-3', action: 'Accept or decline the review invitation' },
  { days: '3-7', action: 'Read the manuscript thoroughly' },
  { days: '7-21', action: 'Complete your detailed review report' },
  { days: '21-28', action: 'Submit your recommendation' },
];

export default function ReviewerGuidelinesPage() {
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-navy-950">
      <section className="gradient-navy relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('/grid.svg')] bg-center opacity-5" />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 sm:py-32">
          <div className="max-w-3xl animate-fade-in">
            <span className="inline-flex items-center gap-2 px-4 py-2 bg-gold-500/20 text-gold-400 rounded-full text-sm font-medium mb-6">
              <BookOpen className="w-4 h-4" />
              For Reviewers
            </span>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white leading-tight mb-6">
              Reviewer Guidelines
            </h1>
            <p className="text-xl sm:text-2xl text-slate-300 leading-relaxed">
              Thank you for contributing your expertise to AMHSJ. These guidelines will help you provide a thorough and constructive review.
            </p>
          </div>
        </div>
        <div className="absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-t from-slate-50 dark:from-navy-950 to-transparent" />
      </section>

      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <Badge variant="navy" size="lg" className="px-4 py-2 text-sm mb-4">What to Assess</Badge>
            <h2 className="text-3xl sm:text-4xl font-bold text-navy-900 dark:text-white mb-4">Review Criteria</h2>
            <p className="text-slate-600 dark:text-slate-400 max-w-2xl mx-auto">
              When reviewing a manuscript, please evaluate the following key criteria.
            </p>
          </div>
          <div className="grid md:grid-cols-2 gap-6 max-w-5xl mx-auto">
            {reviewCriteria.map((item, i) => (
              <div key={i} className="bg-white dark:bg-navy-900 rounded-xl p-6 shadow-sm border border-slate-200 dark:border-navy-800">
                <div className="flex items-start gap-3">
                  <CheckCircle className="w-5 h-5 text-green-600 dark:text-green-400 flex-shrink-0 mt-0.5" />
                  <div>
                    <h3 className="font-bold text-navy-900 dark:text-white mb-1">{item.title}</h3>
                    <p className="text-slate-600 dark:text-slate-400 text-sm leading-relaxed">{item.description}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-20 bg-white dark:bg-navy-900 border-t border-slate-200 dark:border-navy-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <Badge variant="navy" size="lg" className="px-4 py-2 text-sm mb-4">Expected Timeline</Badge>
            <h2 className="text-3xl sm:text-4xl font-bold text-navy-900 dark:text-white mb-4">Review Timeline</h2>
          </div>
          <div className="max-w-3xl mx-auto">
            <div className="relative">
              <div className="absolute left-6 top-0 bottom-0 w-0.5 bg-navy-200 dark:bg-navy-700" />
              <div className="space-y-6">
                {timeline.map((item, i) => (
                  <div key={i} className="relative flex gap-6">
                    <div className="w-12 h-12 bg-navy-900 dark:bg-navy-700 text-gold-400 rounded-full flex items-center justify-center font-bold text-sm flex-shrink-0 z-10">
                      {i + 1}
                    </div>
                    <div className="flex-1 bg-slate-50 dark:bg-navy-950 rounded-xl p-5 border border-slate-200 dark:border-navy-800">
                      <p className="text-xs font-medium text-gold-600 dark:text-gold-400 mb-1">Day {item.days}</p>
                      <p className="text-slate-700 dark:text-slate-300">{item.action}</p>
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
