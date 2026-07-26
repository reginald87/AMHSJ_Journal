'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/Table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/Select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/Dialog';
import { Eye, Download, FileText, Send } from 'lucide-react';
import { formatDate } from '@/lib/utils';
import { toast } from 'sonner';

interface Manuscript {
  id: string;
  title: string;
  articleType: string;
  status: string;
  submittedAt: string;
  correspondingAuthor?: { firstName: string; lastName: string };
  assignedEditorId?: string;
  abstract?: string;
  coverLetter?: string;
  keywords?: string;
  files?: { id: string; fileName: string; fileUrl: string; fileSize: number; mimeType: string; fileType: string; isPrimary: boolean; version: number }[];
}

interface Editor {
  id: string;
  userId: string;
  user?: { firstName: string; lastName: string };
  role: string;
  isActive: boolean;
}

interface VolumeData {
  id: string;
  number: number;
  year: number;
  title?: string;
  _count: { articles: number };
}

const STATUS_OPTIONS = [
  { value: 'SUBMITTED', label: 'Submitted' },
  { value: 'UNDER_REVIEW', label: 'Under Review' },
  { value: 'UNDER_REVISION', label: 'Under Revision' },
  { value: 'ACCEPTED', label: 'Accepted' },
  { value: 'REJECTED', label: 'Rejected' },
  { value: 'PUBLISHED', label: 'Published' },
];

