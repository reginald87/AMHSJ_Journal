'use client';

import { useState, useEffect, useCallback } from 'react';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Card, CardContent } from '@/components/ui/Card';
import { Input, Textarea } from '@/components/ui/Input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/Select';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogClose,
} from '@/components/ui/Dialog';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/Table';
import { formatDate, getStatusVariant } from '@/lib/utils';
import { toast } from 'sonner';
import { Eye, Search, Download, FileText } from 'lucide-react';

interface Manuscript {
  id: string;
  title: string;
  status: string;
  articleType: string;
  submittedAt: string;
  correspondingAuthor?: { firstName: string; lastName: string };
  assignedEditor?: { firstName: string; lastName: string };
  decisionNotes?: string;
  files?: { id: string; fileName: string; fileUrl: string; fileSize: number; mimeType: string; fileType: string; isPrimary: boolean; version: number }[];
}

interface Reviewer {
  id: string;
  user: { firstName: string; lastName: string; email: string };
  role: string;
}

const STATUS_OPTIONS = [
  { value: 'SUBMITTED', label: 'Submitted' },
  { value: 'UNDER_REVIEW', label: 'Under Review' },
  { value: 'UNDER_REVISION', label: 'Under Revision' },
  { value: 'ACCEPTED', label: 'Accepted' },
  { value: 'REJECTED', label: 'Rejected' },
  { value: 'PUBLISHED', label: 'Published' },
];

