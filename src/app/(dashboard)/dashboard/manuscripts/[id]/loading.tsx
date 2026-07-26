export default function ManuscriptDetailLoading() {
  return (
    <div className="p-6 space-y-6" aria-busy="true" aria-label="Loading manuscript">
      <div className="animate-pulse space-y-4">
        <div className="h-4 w-32 bg-slate-200 dark:bg-navy-800 rounded" />
        <div className="h-8 w-2/3 bg-slate-200 dark:bg-navy-800 rounded" />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="h-24 bg-slate-200 dark:bg-navy-800 rounded-xl" />
          <div className="h-24 bg-slate-200 dark:bg-navy-800 rounded-xl" />
          <div className="h-24 bg-slate-200 dark:bg-navy-800 rounded-xl" />
        </div>
        <div className="h-48 bg-slate-200 dark:bg-navy-800 rounded-xl" />
      </div>
    </div>
  );
}
