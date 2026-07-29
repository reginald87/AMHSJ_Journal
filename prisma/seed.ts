import 'dotenv/config';
import { PrismaClient, Role, ManuscriptStatus } from '@prisma/client';
import { PrismaBetterSqlite3 } from '@prisma/adapter-better-sqlite3';
import bcrypt from 'bcryptjs';

const adapter = new PrismaBetterSqlite3({
  url: process.env.DATABASE_URL || 'file:./dev.db',
});

const prisma = new PrismaClient({ adapter });

async function main() {
  console.log('Seeding database...');

  // 1. Create Journal
  const journal = await prisma.journal.upsert({
    where: { shortName: 'AMHSJ' },
    update: {},
    create: {
      name: 'Advances in Medicine and Health Sciences Journal',
      shortName: 'AMHSJ',
      email: 'editor@amhsj.org',
      description: 'A peer-reviewed, open-access journal dedicated to publishing high-quality research across all disciplines of medicine and health sciences.',
      scope: 'All disciplines of medicine and health sciences',
      aims: 'To accelerate the dissemination of medical knowledge to improve patient outcomes worldwide.',
      website: 'https://amhsj.org',
      heroBadge: 'Now Accepting Submissions',
      heroTitle: 'Advances in Medicine and Health Sciences Journal',
      heroSubtitle: 'A peer-reviewed, open-access journal advancing medical knowledge across all disciplines.',
      heroISSN: 'ISSN: 2520-1212 (Print) | 2520-1220 (Online)',
      heroImpactFactor: 'Impact Factor: 3.2',
      homepageCtaHeading: 'Submit Your Manuscript Today',
      homepageCtaText: 'Join thousands of researchers who trust AMHSJ to share their work with the global scientific community.',
      heroCarousel: JSON.stringify([
        { id: 1, image: '/carousel/medical-research.svg', title: 'Advances in Medicine and Health Sciences Journal', subtitle: 'A peer-reviewed, open-access journal advancing medical knowledge across all disciplines.', ctaText: 'Submit Your Research', ctaHref: '/submit' },
        { id: 2, image: '/carousel/peer-review.svg', title: 'Rigorous Peer Review', subtitle: 'Every manuscript undergoes thorough evaluation by experts in the field to ensure scientific excellence.', ctaText: 'Learn About Our Process', ctaHref: '/about' },
        { id: 3, image: '/carousel/global-research.svg', title: 'Global Research Community', subtitle: 'Connecting researchers, clinicians, and institutions worldwide to advance healthcare.', ctaText: 'Meet Our Editorial Board', ctaHref: '/editorial-board' },
        { id: 4, image: '/carousel/open-access.svg', title: 'Open Access Publishing', subtitle: 'Free and unrestricted access to research for everyone, accelerating the pace of scientific discovery.', ctaText: 'Start a Submission', ctaHref: '/submit' },
      ]),
      homepageStats: JSON.stringify([
        { value: '500+', label: 'Articles Published', icon: 'FileText' },
        { value: '2,800+', label: 'Active Authors', icon: 'Users' },
        { value: '85', label: 'Countries Represented', icon: 'Globe' },
        { value: '3.2', label: 'Impact Factor', icon: 'Award' },
      ]),
      homepageFeatures: JSON.stringify([
        { title: 'Rapid Peer Review', description: 'Our streamlined review process provides first decisions within 21 days, without compromising on thoroughness or scientific rigor.', icon: 'Clock' },
        { title: 'Open Access', description: 'All published articles are freely accessible worldwide, maximizing the visibility and impact of your research.', icon: 'Globe' },
        { title: 'Expert Editorial Board', description: 'Led by distinguished researchers from Harvard, Johns Hopkins, Stanford, and other world-renowned institutions.', icon: 'Award' },
        { title: 'Global Reach', description: 'Publish alongside researchers from over 85 countries, contributing to a diverse and inclusive scientific dialogue.', icon: 'Users' },
        { title: 'Ethical Standards', description: 'We adhere to COPE guidelines and maintain the highest standards of publication ethics and research integrity.', icon: 'Shield' },
        { title: 'Author Support', description: 'Dedicated editorial assistance at every stage, from submission through publication, ensuring a seamless experience.', icon: 'GraduationCap' },
      ]),
      scopeAreas: JSON.stringify([
        'Internal Medicine & General Practice', 'Surgery & Surgical Subspecialties', 'Cardiology & Cardiovascular Medicine',
        'Neurology & Neurosurgery', 'Oncology & Cancer Research', 'Pediatrics & Neonatology',
        'Obstetrics & Gynecology', 'Public Health & Epidemiology', 'Infectious Diseases & Microbiology',
        'Pharmacology & Therapeutics', 'Radiology & Medical Imaging', 'Biomedical Engineering & Technology',
        'Mental Health & Psychiatry', 'Emergency & Critical Care Medicine', 'Dermatology & Cosmetic Medicine',
        'Endocrinology & Metabolism', 'Gastroenterology & Hepatology', 'Pulmonology & Respiratory Medicine',
        'Nephrology & Urology', 'Genetics & Genomics', 'Immunology & Allergy',
        'Environmental & Occupational Health', 'Nutrition & Dietetics', 'Rehabilitation & Physical Medicine',
        'Health Policy & Health Services Research',
      ]),
      homepageIndexers: JSON.stringify([
        { name: 'PubMed', color: 'bg-blue-600' },
        { name: 'Scopus', color: 'bg-red-600' },
        { name: 'Web of Science', color: 'bg-navy-800' },
        { name: 'DOAJ', color: 'bg-green-600' },
        { name: 'Google Scholar', color: 'bg-sky-600' },
        { name: 'CrossRef', color: 'bg-purple-600' },
        { name: 'Dimensions', color: 'bg-teal-600' },
        { name: 'Semantic Scholar', color: 'bg-orange-600' },
      ]),
      isActive: true,
    },
  });
  console.log('Journal created:', journal.id);

  // 2. Create Users
  const users = [
    { email: 'admin@amhsj.org', firstName: 'Admin', lastName: 'User', role: 'ADMIN' as Role, affiliation: 'AMHSJ Editorial Office', country: 'Nigeria', status: 'ACTIVE' as const, department: undefined, orcid: undefined },
    { email: 'john.smith@university.edu', firstName: 'John', lastName: 'Smith', role: 'EDITOR_IN_CHIEF' as Role, affiliation: 'Harvard Medical School', country: 'United States', department: 'Internal Medicine', orcid: '0000-0001-1234-5678', status: 'ACTIVE' as const },
    { email: 'sarah.johnson@hospital.org', firstName: 'Sarah', lastName: 'Johnson', role: 'EDITOR' as Role, affiliation: 'Johns Hopkins Hospital', country: 'United States', department: 'Cardiology', orcid: '0000-0002-2345-6789', status: 'ACTIVE' as const },
    { email: 'michael.chen@med.edu', firstName: 'Michael', lastName: 'Chen', role: 'EDITOR' as Role, affiliation: 'Stanford Medical Center', country: 'United States', department: 'Neurology', orcid: '0000-0003-3456-7890', status: 'ACTIVE' as const },
    { email: 'emily.brown@research.org', firstName: 'Emily', lastName: 'Brown', role: 'REVIEWER' as Role, affiliation: 'MIT', country: 'United States', department: 'Biomedical Engineering', status: 'ACTIVE' as const, orcid: undefined },
    { email: 'david.wilson@clinic.com', firstName: 'David', lastName: 'Wilson', role: 'REVIEWER' as Role, affiliation: 'Mayo Clinic', country: 'United States', department: 'Surgery', status: 'ACTIVE' as const, orcid: undefined },
    { email: 'lisa.garcia@uni.edu', firstName: 'Lisa', lastName: 'Garcia', role: 'REVIEWER' as Role, affiliation: 'UCSF', country: 'United States', department: 'Oncology', status: 'ACTIVE' as const, orcid: undefined },
    { email: 'james.taylor@lab.gov', firstName: 'James', lastName: 'Taylor', role: 'REVIEWER' as Role, affiliation: 'NIH', country: 'United States', department: 'Pharmacology', status: 'ACTIVE' as const, orcid: undefined },
    { email: 'anna.lee@hospital.kr', firstName: 'Anna', lastName: 'Lee', role: 'AUTHOR' as Role, affiliation: 'Seoul National University Hospital', country: 'South Korea', status: 'ACTIVE' as const, department: undefined, orcid: undefined },
    { email: 'robert.martinez@med.mx', firstName: 'Robert', lastName: 'Martinez', role: 'AUTHOR' as Role, affiliation: 'UNAM Medical School', country: 'Mexico', status: 'ACTIVE' as const, department: undefined, orcid: undefined },
    { email: 'priya.patel@aiims.in', firstName: 'Priya', lastName: 'Patel', role: 'AUTHOR' as Role, affiliation: 'AIIMS Delhi', country: 'India', department: 'Pediatrics', status: 'ACTIVE' as const, orcid: undefined },
    { email: 'ahmed.hassan@cairo.edu', firstName: 'Ahmed', lastName: 'Hassan', role: 'AUTHOR' as Role, affiliation: 'Cairo University', country: 'Egypt', department: 'Radiology', status: 'ACTIVE' as const, orcid: undefined },
  ];

  const createdUsers: (typeof users[0] & { id: string })[] = [];
  for (const u of users) {
    const user = await prisma.user.upsert({
      where: { email: u.email },
      update: {},
      create: {
        ...u,
        passwordHash: await bcrypt.hash('password123', 12),
        status: 'ACTIVE',
        emailVerified: new Date(),
      },
    });
    createdUsers.push({ ...u, id: user.id });
  }
  console.log(`Created ${createdUsers.length} users`);

  // 3. Create Editorial Board
  const editorialMembers = [
    { userId: createdUsers[1].id, role: 'EDITOR_IN_CHIEF' as Role },
    { userId: createdUsers[2].id, role: 'DEPUTY_EDITOR_IN_CHIEF' as Role },
    { userId: createdUsers[3].id, role: 'ASSOCIATE_EDITOR' as Role },
    { userId: createdUsers[4].id, role: 'REVIEWER' as Role },
    { userId: createdUsers[5].id, role: 'REVIEWER' as Role },
    { userId: createdUsers[6].id, role: 'REVIEWER' as Role },
  ];

  for (const member of editorialMembers) {
    await prisma.editorialRole.create({
      data: {
        journalId: journal.id,
        userId: member.userId,
        role: member.role,
        isActive: true,
      },
    }).catch(() => {});
  }
  console.log('Editorial board created');

  // 4. Create Volumes
  const vol1 = await prisma.volume.upsert({
    where: { journalId_number: { journalId: journal.id, number: 1 } },
    update: {},
    create: { journalId: journal.id, number: 1, year: 2022, title: 'Inaugural Volume', isPublished: true },
  });
  const vol2 = await prisma.volume.upsert({
    where: { journalId_number: { journalId: journal.id, number: 2 } },
    update: {},
    create: { journalId: journal.id, number: 2, year: 2023, title: 'Building Momentum', isPublished: true },
  });
  const vol3 = await prisma.volume.upsert({
    where: { journalId_number: { journalId: journal.id, number: 3 } },
    update: {},
    create: { journalId: journal.id, number: 3, year: 2024, title: 'Advancing Research', isPublished: true },
  });
  const vol4 = await prisma.volume.upsert({
    where: { journalId_number: { journalId: journal.id, number: 4 } },
    update: {},
    create: { journalId: journal.id, number: 4, year: 2025, title: 'Current Volume', isPublished: false },
  });
  console.log('Volumes created');

  // 5. Create Manuscripts
  const manuscriptStatuses: ManuscriptStatus[] = ['SUBMITTED', 'UNDER_REVIEW', 'ACCEPTED', 'PUBLISHED', 'REJECTED', 'UNDER_REVISION'];
  const articleTypes = ['ORIGINAL_RESEARCH', 'REVIEW', 'CASE_REPORT', 'SHORT_COMMUNICATION', 'LETTER_TO_EDITOR'];
  const titles = [
    'Cardiovascular Risk Factors in Urban Populations: A Multi-Center Study',
    'Machine Learning Approaches for Early Detection of Diabetic Retinopathy',
    'COVID-19 Long-term Effects on Pulmonary Function: A Prospective Cohort',
    'Novel Biomarkers for Early Diagnosis of Alzheimer Disease',
    'Telemedicine Adoption in Rural Healthcare Settings: Barriers and Facilitators',
    'Antimicrobial Resistance Patterns in Hospital-Acquired Infections',
    'Effect of Exercise Interventions on Mental Health Outcomes: Meta-Analysis',
    'Genetic Susceptibility to Autoimmune Disorders: A Genome-Wide Study',
    'Maternal Nutrition and Offspring Metabolic Health: Long-term Follow-up',
    'Surgical Outcomes in Minimally Invasive vs Open Approaches: Systematic Review',
    'Artificial Intelligence in Radiology: Current Applications and Future Directions',
    'Pediatric Vaccination Hesitancy: Understanding Parental Perspectives',
    'Nanotechnology-Based Drug Delivery Systems for Cancer Therapy',
    'Global Burden of Non-Communicable Diseases: Trends and Projections',
    'Point-of-Care Testing in Resource-Limited Settings: A Practical Guide',
    'Stem Cell Therapy for Neurodegenerative Diseases: Current Evidence',
    'Environmental Determinants of Respiratory Health in Children',
    'Precision Medicine in Oncology: From Bench to Bedside',
    'Healthcare Worker Burnout: Causes, Consequences, and Interventions',
    'Microbiome and Human Health: Emerging Therapeutic Opportunities',
  ];

  for (let i = 0; i < titles.length; i++) {
    const authorIdx = 8 + (i % 4); // Authors start at index 8
    const status = manuscriptStatuses[i % manuscriptStatuses.length];
    const daysAgo = Math.floor(Math.random() * 365);

    const manuscript = await prisma.manuscript.create({
      data: {
        journalId: journal.id,
        title: titles[i],
        articleType: articleTypes[i % articleTypes.length],
        abstract: `This study investigates ${titles[i].toLowerCase().replace(/[.:]/g, '')}. Our findings provide important insights into the field and have significant implications for clinical practice.`,
        keywords: 'medicine, health sciences, research, clinical study',
        correspondingAuthorId: createdUsers[authorIdx].id,
        status,
        submittedAt: new Date(Date.now() - daysAgo * 86400000),
        assignedEditorId: createdUsers[1 + (i % 3)].id,
      },
    });

    const corAuthor = createdUsers[authorIdx];
    await prisma.manuscriptAuthor.create({
      data: {
        manuscriptId: manuscript.id,
        userId: corAuthor.id,
        firstName: corAuthor.firstName,
        lastName: corAuthor.lastName,
        email: corAuthor.email,
        affiliation: users[authorIdx].affiliation || 'Unknown',
        orcid: users[authorIdx].orcid || null,
        position: 1,
        isCorresponding: true,
      },
    });

    const coAuthorIdx = 8 + ((i + 1) % 4);
    if (coAuthorIdx !== authorIdx) {
      const coAuthor = createdUsers[coAuthorIdx];
      await prisma.manuscriptAuthor.create({
        data: {
          manuscriptId: manuscript.id,
          userId: coAuthor.id,
          firstName: coAuthor.firstName,
          lastName: coAuthor.lastName,
          email: coAuthor.email,
          affiliation: users[coAuthorIdx].affiliation || 'Unknown',
          orcid: users[coAuthorIdx].orcid || null,
          position: 2,
          isCorresponding: false,
        },
      });
    }
  }
  console.log('Manuscripts created');

  // 6. Create CMS Pages
  const pages = [
    { slug: 'about', title: 'About AMHSJ', content: '<p>Advances in Medicine and Health Sciences Journal (AMHSJ) is a peer-reviewed, open-access journal.</p>', isPublished: true },
    { slug: 'guidelines', title: 'Author Guidelines', content: '<p>Prepare manuscripts according to our comprehensive guidelines.</p>', isPublished: true },
    { slug: 'contact', title: 'Contact Us', content: '<p>Reach out to our editorial office for any inquiries.</p>', isPublished: true },
    { slug: 'ethics', title: 'Publication Ethics', content: '<p>We follow COPE guidelines for publication ethics.</p>', isPublished: true },
    { slug: 'faq', title: 'Frequently Asked Questions', content: '<p>Find answers to common questions about submission and review.</p>', isPublished: true },
  ];

  for (const page of pages) {
    await prisma.page.upsert({
      where: { slug: page.slug },
      update: { content: page.content },
      create: page,
    });
  }
  console.log('CMS pages seeded');

  console.log('Seeding complete!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