export default function AdminManuscriptsPage() {
  const [manuscripts, setManuscripts] = useState<Manuscript[]>([]);
  const [filter, setFilter] = useState('all');
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  const [detailOpen, setDetailOpen] = useState(false);
  const [selected, setSelected] = useState<Manuscript | null>(null);
  const [newStatus, setNewStatus] = useState('');
  const [assignedEditorId, setAssignedEditorId] = useState('');
  const [editors, setEditors] = useState<Editor[]>([]);
  const [detailSaving, setDetailSaving] = useState(false);

  const [publishOpen, setPublishOpen] = useState(false);
  const [volumes, setVolumes] = useState<VolumeData[]>([]);
  const [selectedVolumeId, setSelectedVolumeId] = useState('');
  const [publishDoi, setPublishDoi] = useState('');
  const [pageStart, setPageStart] = useState('');
  const [pageEnd, setPageEnd] = useState('');
  const [publishedPdf, setPublishedPdf] = useState<File | null>(null);
  const [publishing, setPublishing] = useState(false);
  const [publishDate, setPublishDate] = useState('');

  const fetchManuscripts = async () => {
    try {
      const data = await fetch('/api/admin/manuscripts').then(r => r.json()).catch(() => ({ manuscripts: [] }));
      setManuscripts(data.manuscripts || (Array.isArray(data) ? data : []));
    } catch { console.error('Failed to fetch manuscripts'); }
    finally { setLoading(false); }
  };

  const fetchEditors = async () => {
    try {
      const res = await fetch('/api/admin/editorial-board');
      if (!res.ok) return;
      const data = await res.json();
      const list = Array.isArray(data) ? data : (data.editors || []);
      setEditors(list.filter((e: Editor) => e.isActive));
    } catch { /* silently fail */ }
  };

  const fetchVolumes = async () => {
    try {
      const res = await fetch('/api/admin/volumes');
      if (!res.ok) return;
      setVolumes(await res.json());
    } catch { /* silently fail */ }
  };

  useEffect(() => {
    fetchManuscripts();
  }, []);

  const openDetail = (ms: Manuscript) => {
    setSelected(ms);
    setNewStatus(ms.status || 'SUBMITTED');
    setAssignedEditorId(ms.assignedEditorId || '');
    setDetailOpen(true);
    fetchEditors();
  };

  const openPublish = (ms: Manuscript) => {
    setSelected(ms);
    setSelectedVolumeId('');
    setPublishDoi('');
    setPageStart('');
    setPageEnd('');
    setPublishedPdf(null);
    setPublishDate(new Date().toISOString().split('T')[0]);
    setPublishOpen(true);
    fetchVolumes();
  };

  const handleDetailSubmit = async () => {
    if (!selected) return;
    setDetailSaving(true);
    try {
      const body: Record<string, string> = { status: newStatus };
      if (assignedEditorId) body.assignedEditorId = assignedEditorId;
      const res = await fetch(`/api/admin/manuscripts/${selected.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      if (res.ok) {
        toast.success('Manuscript updated');
        setDetailOpen(false);
        fetchManuscripts();
      } else {
        toast.error('Failed to update manuscript');
      }
    } catch {
      toast.error('Failed to update manuscript');
    } finally {
      setDetailSaving(false);
    }
  };

  const handlePublish = async () => {
    if (!selected || !selectedVolumeId) {
      toast.error('Please select a volume');
      return;
    }
    setPublishing(true);
    try {
      const formData = new FormData();
      formData.append('manuscriptId', selected.id);
      formData.append('volumeId', selectedVolumeId);
      if (publishDoi) formData.append('doi', publishDoi);
      if (pageStart) formData.append('pageStart', pageStart);
      if (pageEnd) formData.append('pageEnd', pageEnd);
      if (publishedPdf) formData.append('publishedPdf', publishedPdf);
      if (publishDate) formData.append('publishedAt', publishDate);

      const res = await fetch('/api/admin/publish', {
        method: 'POST',
        body: formData,
      });
      if (res.ok) {
        toast.success('Manuscript published successfully!');
        setPublishOpen(false);
        fetchManuscripts();
      } else {
        const err = await res.json().catch(() => ({}));
        toast.error(err.error || 'Failed to publish');
      }
    } catch {
      toast.error('Failed to publish manuscript');
    } finally {
      setPublishing(false);
    }
  };

  const filtered = manuscripts.filter(m => {
    if (filter !== 'all' && m.status !== filter) return false;
    if (search) {
      const q = search.toLowerCase();
      if (!m.title?.toLowerCase().includes(q) && !m.id?.toLowerCase().includes(q)) return false;
    }
    return true;
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-navy-900 dark:text-white">Manuscripts</h1>
          <p className="text-slate-600 dark:text-slate-400 mt-1">Manage manuscript submissions and editorial workflow</p>
        </div>
        <div className="flex gap-2 flex-wrap">
          <Select value={filter} onValueChange={setFilter}>
            <SelectTrigger className="w-[180px]"><SelectValue placeholder="All Status" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="SUBMITTED">Submitted</SelectItem>
              <SelectItem value="UNDER_REVIEW">Under Review</SelectItem>
              <SelectItem value="UNDER_REVISION">Under Revision</SelectItem>
              <SelectItem value="ACCEPTED">Accepted</SelectItem>
              <SelectItem value="REJECTED">Rejected</SelectItem>
              <SelectItem value="PUBLISHED">Published</SelectItem>
            </SelectContent>
          </Select>
          <Input placeholder="Search manuscripts..." value={search} onChange={(e) => setSearch(e.target.value)} className="w-[250px]" />
        </div>
      </div>

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>ID</TableHead>
                <TableHead>Title</TableHead>
                <TableHead>Author</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Submitted</TableHead>
                <TableHead className="w-28">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-12 text-slate-500">Loading...</TableCell>
                </TableRow>
              ) : filtered.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-12 text-slate-500 dark:text-slate-400">No manuscripts found</TableCell>
                </TableRow>
              ) : (
                filtered.map((m) => (
                  <TableRow key={m.id}>
                    <TableCell className="font-mono text-sm font-medium text-navy-900 dark:text-white">{m.id?.slice(0, 8)}</TableCell>
                    <TableCell className="max-w-xs truncate font-medium text-navy-900 dark:text-white">{m.title}</TableCell>
                    <TableCell className="text-sm text-slate-600 dark:text-slate-400">{m.correspondingAuthor?.firstName} {m.correspondingAuthor?.lastName}</TableCell>
                    <TableCell className="text-sm text-slate-600 dark:text-slate-400 capitalize">{m.articleType?.replace(/_/g, ' ').toLowerCase()}</TableCell>
                    <TableCell>
                      <Badge variant={
                        m.status === 'SUBMITTED' ? 'info' :
                        m.status === 'UNDER_REVIEW' ? 'warning' :
                        m.status === 'ACCEPTED' || m.status === 'PUBLISHED' ? 'success' :
                        m.status === 'REJECTED' ? 'danger' : 'outline'
                      }>{m.status?.replace(/_/g, ' ')}</Badge>
                    </TableCell>
                    <TableCell className="text-sm text-slate-600 dark:text-slate-400">{formatDate(m.submittedAt)}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <Button variant="ghost" size="icon" onClick={() => openDetail(m)}>
                          <Eye className="w-4 h-4" />
                        </Button>
                        {m.status === 'ACCEPTED' && (
                           <Button variant="ghost" size="icon" onClick={() => openPublish(m)} title="Publish to Volume">
                            <Send className="w-4 h-4 text-green-600" />
                          </Button>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Detail Dialog */}
      <Dialog open={detailOpen} onOpenChange={setDetailOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Manuscript Details</DialogTitle>
          </DialogHeader>
          {selected && (
            <div className="space-y-4 p-4">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="font-medium text-slate-500 dark:text-slate-400">Title</span>
                  <p className="text-navy-900 dark:text-white mt-1">{selected.title}</p>
                </div>
                <div>
                  <span className="font-medium text-slate-500 dark:text-slate-400">Author</span>
                  <p className="text-navy-900 dark:text-white mt-1">{selected.correspondingAuthor?.firstName} {selected.correspondingAuthor?.lastName}</p>
                </div>
                <div>
                  <span className="font-medium text-slate-500 dark:text-slate-400">Type</span>
                  <p className="text-navy-900 dark:text-white mt-1 capitalize">{selected.articleType?.replace(/_/g, ' ').toLowerCase()}</p>
                </div>
                <div>
                  <span className="font-medium text-slate-500 dark:text-slate-400">Submitted</span>
                  <p className="text-navy-900 dark:text-white mt-1">{formatDate(selected.submittedAt)}</p>
                </div>
              </div>
              {selected.abstract && (
                <div>
                  <span className="font-medium text-slate-500 dark:text-slate-400 text-sm">Abstract</span>
                  <p className="text-sm text-slate-700 dark:text-slate-300 mt-1 whitespace-pre-wrap">{selected.abstract}</p>
                </div>
              )}
              {selected.files && selected.files.length > 0 && (
                <div>
                  <span className="font-medium text-slate-500 dark:text-slate-400 text-sm">Uploaded Files</span>
                  <div className="mt-2 space-y-2">
                    {selected.files.map((f) => (
                      <div key={f.id} className="flex items-center gap-3 p-3 bg-slate-50 dark:bg-navy-800 rounded-lg border border-slate-200 dark:border-navy-700">
                        <FileText className="w-5 h-5 text-slate-400 shrink-0" />
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-navy-900 dark:text-white truncate">{f.fileName || '(empty)'}</p>
                          <p className="text-xs text-slate-500 dark:text-slate-400">
                            {f.fileType} &middot; {f.mimeType} &middot; {f.fileSize > 0 ? `${(f.fileSize / 1024).toFixed(1)} KB` : '0 KB'} &middot; v{f.version}
                          </p>
                        </div>
                        {f.fileUrl && (
                          <a href={f.fileUrl} target="_blank" rel="noopener noreferrer" className="shrink-0">
                            <Button variant="ghost" size="icon"><Download className="w-4 h-4" /></Button>
                          </a>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}
              <div className="border-t border-slate-200 dark:border-navy-700 pt-4 space-y-4">
                <div>
                  <label className="font-medium text-slate-500 dark:text-slate-400 text-sm block mb-1">Status</label>
                  <Select value={newStatus} onValueChange={setNewStatus}>
                    <SelectTrigger className="w-full"><SelectValue placeholder="Select status" /></SelectTrigger>
                    <SelectContent>
                      {STATUS_OPTIONS.map((opt) => (
                        <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label className="font-medium text-slate-500 dark:text-slate-400 text-sm block mb-1">Assign Editor</label>
                  <Select value={assignedEditorId} onValueChange={setAssignedEditorId}>
                    <SelectTrigger className="w-full"><SelectValue placeholder="No editor assigned" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">No editor</SelectItem>
                      {editors.map((e: Editor) => (
                        <SelectItem key={e.id} value={e.userId || e.id}>
                          {e.user?.firstName} {e.user?.lastName} — {e.role?.replace(/_/g, ' ')}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setDetailOpen(false)}>Cancel</Button>
            <Button onClick={handleDetailSubmit} loading={detailSaving}>Save Changes</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Publish Dialog */}
      <Dialog open={publishOpen} onOpenChange={setPublishOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Publish to Volume</DialogTitle>
          </DialogHeader>
          {selected && (
            <div className="space-y-4 p-4">
              <div className="p-3 bg-slate-50 dark:bg-navy-800 rounded-lg">
                <p className="text-sm font-medium text-navy-900 dark:text-white">{selected.title}</p>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                  {selected.correspondingAuthor?.firstName} {selected.correspondingAuthor?.lastName} &middot; {selected.articleType?.replace(/_/g, ' ')}
                </p>
              </div>

              <div>
                <label className="font-medium text-slate-500 dark:text-slate-400 text-sm block mb-1">Target Volume *</label>
                <select
                  value={selectedVolumeId}
                  onChange={(e) => setSelectedVolumeId(e.target.value)}
                  className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm dark:border-navy-700 dark:bg-navy-900 dark:text-slate-100"
                >
                  <option value="">Select volume...</option>
                  {volumes.map((vol) => (
                    <option key={vol.id} value={vol.id}>
                      Volume {vol.number}{vol.title ? ` — ${vol.title}` : ''} ({vol.year})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="font-medium text-slate-500 dark:text-slate-400 text-sm block mb-1">DOI (auto-generated if empty)</label>
                <Input
                  placeholder="10.5555/amhsj.xxxxxxxx"
                  value={publishDoi}
                  onChange={(e) => setPublishDoi(e.target.value)}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="font-medium text-slate-500 dark:text-slate-400 text-sm block mb-1">Page Start</label>
                  <Input type="number" placeholder="1" value={pageStart} onChange={(e) => setPageStart(e.target.value)} />
                </div>
                <div>
                  <label className="font-medium text-slate-500 dark:text-slate-400 text-sm block mb-1">Page End</label>
                  <Input type="number" placeholder="15" value={pageEnd} onChange={(e) => setPageEnd(e.target.value)} />
                </div>
              </div>

              <div>
                <label className="font-medium text-slate-500 dark:text-slate-400 text-sm block mb-1">Publication Date</label>
                <Input type="date" value={publishDate} onChange={(e) => setPublishDate(e.target.value)} />
                <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">Defaults to today if left unchanged.</p>
              </div>

              <div>
                <label className="font-medium text-slate-500 dark:text-slate-400 text-sm block mb-1">
                  Journal-Formatted PDF
                </label>
                <p className="text-xs text-slate-400 dark:text-slate-500 mb-2">
                  Upload the final journal-branded PDF for readers to download. If empty, the original manuscript file will be used.
                </p>
                <div className="flex items-center gap-3">
                  <input
                    type="file"
                    accept=".pdf"
                    onChange={(e) => setPublishedPdf(e.target.files?.[0] || null)}
                    className="block w-full text-sm text-slate-600 dark:text-slate-400 file:mr-3 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-navy-100 file:text-navy-700 dark:file:bg-navy-800 dark:file:text-navy-300 hover:file:bg-navy-200 dark:hover:file:bg-navy-700 cursor-pointer"
                  />
                  {publishedPdf && (
                    <button
                      type="button"
                      onClick={() => setPublishedPdf(null)}
                      className="text-xs text-red-500 hover:text-red-600 whitespace-nowrap"
                    >
                      Remove
                    </button>
                  )}
                </div>
                {publishedPdf && (
                  <p className="text-xs text-green-600 dark:text-green-400 mt-1">
                    {publishedPdf.name} ({(publishedPdf.size / 1024 / 1024).toFixed(1)} MB)
                  </p>
                )}
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setPublishOpen(false)}>Cancel</Button>
            <Button onClick={handlePublish} loading={publishing} variant="gold">
              <Send className="w-4 h-4 mr-2" /> Publish Article
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
