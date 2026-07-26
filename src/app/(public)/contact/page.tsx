import { Metadata } from 'next';
import { Mail, MapPin, Phone, Clock, Globe } from 'lucide-react';
import { Badge } from '@/components/ui/Badge';
import { prisma } from '@/lib/prisma';
import { ContactForm } from './ContactForm';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'Contact Us | AMHSJ',
  description: 'Get in touch with the Advances in Medicine and Health Sciences Journal editorial office.',
};

interface ContactSections {
  heroTitle?: string;
  heroSubtitle?: string;
  email?: string;
  phone?: string;
  address?: string;
  officeHours?: string;
  website?: string;
  officeDescription?: string;
  faqs?: { q: string; a: string }[];
}

async function getContactPage() {
  const page = await prisma.page.findUnique({ where: { slug: 'contact' } });
  if (!page || !page.sections) return null;
  try {
    return { title: page.title, ...JSON.parse(page.sections) as ContactSections };
  } catch {
    return null;
  }
}

export default async function ContactPage() {
  const data = await getContactPage();
  const s: ContactSections = data ?? {};
  const heroTitle = s.heroTitle ?? 'Contact Us';
  const heroSubtitle = s.heroSubtitle ?? 'Have a question about submitting your manuscript, the review process, or anything else? Our editorial team is here to help.';
  const officeDescription = s.officeDescription ?? 'We aim to respond to all inquiries within 2–3 business days. For urgent matters regarding manuscript submissions, please include your manuscript ID in the subject line.';
  const faqs = s.faqs ?? [
    { q: 'How do I submit a manuscript?', a: 'Use our online submission system at /submit. You will need to create an account and follow the 5-step submission wizard.' },
    { q: 'What is the peer review timeline?', a: 'Initial editorial screening takes 1–2 weeks. Peer review typically takes 4–6 weeks. You will receive a decision within 6–8 weeks of submission.' },
    { q: 'Is there a submission fee?', a: 'AMHSJ charges no submission fees. A modest article processing charge (APC) applies upon acceptance, with waivers available for authors from low-income countries.' },
    { q: 'How can I become a reviewer?', a: 'Visit our editorial board page or email us at editorial@amhsj.org with your CV and areas of expertise. We welcome new reviewers.' },
  ];

  const contactInfo = [
    { icon: Mail, label: 'Email', value: s.email ?? 'editorial@amhsj.org', href: `mailto:${s.email ?? 'editorial@amhsj.org'}` },
    { icon: Phone, label: 'Phone', value: s.phone ?? '+1 (555) 123-4567', href: `tel:${(s.phone ?? '+15551234567').replace(/[^+\d]/g, '')}` },
    { icon: MapPin, label: 'Address', value: s.address ?? '123 Medical Center Drive, Suite 400, Boston, MA 02115, USA', href: null },
    { icon: Clock, label: 'Office Hours', value: s.officeHours ?? 'Monday – Friday, 9:00 AM – 5:00 PM EST', href: null },
    { icon: Globe, label: 'Website', value: s.website ?? 'www.amhsj.org', href: `https://${s.website ?? 'www.amhsj.org'}` },
  ];

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-navy-950">
      {/* Hero */}
      <section className="gradient-navy relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('/grid.svg')] bg-center opacity-5" />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 sm:py-32">
          <div className="max-w-3xl animate-fade-in">
            <span className="inline-flex items-center gap-2 px-4 py-2 bg-gold-500/20 text-gold-400 rounded-full text-sm font-medium mb-6">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-gold-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-gold-500"></span>
              </span>
              Get in Touch
            </span>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white leading-tight mb-6">
              {heroTitle}
            </h1>
            <p className="text-xl sm:text-2xl text-slate-300 leading-relaxed">
              {heroSubtitle}
            </p>
          </div>
        </div>
        <div className="absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-t from-slate-50 dark:from-navy-950 to-transparent" />
      </section>

      {/* Contact Info + Form */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-5 gap-12">
            <div className="lg:col-span-2 space-y-8">
              <div>
                <Badge variant="navy" size="lg" className="px-4 py-2 text-sm mb-4">Contact Information</Badge>
                <h2 className="text-2xl font-bold text-navy-900 dark:text-white mb-4">Editorial Office</h2>
                <p className="text-slate-600 dark:text-slate-400 leading-relaxed">{officeDescription}</p>
              </div>
              <div className="space-y-5">
                {contactInfo.map((item) => (
                  <div key={item.label} className="flex items-start gap-4">
                    <div className="w-10 h-10 bg-navy-100 dark:bg-navy-800 rounded-lg flex items-center justify-center text-navy-700 dark:text-gold-400 flex-shrink-0">
                      <item.icon className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-slate-500 dark:text-slate-400">{item.label}</p>
                      {item.href ? (
                        <a href={item.href} className="text-navy-900 dark:text-white hover:text-gold-500 transition-colors">{item.value}</a>
                      ) : (
                        <p className="text-navy-900 dark:text-white">{item.value}</p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div className="lg:col-span-3">
              <div className="bg-white dark:bg-navy-900 rounded-xl shadow-sm border border-slate-200 dark:border-navy-800 p-8">
                <h3 className="text-xl font-bold text-navy-900 dark:text-white mb-6">Send Us a Message</h3>
                <ContactForm />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Quick Links */}
      <section className="py-20 bg-white dark:bg-navy-900 border-t border-slate-200 dark:border-navy-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <Badge variant="navy" size="lg" className="px-4 py-2 text-sm mb-4">Common Questions</Badge>
            <h2 className="text-3xl font-bold text-navy-900 dark:text-white mb-4">Frequently Asked Questions</h2>
          </div>
          <div className="grid md:grid-cols-2 gap-6 max-w-4xl mx-auto">
            {faqs.map((item, i) => (
              <div key={i} className="bg-slate-50 dark:bg-navy-950 rounded-xl p-6 border border-slate-200 dark:border-navy-800">
                <h4 className="font-semibold text-navy-900 dark:text-white mb-2">{item.q}</h4>
                <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">{item.a}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
