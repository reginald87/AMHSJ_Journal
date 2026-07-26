'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/Table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/Select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/Dialog';
import { formatDate } from '@/lib/utils';
import { toast } from 'sonner';
import { Edit as EditIcon, Trash2, Plus } from 'lucide-react';

interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  middleName?: string;
  affiliation?: string;
  department?: string;
  orcid?: string;
  phone?: string;
  country?: string;
  bio?: string;
  role: string;
  status: string;
  createdAt: string;
}

interface EditForm {
  firstName: string;
  lastName: string;
  email: string;
  affiliation: string;
  department: string;
  orcid: string;
  phone: string;
  country: string;
  bio: string;
}

export default function AdminUsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [search, setSearch] = useState('');

  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [editUser, setEditUser] = useState<User | null>(null);
  const [editForm, setEditForm] = useState<EditForm>({
    firstName: '', lastName: '', email: '',
    affiliation: '', department: '', orcid: '',
    phone: '', country: '', bio: '',
  });
  const [editSaving, setEditSaving] = useState(false);

  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deleteUser, setDeleteUser] = useState<User | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [createForm, setCreateForm] = useState({
    firstName: '', lastName: '', email: '', password: '',
    role: 'AUTHOR', affiliation: '', department: '', orcid: '', phone: '', country: '',
  });
  const [createSaving, setCreateSaving] = useState(false);

  const fetchUsers = async () => {
    try {
      const data = await fetch('/api/admin/users').then(r => r.json()).catch(() => ({ users: [] }));
      setUsers(data.users || (Array.isArray(data) ? data : []));
    } catch { console.error('Failed to fetch users'); }
    finally { setLoading(false); }
  };

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchUsers();
  }, []);

  const handleRoleChange = async (userId: string, newRole: string) => {
    try {
      const res = await fetch(`/api/admin/users/${userId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ role: newRole }),
      });
      if (res.ok) { toast.success('Role updated'); fetchUsers(); }
      else { toast.error('Failed to update role'); }
    } catch { toast.error('Failed to update role'); }
  };

  const openEdit = (user: User) => {
    setEditUser(user);
    setEditForm({
      firstName: user.firstName || '',
      lastName: user.lastName || '',
      email: user.email || '',
      affiliation: user.affiliation || '',
      department: user.department || '',
      orcid: user.orcid || '',
      phone: user.phone || '',
      country: user.country || '',
      bio: user.bio || '',
    });
    setEditDialogOpen(true);
  };

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editUser) return;
    setEditSaving(true);
    try {
      const res = await fetch(`/api/admin/users/${editUser.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editForm),
      });
      if (res.ok) {
        toast.success('User updated');
        setEditDialogOpen(false);
        fetchUsers();
      } else {
        toast.error('Failed to update user');
      }
    } catch {
      toast.error('Failed to update user');
    } finally {
      setEditSaving(false);
    }
  };

  const confirmDelete = (user: User) => {
    setDeleteUser(user);
    setDeleteDialogOpen(true);
  };

  const handleDelete = async () => {
    if (!deleteUser) return;
    setDeleteLoading(true);
    try {
      const res = await fetch(`/api/admin/users/${deleteUser.id}`, { method: 'DELETE' });
      if (res.ok) {
        toast.success('User deleted');
        setDeleteDialogOpen(false);
        fetchUsers();
      } else {
        toast.error('Failed to delete user');
      }
    } catch {
      toast.error('Failed to delete user');
    } finally {
      setDeleteLoading(false);
    }
  };

  const filtered = users.filter(u => {
    if (filter !== 'all' && u.role !== filter) return false;
    if (search) {
      const q = search.toLowerCase();
      if (!u.firstName?.toLowerCase().includes(q) && !u.lastName?.toLowerCase().includes(q) && !u.email?.toLowerCase().includes(q)) return false;
    }
    return true;
  });

  const handleCreateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setCreateSaving(true);
    try {
      const res = await fetch('/api/admin/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(createForm),
      });
      if (res.ok) {
        toast.success('User created successfully');
        setCreateDialogOpen(false);
        setCreateForm({ firstName: '', lastName: '', email: '', password: '', role: 'AUTHOR', affiliation: '', department: '', orcid: '', phone: '', country: '' });
        fetchUsers();
      } else {
        const err = await res.json().catch(() => ({}));
        toast.error(err.error || 'Failed to create user');
      }
    } catch {
      toast.error('Failed to create user');
    } finally {
      setCreateSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-navy-900 dark:text-white">User Management</h1>
          <p className="text-slate-600 dark:text-slate-400 mt-1">Manage user accounts and roles</p>
        </div>
        <div className="flex gap-2 flex-wrap">
          <Button onClick={() => setCreateDialogOpen(true)}>
            <Plus className="w-4 h-4 mr-2" /> Create User
          </Button>
          <Select value={filter} onValueChange={setFilter}>
            <SelectTrigger className="w-[180px]"><SelectValue placeholder="All Roles" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Roles</SelectItem>
              <SelectItem value="AUTHOR">Authors</SelectItem>
              <SelectItem value="REVIEWER">Reviewers</SelectItem>
              <SelectItem value="EDITOR">Editors</SelectItem>
              <SelectItem value="ADMIN">Admins</SelectItem>
            </SelectContent>
          </Select>
          <Input placeholder="Search users..." value={search} onChange={(e) => setSearch(e.target.value)} className="w-[250px]" />
        </div>
      </div>

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>Affiliation</TableHead>
                <TableHead>Country</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Joined</TableHead>
                <TableHead className="w-24">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={8} className="text-center py-12 text-slate-500">Loading...</TableCell>
                </TableRow>
              ) : filtered.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} className="text-center py-12 text-slate-500 dark:text-slate-400">No users found</TableCell>
                </TableRow>
              ) : (
                filtered.map((u) => (
                  <TableRow key={u.id}>
                    <TableCell className="font-medium text-navy-900 dark:text-white">{u.firstName} {u.lastName}</TableCell>
                    <TableCell className="text-sm text-slate-600 dark:text-slate-400">{u.email}</TableCell>
                    <TableCell>
                      <Select value={u.role} onValueChange={(v) => handleRoleChange(u.id, v)}>
                        <SelectTrigger className="w-[140px]"><SelectValue placeholder={u.role} /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="AUTHOR">Author</SelectItem>
                          <SelectItem value="REVIEWER">Reviewer</SelectItem>
                          <SelectItem value="EDITOR">Editor</SelectItem>
                          <SelectItem value="ADMIN">Admin</SelectItem>
                        </SelectContent>
                      </Select>
                    </TableCell>
                    <TableCell className="text-sm text-slate-600 dark:text-slate-400">{u.affiliation || '—'}</TableCell>
                    <TableCell className="text-sm text-slate-600 dark:text-slate-400">{u.country || '—'}</TableCell>
                    <TableCell>
                      <Badge variant={u.status === 'ACTIVE' ? 'success' : u.status === 'PENDING_VERIFICATION' ? 'warning' : 'danger'}>
                        {u.status === 'ACTIVE' ? 'Active' : u.status === 'PENDING_VERIFICATION' ? 'Pending' : 'Suspended'}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-sm text-slate-500">{formatDate(u.createdAt)}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <Button variant="ghost" size="icon" onClick={() => openEdit(u)}>
                          <EditIcon className="w-4 h-4" />
                        </Button>
                        <Button variant="ghost" size="icon" onClick={() => confirmDelete(u)} className="text-red-600 hover:text-red-700">
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

      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit User</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleEditSubmit} className="space-y-4 p-4">
            <div className="grid grid-cols-2 gap-4">
              <Input label="First Name" value={editForm.firstName} onChange={(e) => setEditForm({...editForm, firstName: e.target.value})} required />
              <Input label="Last Name" value={editForm.lastName} onChange={(e) => setEditForm({...editForm, lastName: e.target.value})} required />
              <Input label="Email" type="email" value={editForm.email} onChange={(e) => setEditForm({...editForm, email: e.target.value})} required />
              <Input label="Affiliation" value={editForm.affiliation} onChange={(e) => setEditForm({...editForm, affiliation: e.target.value})} />
              <Input label="Department" value={editForm.department} onChange={(e) => setEditForm({...editForm, department: e.target.value})} />
              <Input label="ORCID" value={editForm.orcid} onChange={(e) => setEditForm({...editForm, orcid: e.target.value})} placeholder="0000-0000-0000-0000" />
              <Input label="Phone" value={editForm.phone} onChange={(e) => setEditForm({...editForm, phone: e.target.value})} />
              <Input label="Country" value={editForm.country} onChange={(e) => setEditForm({...editForm, country: e.target.value})} />
            </div>
            <Input label="Bio" value={editForm.bio} onChange={(e) => setEditForm({...editForm, bio: e.target.value})} />
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setEditDialogOpen(false)}>Cancel</Button>
              <Button type="submit" loading={editSaving}>Save Changes</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Delete User</DialogTitle>
          </DialogHeader>
          <div className="p-4">
            <p className="text-sm text-slate-600 dark:text-slate-400">
              Are you sure you want to delete <span className="font-medium text-navy-900 dark:text-white">{deleteUser?.firstName} {deleteUser?.lastName}</span>? This action cannot be undone.
            </p>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteDialogOpen(false)} disabled={deleteLoading}>Cancel</Button>
            <Button variant="destructive" onClick={handleDelete} loading={deleteLoading}>Delete</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Create New User</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleCreateSubmit} className="space-y-4 p-4">
            <div className="grid grid-cols-2 gap-4">
              <Input label="First Name" value={createForm.firstName} onChange={(e) => setCreateForm({...createForm, firstName: e.target.value})} required />
              <Input label="Last Name" value={createForm.lastName} onChange={(e) => setCreateForm({...createForm, lastName: e.target.value})} required />
              <Input label="Email" type="email" value={createForm.email} onChange={(e) => setCreateForm({...createForm, email: e.target.value})} required />
              <Input label="Password" type="password" value={createForm.password} onChange={(e) => setCreateForm({...createForm, password: e.target.value})} required minLength={6} placeholder="Min 6 characters" />
              <div>
                <label className="block text-sm font-medium text-navy-900 dark:text-slate-200 mb-1">Role</label>
                <Select value={createForm.role} onValueChange={(v) => setCreateForm({...createForm, role: v})}>
                  <SelectTrigger><SelectValue placeholder="Role" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="AUTHOR">Author</SelectItem>
                    <SelectItem value="REVIEWER">Reviewer</SelectItem>
                    <SelectItem value="EDITOR">Editor</SelectItem>
                    <SelectItem value="EDITOR_IN_CHIEF">Editor-in-Chief</SelectItem>
                    <SelectItem value="DEPUTY_EDITOR_IN_CHIEF">Deputy Editor-in-Chief</SelectItem>
                    <SelectItem value="ASSOCIATE_EDITOR">Associate Editor</SelectItem>
                    <SelectItem value="ADMIN">Admin</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <Input label="Affiliation" value={createForm.affiliation} onChange={(e) => setCreateForm({...createForm, affiliation: e.target.value})} />
              <Input label="Department" value={createForm.department} onChange={(e) => setCreateForm({...createForm, department: e.target.value})} />
              <Input label="ORCID" value={createForm.orcid} onChange={(e) => setCreateForm({...createForm, orcid: e.target.value})} placeholder="0000-0000-0000-0000" />
              <Input label="Phone" value={createForm.phone} onChange={(e) => setCreateForm({...createForm, phone: e.target.value})} />
              <Input label="Country" value={createForm.country} onChange={(e) => setCreateForm({...createForm, country: e.target.value})} />
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setCreateDialogOpen(false)}>Cancel</Button>
              <Button type="submit" loading={createSaving}>Create User</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
