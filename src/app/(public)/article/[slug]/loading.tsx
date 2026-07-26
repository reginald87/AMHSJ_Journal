export default function ArticleLoading() {
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-navy-950" aria-busy="true" aria-label="Loading article">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="animate-pulse space-y-6">
          <div className="h-4 w-48 bg-slate-200 dark:bg-navy-800 rounded" />
          <div className="h-8 w-3/4 bg-slate-200 dark:bg-navy-800 rounded" />
          <div className="h-5 w-1/2 bg-slate-200 dark:bg-navy-800 rounded" />
          <div className="flex gap-3">
            <div className="h-8 w-24 bg-slate-200 dark:bg-navy-800 rounded-full" />
            <div className="h-8 w-32 bg-slate-200 dark:bg-navy-800 rounded-full" />
          </div>
          <div className="border border-slate-200 dark:border-navy-800 rounded-xl p-6 space-y-3">
            <div className="h-5 w-20 bg-slate-200 dark:bg-navy-800 rounded" />
            <div className="h-4 w-full bg-slate-200 dark:bg-navy-800 rounded" />
            <div className="h-4 w-full bg-slate-200 dark:bg-navy-800 rounded" />
            <div className="h-4 w-3/4 bg-slate-200 dark:bg-navy-800 rounded" />
          </div>
        </div>
      </div>
    </div>
  );
}
