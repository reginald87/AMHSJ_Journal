'use client';

import { useEffect } from 'react';

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('Unhandled error:', error);
  }, [error]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-navy-950 px-4">
      <div className="max-w-md w-full text-center space-y-6">
        <div className="text-6xl font-bold text-gold-600">500</div>
        <h1 className="text-2xl font-semibold text-slate-900 dark:text-white">
          Something went wrong
        </h1>
        <p className="text-slate-600 dark:text-slate-400">
          An unexpected error occurred. Please try again or contact support if the problem persists.
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
