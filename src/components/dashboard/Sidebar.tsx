'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useSession } from 'next-auth/react';
import Image from 'next/image';
import { cn } from '@/lib/utils';
import {
  LayoutDashboard,
  FileText,
  Users,
  BookOpen,
  Settings,
  User,
  ChevronLeft,
  ChevronRight,
  Search,
  Archive,
  Globe,
  Shield,
  Bell,
  BarChart3,
  Mail,
} from 'lucide-react';
import { ExtendedSession } from '@/lib/auth';

interface NavItem {
  href: string;
  label: string;
  icon: React.ReactNode;
}

interface NavGroup {
  label: string;
  items: NavItem[];
}

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
  collapsed: boolean;
  onToggleCollapse: () => void;
}

export function Sidebar({ isOpen, onClose, collapsed, onToggleCollapse }: SidebarProps) {
  const { data: session } = useSession() as { data: ExtendedSession | null };
  const pathname = usePathname();

  const isActive = (href: string) => {
    if (href === '/admin' || href === '/editor' || href === '/reviewer' || href === '/dashboard') {
      return pathname === href;
    }
    return pathname.startsWith(href);
  };

  const adminGroups: NavGroup[] = [
    {
      label: 'Overview',
      items: [
        { href: '/admin', label: 'Dashboard', icon: <LayoutDashboard className="w-5 h-5" /> },
      ],
    },
    {
      label: 'Content',
      items: [
        { href: '/admin/homepage', label: 'Homepage', icon: <LayoutDashboard className="w-5 h-5" /> },
        { href: '/admin/pages', label: 'CMS Pages', icon: <Globe className="w-5 h-5" /> },
        { href: '/admin/editorial-board', label: 'Editorial Board', icon: <Users className="w-5 h-5" /> },
      ],
    },
    {
      label: 'Workflow',
      items: [
        { href: '/admin/manuscripts', label: 'Manuscripts', icon: <FileText className="w-5 h-5" /> },
        { href: '/admin/volumes', label: 'Volumes', icon: <BookOpen className="w-5 h-5" /> },
      ],
    },
    {
      label: 'Administration',
      items: [
        { href: '/admin/users', label: 'Users', icon: <Users className="w-5 h-5" /> },
        { href: '/admin/messages', label: 'Messages', icon: <Mail className="w-5 h-5" /> },
        { href: '/admin/analytics', label: 'Analytics', icon: <BarChart3 className="w-5 h-5" /> },
        { href: '/admin/settings', label: 'Settings', icon: <Settings className="w-5 h-5" /> },
        { href: '/dashboard/notifications', label: 'Notifications', icon: <Bell className="w-5 h-5" /> },
      ],
    },
  ];

  const editorGroups: NavGroup[] = [
    {
      label: 'Overview',
      items: [
        { href: '/editor', label: 'Dashboard', icon: <LayoutDashboard className="w-5 h-5" /> },
      ],
    },
    {
      label: 'Workflow',
      items: [
        { href: '/editor/manuscripts', label: 'Manuscripts', icon: <FileText className="w-5 h-5" /> },
        { href: '/editor/reviewers', label: 'Reviewers', icon: <Users className="w-5 h-5" /> },
        { href: '/editor/volumes', label: 'Volumes', icon: <BookOpen className="w-5 h-5" /> },
        { href: '/editor/messages', label: 'Messages', icon: <Mail className="w-5 h-5" /> },
        { href: '/dashboard/notifications', label: 'Notifications', icon: <Bell className="w-5 h-5" /> },
      ],
    },
  ];

  const reviewerGroups: NavGroup[] = [
    {
      label: 'My Reviews',
      items: [
        { href: '/reviewer', label: 'Dashboard', icon: <LayoutDashboard className="w-5 h-5" /> },
        { href: '/reviewer/assigned', label: 'Assigned Reviews', icon: <Search className="w-5 h-5" /> },
        { href: '/reviewer/history', label: 'Review History', icon: <Archive className="w-5 h-5" /> },
        { href: '/dashboard/notifications', label: 'Notifications', icon: <Bell className="w-5 h-5" /> },
      ],
    },
  ];

  const authorGroups: NavGroup[] = [
    {
      label: 'My Work',
      items: [
        { href: '/dashboard', label: 'Dashboard', icon: <LayoutDashboard className="w-5 h-5" /> },
        { href: '/dashboard/manuscripts', label: 'My Manuscripts', icon: <FileText className="w-5 h-5" /> },
        { href: '/submit', label: 'New Submission', icon: <FileText className="w-5 h-5" /> },
        { href: '/dashboard/profile', label: 'Profile', icon: <User className="w-5 h-5" /> },
        { href: '/dashboard/notifications', label: 'Notifications', icon: <Bell className="w-5 h-5" /> },
      ],
    },
  ];

  const editorAssistantGroups: NavGroup[] = [
    {
      label: 'Overview',
      items: [
        { href: '/editor-assistant', label: 'Dashboard', icon: <LayoutDashboard className="w-5 h-5" /> },
      ],
    },
    {
      label: 'Publishing',
      items: [
        { href: '/editor-assistant/manuscripts', label: 'Manuscripts', icon: <FileText className="w-5 h-5" /> },
        { href: '/editor-assistant/publish', label: 'Publish', icon: <BookOpen className="w-5 h-5" /> },
        { href: '/dashboard/notifications', label: 'Notifications', icon: <Bell className="w-5 h-5" /> },
      ],
    },
  ];

  const getGroups = (): NavGroup[] => {
    const role = session?.user?.role || 'AUTHOR';
    if (['ADMIN', 'EDITOR_IN_CHIEF'].includes(role)) return adminGroups;
    if (['EDITOR', 'DEPUTY_EDITOR_IN_CHIEF', 'ASSOCIATE_EDITOR'].includes(role)) return editorGroups;
    if (role === 'REVIEWER') return reviewerGroups;
    if (role === 'EDITOR_ASSISTANT') return editorAssistantGroups;
    return authorGroups;
  };

  const groups = getGroups();

  return (
    <>
      <aside
        className={cn(
          'fixed inset-y-0 left-0 z-50 bg-white border-r border-slate-200 dark:bg-navy-900 dark:border-navy-800 transition-all duration-300 flex flex-col',
          collapsed ? 'w-[4.5rem]' : 'w-72',
          isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        )}
        aria-label="Sidebar navigation"
      >
        <div className="flex items-center justify-between h-16 px-4 border-b border-slate-200 dark:border-navy-800 flex-shrink-0">
          <Link href="/" className="flex items-center gap-2" aria-label="AMHSJ Dashboard">
            <Image src="/logo.png" alt="AMHSJ" width={32} height={32} className="w-8 h-8 rounded-lg flex-shrink-0" />
            {!collapsed && (
              <span className="font-bold text-navy-900 dark:text-white text-lg">AMHSJ</span>
            )}
          </Link>
          <button
            onClick={onToggleCollapse}
            className={cn(
              'p-1.5 rounded-lg text-slate-500 hover:text-navy-900 hover:bg-slate-100 dark:text-slate-400 dark:hover:text-white dark:hover:bg-navy-800 transition-colors',
              collapsed && 'rotate-180'
            )}
            aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          >
            {collapsed ? <ChevronRight className="w-5 h-5" /> : <ChevronLeft className="w-5 h-5" />}
          </button>
        </div>

        <nav className="flex-1 overflow-y-auto p-3 space-y-4" role="navigation" aria-label="Main navigation">
          {groups.map((group) => (
            <div key={group.label}>
              {!collapsed && (
                <p className="px-3 mb-1 text-[11px] font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500">
                  {group.label}
                </p>
              )}
              <div className="space-y-0.5">
                {group.items.map((item) => {
                  const active = isActive(item.href);
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      className={cn(
                        'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors',
                        active
                          ? 'bg-navy-900 text-white'
                          : 'text-slate-600 hover:text-navy-900 hover:bg-slate-100 dark:text-slate-400 dark:hover:text-white dark:hover:bg-navy-800'
                      )}
                      aria-current={active ? 'page' : undefined}
                      title={collapsed ? item.label : undefined}
                      onClick={onClose}
                    >
                      <span className="flex-shrink-0">{item.icon}</span>
                      {!collapsed && <span className="flex-1 truncate">{item.label}</span>}
                    </Link>
                  );
                })}
              </div>
            </div>
          ))}
        </nav>

        <div className="p-3 border-t border-slate-200 dark:border-navy-800 flex-shrink-0">
          <Link
            href="/"
            className={cn(
              'flex items-center gap-3 px-3 py-2 text-slate-600 dark:text-slate-400 hover:text-navy-900 dark:hover:text-white rounded-lg transition-colors text-sm',
              collapsed && 'justify-center'
            )}
            title={collapsed ? 'View Journal' : undefined}
          >
            <Globe className="w-5 h-5 flex-shrink-0" />
            {!collapsed && <span>View Journal</span>}
          </Link>
        </div>
      </aside>

      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 lg:hidden"
          onClick={onClose}
          aria-hidden="true"
        />
      )}
    </>
  );
}
