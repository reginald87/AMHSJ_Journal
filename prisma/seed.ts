import { PrismaClient } from '@prisma/client';
import { PrismaBetterSqlite3 } from '@prisma/adapter-better-sqlite3';

const adapter = new PrismaBetterSqlite3({
  url: process.env.DATABASE_URL || 'file:./dev.db',
});

const prisma = new PrismaClient({ adapter });

async function main() {
  const pages = [
    {
      slug: 'about',
      title: 'About AMHSJ',
      description: 'Learn about Advances in Medicine and Health Sciences Journal.',
      content: `<p>Advances in Medicine and Health Sciences Journal (AMHSJ) is a peer-reviewed, open-access journal dedicated to publishing high-quality research across all disciplines of medicine and health sciences.</p>
<p>Our mission is to accelerate the dissemination of medical knowledge to improve patient outcomes worldwide. We welcome original research articles, reviews, case reports, and short communications.</p>`,
      metaTitle: 'About AMHSJ',
      metaDescription: 'Learn about Advances in Medicine and Health Sciences Journal - our mission, scope, editorial policies, and commitment to open access publishing.',
    },
    {
      slug: 'guidelines',
      title: 'Author Guidelines',
      description: 'Submission guidelines for authors.',
      content: `<p>Authors should prepare manuscripts according to the following guidelines before submitting through our online submission system.</p>
<h3>Manuscript Preparation</h3>
<p>Manuscripts should be written in clear English and follow the structure: Title, Abstract, Keywords, Introduction, Methods, Results, Discussion, References, Tables, Figures.</p>
<h3>Submission Process</h3>
<p>All submissions undergo an initial editorial screening followed by double-blind peer review. Authors will be notified of the editorial decision within 4-6 weeks.</p>`,
      metaTitle: 'Author Guidelines | AMHSJ',
      metaDescription: 'Submission guidelines for authors publishing in Advances in Medicine and Health Sciences Journal.',
    },
    {
      slug: 'contact',
      title: 'Contact Us',
      description: 'Get in touch with the AMHSJ editorial office.',
      content: `<p>Please use the form below to contact our editorial office. We aim to respond to all inquiries within 2-3 business days.</p>`,
      metaTitle: 'Contact Us | AMHSJ',
      metaDescription: 'Contact the editorial office of Advances in Medicine and Health Sciences Journal.',
    },
  ];

  for (const page of pages) {
    await prisma.page.upsert({
      where: { slug: page.slug },
      update: {},
      create: page,
    });
  }

  console.log('Seeded CMS pages.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
