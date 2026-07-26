'use client';

import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Card, CardContent } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/Select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/Table';
import { formatDate, getStatusVariant } from '@/lib/utils';
import { toast } from 'sonner';
import { FileText, Plus, Search } from 'lucide-react';

interface Manuscript {
  id: string;
  title: string;
  articleType: string;
  status: string;
  submittedAt: string;
}

export default function AuthorManuscriptsPage() {
  const searchParams = useSearchParams();
  const [manuscripts, setManuscripts] = useState<Manuscript[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [search, setSearch] = useState('');

  useEffect(() => {
    if (searchParams.get('submitted') === 'true') {
      toast.success('Manuscript submitted successfully!');
    }
  }, [searchParams]);

  useEffect(() => {
    async function fetchManuscripts() {
      try {
        setLoading(true);
        const res = await fetch('/api/author/manuscripts');
        if (!res.ok) throw new Error('Failed to fetch');
        const data = await res.json();
        setManuscripts(Array.isArray(data) ? data : data.manuscripts || []);
      } catch {
        toast.error('Failed to load manuscripts');
      } finally {
        setLoading(false);
      }
    }
    fetchManuscripts();
  }, []);

  const filtered = manuscripts.filter((m) => {
    if (filter !== 'all' && m.status !== filter) return false;
    if (search) {
      const q = search.toLowerCase();
      if (!m.title?.toLowerCase().includes(q)) return false;
    }
    return true;
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-navy-900 dark:text-white">My Manuscripts</h1>
          <p className="text-slate-600 dark:text-slate-400">Track and manage all your submissions</p>
        </div>
        <Link href="/submit">
          <Button>
            <Plus className="w-4 h-4" />
            New Submission
          </Button>
        </Link>
      </div>

      <div className="flex gap-3 flex-wrap">
        <Select value={filter} onValueChange={setFilter}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="All Status" />
          </SelectTrigger>
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
        <div className="relative w-[250px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <Input
            placeholder="Search by title..."
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
                <TableHead>Type</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Submitted</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={5}>
                    <div className="py-12 text-center">
                      <div className="w-8 h-8 border-4 border-gold-400 border-t-transparent rounded-full animate-spin mx-auto" />
                      <p className="text-sm text-slate-500 mt-3">Loading manuscripts...</p>
                    </div>
                  </TableCell>
                </TableRow>
              ) : filtered.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5}>
                    <div className="py-12 text-center">
                      <FileText className="w-12 h-12 text-slate-300 dark:text-slate-600 mx-auto mb-3" />
                      <p className="font-medium text-navy-900 dark:text-white">No manuscripts found</p>
                      <p className="text-sm text-slate-500 mt-1">
                        {manuscripts.length === 0 ? 'Start your first submission' : 'Try adjusting your filters'}
                      </p>
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                filtered.map((m) => (
                  <TableRow key={m.id}>
                    <TableCell>
                      <Link
                        href={`/dashboard/manuscripts/${m.id}`}
                        className="font-mono text-sm text-navy-700 dark:text-navy-300 hover:text-gold-600 dark:hover:text-gold-400 transition-colors"
                      >
                        {m.id.slice(0, 8)}
                      </Link>
                    </TableCell>
                    <TableCell>
                      <Link
                        href={`/dashboard/manuscripts/${m.id}`}
                        className="font-medium text-navy-900 dark:text-white hover:text-gold-600 dark:hover:text-gold-400 transition-colors max-w-xs block truncate"
                      >
                        {m.title}
                      </Link>
                    </TableCell>
                    <TableCell className="text-sm text-slate-600 dark:text-slate-400 capitalize">
                      {m.articleType?.replace(/_/g, ' ').toLowerCase()}
                    </TableCell>
                    <TableCell>
                      <Badge variant={getStatusVariant(m.status)}>
                        {m.status?.replace(/_/g, ' ')}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-sm text-slate-500">
                      {m.submittedAt ? formatDate(m.submittedAt) : '—'}
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
