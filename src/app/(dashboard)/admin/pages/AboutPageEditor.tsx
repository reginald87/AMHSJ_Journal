'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Input, Textarea } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { ArrowLeft, Save, CheckCircle2, AlertCircle, Loader2, Plus, Trash2 } from 'lucide-react';
import Link from 'next/link';
import { toast } from 'sonner';

interface AboutSections {
  heroTitle: string;
  heroSubtitle: string;
  issn: string;
  impactFactor: string;
  missionTitle: string;
  missionDescription: string;
  visionTitle: string;
  visionDescription: string;
  aimsAndScope: { category: string; items: string[] }[];
  editorialPolicies: { title: string; description: string }[];
  indexing: string[];
  history: { year: string; title: string; description: string }[];
  ctaHeading: string;
  ctaText: string;
  stats: { value: string; label: string }[];
  benefits: { title: string; description: string }[];
  contactEmail: string;
  contactAddress: string;
}

const DEFAULT_SECTIONS: AboutSections = {
  heroTitle: 'About the Journal',
  heroSubtitle: 'Advances in Medicine & Health Sciences Journal - The Official Journal of Bayelsa Medical University',
  issn: 'XXXX-XXXX',
  impactFactor: '',
  missionTitle: 'Our Mission',
  missionDescription: 'Advances in Medicine and Health Sciences Journal (AMHSJ) is an international, peer-reviewed, open-access journal committed to the advancement and dissemination of scholarly knowledge across the expansive field of medicine and health sciences.\n\nThe journal serves as a dynamic platform for the exchange of high-quality scientific findings that shape clinical practice, influence health policy, and drive innovation in health systems worldwide.\n\nOur mission is to foster evidence-based practice, encourage interdisciplinary research, and enhance public health outcomes by publishing robust, impactful studies. AMHSJ is devoted to promoting scientific dialogue among researchers, academicians, healthcare providers, policymakers, and students through the publication of original research articles, systematic reviews, clinical case reports, brief communications, editorials, book reviews, and commentaries.',
  visionTitle: 'Our Vision',
  visionDescription: 'To become a leading international journal recognized for scientific rigor, ethical publishing practices, and rapid dissemination of research that transforms clinical practice and improves health outcomes across diverse populations worldwide.',
  aimsAndScope: [
    { category: 'Medicine & Clinical Sciences', items: ['General and Internal Medicine', 'Surgery and Surgical Specialties', 'Family and Community Medicine', 'Pediatrics and Adolescent Health', 'Obstetrics and Gynecology', 'Psychiatry and Mental Health', 'Emergency and Critical Care', 'Infectious Diseases', 'Chronic Diseases', 'Geriatric Care'] },
    { category: 'Public Health & Allied Sciences', items: ['Public and Community Health', 'Epidemiology and Biostatistics', 'Environmental Health', 'Health Promotion', 'Global Health Systems', 'Disaster Medicine', 'Social Determinants of Health', 'Healthcare Management', 'Health Economics', 'Digital Health'] },
    { category: 'Nursing, Pharmacy & Rehabilitation', items: ['Nursing Science and Midwifery', 'Clinical Pharmacy', 'Pharmacology and Toxicology', 'Physiotherapy', 'Rehabilitation Sciences', 'Complementary Medicine', 'Drug Development', 'Biomedical Engineering', 'Assistive Technology', 'Therapeutics'] },
    { category: 'Biomedical & Life Sciences', items: ['Anatomy and Physiology', 'Biochemistry and Molecular Biology', 'Microbiology and Immunology', 'Genetics and Genomics', 'Cancer Biology', 'Neurosciences', 'Biotechnology', 'Medical Laboratory Science', 'Molecular Diagnostics', 'Developmental Biology'] },
    { category: 'Nutrition & Food Science', items: ['Human Nutrition and Dietetics', 'Public Health Nutrition', 'Food Safety', 'Nutritional Epidemiology', 'Agriculture and Food Security', 'Veterinary Public Health', 'Food Science', 'Nutritional Biochemistry', 'Clinical Nutrition', 'Community Nutrition'] },
    { category: 'Interdisciplinary & Emerging Fields', items: ['Scientific Ethics', 'Research Integrity', 'Climate Change and Health', 'Population Health', 'Health Policy Innovation', 'Precision Medicine', 'Translational Research', 'AI in Medicine', 'Telemedicine', 'Health Informatics'] },
  ],
  editorialPolicies: [
    { title: 'Open Access', description: 'Fully open-access publishing model ensuring all published articles are immediately and permanently available online without any subscription or access fees.' },
    { title: 'Licensing', description: 'Creative Commons Attribution-NonCommercial-NoDerivs 3.0 License (CC BY-NC-ND 3.0) - readers may read, download, copy, distribute, print, search, and link to the full text, provided proper credit is given, the work is not altered, and it is not used commercially.' },
    { title: 'Peer Review', description: 'Double-blind peer review process. Reviewers are selected based on their subject-matter expertise and must declare any potential conflicts of interest before reviewing submissions.' },
    { title: 'Publication Ethics', description: 'We follow COPE guidelines. Authors are expected to disclose any conflicts of interest, funding sources, and ethical approval for studies involving human or animal subjects.' },
    { title: 'Plagiarism Policy', description: 'All manuscripts must contain original, unpublished content and demonstrate at least 80% text uniqueness. Single source similarity should not be greater than 3%. Manuscripts with more than 30% similarity will be rejected outright.' },
    { title: 'Publisher', description: 'Bayelsa Medical University, Yenagoa, Bayelsa State, Nigeria' },
  ],
  indexing: [],
  history: [],
  ctaHeading: 'Ready to Submit Your Research?',
  ctaText: 'Join the global community of researchers contributing to advances in medicine and health. Submit your original research, reviews, or case studies to AMHSJ.',
  stats: [
    { value: 'XXXX-XXXX', label: 'ISSN' },
    { value: 'English', label: 'Language' },
    { value: 'Double-blind', label: 'Review Process' },
    { value: '~4 weeks', label: 'Review Timeline' },
    { value: 'No charges', label: 'APCs' },
    { value: '100%', label: 'Open Access' },
  ],
  benefits: [
    { title: 'Rapid Review', description: 'Fair peer review leading to timely publication' },
    { title: 'Free Publication', description: 'No Article Processing Charges (APCs)' },
    { title: 'Global Visibility', description: 'Open-access indexing and digital dissemination' },
    { title: 'Enhanced Reach', description: 'Social media promotion and citation potential' },
    { title: 'Free Copies', description: 'PDF and hard copies provided free of charge' },
    { title: 'Recognition', description: 'Opportunities for scholarly collaboration' },
  ],
  contactEmail: 'amhsj@bayelsamedicaluniversity.edu.ng',
  contactAddress: 'Bayelsa Medical University, Yenagoa, Bayelsa State, Nigeria',
};

