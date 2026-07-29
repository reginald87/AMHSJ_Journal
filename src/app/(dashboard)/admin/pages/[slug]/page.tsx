'use client';

import { useEffect, useState, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/Card';
import { Input, Textarea } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { ArrowLeft, Save, CheckCircle2, AlertCircle, Loader2 } from 'lucide-react';
import ContactPageEditor from '../ContactPageEditor';
import AboutPageEditor from '../AboutPageEditor';
import SectionsEditor from '@/components/admin/SectionsEditor';

const STRUCTURED_SLUGS: Record<string, React.ComponentType<{ slug: string }>> = {
  contact: ContactPageEditor,
  about: AboutPageEditor,
};

interface PageData {
  id: string;
  slug: string;
  title: string;
  description: string | null;
  content: string;
  metaTitle: string | null;
  metaDescription: string | null;
  isPublished: boolean;
  createdAt: string;
  updatedAt: string;
}

type Status =
  | { kind: 'idle' }
  | { kind: 'loading' }
  | { kind: 'not-found' }
  | { kind: 'ready'; page: PageData | null }
  | { kind: 'saving' }
  | { kind: 'saved' }
  | { kind: 'error'; message: string };

export default function AdminPageEditorPage() {
  const params = useParams<{ slug: string }>();
  const router = useRouter();
  const slug = params?.slug ?? '';

  const StructuredEditor = STRUCTURED_SLUGS[slug];

  const savedTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [content, setContent] = useState('');
  const [sections, setSections] = useState('');
  const [metaTitle, setMetaTitle] = useState('');
  const [metaDescription, setMetaDescription] = useState('');
  const [isPublished, setIsPublished] = useState(true);
  const [status, setStatus] = useState<Status>({ kind: 'loading' });

  useEffect(() => {
    return () => {
      if (savedTimerRef.current) clearTimeout(savedTimerRef.current);
    };
  }, []);

  useEffect(() => {
    if (!slug) return;
    let cancelled = false;
    fetch(`/api/admin/pages/${slug}`)
      .then(async (res) => {
        if (cancelled) return;
        if (res.status === 404) {
          setStatus({ kind: 'not-found' });
          return;
        }
        if (!res.ok) {
          setStatus({ kind: 'error', message: 'Failed to load page' });
          return;
        }
        const data = (await res.json()) as PageData & { sections?: string | null };
        setTitle(data.title);
        setDescription(data.description ?? '');
        setContent(data.content);
        setSections(data.sections ?? '');
        setMetaTitle(data.metaTitle ?? '');
        setMetaDescription(data.metaDescription ?? '');
        setIsPublished(data.isPublished);
        setStatus({ kind: 'ready', page: data });
      })
      .catch(() => {
        if (!cancelled) {
          setStatus({ kind: 'error', message: 'Failed to load page' });
        }
      });
    return () => {
      cancelled = true;
    };
  }, [slug]);

  if (StructuredEditor) {
    return <StructuredEditor slug={slug} />;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!title.trim() || !content.trim()) {
      setStatus({ kind: 'error', message: 'Title and content are required' });
      return;
    }
    setStatus({ kind: 'saving' });
    try {
      const res = await fetch(`/api/admin/pages/${slug}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            title,
            description: description || null,
            content,
            sections: sections || null,
            metaTitle: metaTitle || null,
            metaDescription: metaDescription || null,
            isPublished,
          }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        setStatus({
          kind: 'error',
          message: data.error ?? 'Failed to save page',
        });
        return;
      }
      const data = (await res.json()) as PageData;
      setStatus({ kind: 'saved' });
      router.refresh();
      savedTimerRef.current = setTimeout(() => {
        setStatus({ kind: 'ready', page: data });
      }, 2000);
    } catch (err) {
      setStatus({
        kind: 'error',
        message: err instanceof Error ? err.message : 'Failed to save page',
      });
    }
  }

  if (status.kind === 'loading') {
    return (
      <div className="flex items-center gap-2 text-slate-600 dark:text-slate-400">
        <Loader2 className="w-4 h-4 animate-spin" />
        Loading page…
      </div>
    );
  }

  const isSaving = status.kind === 'saving';

  return (
    <div className="space-y-6 max-w-4xl">
      <div className="flex items-center justify-between gap-4">
        <div>
          <Link
            href="/admin/pages"
            className="inline-flex items-center gap-1 text-sm text-slate-600 hover:text-navy-900 dark:text-slate-400 dark:hover:text-white"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to pages
          </Link>
          <h1 className="mt-2 text-2xl sm:text-3xl font-bold text-navy-900 dark:text-white">
            Edit page
          </h1>
          <p className="text-slate-600 dark:text-slate-400 mt-1">
            Slug: <span className="font-mono">{slug}</span>
          </p>
        </div>
      </div>

      {status.kind === 'not-found' && (
        <div className="rounded-lg border border-amber-300 bg-amber-50 px-4 py-3 text-sm text-amber-900 dark:border-amber-700 dark:bg-amber-900/30 dark:text-amber-200">
          This page does not exist yet. Fill in the form below and save to create it.
        </div>
      )}

      {status.kind === 'saved' && (
        <div className="flex items-center gap-2 rounded-lg border border-green-300 bg-green-50 px-4 py-3 text-sm text-green-900 dark:border-green-700 dark:bg-green-900/30 dark:text-green-200">
          <CheckCircle2 className="w-4 h-4" />
          Page saved successfully.
        </div>
      )}

      {status.kind === 'error' && (
        <div className="flex items-center gap-2 rounded-lg border border-red-300 bg-red-50 px-4 py-3 text-sm text-red-900 dark:border-red-700 dark:bg-red-900/30 dark:text-red-200">
          <AlertCircle className="w-4 h-4" />
          {status.message}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Content</CardTitle>
            <CardDescription>
              The fields shown on the public page.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Input
              label="Title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
            />
            <Textarea
              label="Description"
              rows={2}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
            <Textarea
              label="Content"
              rows={12}
              value={content}
              onChange={(e) => setContent(e.target.value)}
              required
            />
            <div>
              <p className="block text-sm font-medium text-navy-900 dark:text-white mb-1.5">Sections</p>
              <SectionsEditor value={sections} onChange={setSections} />
            </div>
            <label className="flex items-center gap-3">
              <input
                type="checkbox"
                checked={isPublished}
                onChange={(e) => setIsPublished(e.target.checked)}
                className="w-4 h-4 rounded border-slate-300 text-gold-600 focus:ring-gold-500 dark:border-navy-600 dark:bg-navy-800"
              />
              <span className="text-sm font-medium text-navy-900 dark:text-white">
                Published
              </span>
            </label>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>SEO</CardTitle>
            <CardDescription>
              Optional metadata used by search engines.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Input
              label="Meta title"
              value={metaTitle}
              onChange={(e) => setMetaTitle(e.target.value)}
            />
            <Textarea
              label="Meta description"
              rows={3}
              value={metaDescription}
              onChange={(e) => setMetaDescription(e.target.value)}
            />
          </CardContent>
        </Card>

        <div className="flex items-center justify-end gap-3">
          <Link href="/admin/pages">
            <Button type="button" variant="outline">
              Cancel
            </Button>
          </Link>
          <Button type="submit" variant="gold" disabled={isSaving}>
            <Save className="w-4 h-4" />
            {isSaving ? 'Saving…' : 'Save page'}
          </Button>
        </div>
      </form>
    </div>
  );
}
