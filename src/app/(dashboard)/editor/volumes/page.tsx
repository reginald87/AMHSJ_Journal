'use client';

import { useState, useEffect } from 'react';
import { Badge } from '@/components/ui/Badge';
import { Card, CardContent } from '@/components/ui/Card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/Table';

interface Volume {
  id: string;
  number: number;
  year: number;
  title: string | null;
  isPublished: boolean;
  articles: { id: string }[];
}

export default function EditorVolumesPage() {
  const [volumes, setVolumes] = useState<Volume[]>([]);

  useEffect(() => {
    fetch('/api/admin/volumes').then(r => r.json()).then(d => setVolumes(Array.isArray(d) ? d : [])).catch(() => {});
  }, []);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-navy-900 dark:text-white">Volumes</h1>
        <p className="text-slate-600 dark:text-slate-400">Journal volumes overview</p>
      </div>
      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Volume</TableHead>
                <TableHead>Year</TableHead>
                <TableHead>Title</TableHead>
                <TableHead>Articles</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {volumes.length === 0 ? (
                <TableRow><TableCell colSpan={5} className="text-center py-12 text-slate-500">No volumes yet</TableCell></TableRow>
              ) : volumes.map((v) => (
                <TableRow key={v.id}>
                  <TableCell className="font-bold text-navy-900 dark:text-white">Vol. {v.number}</TableCell>
                  <TableCell className="text-slate-600 dark:text-slate-400">{v.year}</TableCell>
                  <TableCell className="font-medium text-navy-900 dark:text-white">{v.title || '—'}</TableCell>
                  <TableCell className="text-slate-600 dark:text-slate-400">{v.articles?.length || 0}</TableCell>
                  <TableCell><Badge variant={v.isPublished ? 'success' : 'warning'}>{v.isPublished ? 'Published' : 'Draft'}</Badge></TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
