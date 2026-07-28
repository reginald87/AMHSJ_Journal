'use client';

import { useEffect, useState, useCallback } from 'react';
import Link from 'next/link';
import { Card, CardContent } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/Select';
import { toast } from 'sonner';
import { FileText, BookOpen, Search, ChevronLeft, ChevronRight, Eye } from 'lucide-react';

interface Manuscript {
  id: string;
  title: string;
  articleType: string;
  section: string;
  status: string;
  submittedAt: string;
  updatedAt: string;
  doi: string | null;
  correspondingAuthor: { firstName: string; lastName: string; email: string };
  journal: { name: string; shortName: string };
  files: { fileUrl: string; fileName: string }[];
}

export default function EditorAssistantManuscriptsPage() {
  const [manuscripts, setManuscripts] = useState<Manuscript[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [status, setStatus] = useState('all');
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  const fetchManuscripts = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ page: String(page), limit: '20', status });
      if (search) params.set('search', search);
      const res = await fetch(`/api/editor-assistant/manuscripts?${params}`);
      if (res.ok) {
        const data = await res.json();
        setManuscripts(data.manuscripts);
        setTotal(data.total);
        setTotalPages(data.totalPages);
      } else {
        toast.error('Failed to load manuscripts');
      }
    } catch {
      toast.error('Failed to load manuscripts');
    } finally {
      setLoading(false);
    }
  }, [page, status, search]);

  useEffect(() => { fetchManuscripts(); }, [fetchManuscripts]);

  const statusColor = (s: string) => {
    if (s === 'ACCEPTED') return 'success';
    if (s === 'PUBLISHED') return 'navy';
    return 'default';
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold text-navy-900 dark:text-white">Manuscripts</h1>
        <p className="text-slate-600 dark:text-slate-400 mt-1">Accepted manuscripts ready for formatting and publishing</p>
      </div>

      <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center">
        <Select value={status} onValueChange={(v) => { setStatus(v); setPage(1); }}>
          <SelectTrigger className="w-[180px]"><SelectValue placeholder="All" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All</SelectItem>
            <SelectItem value="ACCEPTED">Accepted</SelectItem>
            <SelectItem value="PUBLISHED">Published</SelectItem>
          </SelectContent>
        </Select>
        <div className="relative flex-1 sm:max-w-xs">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search manuscripts..."
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            className="w-full pl-9 pr-4 py-2 text-sm border border-slate-200 dark:border-navy-700 rounded-lg bg-white dark:bg-navy-900 text-navy-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-gold-500"
          />
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gold-600" />
        </div>
      ) : manuscripts.length === 0 ? (
        <div className="text-center py-20">
          <FileText className="w-12 h-12 text-slate-300 dark:text-slate-600 mx-auto mb-4" />
          <p className="text-slate-500 dark:text-slate-400">No manuscripts found</p>
        </div>
      ) : (
        <div className="space-y-3">
          {manuscripts.map((m) => (
            <Card key={m.id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-5">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <Badge variant={statusColor(m.status) as 'success' | 'navy' | 'default'}>{m.status}</Badge>
                      <span className="text-xs text-slate-400">{m.articleType}</span>
                    </div>
                    <h3 className="font-semibold text-navy-900 dark:text-white truncate">{m.title}</h3>
                    <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                      {m.correspondingAuthor.firstName} {m.correspondingAuthor.lastName} &middot; {m.correspondingAuthor.email}
                    </p>
                    {m.doi && <p className="text-xs text-slate-400 mt-1">DOI: {m.doi}</p>}
                  </div>
                  <div className="flex gap-2 flex-shrink-0">
                    {m.files[0] && (
                      <a href={m.files[0].fileUrl} target="_blank" rel="noopener noreferrer">
                        <Button variant="outline" size="sm">
                          <Eye className="w-4 h-4 mr-1" /> View
                        </Button>
                      </a>
                    )}
                    {m.status === 'ACCEPTED' && (
                      <Link href={`/editor-assistant/publish?manuscript=${m.id}`}>
                        <Button variant="gold" size="sm">
                          <BookOpen className="w-4 h-4 mr-1" /> Publish
                        </Button>
                      </Link>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {totalPages > 1 && (
        <div className="flex items-center justify-between pt-4">
          <p className="text-sm text-slate-500">Page {page} of {totalPages} &middot; {total} manuscripts</p>
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
