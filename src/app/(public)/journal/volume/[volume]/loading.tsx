export default function VolumeLoading() {
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-navy-950" aria-busy="true" aria-label="Loading volume">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="animate-pulse space-y-8">
          <div className="space-y-3">
            <div className="h-4 w-40 bg-slate-200 dark:bg-navy-800 rounded" />
            <div className="h-8 w-64 bg-slate-200 dark:bg-navy-800 rounded" />
            <div className="h-4 w-32 bg-slate-200 dark:bg-navy-800 rounded" />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[0, 1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="bg-white dark:bg-navy-900 rounded-xl border border-slate-200 dark:border-navy-800 p-6 animate-pulse">
                <div className="h-4 w-20 bg-slate-200 dark:bg-navy-800 rounded-full mb-3" />
                <div className="h-5 w-3/4 bg-slate-200 dark:bg-navy-800 rounded mb-2" />
                <div className="h-4 w-1/2 bg-slate-200 dark:bg-navy-800 rounded mb-4" />
                <div className="flex gap-2">
                  <div className="h-6 w-16 bg-slate-200 dark:bg-navy-800 rounded-full" />
                  <div className="h-6 w-20 bg-slate-200 dark:bg-navy-800 rounded-full" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
