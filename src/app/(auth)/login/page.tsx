import { Suspense } from 'react';
import { LoginPageContent } from './LoginPageContent';

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-slate-50 dark:bg-navy-950 flex items-center justify-center py-12 px-4">
      <div className="w-8 h-8 border-4 border-gold-400 border-t-transparent rounded-full animate-spin" />
    </div>}>
      <LoginPageContent />
    </Suspense>
  );
}