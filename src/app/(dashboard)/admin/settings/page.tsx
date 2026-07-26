'use client';

import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/Button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Input, Textarea } from '@/components/ui/Input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/Select';
import { ImageUpload } from '@/components/ui/ImageUpload';
import { toast } from 'sonner';

const defaultSettings = {
  journalName: '', shortName: '', issnPrint: '', issnOnline: '', doiPrefix: '',
  description: '', scope: '', aims: '', website: '', email: '', logo: '', coverImage: '',
  submissionOpen: true, requireCoverLetter: true, requireEthicsApproval: true,
  reviewType: 'DOUBLE_BLIND', reviewDeadlineDays: 21, maxReviewers: 3,
  enableORCID: true,
};

export default function AdminSettingsPage() {
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [settings, setSettings] = useState(defaultSettings);

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
                <ImageUpload value={settings.logo} onChange={(url) => setSettings({...settings, logo: url})} />
              </div>
              <div>
                <label className="block text-sm font-medium text-navy-900 dark:text-white mb-2">Cover Image</label>
                <ImageUpload value={settings.coverImage} onChange={(url) => setSettings({...settings, coverImage: url})} />
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
