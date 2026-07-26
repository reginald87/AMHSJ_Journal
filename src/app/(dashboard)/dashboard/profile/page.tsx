'use client';

import { useState } from 'react';
import { useSession } from 'next-auth/react';
import { ExtendedSession } from '@/lib/auth';
import { Button } from '@/components/ui/Button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Input, Textarea } from '@/components/ui/Input';
import { toast } from 'sonner';
import { User, Save } from 'lucide-react';

export default function ProfilePage() {
  const { data: session, update } = useSession() as { data: ExtendedSession | null; update: (...args: unknown[]) => Promise<unknown> };
  const [saving, setSaving] = useState(false);

  const [form, setForm] = useState({
    firstName: '',
    lastName: '',
    affiliation: '',
    department: '',
    orcid: '',
    phone: '',
    country: '',
    bio: '',
  });

  const [initialized, setInitialized] = useState(false);

  if (session && !initialized) {
    const u = session.user as unknown as Record<string, string>;
    setForm({
      firstName: u.firstName || '',
      lastName: u.lastName || '',
      affiliation: u.affiliation || '',
      department: u.department || '',
      orcid: u.orcid || '',
      phone: u.phone || '',
      country: u.country || '',
      bio: u.bio || '',
    });
    setInitialized(true);
  }

  const handleChange = (field: string, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setSaving(true);
      const res = await fetch('/api/user/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      if (!res.ok) throw new Error('Failed');
      await update({ ...form });
      toast.success('Profile updated successfully');
    } catch {
      toast.error('Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  if (!session) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="w-8 h-8 border-4 border-gold-400 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const user = session.user as unknown as Record<string, string>;

  return (
    <div className="space-y-6 max-w-2xl">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-navy-900 dark:text-white">My Profile</h1>
          <p className="text-slate-600 dark:text-slate-400">Manage your account information</p>
        </div>
      </div>

      {/* Avatar */}
      <Card>
        <CardContent>
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 bg-navy-900 rounded-full flex items-center justify-center text-gold-400 font-bold text-xl">
              {user.firstName?.[0]}{user.lastName?.[0]}
            </div>
            <div>
              <h2 className="text-xl font-bold text-navy-900 dark:text-white">
                {user.firstName} {user.lastName}
              </h2>
              <p className="text-sm text-slate-500">{user.email}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Edit Form */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="w-5 h-5 text-gold-600" />
            Edit Profile
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input
                label="First Name"
                value={form.firstName}
                onChange={(e) => handleChange('firstName', e.target.value)}
                placeholder="Enter first name"
              />
              <Input
                label="Last Name"
                value={form.lastName}
                onChange={(e) => handleChange('lastName', e.target.value)}
                placeholder="Enter last name"
              />
            </div>

            <Input
              label="Email"
              value={user.email || ''}
              readOnly
              disabled
              hint="Email cannot be changed"
            />

            <Input
              label="Affiliation"
              value={form.affiliation}
              onChange={(e) => handleChange('affiliation', e.target.value)}
              placeholder="University or institution"
            />

            <Input
              label="Department"
              value={form.department}
              onChange={(e) => handleChange('department', e.target.value)}
              placeholder="Department name"
            />

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input
                label="ORCID"
                value={form.orcid}
                onChange={(e) => handleChange('orcid', e.target.value)}
                placeholder="0000-0000-0000-0000"
              />
              <Input
                label="Phone"
                value={form.phone}
                onChange={(e) => handleChange('phone', e.target.value)}
                placeholder="Phone number"
              />
            </div>

            <Input
              label="Country"
              value={form.country}
              onChange={(e) => handleChange('country', e.target.value)}
              placeholder="Country"
            />

            <Textarea
              label="Bio"
              value={form.bio}
              onChange={(e) => handleChange('bio', e.target.value)}
              placeholder="A brief description about yourself..."
            />

            <div className="flex justify-end pt-2">
              <Button type="submit" loading={saving}>
                <Save className="w-4 h-4" />
                Save Changes
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