interface PageData {
  id: string; slug: string; title: string; description: string | null;
  content: string; sections: string | null;
  metaTitle: string | null; metaDescription: string | null; isPublished: boolean;
}

type Status =
  | { kind: 'idle' } | { kind: 'loading' } | { kind: 'not-found' } | { kind: 'ready' }
  | { kind: 'saving' } | { kind: 'saved' } | { kind: 'error'; message: string };

export default function AboutPageEditor({ slug }: { slug: string }) {
  const [title, setTitle] = useState('About');
  const [description, setDescription] = useState('');
  const [metaTitle, setMetaTitle] = useState('');
  const [metaDescription, setMetaDescription] = useState('');
  const [isPublished, setIsPublished] = useState(true);
  const [sections, setSections] = useState<AboutSections>(DEFAULT_SECTIONS);
  const [status, setStatus] = useState<Status>({ kind: 'loading' });

  useEffect(() => {
    fetch(`/api/admin/pages/${slug}`)
      .then(async (res) => {
        if (res.status === 404) { setStatus({ kind: 'not-found' }); return; }
        if (!res.ok) { setStatus({ kind: 'error', message: 'Failed to load page' }); return; }
        const data: PageData = await res.json();
        setTitle(data.title);
        setDescription(data.description ?? '');
        setMetaTitle(data.metaTitle ?? '');
        setMetaDescription(data.metaDescription ?? '');
        setIsPublished(data.isPublished);
        if (data.sections) {
          try {
            const parsed = JSON.parse(data.sections);
            setSections({ ...DEFAULT_SECTIONS, ...parsed, aimsAndScope: parsed.aimsAndScope ?? DEFAULT_SECTIONS.aimsAndScope, editorialPolicies: parsed.editorialPolicies ?? DEFAULT_SECTIONS.editorialPolicies, indexing: parsed.indexing ?? DEFAULT_SECTIONS.indexing, history: parsed.history ?? DEFAULT_SECTIONS.history, stats: parsed.stats ?? DEFAULT_SECTIONS.stats, benefits: parsed.benefits ?? DEFAULT_SECTIONS.benefits });
          } catch { /* keep defaults */ }
        }
        setStatus({ kind: 'ready' });
      })
      .catch(() => setStatus({ kind: 'error', message: 'Failed to load page' }));
  }, [slug]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setStatus({ kind: 'saving' });
    try {
      const res = await fetch(`/api/admin/pages/${slug}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title, description: description || null, content: description || title, sections, metaTitle: metaTitle || null, metaDescription: metaDescription || null, isPublished }),
      });
      if (res.ok) {
        setStatus({ kind: 'saved' });
        toast.success('About page saved');
        setTimeout(() => setStatus({ kind: 'ready' }), 2000);
      } else {
        const data = await res.json().catch(() => ({}));
        setStatus({ kind: 'error', message: data.error ?? 'Failed to save' });
      }
    } catch { setStatus({ kind: 'error', message: 'Failed to save' }); }
  }

  const u = (patch: Partial<AboutSections>) => setSections((s) => ({ ...s, ...patch }));

  if (status.kind === 'loading') {
    return <div className="flex items-center gap-2 text-slate-600 dark:text-slate-400"><Loader2 className="w-4 h-4 animate-spin" /> Loading…</div>;
  }

  return (
    <div className="space-y-6 max-w-4xl">
      <div className="flex items-center justify-between gap-4">
        <div>
          <Link href="/admin/pages" className="inline-flex items-center gap-1 text-sm text-slate-600 hover:text-navy-900 dark:text-slate-400 dark:hover:text-white">
            <ArrowLeft className="w-4 h-4" /> Back to pages
          </Link>
          <h1 className="mt-2 text-2xl sm:text-3xl font-bold text-navy-900 dark:text-white">Edit About Page</h1>
          <p className="text-slate-600 dark:text-slate-400 mt-1">Slug: <span className="font-mono">{slug}</span></p>
        </div>
      </div>

      {status.kind === 'not-found' && (
        <div className="rounded-lg border border-amber-300 bg-amber-50 px-4 py-3 text-sm text-amber-900">This page does not exist yet. Save to create it.</div>
      )}
      {status.kind === 'saved' && (
        <div className="flex items-center gap-2 rounded-lg border border-green-300 bg-green-50 px-4 py-3 text-sm text-green-900">
          <CheckCircle2 className="w-4 h-4" /> Page saved successfully.
        </div>
      )}
      {status.kind === 'error' && (
        <div className="flex items-center gap-2 rounded-lg border border-red-300 bg-red-50 px-4 py-3 text-sm text-red-900">
          <AlertCircle className="w-4 h-4" /> {status.message}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        <Card>
          <CardHeader><CardTitle>Hero Section</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <Input label="Hero Title" value={sections.heroTitle} onChange={(e) => u({ heroTitle: e.target.value })} required />
            <Textarea label="Hero Subtitle" rows={2} value={sections.heroSubtitle} onChange={(e) => u({ heroSubtitle: e.target.value })} />
            <div className="grid grid-cols-2 gap-4">
              <Input label="ISSN" value={sections.issn} onChange={(e) => u({ issn: e.target.value })} />
              <Input label="Impact Factor" value={sections.impactFactor} onChange={(e) => u({ impactFactor: e.target.value })} />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle>Statistics</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            {sections.stats.map((stat, i) => (
              <div key={i} className="flex items-center gap-3">
                <Input label="" placeholder="Value" value={stat.value} onChange={(e) => {
                  const updated = [...sections.stats]; updated[i] = { ...updated[i], value: e.target.value }; u({ stats: updated });
                }} className="w-32" />
                <Input label="" placeholder="Label" value={stat.label} onChange={(e) => {
                  const updated = [...sections.stats]; updated[i] = { ...updated[i], label: e.target.value }; u({ stats: updated });
                }} className="flex-1" />
                <Button type="button" variant="ghost" size="icon" onClick={() => u({ stats: sections.stats.filter((_, j) => j !== i) })} className="text-red-600 h-9 w-9"><Trash2 className="w-4 h-4" /></Button>
              </div>
            ))}
            <Button type="button" variant="outline" size="sm" onClick={() => u({ stats: [...sections.stats, { value: '', label: '' }] })}><Plus className="w-4 h-4 mr-1" /> Add Stat</Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle>Mission & Vision</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <Input label="Mission Title" value={sections.missionTitle} onChange={(e) => u({ missionTitle: e.target.value })} />
            <Textarea label="Mission Description" rows={3} value={sections.missionDescription} onChange={(e) => u({ missionDescription: e.target.value })} />
            <Input label="Vision Title" value={sections.visionTitle} onChange={(e) => u({ visionTitle: e.target.value })} />
            <Textarea label="Vision Description" rows={3} value={sections.visionDescription} onChange={(e) => u({ visionDescription: e.target.value })} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle>Aims & Scope</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            {sections.aimsAndScope.map((group, gi) => (
              <div key={gi} className="border border-slate-200 dark:border-navy-700 rounded-lg p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-slate-500">Category #{gi + 1}</span>
                  <Button type="button" variant="ghost" size="icon" onClick={() => u({ aimsAndScope: sections.aimsAndScope.filter((_, j) => j !== gi) })} className="text-red-600 h-8 w-8"><Trash2 className="w-4 h-4" /></Button>
                </div>
                <Input label="Category Name" value={group.category} onChange={(e) => { const updated = [...sections.aimsAndScope]; updated[gi] = { ...updated[gi], category: e.target.value }; u({ aimsAndScope: updated }); }} />
                <div className="space-y-2">
                  {group.items.map((item, ii) => (
                    <div key={ii} className="flex items-center gap-2">
                      <Input value={item} onChange={(e) => { const updated = [...sections.aimsAndScope]; const items = [...updated[gi].items]; items[ii] = e.target.value; updated[gi] = { ...updated[gi], items }; u({ aimsAndScope: updated }); }} className="flex-1" />
                      <Button type="button" variant="ghost" size="icon" onClick={() => { const updated = [...sections.aimsAndScope]; updated[gi] = { ...updated[gi], items: updated[gi].items.filter((_, j) => j !== ii) }; u({ aimsAndScope: updated }); }} className="text-red-600 h-9 w-9"><Trash2 className="w-4 h-4" /></Button>
                    </div>
                  ))}
                  <Button type="button" variant="outline" size="sm" onClick={() => { const updated = [...sections.aimsAndScope]; updated[gi] = { ...updated[gi], items: [...updated[gi].items, ''] }; u({ aimsAndScope: updated }); }}><Plus className="w-4 h-4 mr-1" /> Add Item</Button>
                </div>
              </div>
            ))}
            <Button type="button" variant="outline" onClick={() => u({ aimsAndScope: [...sections.aimsAndScope, { category: '', items: [''] }] })}><Plus className="w-4 h-4 mr-2" /> Add Category</Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle>Editorial Policies</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            {sections.editorialPolicies.map((policy, i) => (
              <div key={i} className="border border-slate-200 dark:border-navy-700 rounded-lg p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-slate-500">Policy #{i + 1}</span>
                  <Button type="button" variant="ghost" size="icon" onClick={() => u({ editorialPolicies: sections.editorialPolicies.filter((_, j) => j !== i) })} className="text-red-600 h-8 w-8"><Trash2 className="w-4 h-4" /></Button>
                </div>
                <Input label="Title" value={policy.title} onChange={(e) => { const updated = [...sections.editorialPolicies]; updated[i] = { ...updated[i], title: e.target.value }; u({ editorialPolicies: updated }); }} />
                <Textarea label="Description" rows={2} value={policy.description} onChange={(e) => { const updated = [...sections.editorialPolicies]; updated[i] = { ...updated[i], description: e.target.value }; u({ editorialPolicies: updated }); }} />
              </div>
            ))}
            <Button type="button" variant="outline" onClick={() => u({ editorialPolicies: [...sections.editorialPolicies, { title: '', description: '' }] })}><Plus className="w-4 h-4 mr-2" /> Add Policy</Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle>Indexing & Abstracting</CardTitle></CardHeader>
          <CardContent className="space-y-3">
            {sections.indexing.map((item, i) => (
              <div key={i} className="flex items-center gap-2">
                <Input value={item} onChange={(e) => { const updated = [...sections.indexing]; updated[i] = e.target.value; u({ indexing: updated }); }} className="flex-1" />
                <Button type="button" variant="ghost" size="icon" onClick={() => u({ indexing: sections.indexing.filter((_, j) => j !== i) })} className="text-red-600 h-9 w-9"><Trash2 className="w-4 h-4" /></Button>
              </div>
            ))}
            <Button type="button" variant="outline" size="sm" onClick={() => u({ indexing: [...sections.indexing, ''] })}><Plus className="w-4 h-4 mr-1" /> Add Indexer</Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle>History Timeline</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            {sections.history.map((item, i) => (
              <div key={i} className="border border-slate-200 dark:border-navy-700 rounded-lg p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-slate-500">Timeline #{i + 1}</span>
                  <Button type="button" variant="ghost" size="icon" onClick={() => u({ history: sections.history.filter((_, j) => j !== i) })} className="text-red-600 h-8 w-8"><Trash2 className="w-4 h-4" /></Button>
                </div>
                <div className="grid grid-cols-3 gap-3">
                  <Input label="Year" value={item.year} onChange={(e) => { const updated = [...sections.history]; updated[i] = { ...updated[i], year: e.target.value }; u({ history: updated }); }} />
                  <Input label="Title" value={item.title} onChange={(e) => { const updated = [...sections.history]; updated[i] = { ...updated[i], title: e.target.value }; u({ history: updated }); }} className="col-span-2" />
                </div>
                <Textarea label="Description" rows={2} value={item.description} onChange={(e) => { const updated = [...sections.history]; updated[i] = { ...updated[i], description: e.target.value }; u({ history: updated }); }} />
              </div>
            ))}
            <Button type="button" variant="outline" onClick={() => u({ history: [...sections.history, { year: '', title: '', description: '' }] })}><Plus className="w-4 h-4 mr-2" /> Add Timeline Entry</Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle>Call to Action</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <Input label="CTA Heading" value={sections.ctaHeading} onChange={(e) => u({ ctaHeading: e.target.value })} />
            <Textarea label="CTA Text" rows={2} value={sections.ctaText} onChange={(e) => u({ ctaText: e.target.value })} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle>Benefits to Authors</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            {sections.benefits.map((benefit, i) => (
              <div key={i} className="border border-slate-200 dark:border-navy-700 rounded-lg p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-slate-500">Benefit #{i + 1}</span>
                  <Button type="button" variant="ghost" size="icon" onClick={() => u({ benefits: sections.benefits.filter((_, j) => j !== i) })} className="text-red-600 h-8 w-8"><Trash2 className="w-4 h-4" /></Button>
                </div>
                <Input label="Title" value={benefit.title} onChange={(e) => { const updated = [...sections.benefits]; updated[i] = { ...updated[i], title: e.target.value }; u({ benefits: updated }); }} />
                <Textarea label="Description" rows={2} value={benefit.description} onChange={(e) => { const updated = [...sections.benefits]; updated[i] = { ...updated[i], description: e.target.value }; u({ benefits: updated }); }} />
              </div>
            ))}
            <Button type="button" variant="outline" onClick={() => u({ benefits: [...sections.benefits, { title: '', description: '' }] })}><Plus className="w-4 h-4 mr-2" /> Add Benefit</Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle>Contact Information</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <Input label="Email" value={sections.contactEmail} onChange={(e) => u({ contactEmail: e.target.value })} />
            <Textarea label="Address" rows={2} value={sections.contactAddress} onChange={(e) => u({ contactAddress: e.target.value })} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle>Page Settings</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <Input label="Page Title" value={title} onChange={(e) => setTitle(e.target.value)} required />
            <Textarea label="Description" rows={2} value={description} onChange={(e) => setDescription(e.target.value)} />
            <Input label="Meta Title (SEO)" value={metaTitle} onChange={(e) => setMetaTitle(e.target.value)} />
            <Textarea label="Meta Description (SEO)" rows={2} value={metaDescription} onChange={(e) => setMetaDescription(e.target.value)} />
            <label className="flex items-center gap-3">
              <input type="checkbox" checked={isPublished} onChange={(e) => setIsPublished(e.target.checked)} className="w-4 h-4 rounded border-slate-300 text-gold-600 focus:ring-gold-500" />
              <span className="text-sm font-medium text-navy-900 dark:text-white">Published</span>
            </label>
          </CardContent>
        </Card>

        <div className="flex items-center justify-end gap-3">
          <Link href="/admin/pages"><Button type="button" variant="outline">Cancel</Button></Link>
          <Button type="submit" variant="gold" disabled={status.kind === 'saving'}>
            <Save className="w-4 h-4" />
            {status.kind === 'saving' ? 'Saving…' : 'Save page'}
          </Button>
        </div>
      </form>
    </div>
  );
}
