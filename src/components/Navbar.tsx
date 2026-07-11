'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useSession, signOut } from 'next-auth/react';
import { Menu, X, User, LogOut, ChevronDown, FileText, Users, LayoutDashboard } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/Badge';
import { ExtendedSession } from '@/lib/auth';

export function Navbar() {
  const { data: session, status } = useSession() as { data: ExtendedSession | null; status: 'loading' | 'authenticated' | 'unauthenticated' };
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [editorialMenuOpen, setEditorialMenuOpen] = useState(false);
  const [articlesMenuOpen, setArticlesMenuOpen] = useState(false);

  const navItems = [
    { href: '/', label: 'Home' },
    { href: '/submit', label: 'Submit Manuscript' },
    { href: '/about', label: 'About' },
  ];

  const articlesItems = [
    { href: '/articles', label: 'All Articles' },
    { href: '/articles?filter=current', label: 'Current Issue' },
    { href: '/articles?sort=latest', label: 'Latest Articles' },
  ];

  const editorialItems = [
    { href: '/editorial-board#editor-in-chief', label: 'Editor-in-Chief' },
    { href: '/editorial-board#deputy-editor', label: 'Deputy Editor' },
    { href: '/editorial-board#associate-editors', label: 'Associate Editors' },
    { href: '/editorial-board#review-board', label: 'Review Board' },
  ];

  const userNavItems = [
    { href: '/dashboard/manuscripts', label: 'My Manuscripts', icon: FileText },
    { href: '/dashboard/profile', label: 'Profile', icon: User },
    { href: '/submit', label: 'New Submission', icon: FileText },
  ];

  const editorNavItems = [
    { href: '/dashboard/editorial', label: 'Editorial Dashboard', icon: LayoutDashboard },
    { href: '/dashboard/manuscripts', label: 'All Manuscripts', icon: FileText },
    { href: '/dashboard/review', label: 'Review Management', icon: Users },
  ];

  const reviewerNavItems = [
    { href: '/dashboard/review', label: 'My Reviews', icon: FileText },
    { href: '/dashboard/profile', label: 'Profile', icon: User },
  ];

  if (status === 'loading') {
    return (
      <nav className="fixed top-0 left-0 right-0 z-50 bg-white border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-navy-900 rounded-lg animate-pulse" />
              <div className="w-32 h-6 bg-slate-200 rounded animate-pulse" />
            </div>
            <div className="hidden md:flex items-center gap-8">
              {Array(5).fill(0).map((_, i) => (
                <div key={i} className="w-16 h-6 bg-slate-200 rounded animate-pulse" />
              ))}
            </div>
          </div>
        </div>
      </nav>
    );
  }

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-sm border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <Link href="/" className="flex items-center gap-2" aria-label="AMHSJ Home">
            <img src="/logo.png" alt="AMHSJ" className="w-8 h-8" />
            <span className="font-bold text-navy-900 text-lg hidden sm:block">AMHSJ</span>
          </Link>

          <div className="hidden md:flex items-center gap-8">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="text-sm font-medium text-slate-600 hover:text-navy-900 transition-colors"
              >
                {item.label}
              </Link>
            ))}

            <div className="relative" onMouseEnter={() => setArticlesMenuOpen(true)} onMouseLeave={() => setArticlesMenuOpen(false)}>
              <button className="flex items-center gap-1 text-sm font-medium text-slate-600 hover:text-navy-900 transition-colors">
                Articles
                <ChevronDown className="w-4 h-4" />
              </button>
              {articlesMenuOpen && (
                <div className="absolute top-full left-0 mt-2 w-56 bg-white rounded-lg shadow-lg border border-slate-200 py-2 z-50 animate-slide-down">
                  {articlesItems.map((item) => (
                    <Link
                      key={item.href}
                      href={item.href}
                      className="block px-4 py-2 text-sm text-slate-600 hover:bg-slate-50 hover:text-navy-900"
                    >
                      {item.label}
                    </Link>
                  ))}
                </div>
              )}
            </div>

            <div className="relative" onMouseEnter={() => setEditorialMenuOpen(true)} onMouseLeave={() => setEditorialMenuOpen(false)}>
              <button className="flex items-center gap-1 text-sm font-medium text-slate-600 hover:text-navy-900 transition-colors">
                Editorial Board
                <ChevronDown className="w-4 h-4" />
              </button>
              {editorialMenuOpen && (
                <div className="absolute top-full left-0 mt-2 w-56 bg-white rounded-lg shadow-lg border border-slate-200 py-2 z-50 animate-slide-down">
                  {editorialItems.map((item) => (
                    <Link
                      key={item.href}
                      href={item.href}
                      className="block px-4 py-2 text-sm text-slate-600 hover:bg-slate-50 hover:text-navy-900"
                    >
                      {item.label}
                    </Link>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div className="hidden md:flex items-center gap-3">
            {session ? (
              <div className="relative">
                <button
                  onClick={() => setUserMenuOpen(!userMenuOpen)}
                  className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-slate-600 hover:text-navy-900 hover:bg-slate-50 rounded-lg transition-colors"
                >
                  <img src="/logo.png" alt="AMHSJ" className="w-8 h-8 rounded-full" />
                  <span className="hidden sm:block">{session.user?.firstName}</span>
                  <ChevronDown className="w-4 h-4" />
                </button>
                {userMenuOpen && (
                  <div className="absolute right-0 top-full mt-2 w-56 bg-white rounded-lg shadow-lg border border-slate-200 py-2 z-50 animate-scale-in">
                    <div className="px-4 py-2 border-b border-slate-100">
                      <p className="text-sm font-medium text-slate-900">{session.user?.firstName} {session.user?.lastName}</p>
                      <p className="text-xs text-slate-500">{session.user?.email}</p>
                      <Badge variant="navy" size="sm" className="mt-1">{session.user?.role}</Badge>
                    </div>
                    {session.user?.role === 'AUTHOR' && userNavItems.map((item) => (
                      <Link key={item.href} href={item.href} className="flex items-center gap-3 px-4 py-2 text-sm text-slate-600 hover:bg-slate-50 hover:text-navy-900" onClick={() => setUserMenuOpen(false)}>
                        <item.icon className="w-4 h-4" />
                        {item.label}
                      </Link>
                    ))}
                    {['EDITOR', 'EDITOR_IN_CHIEF', 'DEPUTY_EDITOR', 'ASSOCIATE_EDITOR', 'ADMIN'].includes(session.user?.role || '') && editorNavItems.map((item) => (
                      <Link key={item.href} href={item.href} className="flex items-center gap-3 px-4 py-2 text-sm text-slate-600 hover:bg-slate-50 hover:text-navy-900" onClick={() => setUserMenuOpen(false)}>
                        <item.icon className="w-4 h-4" />
                        {item.label}
                      </Link>
                    ))}
                    {session.user?.role === 'REVIEWER' && reviewerNavItems.map((item) => (
                      <Link key={item.href} href={item.href} className="flex items-center gap-3 px-4 py-2 text-sm text-slate-600 hover:bg-slate-50 hover:text-navy-900" onClick={() => setUserMenuOpen(false)}>
                        <item.icon className="w-4 h-4" />
                        {item.label}
                      </Link>
                    ))}
                    <hr className="my-2 border-slate-100" />
                    <button onClick={() => signOut({ callbackUrl: '/' })} className="flex items-center gap-3 w-full px-4 py-2 text-sm text-red-600 hover:bg-red-50">
                      <LogOut className="w-4 h-4" />
                      Sign Out
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center gap-3">
                <Link href="/login" className="text-sm font-medium text-slate-600 hover:text-navy-900 transition-colors">
                  Sign In
                </Link>
                <Link href="/register" className="px-4 py-2 bg-navy-900 text-white text-sm font-medium rounded-lg hover:bg-navy-800 transition-colors">
                  Register
                </Link>
              </div>
            )}
          </div>

          <button
            className="md:hidden p-2 text-slate-600 hover:text-navy-900"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="Toggle menu"
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

        {mobileMenuOpen && (
          <div className="md:hidden py-4 border-t border-slate-200 animate-slide-down">
            <div className="flex items-center gap-2 px-3 py-2">
              <img src="/logo.png" alt="AMHSJ" className="w-8 h-8" />
              <span className="font-bold text-navy-900 text-lg">AMHSJ</span>
            </div>
            <div className="flex flex-col gap-2">
              {navItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className="px-3 py-2 text-slate-600 hover:text-navy-900 hover:bg-slate-50 rounded-lg transition-colors"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  {item.label}
                </Link>
              ))}
              <div className="pt-2">
                <button className="flex items-center justify-between w-full px-3 py-2 text-slate-600 hover:text-navy-900">
                  Articles
                  <ChevronDown className="w-4 h-4" />
                </button>
                <div className="pl-4 py-2 space-y-1">
                  {articlesItems.map((item) => (
                    <Link key={item.href} href={item.href} className="block px-3 py-1 text-sm text-slate-500 hover:text-navy-900" onClick={() => setMobileMenuOpen(false)}>
                      {item.label}
                    </Link>
                  ))}
                </div>
              </div>
              <div className="pt-2">
                <button className="flex items-center justify-between w-full px-3 py-2 text-slate-600 hover:text-navy-900">
                  Editorial Board
                  <ChevronDown className="w-4 h-4" />
                </button>
                <div className="pl-4 py-2 space-y-1">
                  {editorialItems.map((item) => (
                    <Link key={item.href} href={item.href} className="block px-3 py-1 text-sm text-slate-500 hover:text-navy-900" onClick={() => setMobileMenuOpen(false)}>
                      {item.label}
                    </Link>
                  ))}
                </div>
              </div>
              {session ? (
                <div className="pt-4 border-t border-slate-200 space-y-2">
                  {userNavItems.map((item) => (
                    <Link key={item.href} href={item.href} className="flex items-center gap-3 px-3 py-2 text-slate-600 hover:text-navy-900 hover:bg-slate-50 rounded-lg" onClick={() => setMobileMenuOpen(false)}>
                      <item.icon className="w-4 h-4" />
                      {item.label}
                    </Link>
                  ))}
                  <button onClick={() => signOut({ callbackUrl: '/' })} className="flex items-center gap-3 w-full px-3 py-2 text-red-600 hover:bg-red-50 rounded-lg">
                    <LogOut className="w-4 h-4" />
                    Sign Out
                  </button>
                </div>
              ) : (
                <div className="pt-4 border-t border-slate-200 flex flex-col gap-2">
                  <Link href="/login" className="px-3 py-2 text-slate-600 hover:text-navy-900 hover:bg-slate-50 rounded-lg" onClick={() => setMobileMenuOpen(false)}>
                    Sign In
                  </Link>
                  <Link href="/register" className="px-3 py-2 bg-navy-900 text-white text-center rounded-lg hover:bg-navy-800" onClick={() => setMobileMenuOpen(false)}>
                    Register
                  </Link>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}