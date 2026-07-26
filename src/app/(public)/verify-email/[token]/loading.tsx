export default function VerifyEmailLoading() {
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-navy-950 flex items-center justify-center" aria-busy="true" aria-label="Loading">
      <div className="animate-pulse w-full max-w-md space-y-4 px-4 text-center">
        <div className="w-16 h-16 bg-slate-200 dark:bg-navy-800 rounded-full mx-auto" />
        <div className="h-6 w-48 bg-slate-200 dark:bg-navy-800 rounded mx-auto" />
        <div className="h-4 w-64 bg-slate-200 dark:bg-navy-800 rounded mx-auto" />
      </div>
    </div>
  );
}
