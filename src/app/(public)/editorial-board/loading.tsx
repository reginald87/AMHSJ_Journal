export default function EditorialBoardLoading() {
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-navy-950" aria-busy="true" aria-label="Loading editorial board">
      {/* Hero skeleton */}
      <section className="gradient-navy relative overflow-hidden">
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 sm:py-32">
          <div className="max-w-3xl animate-pulse">
            <div className="h-8 w-56 bg-gold-500/20 rounded-full mb-6" />
            <div className="h-12 w-3/4 bg-white/10 rounded mb-6" />
            <div className="h-6 w-full bg-white/10 rounded mb-3" />
            <div className="h-6 w-5/6 bg-white/10 rounded mb-8" />
            <div className="flex flex-wrap gap-8">
              <div className="h-5 w-40 bg-white/10 rounded" />
              <div className="h-5 w-32 bg-white/10 rounded" />
              <div className="h-5 w-28 bg-white/10 rounded" />
            </div>
          </div>
        </div>
      </section>

      {/* Board sections skeleton */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 space-y-16">
        {[0, 1, 2, 3].map((section) => (
          <div key={section}>
            <div className="flex items-center gap-3 mb-8 animate-pulse">
              <div className="w-12 h-12 rounded-xl bg-slate-200 dark:bg-navy-800" />
              <div>
                <div className="h-6 w-48 bg-slate-200 dark:bg-navy-800 rounded mb-2" />
                <div className="h-4 w-24 bg-slate-200 dark:bg-navy-800 rounded" />
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[0, 1, 2].map((card) => (
                <div
                  key={card}
                  className="bg-white dark:bg-navy-900 rounded-xl border border-slate-200 dark:border-navy-800 p-6 animate-pulse"
                >
                  <div className="flex items-start gap-4">
                    <div className="w-16 h-16 rounded-full bg-slate-200 dark:bg-navy-800" />
                    <div className="flex-1 space-y-2">
                      <div className="h-4 w-32 bg-slate-200 dark:bg-navy-800 rounded" />
                      <div className="h-3 w-40 bg-slate-200 dark:bg-navy-800 rounded" />
                      <div className="h-3 w-28 bg-slate-200 dark:bg-navy-800 rounded" />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
