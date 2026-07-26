export default function ResetPasswordLoading() {
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-navy-950 flex items-center justify-center" aria-busy="true" aria-label="Loading">
      <div className="animate-pulse w-full max-w-md space-y-4 px-4">
        <div className="h-8 w-48 bg-slate-200 dark:bg-navy-800 rounded mx-auto" />
        <div className="h-4 w-64 bg-slate-200 dark:bg-navy-800 rounded mx-auto" />
        <div className="h-12 w-full bg-slate-200 dark:bg-navy-800 rounded" />
        <div className="h-12 w-full bg-slate-200 dark:bg-navy-800 rounded" />
        <div className="h-12 w-full bg-gold-200 dark:bg-gold-800 rounded" />
      </div>
    </div>
  );
}
