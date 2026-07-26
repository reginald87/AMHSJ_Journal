'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Input, Textarea } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { ArrowLeft, Save, CheckCircle2, AlertCircle, Loader2, Plus, Trash2 } from 'lucide-react';
import Link from 'next/link';
import { toast } from 'sonner';

interface ContactSections {
  heroTitle: string;
  heroSubtitle: string;
  email: string;
  phone: string;
  address: string;
  officeHours: string;
  website: string;
  officeDescription: string;
  faqs: { q: string; a: string }[];
}

const DEFAULT_SECTIONS: ContactSections = {
  heroTitle: 'Contact Us',
  heroSubtitle: 'Have a question about submitting your manuscript, the review process, or anything else? Our editorial team is here to help.',
  email: 'editorial@amhsj.org',
  phone: '+1 (555) 123-4567',
  address: '123 Medical Center Drive, Suite 400, Boston, MA 02115, USA',
  officeHours: 'Monday – Friday, 9:00 AM – 5:00 PM EST',
  website: 'www.amhsj.org',
  officeDescription: 'We aim to respond to all inquiries within 2–3 business days. For urgent matters regarding manuscript submissions, please include your manuscript ID in the subject line.',
  faqs: [
    { q: 'How do I submit a manuscript?', a: 'Use our online submission system at /submit. You will need to create an account and follow the 5-step submission wizard.' },
    { q: 'What is the peer review timeline?', a: 'Initial editorial screening takes 1–2 weeks. Peer review typically takes 4–6 weeks. You will receive a decision within 6–8 weeks of submission.' },
    { q: 'Is there a submission fee?', a: 'AMHSJ charges no submission fees. A modest article processing charge (APC) applies upon acceptance, with waivers available for authors from low-income countries.' },
    { q: 'How can I become a reviewer?', a: 'Visit our editorial board page or email us at editorial@amhsj.org with your CV and areas of expertise. We welcome new reviewers.' },
  ],
};

interface PageData {
  id: string;
  slug: string;
  title: string;
  description: string | null;
  content: string;
  sections: string | null;
  metaTitle: string | null;
  metaDescription: string | null;
  isPublished: boolean;
}

type Status =
  | { kind: 'idle' }
  | { kind: 'loading' }
  | { kind: 'not-found' }
  | { kind: 'ready' }
  | { kind: 'saving' }
  | { kind: 'saved' }
  | { kind: 'error'; message: string };

