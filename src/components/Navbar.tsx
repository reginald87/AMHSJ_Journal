'use client';

import { useState, useRef, useCallback } from 'react';
import Link from 'next/link';
import { useSession, signOut } from 'next-auth/react';
import { useTheme } from 'next-themes';
import { Menu, X, User, LogOut, ChevronDown, FileText, Users, LayoutDashboard, Sun, Moon, BookOpen, Award, Archive, Send, ClipboardList, Shield, Search } from 'lucide-react';
import Image from 'next/image';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/Badge';
import { ExtendedSession } from '@/lib/auth';

export function Navbar() {
  const { data: session, status } = useSession() as { data: ExtendedSession | null; status: 'loading' | 'authenticated' | 'unauthenticated' };
  const { theme, setTheme } = useTheme();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [openMega, setOpenMega] = useState<string | null>(null);
  const closeTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const megaEnter = useCallback((key: string) => {
    if (closeTimer.current) { clearTimeout(closeTimer.current); closeTimer.current = null; }
    setOpenMega(key);
  }, []);

  const megaLeave = useCallback(() => {
    closeTimer.current = setTimeout(() => setOpenMega(null), 120);
  }, []);

  const userNavItems = [
    { href: '/dashboard/manuscripts', label: 'My Manuscripts', icon: FileText },
    { href: '/dashboard/profile', label: 'Profile', icon: User },
    { href: '/submit', label: 'New Submission', icon: FileText },
  ];

  const adminNavItems = [
    { href: '/admin', label: 'Admin Dashboard', icon: LayoutDashboard },
    { href: '/admin/manuscripts', label: 'Manuscripts', icon: FileText },
    { href: '/admin/editorial-board', label: 'Editorial Board', icon: Users },
    { href: '/admin/settings', label: 'Settings', icon: LayoutDashboard },
  ];

  const editorNavItems = [
    { href: '/editor', label: 'Editor Dashboard', icon: LayoutDashboard },
    { href: '/editor/manuscripts', label: 'Manuscripts', icon: FileText },
    { href: '/editor/reviewers', label: 'Reviewers', icon: Users },
  ];

  const reviewerNavItems = [
    { href: '/reviewer', label: 'Reviewer Dashboard', icon: LayoutDashboard },
    { href: '/reviewer/assigned', label: 'Assigned Reviews', icon: FileText },
    { href: '/reviewer/history', label: 'Review History', icon: FileText },
  ];

  const editorAssistantNavItems = [
    { href: '/editor-assistant', label: 'Dashboard', icon: LayoutDashboard },
    { href: '/admin/manuscripts', label: 'Manuscripts', icon: FileText },
    { href: '/editor-assistant/publish', label: 'Publish', icon: FileText },
  ];

  if (status === 'loading') {
    return (
      <nav className="fixed top-0 left-0 right-0 z-50 bg-white dark:bg-navy-950 border-b border-slate-200 dark:border-navy-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-navy-900 rounded-lg animate-pulse" />
              <div className="w-32 h-6 bg-slate-200 dark:bg-navy-800 rounded animate-pulse" />
            </div>
            <div className="hidden md:flex items-center gap-8">
              {Array(4).fill(0).map((_, i) => (
                <div key={i} className="w-16 h-6 bg-slate-200 dark:bg-navy-800 rounded animate-pulse" />
              ))}
            </div>
          </div>
        </div>
      </nav>
    );
  }

  return (
    <nav className="fixed top-0 left-0 right-0 z-50">
      {/* Main nav bar */}
      <div className="bg-white/95 dark:bg-navy-900/95 backdrop-blur-sm border-b border-slate-200 dark:border-navy-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-14">
            {/* Brand */}
            <Link href="/" className="flex items-center gap-2.5 flex-shrink-0" aria-label="AMHSJ Home">
              <Image src="/logo.png" alt="AMHSJ" width={36} height={36} className="w-9 h-9" />
              <div className="hidden sm:block">
                <span className="font-bold text-navy-900 dark:text-white text-base leading-tight block">AMHSJ</span>
                <span className="text-[10px] text-slate-400 leading-tight block">Advances in Medicine &amp; Health Sciences Journal</span>
              </div>
            </Link>

            {/* Desktop nav items */}
            <div className="hidden lg:flex items-center gap-1">
              {/* Journal mega */}
              <div className="relative" onMouseEnter={() => megaEnter('journal')} onMouseLeave={megaLeave}>
                <button className={cn("flex items-center gap-1 px-3 py-2 text-sm font-medium rounded-lg transition-colors", openMega === 'journal' ? 'text-navy-900 dark:text-white bg-slate-100 dark:bg-navy-800' : 'text-slate-600 hover:text-navy-900 dark:text-slate-400 dark:hover:text-white')}>
                  Journal <ChevronDown className={cn("w-3.5 h-3.5 transition-transform", openMega === 'journal' && "rotate-180")} />
                </button>
                {openMega === 'journal' && (
                  <div className="absolute top-full left-0 pt-2 w-64 z-[100]" onMouseEnter={() => megaEnter('journal')} onMouseLeave={megaLeave}>
                    <div className="bg-white dark:bg-navy-900 rounded-xl shadow-xl border border-slate-200 dark:border-navy-700 p-4 animate-slide-down">
                      <div className="space-y-1">
                        <Link href="/articles" className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-slate-600 hover:bg-slate-50 hover:text-navy-900 dark:text-slate-400 dark:hover:bg-navy-800 dark:hover:text-white transition-colors">
                          <BookOpen className="w-4 h-4 text-navy-500 dark:text-navy-400" /> Browse Articles
                        </Link>
                        <Link href="/editorial-board" className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-slate-600 hover:bg-slate-50 hover:text-navy-900 dark:text-slate-400 dark:hover:bg-navy-800 dark:hover:text-white transition-colors">
                          <Award className="w-4 h-4 text-navy-500 dark:text-navy-400" /> Editorial Board
                        </Link>
                        <Link href="/masthead" className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-slate-600 hover:bg-slate-50 hover:text-navy-900 dark:text-slate-400 dark:hover:bg-navy-800 dark:hover:text-white transition-colors">
                          <Users className="w-4 h-4 text-navy-500 dark:text-navy-400" /> Masthead
                        </Link>
                        <Link href="/articles?filter=archive" className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-slate-600 hover:bg-slate-50 hover:text-navy-900 dark:text-slate-400 dark:hover:bg-navy-800 dark:hover:text-white transition-colors">
                          <Archive className="w-4 h-4 text-navy-500 dark:text-navy-400" /> Archive
                        </Link>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* For Authors mega */}
              <div className="relative" onMouseEnter={() => megaEnter('authors')} onMouseLeave={megaLeave}>
                <button className={cn("flex items-center gap-1 px-3 py-2 text-sm font-medium rounded-lg transition-colors", openMega === 'authors' ? 'text-navy-900 dark:text-white bg-slate-100 dark:bg-navy-800' : 'text-slate-600 hover:text-navy-900 dark:text-slate-400 dark:hover:text-white')}>
                  For Authors <ChevronDown className={cn("w-3.5 h-3.5 transition-transform", openMega === 'authors' && "rotate-180")} />
                </button>
                {openMega === 'authors' && (
                  <div className="absolute top-full left-0 pt-2 w-64 z-[100]" onMouseEnter={() => megaEnter('authors')} onMouseLeave={megaLeave}>
                    <div className="bg-white dark:bg-navy-900 rounded-xl shadow-xl border border-slate-200 dark:border-navy-700 p-4 animate-slide-down">
                      <div className="space-y-1">
                        <Link href="/register" className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-slate-600 hover:bg-slate-50 hover:text-navy-900 dark:text-slate-400 dark:hover:bg-navy-800 dark:hover:text-white transition-colors">
                          <Send className="w-4 h-4 text-gold-500" /> Submit Manuscript
                        </Link>
                        <Link href="/guidelines" className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-slate-600 hover:bg-slate-50 hover:text-navy-900 dark:text-slate-400 dark:hover:bg-navy-800 dark:hover:text-white transition-colors">
                          <ClipboardList className="w-4 h-4 text-navy-500 dark:text-navy-400" /> Submission Guidelines
                        </Link>
                        <Link href="/guidelines#peer-review" className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-slate-600 hover:bg-slate-50 hover:text-navy-900 dark:text-slate-400 dark:hover:bg-navy-800 dark:hover:text-white transition-colors">
                          <Shield className="w-4 h-4 text-navy-500 dark:text-navy-400" /> Peer Review Process
                        </Link>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              <Link href="/about" className="px-3 py-2 text-sm font-medium text-slate-600 hover:text-navy-900 dark:text-slate-400 dark:hover:text-white rounded-lg transition-colors">
                About
              </Link>

              <Link href="/contact" className="px-3 py-2 text-sm font-medium text-slate-600 hover:text-navy-900 dark:text-slate-400 dark:hover:text-white rounded-lg transition-colors">
                Contact
              </Link>
            </div>

            {/* Right side actions */}
            <div className="flex items-center gap-2">
              <button
                className="p-2 text-slate-500 hover:text-navy-900 dark:text-slate-400 dark:hover:text-white rounded-lg hover:bg-slate-100 dark:hover:bg-navy-800 transition-colors"
                aria-label="Toggle theme"
                onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
              >
                <Sun className="w-4 h-4 dark:hidden" />
                <Moon className="hidden w-4 h-4 dark:block" />
              </button>

              <div className="hidden md:block w-px h-5 bg-slate-200 dark:bg-navy-700" />

              {session ? (
                <div className="relative hidden md:block">
                  <button
                    onClick={() => setUserMenuOpen(!userMenuOpen)}
                    className="flex items-center gap-2 px-2 py-1.5 text-sm font-medium text-slate-600 hover:text-navy-900 hover:bg-slate-50 dark:text-slate-400 dark:hover:text-white dark:hover:bg-navy-800 rounded-lg transition-colors"
                  >
                    <div className="w-7 h-7 bg-navy-100 dark:bg-navy-700 rounded-full flex items-center justify-center text-navy-700 dark:text-navy-300 text-xs font-bold">
                      {session.user?.firstName?.[0]}{session.user?.lastName?.[0]}
                    </div>
                    <ChevronDown className="w-3.5 h-3.5" />
                  </button>
                  {userMenuOpen && (
                    <div className="absolute right-0 top-full mt-2 w-56 bg-white dark:bg-navy-900 rounded-xl shadow-xl border border-slate-200 dark:border-navy-700 py-2 z-[100] animate-scale-in">
                      <div className="px-4 py-2 border-b border-slate-100 dark:border-navy-700">
                        <p className="text-sm font-medium text-slate-900 dark:text-white">{session.user?.firstName} {session.user?.lastName}</p>
                        <p className="text-xs text-slate-500 dark:text-slate-400">{session.user?.email}</p>
                        <Badge variant="navy" size="sm" className="mt-1">{session.user?.role}</Badge>
                      </div>
                      {session.user?.role === 'AUTHOR' && userNavItems.map((item) => (
                        <Link key={item.href} href={item.href} className="flex items-center gap-3 px-4 py-2 text-sm text-slate-600 hover:bg-slate-50 hover:text-navy-900 dark:text-slate-400 dark:hover:bg-navy-800 dark:hover:text-white" onClick={() => setUserMenuOpen(false)}>
                          <item.icon className="w-4 h-4" />
                          {item.label}
                        </Link>
                      ))}
                      {['ADMIN', 'EDITOR_IN_CHIEF'].includes(session.user?.role || '') && adminNavItems.map((item) => (
                        <Link key={item.href} href={item.href} className="flex items-center gap-3 px-4 py-2 text-sm text-slate-600 hover:bg-slate-50 hover:text-navy-900 dark:text-slate-400 dark:hover:bg-navy-800 dark:hover:text-white" onClick={() => setUserMenuOpen(false)}>
                          <item.icon className="w-4 h-4" />
                          {item.label}
                        </Link>
                      ))}
                      {['EDITOR', 'DEPUTY_EDITOR_IN_CHIEF', 'ASSOCIATE_EDITOR', 'INTERNATIONAL_EDITOR'].includes(session.user?.role || '') && editorNavItems.map((item) => (
                        <Link key={item.href} href={item.href} className="flex items-center gap-3 px-4 py-2 text-sm text-slate-600 hover:bg-slate-50 hover:text-navy-900 dark:text-slate-400 dark:hover:bg-navy-800 dark:hover:text-white" onClick={() => setUserMenuOpen(false)}>
                          <item.icon className="w-4 h-4" />
                          {item.label}
                        </Link>
                      ))}
                      {session.user?.role === 'REVIEWER' && reviewerNavItems.map((item) => (
                        <Link key={item.href} href={item.href} className="flex items-center gap-3 px-4 py-2 text-sm text-slate-600 hover:bg-slate-50 hover:text-navy-900 dark:text-slate-400 dark:hover:bg-navy-800 dark:hover:text-white" onClick={() => setUserMenuOpen(false)}>
                          <item.icon className="w-4 h-4" />
                          {item.label}
                        </Link>
                      ))}
                      {session.user?.role === 'EDITOR_ASSISTANT' && editorAssistantNavItems.map((item) => (
                        <Link key={item.href} href={item.href} className="flex items-center gap-3 px-4 py-2 text-sm text-slate-600 hover:bg-slate-50 hover:text-navy-900 dark:text-slate-400 dark:hover:bg-navy-800 dark:hover:text-white" onClick={() => setUserMenuOpen(false)}>
                          <item.icon className="w-4 h-4" />
                          {item.label}
                        </Link>
                      ))}
                      <hr className="my-2 border-slate-100 dark:border-navy-700" />
                      <button onClick={() => signOut({ callbackUrl: '/' })} className="flex items-center gap-3 w-full px-4 py-2 text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20">
                        <LogOut className="w-4 h-4" />
                        Sign Out
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                <div className="hidden md:flex items-center gap-2">
                  <Link href="/login" className="px-3 py-1.5 text-sm font-medium text-slate-600 hover:text-navy-900 dark:text-slate-400 dark:hover:text-white transition-colors">
                    Sign In
                  </Link>
                  <Link href="/register" className="px-4 py-1.5 bg-gold-500 text-navy-950 text-sm font-semibold rounded-lg hover:bg-gold-400 transition-colors">
                    Submit
                  </Link>
                </div>
              )}

              {/* Mobile menu button */}
              <button
                className="lg:hidden p-2 text-slate-600 hover:text-navy-900 dark:text-slate-400 dark:hover:text-white"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                aria-label="Toggle menu"
              >
                {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {mobileMenuOpen && (
        <div className="lg:hidden bg-white dark:bg-navy-900 border-b border-slate-200 dark:border-navy-800 animate-slide-down max-h-[80vh] overflow-y-auto">
          <div className="px-4 py-4 space-y-1">
            <p className="text-xs font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider px-3 mb-2">Journal</p>
            <Link href="/articles" className="flex items-center gap-3 px-3 py-2.5 text-sm text-slate-600 hover:bg-slate-50 hover:text-navy-900 dark:text-slate-400 dark:hover:bg-navy-800 dark:hover:text-white rounded-lg" onClick={() => setMobileMenuOpen(false)}>
              <BookOpen className="w-4 h-4" /> Browse Articles
            </Link>
            <Link href="/editorial-board" className="flex items-center gap-3 px-3 py-2.5 text-sm text-slate-600 hover:bg-slate-50 hover:text-navy-900 dark:text-slate-400 dark:hover:bg-navy-800 dark:hover:text-white rounded-lg" onClick={() => setMobileMenuOpen(false)}>
              <Award className="w-4 h-4" /> Editorial Board
            </Link>
            <Link href="/masthead" className="flex items-center gap-3 px-3 py-2.5 text-sm text-slate-600 hover:bg-slate-50 hover:text-navy-900 dark:text-slate-400 dark:hover:bg-navy-800 dark:hover:text-white rounded-lg" onClick={() => setMobileMenuOpen(false)}>
              <Users className="w-4 h-4" /> Masthead
            </Link>
            <Link href="/articles?filter=archive" className="flex items-center gap-3 px-3 py-2.5 text-sm text-slate-600 hover:bg-slate-50 hover:text-navy-900 dark:text-slate-400 dark:hover:bg-navy-800 dark:hover:text-white rounded-lg" onClick={() => setMobileMenuOpen(false)}>
              <Archive className="w-4 h-4" /> Archive
            </Link>

            <div className="pt-3 mt-3 border-t border-slate-100 dark:border-navy-800">
              <p className="text-xs font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider px-3 mb-2">For Authors</p>
              <Link href="/register" className="flex items-center gap-3 px-3 py-2.5 text-sm text-slate-600 hover:bg-slate-50 hover:text-navy-900 dark:text-slate-400 dark:hover:bg-navy-800 dark:hover:text-white rounded-lg" onClick={() => setMobileMenuOpen(false)}>
                <Send className="w-4 h-4 text-gold-500" /> Submit Manuscript
              </Link>
              <Link href="/guidelines" className="flex items-center gap-3 px-3 py-2.5 text-sm text-slate-600 hover:bg-slate-50 hover:text-navy-900 dark:text-slate-400 dark:hover:bg-navy-800 dark:hover:text-white rounded-lg" onClick={() => setMobileMenuOpen(false)}>
                <ClipboardList className="w-4 h-4" /> Submission Guidelines
              </Link>
              <Link href="/guidelines#peer-review" className="flex items-center gap-3 px-3 py-2.5 text-sm text-slate-600 hover:bg-slate-50 hover:text-navy-900 dark:text-slate-400 dark:hover:bg-navy-800 dark:hover:text-white rounded-lg" onClick={() => setMobileMenuOpen(false)}>
                <Shield className="w-4 h-4" /> Peer Review Process
              </Link>
            </div>

            <div className="pt-3 mt-3 border-t border-slate-100 dark:border-navy-800">
              <Link href="/about" className="flex items-center gap-3 px-3 py-2.5 text-sm text-slate-600 hover:bg-slate-50 hover:text-navy-900 dark:text-slate-400 dark:hover:bg-navy-800 dark:hover:text-white rounded-lg" onClick={() => setMobileMenuOpen(false)}>
                About
              </Link>
              <Link href="/contact" className="flex items-center gap-3 px-3 py-2.5 text-sm text-slate-600 hover:bg-slate-50 hover:text-navy-900 dark:text-slate-400 dark:hover:bg-navy-800 dark:hover:text-white rounded-lg" onClick={() => setMobileMenuOpen(false)}>
                Contact
              </Link>
            </div>

            {session ? (
              <div className="pt-3 mt-3 border-t border-slate-100 dark:border-navy-800 space-y-1">
                <div className="px-3 py-2">
                  <p className="text-sm font-medium text-slate-900 dark:text-white">{session.user?.firstName} {session.user?.lastName}</p>
                  <p className="text-xs text-slate-500 dark:text-slate-400">{session.user?.email}</p>
                </div>
                {session.user?.role === 'AUTHOR' && userNavItems.map((item) => (
                  <Link key={item.href} href={item.href} className="flex items-center gap-3 px-3 py-2.5 text-sm text-slate-600 hover:bg-slate-50 hover:text-navy-900 dark:text-slate-400 dark:hover:bg-navy-800 dark:hover:text-white rounded-lg" onClick={() => setMobileMenuOpen(false)}>
                    <item.icon className="w-4 h-4" /> {item.label}
                  </Link>
                ))}
                {['ADMIN', 'EDITOR_IN_CHIEF'].includes(session.user?.role || '') && adminNavItems.map((item) => (
                  <Link key={item.href} href={item.href} className="flex items-center gap-3 px-3 py-2.5 text-sm text-slate-600 hover:bg-slate-50 hover:text-navy-900 dark:text-slate-400 dark:hover:bg-navy-800 dark:hover:text-white rounded-lg" onClick={() => setMobileMenuOpen(false)}>
                    <item.icon className="w-4 h-4" /> {item.label}
                  </Link>
                ))}
                {['EDITOR', 'DEPUTY_EDITOR_IN_CHIEF', 'ASSOCIATE_EDITOR', 'INTERNATIONAL_EDITOR'].includes(session.user?.role || '') && editorNavItems.map((item) => (
                  <Link key={item.href} href={item.href} className="flex items-center gap-3 px-3 py-2.5 text-sm text-slate-600 hover:bg-slate-50 hover:text-navy-900 dark:text-slate-400 dark:hover:bg-navy-800 dark:hover:text-white rounded-lg" onClick={() => setMobileMenuOpen(false)}>
                    <item.icon className="w-4 h-4" /> {item.label}
                  </Link>
                ))}
                {session.user?.role === 'REVIEWER' && reviewerNavItems.map((item) => (
                  <Link key={item.href} href={item.href} className="flex items-center gap-3 px-3 py-2.5 text-sm text-slate-600 hover:bg-slate-50 hover:text-navy-900 dark:text-slate-400 dark:hover:bg-navy-800 dark:hover:text-white rounded-lg" onClick={() => setMobileMenuOpen(false)}>
                    <item.icon className="w-4 h-4" /> {item.label}
                  </Link>
                ))}
                {session.user?.role === 'EDITOR_ASSISTANT' && editorAssistantNavItems.map((item) => (
                  <Link key={item.href} href={item.href} className="flex items-center gap-3 px-3 py-2.5 text-sm text-slate-600 hover:bg-slate-50 hover:text-navy-900 dark:text-slate-400 dark:hover:bg-navy-800 dark:hover:text-white rounded-lg" onClick={() => setMobileMenuOpen(false)}>
                    <item.icon className="w-4 h-4" /> {item.label}
                  </Link>
                ))}
                <button onClick={() => signOut({ callbackUrl: '/' })} className="flex items-center gap-3 w-full px-3 py-2.5 text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg">
                  <LogOut className="w-4 h-4" /> Sign Out
                </button>
              </div>
            ) : (
              <div className="pt-3 mt-3 border-t border-slate-100 dark:border-navy-800 flex flex-col gap-2">
                <Link href="/login" className="px-3 py-2.5 text-sm text-slate-600 hover:bg-slate-50 hover:text-navy-900 dark:text-slate-400 dark:hover:bg-navy-800 dark:hover:text-white rounded-lg text-center" onClick={() => setMobileMenuOpen(false)}>
                  Sign In
                </Link>
                <Link href="/register" className="px-3 py-2.5 bg-gold-500 text-navy-950 text-sm font-semibold rounded-lg hover:bg-gold-400 text-center" onClick={() => setMobileMenuOpen(false)}>
                  Submit Research
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </nav>
  );
}
