import { Metadata } from 'next';
import { Badge } from '@/components/ui/Badge';
import { Award, Star, Trophy, Medal } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Reviewer Recognition',
  description: 'How AMHSJ recognizes and rewards its peer reviewers.',
};

const awards = [
  { icon: Star, title: 'Outstanding Reviewer Award', description: 'Awarded annually to reviewers who have provided exceptionally thorough, constructive, and timely reviews.' },
  { icon: Trophy, title: 'Top Reviewer of the Year', description: 'Recognizes the single most impactful reviewer based on review quality, timeliness, and volume.' },
  { icon: Medal, title: 'Review Milestone Certificates', description: 'Certificates are awarded at milestones: 5, 10, 25, 50, and 100 completed reviews.' },
];

export default function ReviewerRecognitionPage() {
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-navy-950">
      <section className="gradient-navy relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('/grid.svg')] bg-center opacity-5" />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 sm:py-32">
          <div className="max-w-3xl animate-fade-in">
            <span className="inline-flex items-center gap-2 px-4 py-2 bg-gold-500/20 text-gold-400 rounded-full text-sm font-medium mb-6">
              <Award className="w-4 h-4" />
              Recognition Program
            </span>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white leading-tight mb-6">
              Reviewer Recognition
            </h1>
            <p className="text-xl sm:text-2xl text-slate-300 leading-relaxed">
              We value the essential contribution our reviewers make to the quality and integrity of published research.
            </p>
          </div>
        </div>
        <div className="absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-t from-slate-50 dark:from-navy-950 to-transparent" />
      </section>

      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <Badge variant="navy" size="lg" className="px-4 py-2 text-sm mb-4">Our Thanks</Badge>
            <h2 className="text-3xl sm:text-4xl font-bold text-navy-900 dark:text-white mb-4">
              Awards & Acknowledgments
            </h2>
          </div>
          <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
            {awards.map((award, i) => (
              <div key={i} className="bg-white dark:bg-navy-900 rounded-xl p-6 shadow-sm border border-slate-200 dark:border-navy-800 text-center">
                <div className="w-14 h-14 bg-gold-100 dark:bg-gold-900/30 rounded-xl flex items-center justify-center text-gold-600 dark:text-gold-400 mx-auto mb-4">
                  <award.icon className="w-7 h-7" />
                </div>
                <h3 className="font-bold text-navy-900 dark:text-white mb-2">{award.title}</h3>
                <p className="text-slate-600 dark:text-slate-400 text-sm leading-relaxed">{award.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-16 bg-white dark:bg-navy-900 border-t border-slate-200 dark:border-navy-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-2xl font-bold text-navy-900 dark:text-white mb-4">Additional Perks</h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 max-w-4xl mx-auto mt-8">
            {[
              'Annual reviewer appreciation event',
              'Free access to all AMHSJ content',
              'APC waiver for your next submission',
              'LinkedIn endorsement letter',
            ].map((perk, i) => (
              <div key={i} className="bg-slate-50 dark:bg-navy-950 rounded-xl p-4 border border-slate-200 dark:border-navy-800 text-sm font-medium text-navy-900 dark:text-white">
                {perk}
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
