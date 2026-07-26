'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { useSession, signOut } from 'next-auth/react';
import { useTheme } from 'next-themes';
import { cn } from '@/lib/utils';
import { Bell, User, LogOut, ChevronDown, Menu, Sun, Moon } from 'lucide-react';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { ExtendedSession } from '@/lib/auth';

interface Notification {
  id: string;
  title: string;
  message: string;
  isRead: boolean;
  createdAt: string;
  type: string;
}

function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'just now';
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}

export function TopBar({ onMenuClick, sidebarCollapsed, onToggleSidebar }: { onMenuClick: () => void; sidebarCollapsed?: boolean; onToggleSidebar?: () => void }) {
  const { data: session, status } = useSession() as { data: ExtendedSession | null; status: 'loading' | 'authenticated' | 'unauthenticated' };
  const { theme, setTheme } = useTheme();
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);

  const fetchNotifications = useCallback(async () => {
    try {
      const res = await fetch('/api/notifications?unread=true&limit=10');
      if (res.ok) {
        const data = await res.json();
        return { notifications: data.notifications || [], total: data.total || 0 };
      }
    } catch {
      // silently fail
    }
    return { notifications: [], total: 0 };
  }, []);

  useEffect(() => {
    if (status !== 'authenticated') return;

    let cancelled = false;

    const loadNotifications = async () => {
      const result = await fetchNotifications();
      if (!cancelled) {
        setNotifications(result.notifications);
        setUnreadCount(result.total);
      }
    };

    loadNotifications();
    const interval = setInterval(loadNotifications, 30000);
    return () => {
      cancelled = true;
      clearInterval(interval);
    };
  }, [status, fetchNotifications]);

  const markAllRead = async () => {
    try {
      await fetch('/api/notifications', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ all: true }),
      });
      setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
      setUnreadCount(0);
    } catch {
      // silently fail
    }
  };

  if (status === 'loading') {
    return (
      <header className="sticky top-0 z-30 bg-white border-b border-slate-200 dark:bg-navy-900 dark:border-navy-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button className="lg:hidden p-2 text-slate-600 hover:text-navy-900" onClick={onMenuClick}>
              <Menu className="w-6 h-6" />
            </button>
            <div className="w-8 h-8 bg-navy-900 rounded-lg animate-pulse" />
            <div className="w-32 h-6 bg-slate-200 rounded animate-pulse" />
          </div>
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 bg-slate-200 rounded-full animate-pulse" />
          </div>
        </div>
      </header>
    );
  }

  return (
    <header className="sticky top-0 z-30 bg-white border-b border-slate-200 dark:bg-navy-900 dark:border-navy-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button
            className="lg:hidden p-2 text-slate-600 hover:text-navy-900 dark:text-slate-400 dark:hover:text-white"
            onClick={onMenuClick}
            aria-label="Open menu"
          >
            <Menu className="w-6 h-6" />
          </button>
          
          {onToggleSidebar && (
            <button
              onClick={onToggleSidebar}
              className="hidden lg:flex p-2 text-slate-600 hover:text-navy-900 dark:text-slate-400 dark:hover:text-white rounded-lg hover:bg-slate-100 dark:hover:bg-navy-800"
              aria-label={sidebarCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
            >
              <Menu className="w-5 h-5" />
            </button>
          )}
        </div>

        <div className="flex items-center gap-3">
          <button
            className="relative p-2 text-slate-600 hover:text-navy-900 dark:text-slate-400 dark:hover:text-white rounded-lg hover:bg-slate-100 dark:hover:bg-navy-800"
            onClick={() => setNotificationsOpen(!notificationsOpen)}
            aria-label={`Notifications${unreadCount > 0 ? `, ${unreadCount} unread` : ''}`}
          >
            <Bell className="w-5 h-5" />
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs font-medium rounded-full flex items-center justify-center">
                {unreadCount > 9 ? '9+' : unreadCount}
              </span>
            )}
          </button>

          <div className="hidden sm:block w-px h-6 bg-slate-200 dark:bg-navy-700" />

          <button
            className="relative p-2 text-slate-600 hover:text-navy-900 dark:text-slate-400 dark:hover:text-white rounded-lg hover:bg-slate-100 dark:hover:bg-navy-800"
            aria-label="Toggle theme"
            onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
          >
            <Sun className="w-5 h-5 dark:hidden" />
            <Moon className="hidden w-5 h-5 dark:block" />
          </button>

          <div className="hidden sm:block w-px h-6 bg-slate-200 dark:bg-navy-700" />

          {session && (
            <div className="relative">
              <button
                onClick={() => setUserMenuOpen(!userMenuOpen)}
                className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-slate-600 hover:text-navy-900 hover:bg-slate-50 dark:text-slate-400 dark:hover:text-white dark:hover:bg-navy-800 rounded-lg transition-colors"
                aria-expanded={userMenuOpen}
                aria-haspopup="true"
              >
                <div className="w-8 h-8 bg-navy-900 rounded-full flex items-center justify-center text-gold-400 font-bold text-sm">
                  {session.user?.firstName?.[0]}{session.user?.lastName?.[0]}
                </div>
                <span className="hidden sm:block">{session.user?.firstName}</span>
                <ChevronDown className="w-4 h-4" />
              </button>

              {userMenuOpen && (
                <div className="absolute right-0 top-full mt-2 w-56 bg-white rounded-lg shadow-lg border border-slate-200 py-2 z-50 dark:bg-navy-900 dark:border-navy-800">
                  <div className="px-4 py-2 border-b border-slate-100 dark:border-navy-800">
                    <p className="text-sm font-medium text-slate-900 dark:text-white">{session.user?.firstName} {session.user?.lastName}</p>
                    <p className="text-xs text-slate-500 dark:text-slate-400">{session.user?.email}</p>
                    <Badge variant="navy" size="sm" className="mt-1">{session.user?.role}</Badge>
                  </div>
                  <Link
                    href="/dashboard/profile"
                    className="flex items-center gap-3 px-4 py-2 text-sm text-slate-600 hover:bg-slate-50 hover:text-navy-900 dark:text-slate-400 dark:hover:bg-navy-800 dark:hover:text-white"
                    onClick={() => setUserMenuOpen(false)}
                  >
                    <User className="w-4 h-4" />
                    Profile
                  </Link>
                  <hr className="my-2 border-slate-100 dark:border-navy-800" />
                  <button
                    onClick={() => signOut({ callbackUrl: '/' })}
                    className="flex items-center gap-3 w-full px-4 py-2 text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20"
                  >
                    <LogOut className="w-4 h-4" />
                    Sign Out
                  </button>
                </div>
              )}
            </div>
          )}

          {!session && (
            <div className="hidden sm:flex items-center gap-3">
              <Link href="/login" className="text-sm font-medium text-slate-600 hover:text-navy-900 dark:text-slate-400 dark:hover:text-white">
                Sign In
              </Link>
              <Link href="/register">
                <Button size="sm" variant="primary">Register</Button>
              </Link>
            </div>
          )}
        </div>
      </div>

      {notificationsOpen && (
        <div className="absolute right-4 top-full w-80 bg-white rounded-lg shadow-lg border border-slate-200 py-2 z-50 dark:bg-navy-900 dark:border-navy-800 animate-slide-down">
          <div className="px-4 py-3 border-b border-slate-100 dark:border-navy-800 flex items-center justify-between">
            <h3 className="font-semibold text-navy-900 dark:text-white">Notifications</h3>
            {unreadCount > 0 && (
              <button onClick={markAllRead} className="text-sm text-gold-600 hover:text-gold-700">Mark all read</button>
            )}
          </div>
          <div className="max-h-96 overflow-y-auto">
            {notifications.length === 0 ? (
              <div className="px-4 py-8 text-center text-sm text-slate-500 dark:text-slate-400">
                No notifications yet
              </div>
            ) : (
              notifications.map((notification) => (
                <div
                  key={notification.id}
                  className={cn(
                    'px-4 py-3 hover:bg-slate-50 dark:hover:bg-navy-800 border-b border-slate-100 last:border-0 dark:border-navy-800',
                    !notification.isRead && 'bg-gold-50/50 dark:bg-gold-900/10'
                  )}
                >
                  <p className="font-medium text-sm text-navy-900 dark:text-white">{notification.title}</p>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">{notification.message}</p>
                  <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">{timeAgo(notification.createdAt)}</p>
                </div>
              ))
            )}
          </div>
          <div className="px-4 py-2 border-t border-slate-100 dark:border-navy-800">
            <button onClick={() => { fetchNotifications(); setNotificationsOpen(false); }} className="text-sm text-gold-600 hover:text-gold-700 block text-center w-full">
              Refresh
            </button>
          </div>
        </div>
      )}
    </header>
  );
}
