'use client';

import { useState, useEffect, useCallback } from 'react';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Card, CardContent } from '@/components/ui/Card';
import { Textarea } from '@/components/ui/Input';
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
import { Send, Clock, FileText, CheckCircle, Download } from 'lucide-react';

interface Invitation {
  id: string;
  manuscript: { id: string; title: string; files?: { id: string; fileName: string; fileUrl: string; fileSize: number; mimeType: string; isPrimary: boolean }[] };
  status: string;
  dueDate: string;
  createdAt: string;
}

interface ActiveReview {
  id: string;
  manuscript: { id: string; title: string; files?: { id: string; fileName: string; fileUrl: string; fileSize: number; mimeType: string; isPrimary: boolean }[] };
  status: string;
  dueDate: string;
  assignedAt: string;
}

const DECISION_OPTIONS = [
  { value: 'ACCEPT', label: 'Accept' },
  { value: 'MINOR_REVISION', label: 'Minor Revision' },
  { value: 'MAJOR_REVISION', label: 'Major Revision' },
  { value: 'REJECT', label: 'Reject' },
];

function RatingSelect({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <div>
      <p className="text-sm font-medium text-navy-900 dark:text-white mb-1">{label}</p>
      <div className="flex gap-2">
        {[1, 2, 3, 4, 5].map((n) => (
          <button
            key={n}
            type="button"
            onClick={() => onChange(String(n))}
            className={`w-9 h-9 rounded-lg text-sm font-medium transition-all ${
              value === String(n)
                ? 'bg-gold-400 text-navy-900 ring-2 ring-gold-400'
                : 'bg-slate-100 dark:bg-navy-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-navy-700'
            }`}
          >
            {n}
          </button>
        ))}
      </div>
    </div>
  );
}

