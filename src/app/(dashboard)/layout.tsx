'use client';

import { ReactNode, Suspense, useState } from 'react';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import { Sidebar } from '@/components/dashboard/Sidebar';
import { TopBar } from '@/components/dashboard/TopBar';

function SidebarWrapper(props: React.ComponentProps<typeof Sidebar>) {
  return <Sidebar {...props} />;
}

export default function DashboardLayout({ children }: { children: ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-navy-950">
      <div className="flex flex-1">
        <Suspense fallback={null}>
          <SidebarWrapper
            isOpen={sidebarOpen}
            onClose={() => setSidebarOpen(false)}
            collapsed={sidebarCollapsed}
            onToggleCollapse={() => setSidebarCollapsed(!sidebarCollapsed)}
          />
        </Suspense>
        <div className={cn('flex-1 flex flex-col transition-all duration-300', sidebarCollapsed ? 'lg:pl-[4.5rem]' : 'lg:pl-72')}>
          <TopBar
            onMenuClick={() => setSidebarOpen(true)}
            sidebarCollapsed={sidebarCollapsed}
            onToggleSidebar={() => setSidebarCollapsed(!sidebarCollapsed)}
          />
          <main className="flex-1 p-4 sm:p-6 lg:p-8">
            <Suspense fallback={<div className="flex items-center justify-center py-20"><div className="w-8 h-8 border-4 border-gold-400 border-t-transparent rounded-full animate-spin" /></div>}>
              {children}
            </Suspense>
          </main>
          <footer className="border-t border-slate-200 dark:border-navy-800 bg-white dark:bg-navy-900 px-6 py-4">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 text-sm text-slate-500 dark:text-slate-400">
              <p>&copy; {new Date().getFullYear()} AMHSJ. All rights reserved.</p>
              <div className="flex items-center gap-4">
                <Link href="/" className="hover:text-gold-600 transition-colors">View Journal</Link>
                <Link href="/guidelines" className="hover:text-gold-600 transition-colors">Guidelines</Link>
                <Link href="/contact" className="hover:text-gold-600 transition-colors">Support</Link>
              </div>
            </div>
          </footer>
        </div>
      </div>
    </div>
  );
}
