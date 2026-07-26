export default function AdminPageLoading() {
  return (
    <div className="p-6 space-y-6" aria-busy="true" aria-label="Loading page editor">
      <div className="animate-pulse space-y-4">
        <div className="h-8 w-48 bg-slate-200 dark:bg-navy-800 rounded" />
        <div className="h-12 w-full bg-slate-200 dark:bg-navy-800 rounded" />
        <div className="h-64 w-full bg-slate-200 dark:bg-navy-800 rounded" />
        <div className="flex gap-3">
          <div className="h-10 w-24 bg-slate-200 dark:bg-navy-800 rounded" />
          <div className="h-10 w-24 bg-slate-200 dark:bg-navy-800 rounded" />
        </div>
      </div>
    </div>
  );
}
