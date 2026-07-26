'use client';

import { useEffect } from 'react';

export default function PublicError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('Public page error:', error);
  }, [error]);

  return (
    <div className="min-h-[60vh] flex items-center justify-center px-4">
      <div className="max-w-md w-full text-center space-y-6">
        <div className="text-5xl font-bold text-gold-600">Error</div>
        <h1 className="text-xl font-semibold text-slate-900 dark:text-white">
          Something went wrong
        </h1>
        <p className="text-slate-600 dark:text-slate-400">
          An error occurred while loading this page. Please try again.
        </p>
        <button
          onClick={reset}
          className="inline-flex items-center px-6 py-3 bg-gold-600 text-white font-medium rounded-lg hover:bg-gold-700 transition-colors"
        >
          Try Again
        </button>
      </div>
    </div>
  );
}
