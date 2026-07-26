'use client';

import { SessionProvider } from 'next-auth/react';
import { ThemeProvider } from 'next-themes';
import { ReactNode } from 'react';
import { Toaster } from 'sonner';

export function Providers({ children }: { children: ReactNode }) {
  return (
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
      <SessionProvider>
        {children}
        <Toaster position="top-right" toastOptions={{ className: 'bg-white dark:bg-navy-900 border-slate-200 dark:border-navy-700' }} />
      </SessionProvider>
    </ThemeProvider>
  );
}