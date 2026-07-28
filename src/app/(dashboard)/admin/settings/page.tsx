'use client';

import { useEffect, useState, useRef, useCallback } from 'react';
import { Button } from '@/components/ui/Button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Input, Textarea } from '@/components/ui/Input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/Select';
import { ImageUpload } from '@/components/ui/ImageUpload';
import { toast } from 'sonner';
import { Upload, FileText, Loader2, Trash2 } from 'lucide-react';

const defaultSettings = {
  journalName: '', shortName: '', issnPrint: '', issnOnline: '', doiPrefix: '',
  description: '', scope: '', aims: '', website: '', email: '', logo: '', coverImage: '',
  submissionOpen: true, requireCoverLetter: true, requireEthicsApproval: true,
  reviewType: 'DOUBLE_BLIND', reviewDeadlineDays: 21, maxReviewers: 3,
  enableORCID: true, referenceStyle: 'VANCOUVER', manuscriptTemplate: '',
};

export default function AdminSettingsPage() {
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [settings, setSettings] = useState(defaultSettings);
  const [templateUploading, setTemplateUploading] = useState(false);
  const templateInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    fetch('/api/admin/settings')
      .then((res) => {
        if (!res.ok) throw new Error('Failed to fetch');
        return res.json();
      })
      .then((data) => setSettings(data))
      .catch(() => toast.error('Failed to load settings'))
      .finally(() => setFetching(false));
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch('/api/admin/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(settings),
      });
      if (res.ok) toast.success('Settings saved');
      else toast.error('Failed to save settings');
    } catch { toast.error('Failed to save settings'); }
    finally { setLoading(false); }
  };

  const handleTemplateUpload = useCallback(async (file: File) => {
    const allowed = [
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'application/pdf',
    ];
    if (!allowed.includes(file.type)) {
      toast.error('File must be DOC, DOCX, or PDF');
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      toast.error('File must be less than 10MB');
      return;
    }
    setTemplateUploading(true);
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('folder', 'templates');
      const res = await fetch('/api/admin/upload', { method: 'POST', body: formData });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error || 'Upload failed');
      }
      const data = await res.json();
      setSettings((prev) => ({ ...prev, manuscriptTemplate: data.url }));
      toast.success('Template uploaded');
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to upload template');
    } finally {
      setTemplateUploading(false);
    }
  }, []);

  if (fetching) {
    return (
      <div className="max-w-4xl space-y-8">
        <h1 className="text-2xl sm:text-3xl font-bold text-navy-900 dark:text-white">Journal Settings</h1>
        <div className="flex items-center justify-center py-20">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gold-600" />
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl space-y-8">
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold text-navy-900 dark:text-white">Journal Settings</h1>
        <p className="text-slate-600 dark:text-slate-400 mt-1">Configure your journal&apos;s basic information, submission rules, and branding</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        <Card>
          <CardHeader><CardTitle>Basic Information</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div className="grid md:grid-cols-2 gap-4">
              <Input label="Journal Name" value={settings.journalName} onChange={(e) => setSettings({...settings, journalName: e.target.value})} />
              <Input label="Short Name" value={settings.shortName} onChange={(e) => setSettings({...settings, shortName: e.target.value})} />
              <Input label="ISSN (Print)" value={settings.issnPrint} onChange={(e) => setSettings({...settings, issnPrint: e.target.value})} />
              <Input label="ISSN (Online)" value={settings.issnOnline} onChange={(e) => setSettings({...settings, issnOnline: e.target.value})} />
              <Input label="DOI Prefix" value={settings.doiPrefix} onChange={(e) => setSettings({...settings, doiPrefix: e.target.value})} />
              <Input label="Website" value={settings.website} onChange={(e) => setSettings({...settings, website: e.target.value})} />
              <Input label="Contact Email" value={settings.email} onChange={(e) => setSettings({...settings, email: e.target.value})} />
            </div>
            <Textarea label="Description" value={settings.description} onChange={(e) => setSettings({...settings, description: e.target.value})} rows={3} />
            <Textarea label="Scope" value={settings.scope} onChange={(e) => setSettings({...settings, scope: e.target.value})} rows={3} />
            <Textarea label="Aims" value={settings.aims} onChange={(e) => setSettings({...settings, aims: e.target.value})} rows={3} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle>Submission & Review</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div className="grid md:grid-cols-3 gap-4">
              <Select value={settings.reviewType} onValueChange={(v) => setSettings({...settings, reviewType: v})}>
                <SelectTrigger><SelectValue placeholder="Review Type" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="SINGLE_BLIND">Single Blind</SelectItem>
                  <SelectItem value="DOUBLE_BLIND">Double Blind</SelectItem>
                  <SelectItem value="OPEN">Open Review</SelectItem>
                </SelectContent>
              </Select>
              <Input label="Review Deadline (days)" type="number" value={settings.reviewDeadlineDays} onChange={(e) => setSettings({...settings, reviewDeadlineDays: parseInt(e.target.value)})} />
              <Input label="Max Reviewers" type="number" value={settings.maxReviewers} onChange={(e) => setSettings({...settings, maxReviewers: parseInt(e.target.value)})} />
            </div>
            <div className="flex flex-wrap gap-4">
              <label className="flex items-center gap-2"><input type="checkbox" checked={settings.submissionOpen} onChange={(e) => setSettings({...settings, submissionOpen: e.target.checked})} className="w-4 h-4 rounded border-slate-300 text-gold-600 focus:ring-gold-500" /> Submissions Open</label>
              <label className="flex items-center gap-2"><input type="checkbox" checked={settings.requireCoverLetter} onChange={(e) => setSettings({...settings, requireCoverLetter: e.target.checked})} className="w-4 h-4 rounded border-slate-300 text-gold-600 focus:ring-gold-500" /> Require Cover Letter</label>
              <label className="flex items-center gap-2"><input type="checkbox" checked={settings.requireEthicsApproval} onChange={(e) => setSettings({...settings, requireEthicsApproval: e.target.checked})} className="w-4 h-4 rounded border-slate-300 text-gold-600 focus:ring-gold-500" /> Require Ethics</label>
              <label className="flex items-center gap-2"><input type="checkbox" checked={settings.enableORCID} onChange={(e) => setSettings({...settings, enableORCID: e.target.checked})} className="w-4 h-4 rounded border-slate-300 text-gold-600 focus:ring-gold-500" /> Enable ORCID</label>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle>Branding</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-navy-900 dark:text-white mb-2">Journal Logo</label>
                <ImageUpload value={settings.logo} onChange={(url) => setSettings({...settings, logo: url})} folder="settings" />
              </div>
              <div>
                <label className="block text-sm font-medium text-navy-900 dark:text-white mb-2">Cover Image</label>
                <ImageUpload value={settings.coverImage} onChange={(url) => setSettings({...settings, coverImage: url})} folder="settings" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle>Submission Guidelines</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-navy-900 dark:text-white mb-2">Reference Style</label>
                <Select value={settings.referenceStyle} onValueChange={(v) => setSettings({...settings, referenceStyle: v})}>
                  <SelectTrigger><SelectValue placeholder="Select reference style" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="VANCOUVER">Vancouver</SelectItem>
                    <SelectItem value="APA">APA</SelectItem>
                    <SelectItem value="MLA">MLA</SelectItem>
                    <SelectItem value="CHICAGO">Chicago</SelectItem>
                    <SelectItem value="HARVARD">Harvard</SelectItem>
                    <SelectItem value="IEEE">IEEE</SelectItem>
                    <SelectItem value="NLM">NLM</SelectItem>
                  </SelectContent>
                </Select>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Used for formatting references in published articles</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-navy-900 dark:text-white mb-2">Manuscript Template</label>
                <input
                  ref={templateInputRef}
                  type="file"
                  accept=".doc,.docx,.pdf"
                  className="sr-only"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) handleTemplateUpload(file);
                    if (templateInputRef.current) templateInputRef.current.value = '';
                  }}
                />
                {settings.manuscriptTemplate ? (
                  <div className="flex items-center gap-3 p-3 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
                    <FileText className="w-5 h-5 text-green-600 dark:text-green-400 shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-green-800 dark:text-green-300 truncate">
                        {settings.manuscriptTemplate.split('/').pop()}
                      </p>
                      <a
                        href={settings.manuscriptTemplate}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs text-green-600 dark:text-green-400 hover:underline"
                      >
                        View current template
                      </a>
                    </div>
                    <button
                      type="button"
                      onClick={() => setSettings({...settings, manuscriptTemplate: ''})}
                      className="p-1 text-green-600 hover:text-red-600 dark:text-green-400 dark:hover:text-red-400 transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={() => templateInputRef.current?.click()}
                    disabled={templateUploading}
                    className="w-full flex flex-col items-center justify-center p-6 border-2 border-dashed border-slate-300 dark:border-navy-700 rounded-lg hover:border-gold-400 dark:hover:border-gold-400 transition-colors bg-slate-50 dark:bg-navy-800/50"
                  >
                    {templateUploading ? (
                      <>
                        <Loader2 className="w-8 h-8 text-gold-500 mb-2 animate-spin" />
                        <p className="text-sm text-slate-600 dark:text-slate-400">Uploading...</p>
                      </>
                    ) : (
                      <>
                        <Upload className="w-8 h-8 text-slate-400 dark:text-slate-500 mb-2" />
                        <p className="text-sm font-medium text-slate-600 dark:text-slate-400">Upload Template</p>
                        <p className="text-xs text-slate-500 dark:text-slate-500 mt-1">DOC, DOCX, or PDF &middot; Max 10MB</p>
                      </>
                    )}
                  </button>
                )}
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Authors can download this template when preparing their manuscript</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="flex justify-end gap-4 pt-4 border-t border-slate-200 dark:border-navy-800">
          <Button type="submit" loading={loading} size="lg">Save Settings</Button>
        </div>
      </form>
    </div>
  );
}
