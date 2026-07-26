'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/Button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/Dialog';
import { Trash2 } from 'lucide-react';
import { toast } from 'sonner';

export function DeletePageButton({ pageId, pageSlug }: { pageId: string; pageSlug: string }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleDelete = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/pages/${pageId}`, { method: 'DELETE' });
      if (res.ok) {
        toast.success('Page deleted');
        setOpen(false);
        router.refresh();
      } else {
        toast.error('Failed to delete page');
      }
    } catch {
      toast.error('Failed to delete page');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Button
        variant="ghost"
        size="icon"
        onClick={() => setOpen(true)}
        className="text-red-600 hover:text-red-700"
      >
        <Trash2 className="w-4 h-4" />
      </Button>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Delete Page</DialogTitle>
          </DialogHeader>
          <div className="p-4">
            <p className="text-sm text-slate-600 dark:text-slate-400">
              Are you sure you want to delete the page <span className="font-mono font-medium text-navy-900 dark:text-white">{pageSlug}</span>? This action cannot be undone.
            </p>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)} disabled={loading}>Cancel</Button>
            <Button variant="destructive" onClick={handleDelete} loading={loading}>Delete</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
