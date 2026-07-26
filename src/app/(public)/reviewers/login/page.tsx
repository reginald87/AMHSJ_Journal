'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { LogIn } from 'lucide-react';

export default function ReviewerLoginPage() {
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    await new Promise((r) => setTimeout(r, 1000));
    setLoading(false);
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-navy-950 flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <span className="inline-flex items-center gap-2 px-4 py-2 bg-gold-500/20 text-gold-400 rounded-full text-sm font-medium mb-4">
            <LogIn className="w-4 h-4" />
            Reviewer Access
          </span>
          <h1 className="text-3xl font-bold text-navy-900 dark:text-white mb-2">Reviewer Login</h1>
          <p className="text-slate-600 dark:text-slate-400 text-sm">
            Access your reviewer dashboard to manage assigned reviews.
          </p>
        </div>

        <div className="bg-white dark:bg-navy-900 rounded-xl shadow-sm border border-slate-200 dark:border-navy-800 p-8">
          <form onSubmit={handleSubmit} className="space-y-5">
            <Input label="Email Address" name="email" type="email" placeholder="you@institution.edu" required />
            <Input label="Password" name="password" type="password" placeholder="Enter your password" required />
            <Button type="submit" variant="gold" size="lg" className="w-full" disabled={loading}>
              {loading ? 'Signing in...' : 'Sign In'}
            </Button>
          </form>

          <div className="mt-6 pt-6 border-t border-slate-200 dark:border-navy-800 text-center text-sm text-slate-600 dark:text-slate-400">
            <p className="mb-2">Not yet a reviewer?</p>
            <Link href="/reviewers" className="text-navy-700 dark:text-gold-400 font-semibold hover:underline">
              Apply to join our review panel
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
