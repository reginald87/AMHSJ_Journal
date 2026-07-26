'use client';

import { useState, useEffect, useCallback } from 'react';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Card, CardContent } from '@/components/ui/Card';
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
import { Input } from '@/components/ui/Input';
import { formatDate, getRoleBadgeVariant } from '@/lib/utils';
import { toast } from 'sonner';
import { UserPlus, Search } from 'lucide-react';

interface Reviewer {
  id: string;
  user: { firstName: string; lastName: string; email: string; affiliation?: string };
  role: string;
  isActive: boolean;
}

interface Manuscript {
  id: string;
  title: string;
  status: string;
  submittedAt: string;
}

export default function EditorReviewersPage() {
  const [reviewers, setReviewers] = useState<Reviewer[]>([]);
  const [search, setSearch] = useState('');

  const [inviteOpen, setInviteOpen] = useState(false);
  const [manuscripts, setManuscripts] = useState<Manuscript[]>([]);
  const [selectedManuscriptId, setSelectedManuscriptId] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [saving, setSaving] = useState(false);

  const fetchReviewers = useCallback(async () => {
    try {
      const res = await fetch('/api/editorial/reviewers');
      if (!res.ok) throw new Error('Failed');
      const data = await res.json();
      setReviewers(Array.isArray(data) ? data : []);
    } catch {
      toast.error('Failed to load reviewers');
    }
  }, []);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchReviewers();
  }, [fetchReviewers]);

  const openInvite = async () => {
    setInviteOpen(true);
    setSelectedManuscriptId('');
    setDueDate('');
    if (manuscripts.length === 0) {
      try {
        const res = await fetch('/api/editorial/manuscripts');
        if (res.ok) {
          const data = await res.json();
          const list = Array.isArray(data) ? data : data.manuscripts || [];
          setManuscripts(list.filter((m: Manuscript) => m.status === 'SUBMITTED' || m.status === 'UNDER_REVIEW'));
        }
      } catch {
        /* non-critical */
      }
    }
  };

  const handleInvite = async () => {
    if (!selectedManuscriptId) {
      toast.error('Please select a manuscript');
      return;
    }
    if (!dueDate) {
      toast.error('Please set a due date');
      return;
    }
    try {
      setSaving(true);
      const res = await fetch('/api/editorial/invitations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          manuscriptId: selectedManuscriptId,
          dueDate,
        }),
      });
      if (!res.ok) throw new Error('Failed');
      toast.success('Invitation sent successfully');
      setInviteOpen(false);
    } catch {
      toast.error('Failed to send invitation');
    } finally {
      setSaving(false);
    }
  };

  const filtered = reviewers.filter((r) => {
    if (!search) return true;
    const q = search.toLowerCase();
    return (
      r.user.firstName?.toLowerCase().includes(q) ||
      r.user.lastName?.toLowerCase().includes(q) ||
      r.user.email?.toLowerCase().includes(q) ||
      r.user.affiliation?.toLowerCase().includes(q)
    );
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-navy-900 dark:text-white">Reviewer Management</h1>
          <p className="text-slate-600 dark:text-slate-400">Manage reviewers and send review invitations</p>
        </div>
        <Button onClick={openInvite}>
          <UserPlus className="w-4 h-4" />
          Invite to Review
        </Button>
      </div>

      <div className="relative w-[300px]">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
        <Input
          placeholder="Search by name, email, or affiliation..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-9"
        />
      </div>

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>Affiliation</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {reviewers.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={4}>
                    <div className="py-12 text-center">
                      <div className="w-8 h-8 border-4 border-gold-400 border-t-transparent rounded-full animate-spin mx-auto" />
                      <p className="text-sm text-slate-500 mt-3">Loading reviewers...</p>
                    </div>
                  </TableCell>
                </TableRow>
              ) : filtered.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={4}>
                    <div className="py-12 text-center">
                      <p className="font-medium text-navy-900 dark:text-white">No reviewers found</p>
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                filtered.map((r) => (
                  <TableRow key={r.id}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-navy-900 dark:bg-navy-700 flex items-center justify-center text-gold-400 font-semibold text-xs">
                          {r.user.firstName?.[0]}{r.user.lastName?.[0]}
                        </div>
                        <div>
                          <p className="font-medium text-navy-900 dark:text-white text-sm">
                            {r.user.firstName} {r.user.lastName}
                          </p>
                          <p className="text-xs text-slate-500">{r.user.email}</p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant={getRoleBadgeVariant(r.role)} size="sm">
                        {r.role?.replace(/_/g, ' ')}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-sm text-slate-600 dark:text-slate-400">
                      {r.user.affiliation || '—'}
                    </TableCell>
                    <TableCell>
                      <Badge variant={r.isActive ? 'success' : 'default'}>
                        {r.isActive ? 'Active' : 'Inactive'}
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Invite Dialog */}
      <Dialog open={inviteOpen} onOpenChange={setInviteOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Invite Reviewer</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 px-6 py-2">
            <div>
              <p className="text-sm font-medium text-slate-500 mb-1">Select Manuscript</p>
              <Select value={selectedManuscriptId} onValueChange={setSelectedManuscriptId}>
                <SelectTrigger>
                  <SelectValue placeholder="Choose a manuscript" />
                </SelectTrigger>
                <SelectContent>
                  {manuscripts.length === 0 ? (
                    <SelectItem value="" disabled>
                      No manuscripts available
                    </SelectItem>
                  ) : (
                    manuscripts.map((m) => (
                      <SelectItem key={m.id} value={m.id}>
                        {m.title?.slice(0, 60)}{m.title?.length > 60 ? '...' : ''}
                      </SelectItem>
                    ))
                  )}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Input
                label="Due Date"
                type="date"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
              />
            </div>
          </div>
          <DialogFooter>
            <DialogClose />
            <Button variant="ghost" onClick={() => setInviteOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleInvite} loading={saving}>
              Send Invitation
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
