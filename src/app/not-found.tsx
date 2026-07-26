import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-navy-950 px-4">
      <div className="max-w-md w-full text-center space-y-6">
        <div className="text-6xl font-bold text-gold-600">404</div>
        <h1 className="text-2xl font-semibold text-slate-900 dark:text-white">
          Page not found
        </h1>
        <p className="text-slate-600 dark:text-slate-400">
          The page you are looking for does not exist or has been moved.
        </p>
        <Link
          href="/"
          className="inline-flex items-center px-6 py-3 bg-gold-600 text-white font-medium rounded-lg hover:bg-gold-700 transition-colors"
        >
          Back to Home
        </Link>
      </div>
    </div>
  );
}
