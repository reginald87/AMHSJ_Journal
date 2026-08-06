import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { getToken } from 'next-auth/jwt';

const publicPaths = [
  '/',
  '/login',
  '/register',
  '/verify-email',
  '/forgot-password',
  '/reset-password',
  '/articles',
  '/article',
  '/journal',
  '/editorial-board',
  '/masthead',
  '/about',
  '/guidelines',
  '/faq',
  '/ethics',
  '/reviewers',
  '/contact',
  '/submit',
  '/announcements',
];

const adminRoles = ['ADMIN'];
const editorRoles = ['EDITOR', 'EDITOR_IN_CHIEF', 'DEPUTY_EDITOR_IN_CHIEF', 'ASSOCIATE_EDITOR', 'INTERNATIONAL_EDITOR'];
const editorAssistantRoles = ['EDITOR_ASSISTANT', 'ADMIN', 'EDITOR_IN_CHIEF'];
const reviewerRoles = ['REVIEWER', ...editorRoles, ...adminRoles];

function isPublicPath(pathname: string): boolean {
  return publicPaths.some((p) => pathname === p || pathname.startsWith(p + '/'));
}

const securityHeaders = {
  'X-Frame-Options': 'DENY',
  'X-Content-Type-Options': 'nosniff',
  'X-XSS-Protection': '1; mode=block',
  'Referrer-Policy': 'strict-origin-when-cross-origin',
  'Permissions-Policy': 'camera=(), microphone=(), geolocation=()',
  'Strict-Transport-Security': 'max-age=63072000; includeSubDomains; preload',
} as const;

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (pathname.startsWith('/api') || pathname.startsWith('/_next') || pathname.startsWith('/uploads') || pathname.includes('.')) {
    const res = NextResponse.next();
    Object.entries(securityHeaders).forEach(([key, value]) => {
      res.headers.set(key, value);
    });
    return res;
  }

  if (isPublicPath(pathname)) {
    const res = NextResponse.next();
    Object.entries(securityHeaders).forEach(([key, value]) => {
      res.headers.set(key, value);
    });
    return res;
  }

  const token = await getToken({ req: request, secret: process.env.NEXTAUTH_SECRET });

  if (!token) {
    const loginUrl = new URL('/login', request.url);
    loginUrl.searchParams.set('callbackUrl', pathname);
    return NextResponse.redirect(loginUrl);
  }

  const role = token.role as string | undefined;

  if (pathname.startsWith('/admin') && !adminRoles.includes(role || '')) {
    const isManuscriptManagement = pathname === '/admin/manuscripts' || pathname.startsWith('/admin/manuscripts/');
    if (!(role === 'EDITOR_ASSISTANT' && isManuscriptManagement)) {
      return NextResponse.redirect(new URL('/dashboard', request.url));
    }
  }

  if (pathname.startsWith('/editor') && !editorRoles.includes(role || '')) {
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }

  if (pathname.startsWith('/editor-assistant') && !editorAssistantRoles.includes(role || '')) {
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }

  if (pathname.startsWith('/reviewer') && !reviewerRoles.includes(role || '')) {
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }

  const res = NextResponse.next();
  Object.entries(securityHeaders).forEach(([key, value]) => {
    res.headers.set(key, value);
  });
  return res;
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|logo.png|.*\\..*).*)',
  ],
};
