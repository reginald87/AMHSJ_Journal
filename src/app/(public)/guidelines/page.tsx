import { Metadata } from 'next';
import Link from 'next/link';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { FileText, CheckCircle, Clock, ArrowRight, Mail, AlertCircle, BookOpen } from 'lucide-react';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'Submission Guidelines',
  description: 'Submission guidelines for authors publishing in Advances in Medicine and Health Sciences Journal.',
};

const DEFAULTS = {
  heroTitle: 'Submission Guidelines',
  heroSubtitle: 'Please read carefully before submission. Follow these guidelines to ensure your manuscript meets all requirements and avoids rejection.',
  email: 'amhsj@bayelsamedicaluniversity.edu.ng',
  articleTypes: [
    { type: 'Original Research Articles', description: 'Reports of original research', wordLimit: '3000 words max', abstract: '300 words max', references: 'Vancouver format', figures: '250 words each' },
    { type: 'Review Articles', description: 'Comprehensive reviews', wordLimit: '3500 words max', abstract: '300 words max', references: 'Vancouver format', figures: '250 words each' },
    { type: 'Case/Audit Reports', description: 'Clinical case reports', wordLimit: '800 words max', abstract: '300 words max', references: 'Vancouver format', figures: '250 words each' },
    { type: 'Letters', description: 'Brief communications', wordLimit: 'As appropriate', abstract: 'Not required', references: 'Vancouver format', figures: 'Minimal' },
  ],
  abstractStructure: [
    { step: '1', title: 'Background', description: 'Study rationale, context, and what was previously known' },
    { step: '2', title: 'Objectives', description: 'Clear statement of study aims and research questions' },
    { step: '3', title: 'Methods', description: 'Study design, participants, procedures, and analytical methods' },
    { step: '4', title: 'Results', description: 'Main findings with key data and statistical significance' },
    { step: '5', title: 'Conclusion', description: 'Principal conclusions and their clinical/scientific implications' },
  ],
  peerReviewCriteria: [
    { title: 'Structure & Content', items: ['Does the title reflect the contents?', 'Does abstract reflect all study aspects?', 'Is study rationale adequately described?', 'Are objectives clearly stated?', 'Do results justify the conclusions?', 'Is the paper clearly written?'] },
    { title: 'Methodology & Analysis', items: ['Is study design appropriate?', 'Is sample size appropriate?', 'Are data collection methods described?', 'Are bias minimization techniques documented?', 'Are data analysis methods appropriate?', 'Is statistical significance documented?'] },
    { title: 'Discussion & References', items: ['Are key findings clearly stated?', 'Are differences with other studies discussed?', 'Are implications clearly explained?', 'Are references appropriate and up-to-date?', 'Do references follow Vancouver style?', 'Any important references missing?'] },
    { title: 'Ethics & Quality', items: ['Are ethical considerations described?', 'Is ethics approval documented?', 'Are results credible and logical?', 'Are there grammar/language problems?', 'Is interpretation warranted by data?', 'Are conflicts of interest declared?'] },
  ],
  submissionSteps: [
    { step: 1, title: 'Prepare Your Manuscript', description: 'Format according to guidelines and prepare all required files' },
    { step: 2, title: 'Create Account', description: 'Register on our submission platform with ORCID integration' },
    { step: 3, title: 'Upload Files', description: 'Submit manuscript, figures, and supplementary materials' },
    { step: 4, title: 'Review & Submit', description: 'Review all information and complete submission' },
  ],
  preSubmissionChecks: ['Use the official manuscript template', 'Complete the author checklist', 'Verify all required sections', 'Check figure and table quality'],
  rejectionReasons: ['Incorrect formatting or template use', 'Incomplete author information', 'Missing ethics approvals', 'Improper reference formatting'],
  authorshipCriteria: [
    'Substantial contributions to the conception, design, data acquisition, or analysis/interpretation of data',
    'Drafting the work or revising it critically for important intellectual content',
    'Final approval of the version to be published',
    'Agreement to be accountable for all aspects of the work',
  ],
  publicationDetails: [
    { label: 'Open Access Policy', value: 'Free, unrestricted online access' },
    { label: 'License', value: 'CC BY-NC-ND' },
    { label: 'Publication Fee', value: 'No charges' },
    { label: 'Reference Style', value: 'Vancouver format' },
  ],
};

async function getSections(): Promise<Record<string, any> | null> {
  const page = await prisma.page.findUnique({ where: { slug: 'guidelines' } });
  if (!page?.sections) return null;
  try { return JSON.parse(page.sections); } catch { return null; }
}

