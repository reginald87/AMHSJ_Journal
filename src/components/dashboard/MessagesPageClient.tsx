'use client';

import { useEffect, useState, useCallback } from 'react';
import { Button } from '@/components/ui/Button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { toast } from 'sonner';
import {
  Mail,
  MailOpen,
  Trash2,
  ChevronLeft,
  ChevronRight,
  Search,
  User,
  Clock,
  Building2,
  ArrowLeft,
  Send,
  RefreshCw,
} from 'lucide-react';

interface ContactMessage {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  affiliation: string | null;
  subject: string;
  message: string;
  isRead: boolean;
  readAt: string | null;
  repliedAt: string | null;
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
  return `${days}d ago`;
}

const subjectLabels: Record<string, string> = {
  general: 'General Inquiry',
  submission: 'Submission Question',
  review: 'Review Process',
  editorial: 'Editorial Board',
  technical: 'Technical Support',
  other: 'Other',
};

export function MessagesPageClient() {
  const [messages, setMessages] = useState<ContactMessage[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [filter, setFilter] = useState<'all' | 'unread' | 'read'>('all');
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<ContactMessage | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  const fetchMessages = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/contact-messages?page=${page}&limit=20&filter=${filter}`);
      if (res.ok) {
        const data = await res.json();
        setMessages(data.messages);
        setTotal(data.total);
        setTotalPages(data.totalPages);
      } else {
        toast.error('Failed to load messages');
      }
    } catch {
      toast.error('Failed to load messages');
    } finally {
      setLoading(false);
    }
  }, [page, filter]);

  useEffect(() => {
    fetchMessages();
  }, [fetchMessages]);

  const markAsRead = async (id: string) => {
    try {
      await fetch(`/api/admin/contact-messages/${id}`, { method: 'GET' });
      setMessages((prev) =>
        prev.map((m) => (m.id === id ? { ...m, isRead: true, readAt: new Date().toISOString() } : m))
      );
      if (selected?.id === id) {
        setSelected((prev) => (prev ? { ...prev, isRead: true, readAt: new Date().toISOString() } : prev));
      }
    } catch {
      // silent
    }
  };

  const deleteMessage = async (id: string) => {
    if (!confirm('Delete this message?')) return;
    try {
      const res = await fetch(`/api/admin/contact-messages/${id}`, { method: 'DELETE' });
      if (res.ok) {
        toast.success('Message deleted');
        setSelected(null);
        fetchMessages();
      } else {
        toast.error('Failed to delete');
      }
    } catch {
      toast.error('Failed to delete');
    }
  };

  const markAsReplied = async (id: string) => {
    try {
      await fetch(`/api/admin/contact-messages/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ repliedAt: new Date().toISOString() }),
      });
      setMessages((prev) =>
        prev.map((m) => (m.id === id ? { ...m, repliedAt: new Date().toISOString() } : m))
      );
      if (selected?.id === id) {
        setSelected((prev) => (prev ? { ...prev, repliedAt: new Date().toISOString() } : prev));
      }
      toast.success('Marked as replied');
    } catch {
      toast.error('Failed to update');
    }
  };

  const openMessage = (msg: ContactMessage) => {
    setSelected(msg);
    if (!msg.isRead) markAsRead(msg.id);
  };

  const filteredMessages = messages.filter((m) => {
    if (!searchTerm) return true;
    const term = searchTerm.toLowerCase();
    return (
      m.firstName.toLowerCase().includes(term) ||
      m.lastName.toLowerCase().includes(term) ||
      m.email.toLowerCase().includes(term) ||
      m.subject.toLowerCase().includes(term) ||
      m.message.toLowerCase().includes(term)
    );
  });

  const unreadCount = messages.filter((m) => !m.isRead).length;

  if (selected) {
    return (
      <div className="max-w-4xl space-y-6">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="sm" onClick={() => setSelected(null)}>
            <ArrowLeft className="w-4 h-4 mr-1" /> Back
          </Button>
          <div className="flex-1" />
          <Button variant="ghost" size="sm" onClick={() => deleteMessage(selected.id)} className="text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20">
            <Trash2 className="w-4 h-4 mr-1" /> Delete
          </Button>
        </div>

        <Card>
          <CardHeader>
            <div className="flex items-start justify-between gap-4">
              <div>
                <CardTitle className="text-xl">{selected.subject}</CardTitle>
                <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                  {subjectLabels[selected.subject] || selected.subject}
                </p>
              </div>
              <Badge variant={selected.isRead ? 'default' : 'gold'}>
                {selected.isRead ? 'Read' : 'Unread'}
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex flex-wrap gap-4 p-4 bg-slate-50 dark:bg-navy-800 rounded-lg">
              <div className="flex items-center gap-2">
                <User className="w-4 h-4 text-slate-400" />
                <span className="text-sm font-medium text-navy-900 dark:text-white">
                  {selected.firstName} {selected.lastName}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <Mail className="w-4 h-4 text-slate-400" />
                <a href={`mailto:${selected.email}`} className="text-sm text-gold-600 dark:text-gold-400 hover:underline">
                  {selected.email}
                </a>
              </div>
              {selected.affiliation && (
                <div className="flex items-center gap-2">
                  <Building2 className="w-4 h-4 text-slate-400" />
                  <span className="text-sm text-slate-600 dark:text-slate-400">{selected.affiliation}</span>
                </div>
              )}
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-slate-400" />
                <span className="text-sm text-slate-500 dark:text-slate-400">{timeAgo(selected.createdAt)}</span>
              </div>
            </div>

            <div className="prose prose-sm dark:prose-invert max-w-none">
              <p className="text-slate-700 dark:text-slate-300 whitespace-pre-wrap leading-relaxed">{selected.message}</p>
            </div>

            <div className="flex gap-3 pt-4 border-t border-slate-200 dark:border-navy-800">
              <a
                href={`mailto:${selected.email}?subject=Re: ${selected.subject}&body=%0A%0A---%0ADear ${selected.firstName},`}
                onClick={() => !selected.repliedAt && markAsReplied(selected.id)}
              >
                <Button variant="gold" size="sm">
                  <Send className="w-4 h-4 mr-2" /> Reply via Email
                </Button>
              </a>
              {selected.repliedAt && (
                <Badge variant="default" className="self-center">
                  Replied {timeAgo(selected.repliedAt)}
                </Badge>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold text-navy-900 dark:text-white">Messages</h1>
        <p className="text-slate-600 dark:text-slate-400 mt-1">View and respond to messages from the contact form</p>
      </div>

      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div className="flex gap-2">
          {(['all', 'unread', 'read'] as const).map((f) => (
            <button
              key={f}
              onClick={() => { setFilter(f); setPage(1); }}
              className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
                filter === f
                  ? 'bg-navy-900 text-white dark:bg-white dark:text-navy-900'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-navy-800 dark:text-slate-400 dark:hover:bg-navy-700'
              }`}
            >
              {f === 'all' ? `All (${total})` : f === 'unread' ? `Unread (${unreadCount})` : `Read (${total - unreadCount})`}
            </button>
          ))}
        </div>
        <div className="flex gap-2 w-full sm:w-auto">
          <div className="relative flex-1 sm:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search messages..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-4 py-2 text-sm border border-slate-200 dark:border-navy-700 rounded-lg bg-white dark:bg-navy-900 text-navy-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-gold-500"
            />
          </div>
          <Button variant="outline" size="sm" onClick={fetchMessages}>
            <RefreshCw className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gold-600" />
        </div>
      ) : filteredMessages.length === 0 ? (
        <div className="text-center py-20">
          <Mail className="w-12 h-12 text-slate-300 dark:text-slate-600 mx-auto mb-4" />
          <p className="text-slate-500 dark:text-slate-400">No messages found</p>
        </div>
      ) : (
        <div className="space-y-2">
          {filteredMessages.map((msg) => (
            <button
              key={msg.id}
              onClick={() => openMessage(msg)}
              className={`w-full text-left p-4 rounded-xl border transition-all hover:shadow-md ${
                msg.isRead
                  ? 'bg-white dark:bg-navy-900 border-slate-200 dark:border-navy-800'
                  : 'bg-gold-50/50 dark:bg-gold-900/10 border-gold-200 dark:border-gold-800'
              }`}
            >
              <div className="flex items-start gap-3">
                <div className={`mt-0.5 ${msg.isRead ? 'text-slate-400' : 'text-gold-500'}`}>
                  {msg.isRead ? <MailOpen className="w-5 h-5" /> : <Mail className="w-5 h-5" />}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className={`text-sm font-semibold ${msg.isRead ? 'text-slate-700 dark:text-slate-300' : 'text-navy-900 dark:text-white'}`}>
                      {msg.firstName} {msg.lastName}
                    </span>
                    {!msg.isRead && <span className="w-2 h-2 bg-gold-500 rounded-full" />}
                    <span className="text-xs text-slate-400 ml-auto flex-shrink-0">{timeAgo(msg.createdAt)}</span>
                  </div>
                  <p className={`text-sm font-medium truncate ${msg.isRead ? 'text-slate-600 dark:text-slate-400' : 'text-navy-900 dark:text-white'}`}>
                    {msg.subject}
                  </p>
                  <p className="text-xs text-slate-500 dark:text-slate-400 truncate mt-0.5">{msg.message}</p>
                </div>
              </div>
            </button>
          ))}
        </div>
      )}

      {totalPages > 1 && (
        <div className="flex items-center justify-between pt-4">
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Page {page} of {totalPages}
          </p>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" disabled={page <= 1} onClick={() => setPage(page - 1)}>
              <ChevronLeft className="w-4 h-4" />
            </Button>
            <Button variant="outline" size="sm" disabled={page >= totalPages} onClick={() => setPage(page + 1)}>
              <ChevronRight className="w-4 h-4" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
