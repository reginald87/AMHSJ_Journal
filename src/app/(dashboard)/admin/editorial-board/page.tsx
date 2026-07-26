'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/Button';
import { Card, CardContent } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Input } from '@/components/ui/Input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/Table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/Dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/Select';
import { Trash2, Edit as EditIcon, Plus } from 'lucide-react';
import { toast } from 'sonner';

interface Editor {
  id: string;
  user?: {
    firstName: string;
    lastName: string;
    middleName?: string;
    email: string;
    affiliation?: string;
    department?: string;
    orcid?: string;
    bio?: string;
  };
  role: string;
  isActive: boolean;
}

interface FormData {
  firstName: string;
  lastName: string;
  middleName: string;
  email: string;
  affiliation: string;
  department: string;
  orcid: string;
  bio: string;
  role: string;
  isActive: boolean;
  password: string;
}

export default function AdminEditorialBoardPage() {
  const [editors, setEditors] = useState<Editor[]>([]);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<Editor | null>(null);
  const [form, setForm] = useState<FormData>({
    firstName: '', lastName: '', middleName: '', email: '',
    affiliation: '', department: '', orcid: '', bio: '',
    role: 'EDITOR', isActive: true, password: '',
  });

  const fetchEditors = async () => {
    try {
      const res = await fetch('/api/admin/editorial-board');
      if (!res.ok) {
        toast.error('Failed to fetch editors');
        return;
      }
      const data = await res.json();
      setEditors(Array.isArray(data) ? data : (data.editors || []));
    } catch {
      toast.error('Failed to fetch editors');
    }
  };

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchEditors();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const method = editing ? 'PUT' : 'POST';
      const url = editing ? `/api/admin/editorial-board/${editing.id}` : '/api/admin/editorial-board';
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      if (res.ok) {
        toast.success(editing ? 'Editor updated' : 'Editor added');
        setDialogOpen(false);
        setEditing(null);
        setForm({ firstName: '', lastName: '', middleName: '', email: '', affiliation: '', department: '', orcid: '', bio: '', role: 'EDITOR', isActive: true, password: '' });
        fetchEditors();
      } else {
        toast.error('Failed to save');
      }
    } catch { toast.error('Failed to save'); }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Remove this editor?')) return;
    try {
      const res = await fetch(`/api/admin/editorial-board/${id}`, { method: 'DELETE' });
      if (res.ok) { toast.success('Removed'); fetchEditors(); }
    } catch { toast.error('Failed to remove'); }
  };

  const openEdit = (editor: Editor) => {
    setEditing(editor);
    setForm({
      firstName: editor.user?.firstName || '', lastName: editor.user?.lastName || '',
      middleName: editor.user?.middleName || '', email: editor.user?.email || '',
      affiliation: editor.user?.affiliation || '', department: editor.user?.department || '',
      orcid: editor.user?.orcid || '', bio: editor.user?.bio || '', role: editor.role, isActive: editor.isActive, password: '',
    });
    setDialogOpen(true);
  };

  const openNew = () => {
    setEditing(null);
    setForm({ firstName: '', lastName: '', middleName: '', email: '', affiliation: '', department: '', orcid: '', bio: '', role: 'EDITOR', isActive: true, password: '' });
    setDialogOpen(true);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-navy-900 dark:text-white">Editorial Board</h1>
          <p className="text-slate-600 dark:text-slate-400 mt-1">Manage editorial board members and roles</p>
        </div>
        <Button onClick={openNew}><Plus className="w-4 h-4 mr-2" /> Add Editor</Button>
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
                <TableHead className="w-32">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {editors.filter(e => e.role !== 'INTERNATIONAL_EDITOR').length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-12 text-slate-500 dark:text-slate-400">No editors yet.</TableCell>
                </TableRow>
              ) : (
                editors.filter(e => e.role !== 'INTERNATIONAL_EDITOR').map((editor) => (
                  <TableRow key={editor.id}>
                    <TableCell className="font-medium text-navy-900 dark:text-white">
                      {editor.user?.firstName} {editor.user?.lastName}
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className="capitalize">{editor.role?.replace(/_/g, ' ').toLowerCase()}</Badge>
                    </TableCell>
                    <TableCell className="text-sm text-slate-600 dark:text-slate-400">{editor.user?.affiliation || '—'}</TableCell>
                    <TableCell>
                      <Badge variant={editor.isActive ? 'success' : 'outline'}>{editor.isActive ? 'Active' : 'Inactive'}</Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <Button variant="ghost" size="icon" onClick={() => openEdit(editor)}>
                          <EditIcon className="w-4 h-4" />
                        </Button>
                        <Button variant="ghost" size="icon" onClick={() => handleDelete(editor.id)} className="text-red-600 hover:text-red-700">
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

      {editors.filter(e => e.role === 'INTERNATIONAL_EDITOR').length > 0 && (
        <Card>
          <CardContent className="pt-6">
            <h2 className="text-lg font-semibold text-navy-900 dark:text-white mb-4">International Editorial Advisory Board</h2>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Affiliation</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="w-32">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {editors.filter(e => e.role === 'INTERNATIONAL_EDITOR').map((editor) => (
                  <TableRow key={editor.id}>
                    <TableCell className="font-medium text-navy-900 dark:text-white">
                      {editor.user?.firstName} {editor.user?.lastName}
                    </TableCell>
                    <TableCell className="text-sm text-slate-600 dark:text-slate-400">{editor.user?.affiliation || '—'}</TableCell>
                    <TableCell>
                      <Badge variant={editor.isActive ? 'success' : 'outline'}>{editor.isActive ? 'Active' : 'Inactive'}</Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <Button variant="ghost" size="icon" onClick={() => openEdit(editor)}>
                          <EditIcon className="w-4 h-4" />
                        </Button>
                        <Button variant="ghost" size="icon" onClick={() => handleDelete(editor.id)} className="text-red-600 hover:text-red-700">
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editing ? 'Edit Editor' : 'Add New Editor'}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4 p-4">
            <div className="grid grid-cols-2 gap-4">
              <Input label="First Name" value={form.firstName} onChange={(e) => setForm({...form, firstName: e.target.value})} required />
              <Input label="Last Name" value={form.lastName} onChange={(e) => setForm({...form, lastName: e.target.value})} required />
              <Input label="Middle Name" value={form.middleName} onChange={(e) => setForm({...form, middleName: e.target.value})} />
              <Input label="Email" type="email" value={form.email} onChange={(e) => setForm({...form, email: e.target.value})} required />
              <Input label="Affiliation" value={form.affiliation} onChange={(e) => setForm({...form, affiliation: e.target.value})} required />
              <Input label="Department" value={form.department} onChange={(e) => setForm({...form, department: e.target.value})} />
              <Input label="ORCID" value={form.orcid} onChange={(e) => setForm({...form, orcid: e.target.value})} placeholder="0000-0000-0000-0000" />
              <div className="col-span-2">
                <label className="block text-sm font-medium text-navy-900 dark:text-white mb-1">Biography</label>
                <textarea value={form.bio} onChange={(e) => setForm({...form, bio: e.target.value})} rows={3} className="w-full rounded-lg border border-slate-300 dark:border-navy-700 bg-white dark:bg-navy-800 px-3 py-2 text-sm text-navy-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-gold-500" placeholder="Brief biography for public display" />
              </div>
              <Select value={form.role} onValueChange={(v) => setForm({...form, role: v})}>
                <SelectTrigger><SelectValue placeholder="Role" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="EDITOR_IN_CHIEF">Editor-in-Chief</SelectItem>
                  <SelectItem value="DEPUTY_EDITOR_IN_CHIEF">Deputy Editor-in-Chief</SelectItem>
                  <SelectItem value="ASSOCIATE_EDITOR">Associate Editor</SelectItem>
                  <SelectItem value="EDITOR">Editor</SelectItem>
                  <SelectItem value="INTERNATIONAL_EDITOR">International Editor</SelectItem>
                  <SelectItem value="REVIEWER">Reviewer</SelectItem>
                </SelectContent>
              </Select>
              <Input label="Password" type="password" value={form.password} onChange={(e) => setForm({...form, password: e.target.value})} placeholder={editing ? 'Leave blank to keep current' : 'Required for new editors'} required={!editing} />
            </div>
            <div className="flex items-center gap-3">
              <input type="checkbox" id="editorActive" checked={form.isActive} onChange={(e) => setForm({...form, isActive: e.target.checked})} className="w-4 h-4 rounded border-slate-300 text-gold-600 focus:ring-gold-500" />
              <label htmlFor="editorActive" className="text-sm font-medium text-navy-900 dark:text-white">Active</label>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>Cancel</Button>
              <Button type="submit">{editing ? 'Update' : 'Add'}</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
