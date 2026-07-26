'use client';

import { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Bell, CheckCircle, CheckCheck, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface Notification {
  id: string;
  title: string;
  message: string;
  type: string;
  isRead: boolean;
  createdAt: string;
}

function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'just now';
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 30) return `${days}d ago`;
  return new Date(dateStr).toLocaleDateString();
}

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [filter, setFilter] = useState<'all' | 'unread'>('all');

  const fetchNotifications = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ page: String(page), limit: '20' });
      if (filter === 'unread') params.set('unread', 'true');
      const res = await fetch(`/api/notifications?${params}`);
      if (res.ok) {
        const data = await res.json();
        setNotifications(data.notifications || []);
        setTotalPages(data.pagination?.totalPages || 1);
      }
    } catch {
      // silently fail
    } finally {
      setLoading(false);
    }
  }, [page, filter]);

  useEffect(() => { fetchNotifications(); }, [fetchNotifications]);

  const markAllRead = async () => {
    try {
      await fetch('/api/notifications', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ all: true }),
      });
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
    } catch {
      // silently fail
    }
  };

  const markRead = async (id: string) => {
    try {
      await fetch('/api/notifications', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ids: [id] }),
      });
      setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, isRead: true } : n)));
    } catch {
      // silently fail
    }
  };

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-navy-900 dark:text-white">Notifications</h1>
          <p className="text-slate-600 dark:text-slate-400 text-sm mt-1">Stay updated on your manuscripts and reviews.</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex rounded-lg border border-slate-200 dark:border-navy-700 overflow-hidden">
            <button
              onClick={() => { setFilter('all'); setPage(1); }}
              className={cn('px-4 py-2 text-sm font-medium transition-colors', filter === 'all' ? 'bg-navy-900 text-white' : 'bg-white dark:bg-navy-900 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-navy-800')}
            >
              All
            </button>
            <button
              onClick={() => { setFilter('unread'); setPage(1); }}
              className={cn('px-4 py-2 text-sm font-medium transition-colors', filter === 'unread' ? 'bg-navy-900 text-white' : 'bg-white dark:bg-navy-900 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-navy-800')}
            >
              Unread {unreadCount > 0 && `(${unreadCount})`}
            </button>
          </div>
          {unreadCount > 0 && (
            <Button variant="outline" size="sm" onClick={markAllRead}>
              <CheckCheck className="w-4 h-4 mr-1" /> Mark all read
            </Button>
          )}
        </div>
      </div>

      <Card className="bg-white dark:bg-navy-900 border-slate-200 dark:border-navy-800">
        <CardContent className="p-0">
          {loading ? (
            <div className="flex items-center justify-center py-16">
              <Loader2 className="w-6 h-6 text-gold-400 animate-spin" />
            </div>
          ) : notifications.length === 0 ? (
            <div className="text-center py-16">
              <Bell className="w-12 h-12 text-slate-300 dark:text-slate-600 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-navy-900 dark:text-white mb-1">No notifications</h3>
              <p className="text-slate-500 dark:text-slate-400 text-sm">
                {filter === 'unread' ? "You're all caught up!" : "You'll see notifications here when there's activity on your manuscripts."}
              </p>
            </div>
          ) : (
            <div className="divide-y divide-slate-100 dark:divide-navy-800">
              {notifications.map((n) => (
                <div
                  key={n.id}
                  className={cn(
                    'px-6 py-4 hover:bg-slate-50 dark:hover:bg-navy-800/50 transition-colors cursor-pointer',
                    !n.isRead && 'bg-gold-50/30 dark:bg-gold-900/5'
                  )}
                  onClick={() => !n.isRead && markRead(n.id)}
                >
                  <div className="flex items-start gap-3">
                    <div className={cn(
                      'w-2 h-2 rounded-full mt-2 flex-shrink-0',
                      n.isRead ? 'bg-transparent' : 'bg-gold-400'
                    )} />
                    <div className="flex-1 min-w-0">
                      <p className={cn('text-sm', n.isRead ? 'text-slate-600 dark:text-slate-400' : 'font-semibold text-navy-900 dark:text-white')}>{n.title}</p>
                      <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">{n.message}</p>
                      <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">{timeAgo(n.createdAt)}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {totalPages > 1 && (
        <div className="flex justify-center gap-2">
          <Button variant="outline" size="sm" disabled={page <= 1} onClick={() => setPage(page - 1)}>Previous</Button>
          <span className="px-3 py-2 text-sm text-slate-600 dark:text-slate-400">Page {page} of {totalPages}</span>
          <Button variant="outline" size="sm" disabled={page >= totalPages} onClick={() => setPage(page + 1)}>Next</Button>
        </div>
      )}
    </div>
  );
}
