import { Metadata } from 'next';
import Link from 'next/link';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Users, CheckCircle, ArrowRight } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Become a Reviewer',
  description: 'Join the AMHSJ peer review panel and contribute to advancing medical research.',
};

const benefits = [
  'Contribute to maintaining the highest standards of scientific publishing',
  'Gain early access to cutting-edge research before publication',
  'Earn recognition through our annual Reviewer Excellence Awards',
  'Receive an official certificate of review service for your portfolio',
  'Network with leading researchers and editors worldwide',
  'Receive a complimentary article processing charge waiver for your next submission',
];

const requirements = [
  'Hold a PhD or equivalent doctoral degree in a relevant field',
  'Have an active research profile with recent publications',
  'Demonstrate expertise in one or more of our subject areas',
  'Commit to completing reviews within the agreed timeline (typically 3-4 weeks)',
  'Maintain objectivity and confidentiality throughout the review process',
];

export default function ReviewersPage() {
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-navy-950">
      <section className="gradient-navy relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('/grid.svg')] bg-center opacity-5" />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 sm:py-32">
          <div className="max-w-3xl animate-fade-in">
            <span className="inline-flex items-center gap-2 px-4 py-2 bg-gold-500/20 text-gold-400 rounded-full text-sm font-medium mb-6">
              <Users className="w-4 h-4" />
              Join Our Review Panel
            </span>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white leading-tight mb-6">
              Become a Reviewer
            </h1>
            <p className="text-xl sm:text-2xl text-slate-300 leading-relaxed mb-8">
              Help us maintain the highest standards of peer review. Join a global panel
              of experts shaping the future of medical research.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <Link href="/register">
                <Button size="xl" variant="gold">Apply to Review <ArrowRight className="w-5 h-5 ml-2" /></Button>
              </Link>
              <Link href="/reviewers/guidelines">
                <Button size="xl" variant="outline" className="border-white text-white hover:bg-white/10">Reviewer Guidelines</Button>
              </Link>
            </div>
          </div>
        </div>
        <div className="absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-t from-slate-50 dark:from-navy-950 to-transparent" />
      </section>

      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 max-w-5xl mx-auto">
            <div>
              <Badge variant="navy" size="lg" className="px-4 py-2 text-sm mb-6">Why Review?</Badge>
              <h2 className="text-3xl font-bold text-navy-900 dark:text-white mb-6">
                Benefits of Reviewing for AMHSJ
              </h2>
              <ul className="space-y-4">
                {benefits.map((b, i) => (
                  <li key={i} className="flex items-start gap-3 text-slate-600 dark:text-slate-400">
                    <CheckCircle className="w-5 h-5 text-green-600 dark:text-green-400 flex-shrink-0 mt-0.5" />
                    <span>{b}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <Badge variant="navy" size="lg" className="px-4 py-2 text-sm mb-6">Requirements</Badge>
              <h2 className="text-3xl font-bold text-navy-900 dark:text-white mb-6">
                What We Look For
              </h2>
              <ul className="space-y-4">
                {requirements.map((r, i) => (
                  <li key={i} className="flex items-start gap-3 text-slate-600 dark:text-slate-400">
                    <CheckCircle className="w-5 h-5 text-gold-600 dark:text-gold-400 flex-shrink-0 mt-0.5" />
                    <span>{r}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      <section className="py-16 bg-white dark:bg-navy-900 border-t border-slate-200 dark:border-navy-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            {[
              { value: '200+', label: 'Active Reviewers' },
              { value: '50+', label: 'Countries' },
              { value: '3-4', label: 'Week Avg. Turnaround' },
              { value: '95%', label: 'Reviewer Satisfaction' },
            ].map((stat, i) => (
              <div key={i}>
                <p className="text-3xl font-bold text-navy-900 dark:text-white">{stat.value}</p>
                <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
