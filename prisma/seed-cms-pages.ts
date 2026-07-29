import { PrismaClient } from '@prisma/client';
import { PrismaBetterSqlite3 } from '@prisma/adapter-better-sqlite3';

const adapter = new PrismaBetterSqlite3({
  url: process.env.DATABASE_URL || 'file:./dev.db',
});

const prisma = new PrismaClient({ adapter });

const CONTACT_SECTIONS = {
  heroTitle: 'Contact Us',
  heroSubtitle: 'Have a question about submitting your manuscript, the review process, or anything else? Our editorial team is here to help.',
  email: 'editorial@amhsj.org',
  phone: '+1 (555) 123-4567',
  address: '123 Medical Center Drive, Suite 400, Boston, MA 02115, USA',
  officeHours: 'Monday – Friday, 9:00 AM – 5:00 PM EST',
  website: 'www.amhsj.org',
  officeDescription: 'We aim to respond to all inquiries within 2–3 business days. For urgent matters regarding manuscript submissions, please include your manuscript ID in the subject line.',
  faqs: [
    { q: 'How do I submit a manuscript?', a: 'Use our online submission system at /submit. You will need to create an account and follow the 5-step submission wizard.' },
    { q: 'What is the peer review timeline?', a: 'Initial editorial screening takes 1–2 weeks. Peer review typically takes 4–6 weeks. You will receive a decision within 6–8 weeks of submission.' },
    { q: 'Is there a submission fee?', a: 'AMHSJ charges no submission fees. A modest article processing charge (APC) applies upon acceptance, with waivers available for authors from low-income countries.' },
    { q: 'How can I become a reviewer?', a: 'Visit our editorial board page or email us at editorial@amhsj.org with your CV and areas of expertise. We welcome new reviewers.' },
  ],
};