export default function ReviewerAssignedPage() {
  const [invitations, setInvitations] = useState<Invitation[]>([]);
  const [activeReviews, setActiveReviews] = useState<ActiveReview[]>([]);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  const [reviewDialogOpen, setReviewDialogOpen] = useState(false);
  const [reviewTarget, setReviewTarget] = useState<ActiveReview | null>(null);
  const [decision, setDecision] = useState('');
  const [originality, setOriginality] = useState('');
  const [methodology, setMethodology] = useState('');
  const [significance, setSignificance] = useState('');
  const [clarity, setClarity] = useState('');
  const [commentsToEditor, setCommentsToEditor] = useState('');
  const [commentsToAuthor, setCommentsToAuthor] = useState('');
  const [confidentialNotes, setConfidentialNotes] = useState('');
  const [saving, setSaving] = useState(false);

  const fetchData = useCallback(async () => {
    try {
      const res = await fetch('/api/reviewer/assigned');
      if (!res.ok) throw new Error('Failed');
      const data = await res.json();
      setInvitations(data.pendingInvitations || data.pending || []);
      setActiveReviews(data.activeReviews || data.active || []);
    } catch {
      toast.error('Failed to load assigned reviews');
    }
  }, []);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchData();
  }, [fetchData]);

  const handleInvitation = async (invitationId: string, action: 'accept' | 'decline') => {
    try {
      setActionLoading(invitationId);
      const res = await fetch(`/api/reviewer/invitations/${invitationId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action }),
      });
      if (!res.ok) throw new Error('Failed');
      toast.success(`Invitation ${action === 'accept' ? 'accepted' : 'declined'}`);
      fetchData();
    } catch {
      toast.error(`Failed to ${action} invitation`);
    } finally {
      setActionLoading(null);
    }
  };

  const openReviewDialog = (review: ActiveReview) => {
    setReviewTarget(review);
    setDecision('');
    setOriginality('');
    setMethodology('');
    setSignificance('');
    setClarity('');
    setCommentsToEditor('');
    setCommentsToAuthor('');
    setConfidentialNotes('');
    setReviewDialogOpen(true);
  };

  const handleSubmitReview = async () => {
    if (!reviewTarget || !decision) {
      toast.error('Please select a decision');
      return;
    }
    if (!originality || !methodology || !significance || !clarity) {
      toast.error('Please rate all criteria');
      return;
    }
    try {
      setSaving(true);
      const res = await fetch(`/api/reviewer/reviews/${reviewTarget.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          decision,
          originality: Number(originality),
          methodology: Number(methodology),
          significance: Number(significance),
          clarity: Number(clarity),
          commentsToEditor,
          commentsToAuthor,
          confidentialNotes,
        }),
      });
      if (!res.ok) throw new Error('Failed');
      toast.success('Review submitted successfully');
      setReviewDialogOpen(false);
      fetchData();
    } catch {
      toast.error('Failed to submit review');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-navy-900 dark:text-white">Assigned Reviews</h1>
        <p className="text-slate-600 dark:text-slate-400">Review invitations and active manuscript reviews</p>
      </div>

      {/* Pending Invitations */}
      <Card>
        <CardContent>
          <h2 className="text-lg font-semibold text-navy-900 dark:text-white mb-4 flex items-center gap-2">
            <Clock className="w-5 h-5 text-gold-600" />
            Pending Invitations
          </h2>
          {invitations.length === 0 && activeReviews.length === 0 ? (
            <div className="py-8 text-center">
              <div className="w-6 h-6 border-4 border-gold-400 border-t-transparent rounded-full animate-spin mx-auto" />
            </div>
          ) : invitations.length === 0 ? (
            <p className="text-sm text-slate-500 py-4">No pending invitations.</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Manuscript</TableHead>
                  <TableHead>Due Date</TableHead>
                  <TableHead>Invited</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {invitations.map((inv) => (
                  <TableRow key={inv.id}>
                    <TableCell className="font-medium text-navy-900 dark:text-white max-w-xs truncate">
                      {inv.manuscript?.title || 'Untitled'}
                    </TableCell>
                    <TableCell className="text-sm text-slate-500">
                      {inv.dueDate ? formatDate(inv.dueDate) : '—'}
                    </TableCell>
                    <TableCell className="text-sm text-slate-500">
                      {formatDate(inv.createdAt)}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-2">
                        {inv.manuscript?.files?.filter(f => f.isPrimary).map(f => (
                          <a key={f.id} href={f.fileUrl} target="_blank" rel="noopener noreferrer">
                            <Button variant="ghost" size="sm">
                              <Download className="w-3 h-3" />
                            </Button>
                          </a>
                        ))}
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleInvitation(inv.id, 'decline')}
                          disabled={actionLoading === inv.id}
                        >
                          Decline
                        </Button>
                        <Button
                          size="sm"
                          onClick={() => handleInvitation(inv.id, 'accept')}
                          loading={actionLoading === inv.id}
                        >
                          Accept
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Active Reviews */}
      <Card>
        <CardContent>
          <h2 className="text-lg font-semibold text-navy-900 dark:text-white mb-4 flex items-center gap-2">
            <FileText className="w-5 h-5 text-gold-600" />
            Active Reviews
          </h2>
          {invitations.length === 0 && activeReviews.length === 0 ? (
            <div className="py-8 text-center">
              <div className="w-6 h-6 border-4 border-gold-400 border-t-transparent rounded-full animate-spin mx-auto" />
            </div>
          ) : activeReviews.length === 0 ? (
            <p className="text-sm text-slate-500 py-4">No active reviews. Accept an invitation to begin.</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Manuscript</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Due Date</TableHead>
                  <TableHead>Assigned</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {activeReviews.map((review) => (
                  <TableRow key={review.id}>
                    <TableCell className="font-medium text-navy-900 dark:text-white max-w-xs truncate">
                      {review.manuscript?.title || 'Untitled'}
                    </TableCell>
                    <TableCell>
                      <Badge variant={getStatusVariant(review.status)} size="sm">
                        {review.status?.replace(/_/g, ' ')}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-sm text-slate-500">
                      {review.dueDate ? formatDate(review.dueDate) : '—'}
                    </TableCell>
                    <TableCell className="text-sm text-slate-500">
                      {formatDate(review.assignedAt)}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-2">
                        {review.manuscript?.files?.filter(f => f.isPrimary).map(f => (
                          <a key={f.id} href={f.fileUrl} target="_blank" rel="noopener noreferrer">
                            <Button variant="ghost" size="sm">
                              <Download className="w-3 h-3" />
                              Manuscript
                            </Button>
                          </a>
                        ))}
                        <Button
                          size="sm"
                          onClick={() => openReviewDialog(review)}
                        >
                          <Send className="w-3 h-3" />
                          Submit Review
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Review Submission Dialog */}
      <Dialog open={reviewDialogOpen} onOpenChange={setReviewDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Submit Review</DialogTitle>
          </DialogHeader>
          <div className="space-y-5 overflow-y-auto max-h-[60vh] px-6 py-2">
            {reviewTarget && (
              <div className="p-3 rounded-lg bg-slate-50 dark:bg-navy-800">
                <p className="text-sm text-slate-500">Reviewing</p>
                <p className="font-medium text-navy-900 dark:text-white text-sm">
                  {reviewTarget.manuscript?.title || 'Untitled'}
                </p>
              </div>
            )}

            <div>
              <p className="text-sm font-medium text-navy-900 dark:text-white mb-1">Decision *</p>
              <Select value={decision} onValueChange={setDecision}>
                <SelectTrigger>
                  <SelectValue placeholder="Select decision" />
                </SelectTrigger>
                <SelectContent>
                  {DECISION_OPTIONS.map((d) => (
                    <SelectItem key={d.value} value={d.value}>
                      {d.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <RatingSelect label="Originality" value={originality} onChange={setOriginality} />
              <RatingSelect label="Methodology" value={methodology} onChange={setMethodology} />
              <RatingSelect label="Significance" value={significance} onChange={setSignificance} />
              <RatingSelect label="Clarity" value={clarity} onChange={setClarity} />
            </div>

            <Textarea
              label="Comments to Editor"
              placeholder="Confidential comments visible only to editors..."
              value={commentsToEditor}
              onChange={(e) => setCommentsToEditor(e.target.value)}
            />

            <Textarea
              label="Comments to Author"
              placeholder="Constructive feedback for the authors..."
              value={commentsToAuthor}
              onChange={(e) => setCommentsToAuthor(e.target.value)}
            />

            <Textarea
              label="Confidential Notes"
              placeholder="Internal notes not shared with anyone..."
              value={confidentialNotes}
              onChange={(e) => setConfidentialNotes(e.target.value)}
            />
          </div>
          <DialogFooter>
            <DialogClose />
            <Button variant="ghost" onClick={() => setReviewDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSubmitReview} loading={saving}>
              <CheckCircle className="w-4 h-4" />
              Submit Review
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