export default function ContactPageEditor({ slug }: { slug: string }) {
  const [title, setTitle] = useState('Contact');
  const [description, setDescription] = useState('');
  const [metaTitle, setMetaTitle] = useState('');
  const [metaDescription, setMetaDescription] = useState('');
  const [isPublished, setIsPublished] = useState(true);
  const [sections, setSections] = useState<ContactSections>(DEFAULT_SECTIONS);
  const [status, setStatus] = useState<Status>({ kind: 'loading' });

  useEffect(() => {
    fetch(`/api/admin/pages/${slug}`)
      .then(async (res) => {
        if (res.status === 404) {
          setStatus({ kind: 'not-found' });
          return;
        }
        if (!res.ok) {
          setStatus({ kind: 'error', message: 'Failed to load page' });
          return;
        }
        const data: PageData = await res.json();
        setTitle(data.title);
        setDescription(data.description ?? '');
        setMetaTitle(data.metaTitle ?? '');
        setMetaDescription(data.metaDescription ?? '');
        setIsPublished(data.isPublished);
        if (data.sections) {
          try {
            const parsed = JSON.parse(data.sections);
            setSections({ ...DEFAULT_SECTIONS, ...parsed });
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
        body: JSON.stringify({
          title,
          description: description || null,
          content: description || title,
          sections,
          metaTitle: metaTitle || null,
          metaDescription: metaDescription || null,
          isPublished,
        }),
      });
      if (res.ok) {
        setStatus({ kind: 'saved' });
        toast.success('Contact page saved');
        setTimeout(() => setStatus({ kind: 'ready' }), 2000);
      } else {
        const data = await res.json().catch(() => ({}));
        setStatus({ kind: 'error', message: data.error ?? 'Failed to save' });
      }
    } catch {
      setStatus({ kind: 'error', message: 'Failed to save' });
    }
  }

  const updateFaq = (index: number, field: 'q' | 'a', value: string) => {
    const updated = [...sections.faqs];
    updated[index] = { ...updated[index], [field]: value };
    setSections({ ...sections, faqs: updated });
  };

  const addFaq = () => {
    setSections({ ...sections, faqs: [...sections.faqs, { q: '', a: '' }] });
  };

  const removeFaq = (index: number) => {
    setSections({ ...sections, faqs: sections.faqs.filter((_, i) => i !== index) });
  };

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
          <h1 className="mt-2 text-2xl sm:text-3xl font-bold text-navy-900 dark:text-white">Edit Contact Page</h1>
          <p className="text-slate-600 dark:text-slate-400 mt-1">Slug: <span className="font-mono">{slug}</span></p>
        </div>
      </div>

      {status.kind === 'not-found' && (
        <div className="rounded-lg border border-amber-300 bg-amber-50 px-4 py-3 text-sm text-amber-900 dark:border-amber-700 dark:bg-amber-900/30 dark:text-amber-200">
          This page does not exist yet. Save to create it with default content.
        </div>
      )}

      {status.kind === 'saved' && (
        <div className="flex items-center gap-2 rounded-lg border border-green-300 bg-green-50 px-4 py-3 text-sm text-green-900 dark:border-green-700 dark:bg-green-900/30 dark:text-green-200">
          <CheckCircle2 className="w-4 h-4" /> Page saved successfully.
        </div>
      )}

      {status.kind === 'error' && (
        <div className="flex items-center gap-2 rounded-lg border border-red-300 bg-red-50 px-4 py-3 text-sm text-red-900 dark:border-red-700 dark:bg-red-900/30 dark:text-red-200">
          <AlertCircle className="w-4 h-4" /> {status.message}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        <Card>
          <CardHeader><CardTitle>Hero Section</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <Input label="Hero Title" value={sections.heroTitle} onChange={(e) => setSections({ ...sections, heroTitle: e.target.value })} required />
            <Textarea label="Hero Subtitle" rows={2} value={sections.heroSubtitle} onChange={(e) => setSections({ ...sections, heroSubtitle: e.target.value })} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle>Contact Details</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input label="Email" type="email" value={sections.email} onChange={(e) => setSections({ ...sections, email: e.target.value })} required />
              <Input label="Phone" value={sections.phone} onChange={(e) => setSections({ ...sections, phone: e.target.value })} required />
              <Input label="Address" value={sections.address} onChange={(e) => setSections({ ...sections, address: e.target.value })} required />
              <Input label="Office Hours" value={sections.officeHours} onChange={(e) => setSections({ ...sections, officeHours: e.target.value })} required />
              <Input label="Website" value={sections.website} onChange={(e) => setSections({ ...sections, website: e.target.value })} />
            </div>
            <Textarea label="Office Description" rows={3} value={sections.officeDescription} onChange={(e) => setSections({ ...sections, officeDescription: e.target.value })} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>FAQ Items</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {sections.faqs.map((faq, i) => (
              <div key={i} className="border border-slate-200 dark:border-navy-700 rounded-lg p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-slate-500 dark:text-slate-400">FAQ #{i + 1}</span>
                  <Button type="button" variant="ghost" size="icon" onClick={() => removeFaq(i)} className="text-red-600 hover:text-red-700 h-8 w-8">
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
                <Input label="Question" value={faq.q} onChange={(e) => updateFaq(i, 'q', e.target.value)} required />
                <Textarea label="Answer" rows={2} value={faq.a} onChange={(e) => updateFaq(i, 'a', e.target.value)} required />
              </div>
            ))}
            <Button type="button" variant="outline" onClick={addFaq}><Plus className="w-4 h-4 mr-2" /> Add FAQ</Button>
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
