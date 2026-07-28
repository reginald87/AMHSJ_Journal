'use client';

import { useEffect, useState, useCallback } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/Select';
import { toast } from 'sonner';
import { BookOpen, Upload, CheckCircle, ArrowLeft, Loader2 } from 'lucide-react';

interface Manuscript {
  id: string;
  title: string;
  articleType: string;
  correspondingAuthor: { firstName: string; lastName: string; email: string };
}

interface Volume {
  id: string;
  number: number;
  year: number;
  title: string | null;
  isPublished: boolean;
}

export default function EditorAssistantPublishPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const preselectedManuscript = searchParams.get('manuscript') || '';

  const [manuscripts, setManuscripts] = useState<Manuscript[]>([]);
  const [volumes, setVolumes] = useState<Volume[]>([]);
  const [loading, setLoading] = useState(true);
  const [publishing, setPublishing] = useState(false);
  const [success, setSuccess] = useState(false);

  const [manuscriptId, setManuscriptId] = useState(preselectedManuscript);
  const [volumeId, setVolumeId] = useState('');
  const [doi, setDoi] = useState('');
  const [pageStart, setPageStart] = useState('');
  const [pageEnd, setPageEnd] = useState('');
  const [publishedAt, setPublishedAt] = useState('');
  const [pdfFile, setPdfFile] = useState<File | null>(null);

  const fetchData = useCallback(async () => {
    try {
      const [manuscriptsRes, volumesRes] = await Promise.all([
        fetch('/api/editor-assistant/manuscripts?status=ACCEPTED'),
        fetch('/api/admin/volumes'),
      ]);
      if (manuscriptsRes.ok) {
        const data = await manuscriptsRes.json();
        setManuscripts(data.manuscripts || []);
      }
      if (volumesRes.ok) {
        const data = await volumesRes.json();
        setVolumes(data.volumes || data || []);
      }
    } catch {}
    finally { setLoading(false); }
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  const handlePublish = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!manuscriptId || !volumeId) {
      toast.error('Select a manuscript and volume');
      return;
    }
    setPublishing(true);
    try {
      const formData = new FormData();
      formData.append('manuscriptId', manuscriptId);
      formData.append('volumeId', volumeId);
      if (doi) formData.append('doi', doi);
      if (pageStart) formData.append('pageStart', pageStart);
      if (pageEnd) formData.append('pageEnd', pageEnd);
      if (publishedAt) formData.append('publishedAt', publishedAt);
      if (pdfFile) formData.append('publishedPdf', pdfFile);

      const res = await fetch('/api/editor-assistant/publish', { method: 'POST', body: formData });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error || 'Publish failed');
      }
      setSuccess(true);
      toast.success('Manuscript published successfully!');
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to publish');
    } finally {
      setPublishing(false);
    }
  };

  if (success) {
    return (
      <div className="max-w-2xl mx-auto text-center py-20">
        <div className="w-16 h-16 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
          <CheckCircle className="w-8 h-8 text-green-600 dark:text-green-400" />
        </div>
        <h2 className="text-2xl font-bold text-navy-900 dark:text-white mb-2">Published!</h2>
        <p className="text-slate-600 dark:text-slate-400 mb-6">The manuscript has been published successfully.</p>
        <div className="flex gap-3 justify-center">
          <Button variant="outline" onClick={() => { setSuccess(false); setManuscriptId(''); setVolumeId(''); setDoi(''); setPageStart(''); setPageEnd(''); setPdfFile(null); }}>
            Publish Another
          </Button>
          <Button variant="gold" onClick={() => router.push('/editor-assistant/manuscripts')}>
            View Manuscripts
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-3xl space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="sm" onClick={() => router.back()}>
          <ArrowLeft className="w-4 h-4 mr-1" /> Back
        </Button>
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-navy-900 dark:text-white">Publish Manuscript</h1>
          <p className="text-slate-600 dark:text-slate-400 mt-1">Upload formatted PDF and assign to a volume</p>
        </div>
      </div>

      <form onSubmit={handlePublish}>
        <Card>
          <CardHeader><CardTitle>Publication Details</CardTitle></CardHeader>
          <CardContent className="space-y-5">
            {loading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="w-6 h-6 animate-spin text-gold-500" />
              </div>
            ) : (
              <>
                <div>
                  <label className="block text-sm font-medium text-navy-900 dark:text-white mb-1">Manuscript *</label>
                  <Select value={manuscriptId} onValueChange={setManuscriptId}>
                    <SelectTrigger><SelectValue placeholder="Select an accepted manuscript" /></SelectTrigger>
                    <SelectContent>
                      {manuscripts.map((m) => (
                        <SelectItem key={m.id} value={m.id}>
                          {m.title} — {m.correspondingAuthor.firstName} {m.correspondingAuthor.lastName}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-navy-900 dark:text-white mb-1">Volume *</label>
                  <Select value={volumeId} onValueChange={setVolumeId}>
                    <SelectTrigger><SelectValue placeholder="Select a volume" /></SelectTrigger>
                    <SelectContent>
                      {volumes.map((v) => (
                        <SelectItem key={v.id} value={v.id}>
                          Volume {v.number} ({v.year}){v.title ? ` — ${v.title}` : ''}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <Input label="DOI (optional)" placeholder="Auto-generated if empty" value={doi} onChange={(e) => setDoi(e.target.value)} />
                  <div>
                    <label className="block text-sm font-medium text-navy-900 dark:text-white mb-1">Publication Date</label>
                    <input
                      type="date"
                      value={publishedAt}
                      onChange={(e) => setPublishedAt(e.target.value)}
                      className="w-full px-3 py-2 text-sm border border-slate-200 dark:border-navy-700 rounded-lg bg-white dark:bg-navy-900 text-navy-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-gold-500"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <Input label="Page Start" type="number" placeholder="e.g., 1" value={pageStart} onChange={(e) => setPageStart(e.target.value)} />
                  <Input label="Page End" type="number" placeholder="e.g., 15" value={pageEnd} onChange={(e) => setPageEnd(e.target.value)} />
                </div>

                <div>
                  <label className="block text-sm font-medium text-navy-900 dark:text-white mb-1">Formatted PDF</label>
                  <div className="border-2 border-dashed border-slate-300 dark:border-navy-700 rounded-lg p-6 text-center hover:border-gold-400 transition-colors">
                    <input
                      type="file"
                      accept=".pdf"
                      className="sr-only"
                      id="pdf-upload"
                      onChange={(e) => setPdfFile(e.target.files?.[0] || null)}
                    />
                    <label htmlFor="pdf-upload" className="cursor-pointer">
                      {pdfFile ? (
                        <>
                          <CheckCircle className="w-8 h-8 text-green-500 mx-auto mb-2" />
                          <p className="text-sm font-medium text-green-700 dark:text-green-400">{pdfFile.name}</p>
                          <p className="text-xs text-slate-500 mt-1">Click to replace</p>
                        </>
                      ) : (
                        <>
                          <Upload className="w-8 h-8 text-slate-400 mx-auto mb-2" />
                          <p className="text-sm text-slate-600 dark:text-slate-400">Click to upload formatted PDF</p>
                          <p className="text-xs text-slate-500 mt-1">Optional — upload the final formatted version</p>
                        </>
                      )}
                    </label>
                  </div>
                </div>
              </>
            )}
          </CardContent>
        </Card>

        <div className="flex justify-end gap-3 mt-6">
          <Button type="button" variant="outline" onClick={() => router.back()}>Cancel</Button>
          <Button type="submit" variant="gold" loading={publishing} disabled={loading || !manuscriptId || !volumeId}>
            <BookOpen className="w-4 h-4 mr-2" /> Publish Article
          </Button>
        </div>
      </form>
    </div>
  );
}
