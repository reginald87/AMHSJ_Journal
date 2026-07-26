'use client';

import { useState, useEffect, useCallback } from 'react';
import { Badge } from '@/components/ui/Badge';
import { Card, CardContent } from '@/components/ui/Card';
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
import { Archive } from 'lucide-react';

interface ReviewHistoryItem {
  id: string;
  manuscript: { id: string; title: string };
  decision: string;
  originality: number;
  methodology: number;
  significance: number;
  clarity: number;
  submittedAt: string;
}

function RatingBadge({ label, value }: { label: string; value: number }) {
  const variant = value >= 4 ? 'success' : value >= 3 ? 'warning' : 'danger';
  return (
    <Badge variant={variant} size="sm" className="gap-1">
      {label.charAt(0)}:{value}
    </Badge>
  );
}

export default function ReviewerHistoryPage() {
  const [history, setHistory] = useState<ReviewHistoryItem[]>([]);

  const fetchHistory = useCallback(async () => {
    try {
      const res = await fetch('/api/reviewer/history');
      if (!res.ok) throw new Error('Failed');
      const data = await res.json();
      setHistory(Array.isArray(data) ? data : data.reviews || []);
    } catch {
      toast.error('Failed to load review history');
    }
  }, []);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchHistory();
  }, [fetchHistory]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-navy-900 dark:text-white">Review History</h1>
        <p className="text-slate-600 dark:text-slate-400">Your completed review submissions</p>
      </div>

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Manuscript Title</TableHead>
                <TableHead>Decision</TableHead>
                <TableHead>Ratings</TableHead>
                <TableHead>Submitted</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {history.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={4}>
                    <div className="py-12 text-center">
                      <Archive className="w-12 h-12 text-slate-300 dark:text-slate-600 mx-auto mb-3" />
                      <p className="font-medium text-navy-900 dark:text-white">No review history</p>
                      <p className="text-sm text-slate-500 mt-1">Completed reviews will appear here.</p>
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                history.map((item) => (
                  <TableRow key={item.id}>
                    <TableCell className="font-medium text-navy-900 dark:text-white max-w-xs truncate">
                      {item.manuscript?.title || 'Untitled'}
                    </TableCell>
                    <TableCell>
                      <Badge variant={getStatusVariant(item.decision)}>
                        {item.decision?.replace(/_/g, ' ')}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-wrap gap-1.5">
                        <RatingBadge label="O" value={item.originality} />
                        <RatingBadge label="M" value={item.methodology} />
                        <RatingBadge label="S" value={item.significance} />
                        <RatingBadge label="C" value={item.clarity} />
                      </div>
                    </TableCell>
                    <TableCell className="text-sm text-slate-500">
                      {item.submittedAt ? formatDate(item.submittedAt) : '—'}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