export default async function GuidelinesPage() {
  const s = await getSections();

  const heroTitle = s?.heroTitle ?? DEFAULTS.heroTitle;
  const heroSubtitle = s?.heroSubtitle ?? DEFAULTS.heroSubtitle;
  const email = s?.email ?? DEFAULTS.email;
  const articleTypes = s?.articleTypes ?? DEFAULTS.articleTypes;
  const abstractStructure = s?.abstractStructure ?? DEFAULTS.abstractStructure;
  const peerReviewCriteria = s?.peerReviewCriteria ?? DEFAULTS.peerReviewCriteria;
  const submissionSteps = s?.submissionSteps ?? DEFAULTS.submissionSteps;
  const preSubmissionChecks = s?.preSubmissionChecks ?? DEFAULTS.preSubmissionChecks;
  const rejectionReasons = s?.rejectionReasons ?? DEFAULTS.rejectionReasons;
  const authorshipCriteria = s?.authorshipCriteria ?? DEFAULTS.authorshipCriteria;
  const publicationDetails = s?.publicationDetails ?? DEFAULTS.publicationDetails;

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-navy-950">
      {/* Hero */}
      <section className="gradient-navy relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('/grid.svg')] bg-center opacity-5" />
        <div className="absolute inset-0 bg-gradient-to-r from-navy-900/50 to-navy-800/50" />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 sm:py-32">
          <div className="max-w-3xl animate-fade-in">
            <span className="inline-flex items-center gap-2 px-4 py-2 bg-gold-500/20 text-gold-400 rounded-full text-sm font-medium mb-6">
              <FileText className="w-4 h-4" />
              Official Journal of Bayelsa Medical University
            </span>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white leading-tight mb-6">{heroTitle}</h1>
            <p className="text-xl sm:text-2xl text-slate-300 leading-relaxed mb-8">{heroSubtitle}</p>
            <div className="bg-red-900/30 border border-red-500/30 rounded-lg p-4 mb-8">
              <div className="flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-red-400 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="font-semibold text-red-300 text-sm">CRITICAL: Compliance Required for Review</p>
                  <p className="text-red-200/80 text-sm mt-1">Manuscripts that do not follow these submission guidelines and formatting requirements will be <strong>REJECTED without review</strong>. To avoid rejection, ensure your manuscript meets ALL requirements listed in these guidelines before submission.</p>
                </div>
              </div>
            </div>
            <Link href="/register">
              <Button size="xl" variant="gold">Submit Your Manuscript <ArrowRight className="w-5 h-5 ml-2" /></Button>
            </Link>
          </div>
        </div>
        <div className="absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-t from-slate-50 dark:from-navy-950 to-transparent" />
      </section>

      {/* Key Stats */}
      <section className="py-8 bg-white dark:bg-navy-900 border-b border-slate-200 dark:border-navy-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-wrap gap-6 justify-center text-sm">
            <div className="flex items-center gap-2 text-slate-600 dark:text-slate-400">
              <Clock className="w-4 h-4 text-gold-500" />
              <span><strong className="text-navy-900 dark:text-white">14 days</strong> peer-review timeframe</span>
            </div>
            <div className="flex items-center gap-2 text-slate-600 dark:text-slate-400">
              <Clock className="w-4 h-4 text-gold-500" />
              <span><strong className="text-navy-900 dark:text-white">4-6 weeks</strong> publication after submission</span>
            </div>
            <div className="flex items-center gap-2 text-slate-600 dark:text-slate-400">
              <Mail className="w-4 h-4 text-gold-500" />
              <span>Submit to: <a href={`mailto:${email}`} className="text-gold-600 dark:text-gold-400 hover:underline">{email}</a></span>
            </div>
          </div>
        </div>
      </section>

      {/* Before Submission Checklist */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto">
            <div className="bg-white dark:bg-navy-900 rounded-xl p-6 shadow-sm border border-slate-200 dark:border-navy-800">
              <h3 className="font-bold text-navy-900 dark:text-white mb-4">Pre-Submission Requirements</h3>
              <ul className="space-y-3">
                {preSubmissionChecks.map((item: string, i: number) => (
                  <li key={i} className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400">
                    <CheckCircle className="w-4 h-4 text-green-600 dark:text-green-400 flex-shrink-0" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>
            <div className="bg-white dark:bg-navy-900 rounded-xl p-6 shadow-sm border border-slate-200 dark:border-navy-800">
              <h3 className="font-bold text-navy-900 dark:text-white mb-4">Common Rejection Reasons</h3>
              <ul className="space-y-3">
                {rejectionReasons.map((item: string, i: number) => (
                  <li key={i} className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400">
                    <AlertCircle className="w-4 h-4 text-red-500 flex-shrink-0" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Article Types */}
      <section id="article-types" className="py-20 bg-white dark:bg-navy-900 border-t border-slate-200 dark:border-navy-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <Badge variant="navy" size="lg" className="px-4 py-2 text-sm mb-4">What to Submit</Badge>
            <h2 className="text-3xl sm:text-4xl font-bold text-navy-900 dark:text-white mb-4">Article Types</h2>
            <p className="text-slate-600 dark:text-slate-400 max-w-2xl mx-auto">AMHSJ accepts the following types of submissions. All papers will be peer-reviewed by at least three independent referees.</p>
          </div>
          <div className="grid md:grid-cols-2 gap-6 max-w-5xl mx-auto">
            {articleTypes.map((item: any, index: number) => (
              <div key={index} className="bg-slate-50 dark:bg-navy-950 rounded-xl p-6 border border-slate-200 dark:border-navy-800 hover:shadow-md transition-shadow">
                <h3 className="text-lg font-bold text-navy-900 dark:text-white mb-1">{item.type}</h3>
                <p className="text-slate-600 dark:text-slate-400 text-sm mb-4">{item.description}</p>
                <div className="grid grid-cols-2 gap-3 text-xs">
                  <div className="bg-white dark:bg-navy-800 rounded-lg p-3"><p className="text-slate-500 dark:text-slate-400">Word Limit</p><p className="font-semibold text-navy-900 dark:text-white">{item.wordLimit}</p></div>
                  <div className="bg-white dark:bg-navy-800 rounded-lg p-3"><p className="text-slate-500 dark:text-slate-400">Abstract</p><p className="font-semibold text-navy-900 dark:text-white">{item.abstract}</p></div>
                  <div className="bg-white dark:bg-navy-800 rounded-lg p-3"><p className="text-slate-500 dark:text-slate-400">References</p><p className="font-semibold text-navy-900 dark:text-white">{item.references}</p></div>
                  <div className="bg-white dark:bg-navy-800 rounded-lg p-3"><p className="text-slate-500 dark:text-slate-400">Figures</p><p className="font-semibold text-navy-900 dark:text-white">{item.figures}</p></div>
                </div>
              </div>
            ))}
          </div>
          <p className="text-sm text-slate-500 dark:text-slate-400 text-center mt-6 max-w-3xl mx-auto">Allow 250 words for each table, figure or group of eight references when calculating total word count.</p>
        </div>
      </section>

      {/* Submission Process */}
      <section id="submission-process" className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <Badge variant="navy" size="lg" className="px-4 py-2 text-sm mb-4">Steps</Badge>
            <h2 className="text-3xl sm:text-4xl font-bold text-navy-900 dark:text-white mb-4">Submission Process</h2>
            <p className="text-slate-600 dark:text-slate-400 max-w-2xl mx-auto">Follow these steps to submit your manuscript</p>
          </div>
          <div className="max-w-3xl mx-auto">
            <div className="relative">
              <div className="absolute left-6 top-0 bottom-0 w-0.5 bg-navy-200 dark:bg-navy-700" />
              <div className="space-y-8">
                {submissionSteps.map((item: any) => (
                  <div key={item.step} className="relative flex gap-6">
                    <div className="w-12 h-12 bg-navy-900 dark:bg-navy-700 text-gold-400 rounded-full flex items-center justify-center font-bold text-sm flex-shrink-0 z-10">{item.step}</div>
                    <div className="flex-1 bg-white dark:bg-navy-900 rounded-xl p-5 shadow-sm border border-slate-200 dark:border-navy-800">
                      <h3 className="font-bold text-navy-900 dark:text-white mb-1">{item.title}</h3>
                      <p className="text-slate-600 dark:text-slate-400 text-sm">{item.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
          <div className="text-center mt-8">
            <Link href="/register"><Button size="lg" variant="gold">Start Submission <ArrowRight className="w-4 h-4 ml-2" /></Button></Link>
          </div>
        </div>
      </section>

      {/* Manuscript Preparation */}
      <section id="preparation" className="py-20 bg-white dark:bg-navy-900 border-t border-slate-200 dark:border-navy-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <Badge variant="navy" size="lg" className="px-4 py-2 text-sm mb-4">Step-by-Step</Badge>
            <h2 className="text-3xl sm:text-4xl font-bold text-navy-900 dark:text-white mb-4">Manuscript Preparation</h2>
          </div>
          <div className="max-w-4xl mx-auto space-y-8">
            <div className="bg-slate-50 dark:bg-navy-950 rounded-xl p-6 border border-slate-200 dark:border-navy-800">
              <h3 className="font-bold text-navy-900 dark:text-white mb-3">General Requirements</h3>
              <ul className="space-y-2 text-sm text-slate-600 dark:text-slate-400">
                <li className="flex items-start gap-2"><CheckCircle className="w-4 h-4 text-green-600 dark:text-green-400 flex-shrink-0 mt-0.5" /> Font: Times New Roman, size 12, double-spaced</li>
                <li className="flex items-start gap-2"><CheckCircle className="w-4 h-4 text-green-600 dark:text-green-400 flex-shrink-0 mt-0.5" /> Single column format using Microsoft Word</li>
                <li className="flex items-start gap-2"><CheckCircle className="w-4 h-4 text-green-600 dark:text-green-400 flex-shrink-0 mt-0.5" /> Pages numbered consecutively</li>
                <li className="flex items-start gap-2"><CheckCircle className="w-4 h-4 text-green-600 dark:text-green-400 flex-shrink-0 mt-0.5" /> Word count provided (excluding references, tables, legends)</li>
                <li className="flex items-start gap-2"><CheckCircle className="w-4 h-4 text-green-600 dark:text-green-400 flex-shrink-0 mt-0.5" /> References in Vancouver format</li>
              </ul>
            </div>
            <div className="bg-slate-50 dark:bg-navy-950 rounded-xl p-6 border border-slate-200 dark:border-navy-800">
              <h3 className="font-bold text-navy-900 dark:text-white mb-3">Title Page Requirements</h3>
              <ul className="space-y-2 text-sm text-slate-600 dark:text-slate-400">
                <li className="flex items-start gap-2"><CheckCircle className="w-4 h-4 text-green-600 dark:text-green-400 flex-shrink-0 mt-0.5" /> Full title of the article</li>
                <li className="flex items-start gap-2"><CheckCircle className="w-4 h-4 text-green-600 dark:text-green-400 flex-shrink-0 mt-0.5" /> Names and up to 2 degrees of all authors</li>
                <li className="flex items-start gap-2"><CheckCircle className="w-4 h-4 text-green-600 dark:text-green-400 flex-shrink-0 mt-0.5" /> Department(s) and institution(s)</li>
                <li className="flex items-start gap-2"><CheckCircle className="w-4 h-4 text-green-600 dark:text-green-400 flex-shrink-0 mt-0.5" /> Five keywords</li>
                <li className="flex items-start gap-2"><CheckCircle className="w-4 h-4 text-green-600 dark:text-green-400 flex-shrink-0 mt-0.5" /> Corresponding author name, email and postal address</li>
              </ul>
            </div>
            <div className="bg-slate-50 dark:bg-navy-950 rounded-xl p-6 border border-slate-200 dark:border-navy-800">
              <h3 className="font-bold text-navy-900 dark:text-white mb-3">Abstract Structure</h3>
              <p className="text-sm text-slate-600 dark:text-slate-400 mb-4">Required structure for abstracts (maximum 300 words)</p>
              <div className="space-y-3">
                {abstractStructure.map((item: any) => (
                  <div key={item.step} className="flex items-start gap-3">
                    <div className="w-7 h-7 bg-navy-900 dark:bg-navy-700 text-gold-400 rounded-full flex items-center justify-center font-bold text-xs flex-shrink-0">{item.step}</div>
                    <div>
                      <p className="font-semibold text-navy-900 dark:text-white text-sm">{item.title}</p>
                      <p className="text-slate-600 dark:text-slate-400 text-sm">{item.description}</p>
                    </div>
                  </div>
                ))}
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-4 italic">Note for Original Articles: All original article contributions should contain a structured abstract not exceeding 300 words following the Background, Objectives, Methods, Results, and Conclusion format.</p>
            </div>
            <div className="bg-slate-50 dark:bg-navy-950 rounded-xl p-6 border border-slate-200 dark:border-navy-800">
              <h3 className="font-bold text-navy-900 dark:text-white mb-3">Covering Letter Requirements</h3>
              <ul className="space-y-2 text-sm text-slate-600 dark:text-slate-400">
                <li className="flex items-start gap-2"><CheckCircle className="w-4 h-4 text-green-600 dark:text-green-400 flex-shrink-0 mt-0.5" /> Must identify the corresponding author</li>
                <li className="flex items-start gap-2"><CheckCircle className="w-4 h-4 text-green-600 dark:text-green-400 flex-shrink-0 mt-0.5" /> Must be signed by all co-authors</li>
                <li className="flex items-start gap-2"><CheckCircle className="w-4 h-4 text-green-600 dark:text-green-400 flex-shrink-0 mt-0.5" /> Only those who have contributed significantly should be included as authors</li>
                <li className="flex items-start gap-2"><CheckCircle className="w-4 h-4 text-green-600 dark:text-green-400 flex-shrink-0 mt-0.5" /> Corresponding author should explain any authors unable to sign</li>
                <li className="flex items-start gap-2"><CheckCircle className="w-4 h-4 text-green-600 dark:text-green-400 flex-shrink-0 mt-0.5" /> All authors must sign declaration and copyright form when manuscript is accepted</li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Peer Review Criteria */}
      <section id="peer-review" className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <Badge variant="navy" size="lg" className="px-4 py-2 text-sm mb-4">Evaluation</Badge>
            <h2 className="text-3xl sm:text-4xl font-bold text-navy-900 dark:text-white mb-4">Peer Review Criteria</h2>
            <p className="text-slate-600 dark:text-slate-400 max-w-2xl mx-auto">Criteria used by reviewers to evaluate manuscripts</p>
          </div>
          <div className="grid md:grid-cols-2 gap-6 max-w-5xl mx-auto">
            {peerReviewCriteria.map((section: any, index: number) => (
              <div key={index} className="bg-white dark:bg-navy-900 rounded-xl p-6 shadow-sm border border-slate-200 dark:border-navy-800">
                <h3 className="font-bold text-navy-900 dark:text-white mb-3">{section.title}</h3>
                <ul className="space-y-2">
                  {section.items.map((item: any, i: number) => (
                    <li key={i} className="flex items-start gap-2 text-sm text-slate-600 dark:text-slate-400">
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

      {/* Authorship & Publication */}
      <section id="authorship" className="py-20 bg-white dark:bg-navy-900 border-t border-slate-200 dark:border-navy-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto space-y-12">
            <div>
              <div className="text-center mb-10">
                <Badge variant="navy" size="lg" className="px-4 py-2 text-sm mb-4">Requirements</Badge>
                <h2 className="text-3xl sm:text-4xl font-bold text-navy-900 dark:text-white mb-4">Authorship</h2>
                <p className="text-slate-600 dark:text-slate-400">All authors must meet the following criteria:</p>
              </div>
              <div className="grid sm:grid-cols-2 gap-4">
                {authorshipCriteria.map((item: any, i: number) => (
                  <div key={i} className="bg-slate-50 dark:bg-navy-950 rounded-xl p-5 border border-slate-200 dark:border-navy-800 flex items-start gap-3">
                    <div className="w-8 h-8 bg-navy-900 dark:bg-navy-700 text-gold-400 rounded-full flex items-center justify-center font-bold text-sm flex-shrink-0">{i + 1}</div>
                    <p className="text-sm text-slate-600 dark:text-slate-400">{item}</p>
                  </div>
                ))}
              </div>
              <p className="text-sm text-slate-500 dark:text-slate-400 mt-4 text-center">Financial conflicts of interest must be declared. AMHSJ supports ORCID. Authors are encouraged to use ORCID iDs during peer review.</p>
            </div>
            <div className="bg-slate-50 dark:bg-navy-950 rounded-xl p-8 border border-slate-200 dark:border-navy-800">
              <h3 className="font-bold text-navy-900 dark:text-white mb-4 text-center">Publication Details</h3>
              <div className="grid sm:grid-cols-2 gap-4 text-sm">
                {publicationDetails.map((detail: any, i: number) => (
                  <div key={i} className="flex justify-between py-2 border-b border-slate-200 dark:border-navy-700">
                    <span className="text-slate-500 dark:text-slate-400">{detail.label}</span>
                    <span className="font-medium text-navy-900 dark:text-white">{detail.value}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 gradient-navy">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <Badge variant="gold" size="lg" className="px-4 py-2 text-sm mb-4">Ready to Submit?</Badge>
          <h2 className="text-3xl sm:text-4xl font-bold text-white mb-6">Ready to Submit Your Research?</h2>
          <p className="text-slate-300 text-lg mb-8 max-w-2xl mx-auto">Follow these guidelines carefully to ensure your manuscript meets all requirements.</p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/register"><Button size="xl" variant="gold">Start Submission</Button></Link>
            <Link href="/contact"><Button size="xl" variant="outline" className="border-white text-white hover:bg-white/10">Contact Editorial Office</Button></Link>
          </div>
        </div>
      </section>
    </div>
  );
}