export default function EditorManuscriptsPage() {
  const [manuscripts, setManuscripts] = useState<Manuscript[]>([]);
  const [filter, setFilter] = useState('all');
  const [search, setSearch] = useState('');

  const [selected, setSelected] = useState<Manuscript | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [newStatus, setNewStatus] = useState('');
  const [assignedEditorId, setAssignedEditorId] = useState('');
  const [decisionNotes, setDecisionNotes] = useState('');
  const [saving, setSaving] = useState(false);

  const [reviewers, setReviewers] = useState<Reviewer[]>([]);

  const fetchManuscripts = useCallback(async () => {
    try {
      const res = await fetch('/api/editorial/manuscripts');
      if (!res.ok) throw new Error('Failed');
      const data = await res.json();
      setManuscripts(Array.isArray(data) ? data : data.manuscripts || []);
    } catch {
      toast.error('Failed to load manuscripts');
    }
  }, []);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchManuscripts();
  }, [fetchManuscripts]);

  const openDialog = async (m: Manuscript) => {
    setSelected(m);
    setNewStatus(m.status);
    setAssignedEditorId(m.assignedEditor ? '' : '');
    setDecisionNotes(m.decisionNotes || '');
    setDialogOpen(true);

    if (reviewers.length === 0) {
      try {
        const res = await fetch('/api/editorial/reviewers');
        if (res.ok) {
          const data = await res.json();
          setReviewers(Array.isArray(data) ? data : []);
        }
      } catch {
        /* reviewers load is non-critical */
      }
    }
  };

  const handleSave = async () => {
    if (!selected) return;
    try {
      setSaving(true);
      const body: Record<string, unknown> = {
        status: newStatus,
        decisionNotes,
      };
      if (assignedEditorId) {
        body.assignedEditorId = assignedEditorId;
      }
      const res = await fetch(`/api/editorial/manuscripts/${selected.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      if (!res.ok) throw new Error('Failed');
      toast.success('Manuscript updated successfully');
      setDialogOpen(false);
      fetchManuscripts();
    } catch {
      toast.error('Failed to update manuscript');
    } finally {
      setSaving(false);
    }
  };

  const filtered = manuscripts.filter((m) => {
    if (filter !== 'all' && m.status !== filter) return false;
    if (search) {
      const q = search.toLowerCase();
      if (
        !m.title?.toLowerCase().includes(q) &&
        !m.id?.toLowerCase().includes(q) &&
        !m.correspondingAuthor?.firstName?.toLowerCase().includes(q) &&
        !m.correspondingAuthor?.lastName?.toLowerCase().includes(q)
      )
        return false;
    }
    return true;
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-navy-900 dark:text-white">Manuscripts</h1>
        <p className="text-slate-600 dark:text-slate-400">Manage and review submitted manuscripts</p>
      </div>

      <div className="flex gap-3 flex-wrap">
        <Select value={filter} onValueChange={setFilter}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="All Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            {STATUS_OPTIONS.map((s) => (
              <SelectItem key={s.value} value={s.value}>
                {s.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <div className="relative w-[250px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <Input
            placeholder="Search title, ID, or author..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>
      </div>

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[100px]">ID</TableHead>
                <TableHead>Title</TableHead>
                <TableHead>Author</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Submitted</TableHead>
                <TableHead className="w-[100px]">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {manuscripts.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6}>
                    <div className="py-12 text-center">
                      <div className="w-8 h-8 border-4 border-gold-400 border-t-transparent rounded-full animate-spin mx-auto" />
                      <p className="text-sm text-slate-500 mt-3">Loading manuscripts...</p>
                    </div>
                  </TableCell>
                </TableRow>
              ) : filtered.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6}>
                    <div className="py-12 text-center">
                      <p className="font-medium text-navy-900 dark:text-white">No manuscripts found</p>
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                filtered.map((m) => (
                  <TableRow key={m.id}>
                    <TableCell className="font-mono text-sm">{m.id.slice(0, 8)}</TableCell>
                    <TableCell className="font-medium text-navy-900 dark:text-white max-w-xs truncate">
                      {m.title}
                    </TableCell>
                    <TableCell className="text-sm text-slate-600 dark:text-slate-400">
                      {m.correspondingAuthor?.firstName} {m.correspondingAuthor?.lastName}
                    </TableCell>
                    <TableCell>
                      <Badge variant={getStatusVariant(m.status)}>
                        {m.status?.replace(/_/g, ' ')}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-sm text-slate-500">
                      {m.submittedAt ? formatDate(m.submittedAt) : '—'}
                    </TableCell>
                    <TableCell>
                      <Button variant="ghost" size="sm" onClick={() => openDialog(m)}>
                        <Eye className="w-4 h-4" />
                        View
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Detail / Edit Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Manuscript Details</DialogTitle>
          </DialogHeader>
          {selected && (
            <div className="space-y-4 overflow-y-auto max-h-[60vh] px-6 py-2">
              <div>
                <p className="text-sm font-medium text-slate-500">Title</p>
                <p className="text-navy-900 dark:text-white font-medium">{selected.title}</p>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-medium text-slate-500">ID</p>
                  <p className="text-sm font-mono text-navy-900 dark:text-white">{selected.id.slice(0, 8)}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-slate-500">Author</p>
                  <p className="text-sm text-navy-900 dark:text-white">
                    {selected.correspondingAuthor?.firstName} {selected.correspondingAuthor?.lastName}
                  </p>
                </div>
              </div>
              <div>
                <p className="text-sm font-medium text-slate-500 mb-1">Update Status</p>
                <Select value={newStatus} onValueChange={setNewStatus}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    {STATUS_OPTIONS.map((s) => (
                      <SelectItem key={s.value} value={s.value}>
                        {s.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              {reviewers.length > 0 && (
                <div>
                  <p className="text-sm font-medium text-slate-500 mb-1">Assign Editor</p>
                  <Select value={assignedEditorId} onValueChange={setAssignedEditorId}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select editor" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">No change</SelectItem>
                      {reviewers.map((r) => (
                        <SelectItem key={r.id} value={r.id}>
                          {r.user.firstName} {r.user.lastName}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}
              <div>
                <Textarea
                  label="Decision Notes"
                  placeholder="Add notes about this decision..."
                  value={decisionNotes}
                  onChange={(e) => setDecisionNotes(e.target.value)}
                />
              </div>
              {selected.files && selected.files.length > 0 && (
                <div>
                  <p className="text-sm font-medium text-slate-500 mb-2">Manuscript Files</p>
                  <div className="space-y-2">
                    {selected.files.map((f) => (
                      <div key={f.id} className="flex items-center gap-3 p-3 bg-slate-50 dark:bg-navy-800 rounded-lg border border-slate-200 dark:border-navy-700">
                        <FileText className="w-5 h-5 text-slate-400 shrink-0" />
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-navy-900 dark:text-white truncate">{f.fileName || '(empty)'}</p>
                          <p className="text-xs text-slate-500">{f.fileType} &middot; {f.mimeType} &middot; {f.fileSize > 0 ? `${(f.fileSize / 1024).toFixed(1)} KB` : '0 KB'}</p>
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
            </div>
          )}
          <DialogFooter>
            <DialogClose />
            <Button variant="ghost" onClick={() => setDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSave} loading={saving}>
              Save Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
