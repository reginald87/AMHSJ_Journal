import { PrismaClient } from '@prisma/client';
import { PrismaBetterSqlite3 } from '@prisma/adapter-better-sqlite3';

const adapter = new PrismaBetterSqlite3({ url: process.env.DATABASE_URL || 'file:./dev.db' });
const prisma = new PrismaClient({ adapter });

async function main() {
  const journal = await prisma.journal.findFirst({ where: { isActive: true } });
  if (!journal) { console.log('No active journal found'); return; }

  await prisma.journal.update({
    where: { id: journal.id },
    data: {
      heroBadge: 'Now Accepting Submissions for 2025 Issues',
      heroTitle: 'Advances in Medicine and Health Sciences Journal',
      heroSubtitle: 'A peer-reviewed, open-access journal publishing high-quality research across all disciplines of medicine and health sciences.',
      heroISSN: '2XXX-XXXX (Print) | 2XXX-XXXX (Online)',
      heroImpactFactor: '2.5 (2024)',
      homepageStats: JSON.stringify([
        { value: '500+', label: 'Published Articles' },
        { value: '150+', label: 'Editorial Board Members' },
        { value: '50+', label: 'Countries Represented' },
        { value: '2.5', label: 'Impact Factor (2024)' },
      ]),
      homepageFeatures: JSON.stringify([
        { title: 'Rigorous Peer Review', description: 'Double-blind peer review process with expert reviewers from leading institutions worldwide.', icon: 'Search' },
        { title: 'Fast Publication', description: 'First decision within 4 weeks. Accepted articles published online within 2 weeks of acceptance.', icon: 'Clock' },
        { title: 'Open Access', description: 'All articles freely available online immediately upon publication under CC BY 4.0 license.', icon: 'Globe' },
        { title: 'Ethical Standards', description: 'COPE member adhering to highest ethical standards in publication and research integrity.', icon: 'Shield' },
        { title: 'Medical Focus', description: 'Comprehensive coverage of clinical medicine, biomedical research, and health sciences.', icon: 'HeartPulse' },
        { title: 'Global Reach', description: 'Indexed in PubMed, Scopus, Web of Science, and other major databases.', icon: 'GraduationCap' },
      ]),
      homepageIndexers: JSON.stringify([
        { name: 'PubMed', color: 'bg-blue-600' },
        { name: 'Scopus', color: 'bg-red-600' },
        { name: 'Web of Science', color: 'bg-purple-600' },
        { name: 'DOAJ', color: 'bg-green-600' },
        { name: 'Google Scholar', color: 'bg-slate-700' },
        { name: 'Crossref', color: 'bg-orange-600' },
        { name: 'Europe PMC', color: 'bg-teal-600' },
        { name: 'CNKI', color: 'bg-indigo-600' },
      ]),
      homepageCtaHeading: 'Submit Your Manuscript Today',
      homepageCtaText: 'Join thousands of researchers who trust AMHSJ for rapid, rigorous, and impactful publication of their work.',
      heroCarousel: JSON.stringify([
        {
          id: 1,
          image: 'https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?w=1920&q=80',
          title: 'Advancing Medical Research',
          subtitle: 'Publish your groundbreaking discoveries in a globally recognized, peer-reviewed journal',
          ctaText: 'Submit Your Manuscript',
          ctaHref: '/submit',
        },
        {
          id: 2,
          image: 'https://images.unsplash.com/photo-1559757148-5c350d0d3c56?w=1920&q=80',
          title: 'Cutting-Edge Clinical Trials',
          subtitle: 'Access the latest clinical research and trial methodologies from leading institutions worldwide',
          ctaText: 'Browse Latest Articles',
          ctaHref: '/articles',
        },
        {
          id: 3,
          image: 'https://images.unsplash.com/photo-1576091160550-2173dba999ef?w=1920&q=80',
          title: 'Global Health Impact',
          subtitle: 'Join a community of researchers from 100+ countries advancing healthcare for all',
          ctaText: 'Explore Our Journal',
          ctaHref: '/journal',
        },
        {
          id: 4,
          image: 'https://images.unsplash.com/photo-1550751827-4bd374c3f58b?w=1920&q=80',
          title: 'Rapid Publication & Open Access',
          subtitle: 'Fast-track your research with our streamlined review process and immediate open access',
          ctaText: 'View Author Guidelines',
          ctaHref: '/guidelines',
        },
      ]),
    },
  });

  console.log('Homepage data seeded successfully!');
}

main().catch(console.error).finally(() => prisma.$disconnect());
