'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/Button';
import { Card, CardContent } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Input, Textarea } from '@/components/ui/Input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/Table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/Dialog';
import { FolderPlus, Trash2, Edit as EditIcon } from 'lucide-react';
import { toast } from 'sonner';

interface Volume {
  id: string;
  number: number;
  year: number;
  title: string | null;
  description: string | null;
  coverImage: string | null;
  isPublished: boolean;
  articles: { id: string }[];
}

interface FormData {
  number: number;
  year: number;
  title: string;
  description: string;
  coverImage: string;
  isPublished: boolean;
}

export default function AdminVolumesPage() {
  const [volumes, setVolumes] = useState<Volume[]>([]);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<Volume | null>(null);
  const [form, setForm] = useState<FormData>({
    number: 1, year: new Date().getFullYear(), title: '',
    description: '', coverImage: '', isPublished: false,
  });

  const fetchVolumes = async () => {
    try {
      const res = await fetch('/api/admin/volumes');
      if (!res.ok) {
        toast.error('Failed to fetch volumes');
        return;
      }
      const data = await res.json();
      setVolumes(Array.isArray(data) ? data : []);
    } catch {
      toast.error('Failed to fetch volumes');
    }
  };

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchVolumes();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const method = editing ? 'PUT' : 'POST';
      const url = editing ? `/api/admin/volumes/${editing.id}` : '/api/admin/volumes';
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      if (res.ok) {
        toast.success(editing ? 'Volume updated' : 'Volume created');
        setDialogOpen(false);
        setEditing(null);
        fetchVolumes();
      } else { toast.error('Failed to save'); }
    } catch { toast.error('Failed to save'); }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this volume?')) return;
    try {
      const res = await fetch(`/api/admin/volumes/${id}`, { method: 'DELETE' });
      if (res.ok) { toast.success('Deleted'); fetchVolumes(); }
    } catch { toast.error('Failed to delete'); }
  };

  const openEdit = (vol: Volume) => {
    setEditing(vol);
    setForm({
      number: vol.number, year: vol.year, title: vol.title || '',
      description: vol.description || '', coverImage: vol.coverImage || '',
      isPublished: vol.isPublished,
    });
    setDialogOpen(true);
  };

  const openNew = () => {
    setEditing(null);
    setForm({ number: volumes.length + 1, year: new Date().getFullYear(), title: '', description: '', coverImage: '', isPublished: false });
    setDialogOpen(true);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-navy-900 dark:text-white">Volumes</h1>
          <p className="text-slate-600 dark:text-slate-400 mt-1">Manage journal volumes</p>
        </div>
        <Button onClick={openNew}><FolderPlus className="w-4 h-4 mr-2" /> New Volume</Button>
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
                <TableHead className="w-32">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {volumes.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-12 text-slate-500 dark:text-slate-400">No volumes yet.</TableCell>
                </TableRow>
              ) : (
                volumes.map((vol) => (
                  <TableRow key={vol.id}>
                    <TableCell className="font-bold text-navy-900 dark:text-white">Vol. {vol.number}</TableCell>
                    <TableCell className="text-slate-600 dark:text-slate-400">{vol.year}</TableCell>
                    <TableCell className="font-medium text-navy-900 dark:text-white">{vol.title || '—'}</TableCell>
                    <TableCell className="text-slate-600 dark:text-slate-400">{vol.articles?.length || 0}</TableCell>
                    <TableCell><Badge variant={vol.isPublished ? 'success' : 'warning'}>{vol.isPublished ? 'Published' : 'Draft'}</Badge></TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <Button variant="ghost" size="icon" onClick={() => openEdit(vol)}>
                          <EditIcon className="w-4 h-4" />
                        </Button>
                        <Button variant="ghost" size="icon" onClick={() => handleDelete(vol.id)} className="text-red-600 hover:text-red-700">
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader><DialogTitle>{editing ? 'Edit Volume' : 'New Volume'}</DialogTitle></DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4 p-4">
            <div className="grid grid-cols-2 gap-4">
              <Input label="Volume Number" type="number" value={form.number} onChange={(e) => setForm({...form, number: parseInt(e.target.value) || 1})} required />
              <Input label="Year" type="number" value={form.year} onChange={(e) => setForm({...form, year: parseInt(e.target.value) || new Date().getFullYear()})} required />
            </div>
            <Input label="Title (Optional)" value={form.title} onChange={(e) => setForm({...form, title: e.target.value})} />
            <Textarea label="Description" value={form.description} onChange={(e) => setForm({...form, description: e.target.value})} rows={3} />
            <Input label="Cover Image URL" value={form.coverImage} onChange={(e) => setForm({...form, coverImage: e.target.value})} placeholder="https://..." />
            <div className="flex items-center gap-3">
              <input type="checkbox" id="volPublished" checked={form.isPublished} onChange={(e) => setForm({...form, isPublished: e.target.checked})} className="w-4 h-4 rounded border-slate-300 text-gold-600 focus:ring-gold-500" />
              <label htmlFor="volPublished" className="text-sm font-medium text-navy-900 dark:text-white">Published</label>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>Cancel</Button>
              <Button type="submit">{editing ? 'Update' : 'Create'}</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
