import Image from 'next/image';
import Link from 'next/link';

export function Footer() {
  const footerLinks = {
    journal: [
      { href: '/journal', label: 'Browse Volumes' },
      { href: '/journal/archive', label: 'Archive' },
      { href: '/editorial-board', label: 'Editorial Board' },
      { href: '/guidelines', label: 'Author Guidelines' },
      { href: '/submit', label: 'Submit Manuscript' },
      { href: '/ethics', label: 'Publication Ethics' },
    ],
    about: [
      { href: '/about', label: 'About AMHSJ' },
      { href: '/about#scope', label: 'Aims & Scope' },
      { href: '/about#indexing', label: 'Indexing' },
      { href: '/about#metrics', label: 'Journal Metrics' },
      { href: '/about#history', label: 'History' },
      { href: '/contact', label: 'Contact Us' },
    ],
    authors: [
      { href: '/submit', label: 'Submit Manuscript' },
      { href: '/guidelines', label: 'Author Guidelines' },
      { href: '/guidelines#preparation', label: 'Manuscript Preparation' },
      { href: '/guidelines#ethics', label: 'Ethical Guidelines' },
      { href: '/guidelines#copyright', label: 'Copyright & License' },
      { href: '/faq', label: 'FAQ' },
    ],
    reviewers: [
      { href: '/reviewers', label: 'Become a Reviewer' },
      { href: '/reviewers/guidelines', label: 'Reviewer Guidelines' },
      { href: '/reviewers/recognition', label: 'Reviewer Recognition' },
      { href: '/reviewers/login', label: 'Reviewer Login' },
    ],
  };

  const socialLinks = [
    { href: 'https://twitter.com/amhsj', label: 'Twitter', icon: 'X' },
    { href: 'https://linkedin.com/company/amhsj', label: 'LinkedIn', icon: 'in' },
    { href: 'https://facebook.com/amhsj', label: 'Facebook', icon: 'f' },
    { href: 'https://orcid.org', label: 'ORCID', icon: 'ORCID' },
  ];

  return (
    <footer className="bg-navy-950 border-t border-navy-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10">
          <div className="lg:col-span-2">
<Link href="/" className="flex items-center gap-2 mb-6" aria-label="AMHSJ Home">
            <Image src="/logo.png" alt="AMHSJ" width={40} height={40} className="w-10 h-10" />
            <span className="font-bold text-white text-xl">AMHSJ</span>
          </Link>
            <p className="text-slate-400 text-sm leading-relaxed mb-6 max-w-xs">
              Advances in Medicine and Health Sciences Journal is a peer-reviewed, 
              open-access journal dedicated to publishing high-quality research in 
              all areas of medicine and health sciences.
            </p>
            <div className="flex gap-4">
              {socialLinks.map((social) => (
                <a
                  key={social.label}
                  href={social.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-9 h-9 bg-navy-800 rounded-lg flex items-center justify-center text-slate-400 hover:text-gold-400 hover:bg-navy-700 transition-colors text-sm font-bold"
                  aria-label={social.label}
                >
                  {social.icon}
                </a>
              ))}
            </div>
          </div>

          <div>
            <h3 className="text-gold-400 font-semibold text-sm uppercase tracking-wider mb-4">Journal</h3>
            <nav className="space-y-3">
              {footerLinks.journal.map((link) => (
                <Link key={link.href} href={link.href} className="text-slate-400 hover:text-gold-400 text-sm transition-colors block">
                  {link.label}
                </Link>
              ))}
            </nav>
          </div>

          <div>
            <h3 className="text-gold-400 font-semibold text-sm uppercase tracking-wider mb-4">About</h3>
            <nav className="space-y-3">
              {footerLinks.about.map((link) => (
                <Link key={link.href} href={link.href} className="text-slate-400 hover:text-gold-400 text-sm transition-colors block">
                  {link.label}
                </Link>
              ))}
            </nav>
          </div>

          <div>
            <h3 className="text-gold-400 font-semibold text-sm uppercase tracking-wider mb-4">For Authors</h3>
            <nav className="space-y-3">
              {footerLinks.authors.map((link) => (
                <Link key={link.href} href={link.href} className="text-slate-400 hover:text-gold-400 text-sm transition-colors block">
                  {link.label}
                </Link>
              ))}
            </nav>
          </div>

          <div>
            <h3 className="text-gold-400 font-semibold text-sm uppercase tracking-wider mb-4">For Reviewers</h3>
            <nav className="space-y-3">
              {footerLinks.reviewers.map((link) => (
                <Link key={link.href} href={link.href} className="text-slate-400 hover:text-gold-400 text-sm transition-colors block">
                  {link.label}
                </Link>
              ))}
            </nav>
          </div>
        </div>

        <div className="mt-12 pt-8 border-t border-navy-800">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-slate-500 text-sm">
              &copy; {new Date().getFullYear()} Advances in Medicine and Health Sciences Journal. All rights reserved.
            </p>
            <div className="flex items-center gap-6 text-sm text-slate-500">
              <Link href="/privacy" className="hover:text-gold-400 transition-colors">Privacy Policy</Link>
              <Link href="/terms" className="hover:text-gold-400 transition-colors">Terms of Use</Link>
              <Link href="/cookies" className="hover:text-gold-400 transition-colors">Cookie Policy</Link>
              <Link href="/accessibility" className="hover:text-gold-400 transition-colors">Accessibility</Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}