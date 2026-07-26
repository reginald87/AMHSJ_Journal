'use client';

import { useEffect } from 'react';

export default function DashboardError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('Dashboard error:', error);
  }, [error]);

  return (
    <div className="min-h-[60vh] flex items-center justify-center px-4">
      <div className="max-w-md w-full text-center space-y-6">
        <div className="text-5xl font-bold text-gold-600">Error</div>
        <h1 className="text-xl font-semibold text-slate-900 dark:text-white">
          Dashboard Error
        </h1>
        <p className="text-slate-600 dark:text-slate-400">
          An error occurred in the dashboard. Please try again or return to the dashboard home.
        </p>
        <div className="flex items-center justify-center gap-4">
          <button
            onClick={reset}
            className="inline-flex items-center px-6 py-3 bg-gold-600 text-white font-medium rounded-lg hover:bg-gold-700 transition-colors"
          >
            Try Again
          </button>
          <a
            href="/dashboard"
            className="inline-flex items-center px-6 py-3 border border-slate-300 dark:border-navy-600 text-slate-700 dark:text-slate-300 font-medium rounded-lg hover:bg-slate-50 dark:hover:bg-navy-800 transition-colors"
          >
            Dashboard Home
          </a>
        </div>
      </div>
    </div>
  );
}