const ABOUT_SECTIONS = {
  heroTitle: 'About Advances in Medicine and Health Sciences Journal',
  heroSubtitle: 'A peer-reviewed, open-access journal dedicated to publishing high-quality research across all disciplines of medicine and health sciences.',
  issn: '2XXX-XXXX (Print) | 2XXX-XXXX (Online)',
  impactFactor: '2.5 (2024)',
  missionTitle: 'Our Mission',
  missionDescription: 'To publish high-quality, peer-reviewed medical research that advances scientific knowledge and improves patient care globally. We strive to be the premier open-access journal for physicians, researchers, and healthcare professionals seeking cutting-edge medical evidence.',
  visionTitle: 'Our Vision',
  visionDescription: 'To become the leading international medical journal recognized for scientific rigor, ethical publishing practices, and rapid dissemination of research that transforms clinical practice and improves health outcomes across diverse populations worldwide.',
  aimsAndScope: [
    { category: 'Medicine & Clinical Sciences', items: ['General and Internal Medicine', 'Surgery and Surgical Specialties', 'Family and Community Medicine', 'Pediatrics and Adolescent Health', 'Obstetrics and Gynecology', 'Psychiatry and Mental Health', 'Emergency and Critical Care', 'Infectious Diseases', 'Chronic Diseases', 'Geriatric Care'] },
    { category: 'Public Health & Allied Sciences', items: ['Public and Community Health', 'Epidemiology and Biostatistics', 'Environmental Health', 'Health Promotion', 'Global Health Systems', 'Disaster Medicine', 'Social Determinants of Health', 'Healthcare Management', 'Health Economics', 'Digital Health'] },
    { category: 'Nursing, Pharmacy & Rehabilitation', items: ['Nursing Science and Midwifery', 'Clinical Pharmacy', 'Pharmacology and Toxicology', 'Physiotherapy', 'Rehabilitation Sciences', 'Complementary Medicine', 'Drug Development', 'Biomedical Engineering', 'Assistive Technology', 'Therapeutics'] },
    { category: 'Biomedical & Life Sciences', items: ['Anatomy and Physiology', 'Biochemistry and Molecular Biology', 'Microbiology and Immunology', 'Genetics and Genomics', 'Cancer Biology', 'Neurosciences', 'Biotechnology', 'Medical Laboratory Science', 'Molecular Diagnostics', 'Developmental Biology'] },
    { category: 'Nutrition & Food Science', items: ['Human Nutrition and Dietetics', 'Public Health Nutrition', 'Food Safety', 'Nutritional Epidemiology', 'Agriculture and Food Security', 'Veterinary Public Health', 'Food Science', 'Nutritional Biochemistry', 'Clinical Nutrition', 'Community Nutrition'] },
    { category: 'Interdisciplinary & Emerging Fields', items: ['Scientific Ethics', 'Research Integrity', 'Climate Change and Health', 'Population Health', 'Health Policy Innovation', 'Precision Medicine', 'Translational Research', 'AI in Medicine', 'Telemedicine', 'Health Informatics'] },
  ],
  editorialPolicies: [
    { title: 'Peer Review', description: 'All manuscripts undergo rigorous double-blind peer review by at least two independent experts in the field.' },
    { title: 'Open Access', description: 'All articles are freely available immediately upon publication under the Creative Commons Attribution 4.0 International (CC BY 4.0) license.' },
    { title: 'Publication Ethics', description: 'We follow COPE guidelines and require declarations of conflicts of interest, funding sources, and ethical approvals.' },
    { title: 'Data Availability', description: 'Authors are encouraged to deposit data in public repositories and provide data availability statements.' },
    { title: 'Authorship', description: 'All authors must meet ICMJE criteria and approve the final manuscript version.' },
    { title: 'Corrections & Retractions', description: 'We follow COPE guidelines for corrections, expressions of concern, and retractions when necessary.' },
  ],
  indexing: [
    'PubMed/MEDLINE', 'Scopus', 'Web of Science (ESCI)', 'DOAJ (Directory of Open Access Journals)',
    'Google Scholar', 'Crossref', 'Europe PMC', 'Index Medicus', 'EMBASE', 'CABI',
  ],
  history: [
    { year: '2018', title: 'Journal Founded', description: 'AMHSJ was established to address the growing need for rapid, open-access publication of high-quality medical research across all disciplines.' },
    { year: '2019', title: 'First Issue Published', description: 'The inaugural issue featured groundbreaking research in cardiology, oncology, and infectious diseases from researchers across 20 countries.' },
    { year: '2020', title: 'Indexed in DOAJ', description: 'Achieved Directory of Open Access Journals indexing, recognizing our commitment to open access best practices and publishing standards.' },
    { year: '2021', title: 'PubMed/MEDLINE Indexing', description: 'Achieved MEDLINE indexing, significantly increasing global visibility and accessibility of published research.' },
    { year: '2022', title: 'Scopus & Web of Science', description: 'Indexed in Scopus and Web of Science (ESCI), establishing AMHSJ as a globally recognized medical journal.' },
    { year: '2023', title: 'Impact Factor 2.5', description: 'Received first official Impact Factor of 2.5, reflecting the growing citation impact and quality of published research.' },
    { year: '2024', title: 'Global Expansion', description: 'Expanded editorial board to 150+ experts from 50+ countries, representing the full diversity of global medical research.' },
  ],
  ctaHeading: 'Submit Your Research Today',
  ctaText: 'Join thousands of researchers who trust AMHSJ for rapid, rigorous, and impactful publication of their work.',
  stats: [
    { value: '2018', label: 'Founded' },
    { value: '50+', label: 'Countries' },
    { value: '500+', label: 'Published Articles' },
    { value: '150+', label: 'Editorial Board' },
    { value: '2.5', label: 'Impact Factor (2024)' },
    { value: '100%', label: 'Open Access' },
  ],
};

async function seedPage(slug: string, title: string, description: string, sections: Record<string, unknown>) {
  const existing = await prisma.page.findUnique({ where: { slug } });
  const sectionsJson = JSON.stringify(sections);

  if (existing) {
    await prisma.page.update({
      where: { slug },
      data: {
        title,
        description,
        sections: sectionsJson,
        isPublished: true,
      },
    });
    console.log(`  Updated "${slug}" page`);
  } else {
    await prisma.page.create({
      data: {
        slug,
        title,
        description,
        content: description,
        sections: sectionsJson,
        isPublished: true,
      },
    });
    console.log(`  Created "${slug}" page`);
  }
}

async function main() {
  console.log('Seeding CMS pages with structured data...\n');

  await seedPage(
    'contact',
    'Contact Us',
    'Get in touch with the Advances in Medicine and Health Sciences Journal editorial office.',
    CONTACT_SECTIONS,
  );

  await seedPage(
    'about',
    'About AMHSJ',
    'Learn about Advances in Medicine and Health Sciences Journal - our mission, scope, editorial policies, and commitment to open access publishing.',
    ABOUT_SECTIONS,
  );

  console.log('\nCMS page seeding complete!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
