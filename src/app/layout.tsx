import type { Metadata, Viewport } from 'next';
import Script from 'next/script';
import { Inter } from 'next/font/google';
import './globals.css';
import { Providers } from './providers';
import { CookieConsent } from '@/components/ui/CookieConsent';


const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
});

export const metadata: Metadata = {
  title: {
    default: 'Advances in Medicine and Health Sciences Journal (AMHSJ)',
    template: '%s | AMHSJ',
  },
  description: 'Advances in Medicine and Health Sciences Journal is a peer-reviewed, open-access journal dedicated to publishing high-quality research in all areas of medicine and health sciences.',
  keywords: ['medicine', 'health sciences', 'peer-reviewed journal', 'open access', 'medical research', 'clinical trials', 'systematic reviews'],
  authors: [{ name: 'Advances in Medicine and Health Sciences Journal' }],
  creator: 'AMHSJ',
  publisher: 'Advances in Medicine and Health Sciences Journal',
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  metadataBase: new URL(process.env.NEXTAUTH_URL || 'http://localhost:3000'),
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: '/',
    siteName: 'Advances in Medicine and Health Sciences Journal',
    title: 'Advances in Medicine and Health Sciences Journal (AMHSJ)',
    description: 'Advances in Medicine and Health Sciences Journal is a peer-reviewed, open-access journal dedicated to publishing high-quality research in all areas of medicine and health sciences.',
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: 'AMHSJ - Advances in Medicine and Health Sciences Journal',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Advances in Medicine and Health Sciences Journal (AMHSJ)',
    description: 'Advances in Medicine and Health Sciences Journal is a peer-reviewed, open-access journal dedicated to publishing high-quality research in all areas of medicine and health sciences.',
    images: ['/og-image.png'],
    creator: '@amhsj',
  },
  icons: {
    icon: '/logo.png',
    shortcut: '/logo.png',
    apple: '/logo.png',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
};

export const viewport: Viewport = {
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#0f172a' },
    { media: '(prefers-color-scheme: dark)', color: '#0f172a' },
  ],
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${inter.variable} h-full antialiased`} suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link rel="dns-prefetch" href="https://fonts.googleapis.com" />
      </head>
      <body className="min-h-full flex flex-col font-sans text-slate-900 bg-white" suppressHydrationWarning>
        <Script
          id="theme-init"
          strategy="beforeInteractive"
          dangerouslySetInnerHTML={{
            __html: `(function(){try{var t=localStorage.getItem('theme');if(t==='dark'||(!t&&window.matchMedia('(prefers-color-scheme:dark)').matches))document.documentElement.classList.add('dark');else document.documentElement.classList.remove('dark')}catch(e){}})()`,
          }}
        />
        <Providers>
          {children}
          <CookieConsent />
        </Providers>
      </body>
    </html>
  );
}