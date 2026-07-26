'use client';

import { useState, useEffect, useCallback } from 'react';
import { useSession } from 'next-auth/react';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Card, CardContent } from '@/components/ui/Card';
import { formatDate, getStatusVariant } from '@/lib/utils';
import { toast } from 'sonner';
import {
  FileText,
  Clock,
  CheckCircle,
  Mail,
  Send,
} from 'lucide-react';

interface Invitation {
  id: string;
  manuscript: { id: string; title: string };
  status: string;
  dueDate: string;
  createdAt: string;
}

interface ActiveReview {
  id: string;
  manuscript: { id: string; title: string };
  status: string;
  dueDate: string;
  assignedAt: string;
}

interface DashboardData {
  pendingInvitations: Invitation[];
  activeReviews: ActiveReview[];
  completedReviews: number;
}

export default function ReviewerDashboardPage() {
  const { data: session } = useSession();
  const [data, setData] = useState<DashboardData>({
    pendingInvitations: [],
    activeReviews: [],
    completedReviews: 0,
  });
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    try {
      const res = await fetch('/api/reviewer/assigned');
      if (!res.ok) throw new Error('Failed');
      const result = await res.json();
      setData({
        pendingInvitations: result.pendingInvitations || result.pending || [],
        activeReviews: result.activeReviews || result.active || [],
        completedReviews: result.completedReviews ?? result.completed ?? 0,
      });
    } catch {
      toast.error('Failed to load dashboard data');
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

  const firstName = (session?.user as Record<string, unknown>)?.firstName as string || '';

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold text-navy-900 dark:text-white">
          Welcome back{firstName ? `, ${firstName}` : ''}
        </h1>
        <p className="text-slate-600 dark:text-slate-400 mt-1">
          Review manuscripts and track your review activity
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {[
          {
            label: 'Pending Invitations',
            value: data.pendingInvitations.length,
            icon: Mail,
            color: 'bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400',
          },
          {
            label: 'Active Reviews',
            value: data.activeReviews.length,
            icon: FileText,
            color: 'bg-amber-100 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400',
          },
          {
            label: 'Completed Reviews',
            value: data.completedReviews,
            icon: CheckCircle,
            color: 'bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400',
          },
        ].map((stat) => (
          <div
            key={stat.label}
            className="bg-white dark:bg-navy-900 rounded-xl border border-slate-200 dark:border-navy-800 p-6"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-500 dark:text-slate-400">{stat.label}</p>
                <p className="text-3xl font-bold text-navy-900 dark:text-white mt-1">{stat.value}</p>
              </div>
              <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${stat.color}`}>
                <stat.icon className="w-6 h-6" />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Pending Invitations */}
      <Card>
        <CardContent>
          <h2 className="text-lg font-semibold text-navy-900 dark:text-white mb-4 flex items-center gap-2">
            <Mail className="w-5 h-5 text-gold-600" />
            Pending Invitations
          </h2>
          {data.pendingInvitations.length === 0 ? (
            <p className="text-sm text-slate-500 py-4">No pending invitations at this time.</p>
          ) : (
            <div className="space-y-3">
              {data.pendingInvitations.map((inv) => (
                <div
                  key={inv.id}
                  className="flex items-center justify-between p-4 rounded-lg bg-slate-50 dark:bg-navy-800 border border-slate-200 dark:border-navy-700"
                >
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-navy-900 dark:text-white truncate">
                      {inv.manuscript?.title || 'Untitled'}
                    </p>
                    <div className="flex items-center gap-3 mt-1 text-xs text-slate-500">
                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        Due {inv.dueDate ? formatDate(inv.dueDate) : 'No deadline'}
                      </span>
                      <span>Invited {formatDate(inv.createdAt)}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 ml-4">
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
                      <Send className="w-3 h-3" />
                      Accept
                    </Button>
                  </div>
                </div>
              ))}
            </div>
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
          {data.activeReviews.length === 0 ? (
            <p className="text-sm text-slate-500 py-4">No active reviews at this time.</p>
          ) : (
            <div className="space-y-3">
              {data.activeReviews.map((review) => (
                <div
                  key={review.id}
                  className="flex items-center justify-between p-4 rounded-lg bg-slate-50 dark:bg-navy-800 border border-slate-200 dark:border-navy-700"
                >
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-navy-900 dark:text-white truncate">
                      {review.manuscript?.title || 'Untitled'}
                    </p>
                    <div className="flex items-center gap-3 mt-1 text-xs text-slate-500">
                      <Badge variant={getStatusVariant(review.status)} size="sm">
                        {review.status?.replace(/_/g, ' ')}
                      </Badge>
                      {review.dueDate && (
                        <span className="flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          Due {formatDate(review.dueDate)}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
