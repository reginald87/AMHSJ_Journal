'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/Button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/Dialog';
import { Input } from '@/components/ui/Input';
import { Plus } from 'lucide-react';

export function CreatePageButton() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [slug, setSlug] = useState('');

  const handleCreate = () => {
    const trimmed = slug.trim().toLowerCase().replace(/[^a-z0-9-]/g, '-').replace(/-+/g, '-');
    if (trimmed) {
      router.push(`/admin/pages/${trimmed}`);
    }
  };

  return (
    <>
      <Button onClick={() => setOpen(true)}>
        <Plus className="w-4 h-4 mr-2" /> New Page
      </Button>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Create New Page</DialogTitle>
          </DialogHeader>
          <div className="p-4 space-y-4">
            <Input
              label="Page Slug (URL)"
              value={slug}
              onChange={(e) => setSlug(e.target.value)}
              placeholder="e.g. about, guidelines, faq"
              onKeyDown={(e) => { if (e.key === 'Enter') handleCreate(); }}
            />
            <p className="text-xs text-slate-500 dark:text-slate-400">
              The slug determines the URL. You&apos;ll add the title and content on the next screen.
            </p>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
            <Button onClick={handleCreate} disabled={!slug.trim()}>Create</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
