'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input, Textarea } from '@/components/ui/Input';
import { ArrowLeft, Upload, Loader2, CheckCircle } from 'lucide-react';
import Link from 'next/link';

const revisionSchema = z.object({
  title: z.string().min(10).max(200),
  abstract: z.string().min(100).max(3000),
  keywords: z.string().min(1),
  coverLetter: z.string().optional(),
  responseToReviewers: z.string().min(10, 'Please provide a response to the reviewers'),
});

type RevisionFormData = z.infer<typeof revisionSchema>;

interface Manuscript {
  id: string;
  title: string;
  abstract: string;
  keywords: string;
  status: string;
  articleType: string;
  section: string | null;
}

export default function ManuscriptEditPage() {
  const router = useRouter();
  const params = useParams();
  const { data: session, status: sessionStatus } = useSession();
  const [manuscript, setManuscript] = useState<Manuscript | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');
  const [revisionFile, setRevisionFile] = useState<File | null>(null);

  const { register, handleSubmit, formState: { errors } } = useForm<RevisionFormData>({
    resolver: zodResolver(revisionSchema),
  });

  useEffect(() => {
    if (sessionStatus !== 'authenticated') return;
    const fetchManuscript = async () => {
      try {
        const res = await fetch(`/api/author/manuscripts/${params.id}`);
        if (res.ok) {
          const data = await res.json();
          setManuscript(data.manuscript);
        } else {
          setError('Manuscript not found');
        }
      } catch {
        setError('Failed to load manuscript');
      } finally {
        setLoading(false);
      }
    };
    fetchManuscript();
  }, [params.id, sessionStatus]);

  const onSubmit = async (data: RevisionFormData) => {
    if (!revisionFile) {
      setError('Please upload the revised manuscript file');
      return;
    }

    setSubmitting(true);
    setError('');

    try {
      const formData = new FormData();
      formData.append('manuscriptId', params.id as string);
      formData.append('title', data.title);
      formData.append('abstract', data.abstract);
      formData.append('keywords', data.keywords);
      formData.append('coverLetter', data.coverLetter || '');
      formData.append('responseToReviewers', data.responseToReviewers);
      formData.append('manuscriptFile', revisionFile);

      const res = await fetch('/api/author/manuscripts', {
        method: 'PUT',
        body: formData,
      });

      if (!res.ok) {
        const result = await res.json();
        throw new Error(result.error || 'Failed to submit revision');
      }

      setSuccess(true);
      setTimeout(() => router.push('/dashboard/manuscripts'), 2000);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to submit revision');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading || sessionStatus === 'loading') {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-8 h-8 text-gold-400 animate-spin" />
      </div>
    );
  }

  if (success) {
    return (
      <div className="max-w-2xl mx-auto text-center py-20">
        <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
        <h1 className="text-2xl font-bold text-navy-900 dark:text-white mb-2">Revision Submitted!</h1>
        <p className="text-slate-600 dark:text-slate-400">Redirecting to your manuscripts...</p>
      </div>
    );
  }

  if (!manuscript) {
    return (
      <div className="max-w-2xl mx-auto text-center py-20">
        <p className="text-slate-600 dark:text-slate-400">{error || 'Manuscript not found'}</p>
        <Link href="/dashboard/manuscripts"><Button variant="outline" className="mt-4">Back to Manuscripts</Button></Link>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <Link href="/dashboard/manuscripts" className="inline-flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400 hover:text-navy-900 dark:hover:text-white">
        <ArrowLeft className="w-4 h-4" /> Back to My Manuscripts
      </Link>

      <div>
        <h1 className="text-2xl font-bold text-navy-900 dark:text-white">Submit Revision</h1>
        <p className="text-slate-600 dark:text-slate-400 text-sm mt-1">
          Update your manuscript based on reviewer feedback.
        </p>
      </div>

      <Card className="bg-white dark:bg-navy-900 border-slate-200 dark:border-navy-800">
        <CardHeader>
          <CardTitle className="text-lg">Current Manuscript</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-navy-900 dark:text-white font-medium">{manuscript.title}</p>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Status: {manuscript.status.replace(/_/g, ' ')}</p>
        </CardContent>
      </Card>

      <form onSubmit={handleSubmit(onSubmit)}>
        <Card className="bg-white dark:bg-navy-900 border-slate-200 dark:border-navy-800">
          <CardHeader>
            <CardTitle className="text-lg">Revised Manuscript</CardTitle>
          </CardHeader>
          <CardContent className="space-y-5">
            <Input label="Title *" error={errors.title?.message} {...register('title')} defaultValue={manuscript.title} />
            <Textarea label="Abstract *" rows={5} error={errors.abstract?.message} {...register('abstract')} defaultValue={manuscript.abstract} />
            <Input label="Keywords *" error={errors.keywords?.message} {...register('keywords')} defaultValue={manuscript.keywords} />

            <div>
              <label className="block text-sm font-medium text-navy-900 dark:text-white mb-1.5">Revised Manuscript File *</label>
              <div className="border-2 border-dashed border-slate-300 dark:border-navy-700 rounded-lg p-6 text-center hover:border-gold-400 transition-colors">
                <input type="file" accept=".pdf,.doc,.docx" className="sr-only" id="revisionFile" onChange={(e) => setRevisionFile(e.target.files?.[0] || null)} />
                <label htmlFor="revisionFile" className="cursor-pointer">
                  {revisionFile ? (
                    <p className="text-sm text-green-600 dark:text-green-400 font-medium">{revisionFile.name}</p>
                  ) : (
                    <>
                      <Upload className="w-8 h-8 mx-auto text-slate-400 mb-2" />
                      <p className="text-sm text-slate-600 dark:text-slate-400">Click to upload revised manuscript (PDF, DOC, DOCX)</p>
                    </>
                  )}
                </label>
              </div>
            </div>

            <Textarea label="Response to Reviewers *" rows={8} placeholder="Address each reviewer comment point by point..." error={errors.responseToReviewers?.message} {...register('responseToReviewers')} />
            <Textarea label="Cover Letter (Optional)" rows={4} placeholder="Brief cover letter for the revision..." {...register('coverLetter')} />

            {error && <p className="text-sm text-red-600 dark:text-red-400">{error}</p>}

            <div className="flex justify-end gap-3 pt-4 border-t border-slate-200 dark:border-navy-800">
              <Link href="/dashboard/manuscripts"><Button type="button" variant="outline">Cancel</Button></Link>
              <Button type="submit" variant="gold" loading={submitting}>Submit Revision</Button>
            </div>
          </CardContent>
        </Card>
      </form>
    </div>
  );
}
