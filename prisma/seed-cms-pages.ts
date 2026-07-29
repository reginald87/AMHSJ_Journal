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

  await seedPage(
    'guidelines',
    'Submission Guidelines',
    'Submission guidelines for authors publishing in Advances in Medicine and Health Sciences Journal.',
    {
      heroTitle: 'Submission Guidelines',
      heroSubtitle: 'Please read carefully before submission. Follow these guidelines to ensure your manuscript meets all requirements and avoids rejection.',
      email: 'amhsj@bayelsamedicaluniversity.edu.ng',
      articleTypes: [
        { type: 'Original Research Articles', description: 'Reports of original research', wordLimit: '3000 words max', abstract: '300 words max', references: 'Vancouver format', figures: '250 words each' },
        { type: 'Review Articles', description: 'Comprehensive reviews', wordLimit: '3500 words max', abstract: '300 words max', references: 'Vancouver format', figures: '250 words each' },
        { type: 'Case/Audit Reports', description: 'Clinical case reports', wordLimit: '800 words max', abstract: '300 words max', references: 'Vancouver format', figures: '250 words each' },
        { type: 'Letters', description: 'Brief communications', wordLimit: 'As appropriate', abstract: 'Not required', references: 'Vancouver format', figures: 'Minimal' },
      ],
      abstractStructure: [
        { step: '1', title: 'Background', description: 'Study rationale, context, and what was previously known' },
        { step: '2', title: 'Objectives', description: 'Clear statement of study aims and research questions' },
        { step: '3', title: 'Methods', description: 'Study design, participants, procedures, and analytical methods' },
        { step: '4', title: 'Results', description: 'Main findings with key data and statistical significance' },
        { step: '5', title: 'Conclusion', description: 'Principal conclusions and their clinical/scientific implications' },
      ],
      peerReviewCriteria: [
        { title: 'Structure & Content', items: ['Does the title reflect the contents?', 'Does abstract reflect all study aspects?', 'Is study rationale adequately described?', 'Are objectives clearly stated?', 'Do results justify the conclusions?', 'Is the paper clearly written?'] },
        { title: 'Methodology & Analysis', items: ['Is study design appropriate?', 'Is sample size appropriate?', 'Are data collection methods described?', 'Are bias minimization techniques documented?', 'Are data analysis methods appropriate?', 'Is statistical significance documented?'] },
        { title: 'Discussion & References', items: ['Are key findings clearly stated?', 'Are differences with other studies discussed?', 'Are implications clearly explained?', 'Are references appropriate and up-to-date?', 'Do references follow Vancouver style?', 'Any important references missing?'] },
        { title: 'Ethics & Quality', items: ['Are ethical considerations described?', 'Is ethics approval documented?', 'Are results credible and logical?', 'Are there grammar/language problems?', 'Is interpretation warranted by data?', 'Are conflicts of interest declared?'] },
      ],
      submissionSteps: [
        { step: 1, title: 'Prepare Your Manuscript', description: 'Format according to guidelines and prepare all required files' },
        { step: 2, title: 'Create Account', description: 'Register on our submission platform with ORCID integration' },
        { step: 3, title: 'Upload Files', description: 'Submit manuscript, figures, and supplementary materials' },
        { step: 4, title: 'Review & Submit', description: 'Review all information and complete submission' },
      ],
      preSubmissionChecks: ['Use the official manuscript template', 'Complete the author checklist', 'Verify all required sections', 'Check figure and table quality'],
      rejectionReasons: ['Incorrect formatting or template use', 'Incomplete author information', 'Missing ethics approvals', 'Improper reference formatting'],
      authorshipCriteria: [
        'Substantial contributions to the conception, design, data acquisition, or analysis/interpretation of data',
        'Drafting the work or revising it critically for important intellectual content',
        'Final approval of the version to be published',
        'Agreement to be accountable for all aspects of the work',
      ],
      publicationDetails: [
        { label: 'Open Access Policy', value: 'Free, unrestricted online access' },
        { label: 'License', value: 'CC BY-NC-ND' },
        { label: 'Publication Fee', value: 'No charges' },
        { label: 'Reference Style', value: 'Vancouver format' },
      ],
    },
  );

  await seedPage(
    'ethics',
    'Publication Ethics',
    'Ethical guidelines and policies for authors, reviewers, and editors at AMHSJ.',
    {
      heroTitle: 'Publication Ethics & Policies',
      heroSubtitle: 'AMHSJ is committed to upholding the highest standards of publication ethics. We follow the guidelines established by the Committee on Publication Ethics (COPE).',
      principles: [
        { icon: 'Shield', title: 'Research Integrity', items: ['All research must be conducted with honesty and transparency.', 'Data must not be fabricated, falsified, or manipulated.', 'Proper credit must be given to prior work through appropriate citations.', 'Overlapping or duplicate submissions to multiple journals are prohibited.'] },
        { icon: 'Eye', title: 'Transparency & Disclosure', items: ['All conflicts of interest must be disclosed at the time of submission.', 'Funding sources must be acknowledged in the manuscript.', 'Clinical trials must be registered before patient enrollment.', 'Data availability statements are required for all research articles.'] },
        { icon: 'Scale', title: 'Fairness & Impartiality', items: ['Manuscripts are evaluated solely on scientific merit and relevance.', 'The peer review process is double-blind to ensure impartiality.', 'Editorial decisions are made independently of commercial or political interests.', 'Diversity and inclusion are valued in authorship and peer review.'] },
        { icon: 'BookOpen', title: 'Authorship Standards', items: ['All authors must meet the ICMJE criteria for authorship.', 'All listed authors must have made a substantive contribution to the work.', 'The corresponding author is responsible for the integrity of the entire manuscript.', 'Ghost or gift authorship is strictly prohibited.'] },
      ],
      misconduct: [
        { title: 'Plagiarism', description: 'Presenting another person\'s ideas, data, or text as one\'s own without proper attribution. All manuscripts are screened using industry-standard plagiarism detection tools.', severity: 'Manuscript rejection and potential ban from future submissions.' },
        { title: 'Data Fabrication & Falsification', description: 'Making up research data or manipulating research results to support hypotheses. This includes selective reporting of data.', severity: 'Immediate rejection, retraction of published articles, and notification of the author\'s institution.' },
        { title: 'Duplicate Submission', description: 'Submitting the same manuscript to multiple journals simultaneously or publishing the same work in multiple journals without disclosure.', severity: 'Immediate rejection and retraction if published.' },
        { title: 'Undisclosed Conflicts of Interest', description: 'Failure to disclose financial, personal, or professional relationships that could influence the research or its interpretation.', severity: 'Request for correction, or retraction if the undisclosed conflict is material.' },
      ],
      process: [
        { step: 'Complaint Received', description: 'Any concerns about published or submitted manuscripts can be reported to the Editor-in-Chief at ethics@amhsj.org.' },
        { step: 'Initial Assessment', description: 'The Editor-in-Chief evaluates the complaint and determines whether a formal investigation is warranted.' },
        { step: 'Investigation', description: 'A confidential investigation is conducted, involving the authors, reviewers, and/or institutional authorities as needed.' },
        { step: 'COPE Consultation', description: 'For complex cases, guidance is sought from the Committee on Publication Ethics (COPE).' },
        { step: 'Resolution', description: 'Appropriate action is taken, which may include correction, expression of concern, or retraction of the published article.' },
        { step: 'Notification', description: 'All parties involved are notified of the outcome. Retractions are published transparently in the journal.' },
      ],
    },
  );

  await seedPage(
    'faq',
    'Frequently Asked Questions',
    'Answers to common questions about submitting to and publishing in AMHSJ.',
    {
      heroTitle: 'Frequently Asked Questions',
      heroSubtitle: 'Find answers to common questions about submitting, publishing, and accessing AMHSJ.',
      faqs: [
        {
          category: 'Submission',
          items: [
            { q: 'How do I submit a manuscript?', a: 'Create an author account at /register, then use the submission wizard at /submit. The 5-step process guides you through entering details, adding co-authors, uploading files, making declarations, and reviewing before final submission.' },
            { q: 'Is there a submission fee?', a: 'No. AMHSJ charges no submission fees. A modest article processing charge (APC) applies only upon acceptance, with full waivers available for authors from low-income countries.' },
            { q: 'Can I submit a manuscript that is under review elsewhere?', a: 'No. AMHSJ requires that manuscripts are not under consideration by any other journal. Simultaneous submissions are considered a breach of publication ethics.' },
            { q: 'What file formats are accepted?', a: 'We accept Microsoft Word (.docx) as the preferred format, LaTeX with PDF output, and PDF for initial submissions. Figures should be provided as separate high-resolution files (minimum 300 DPI).' },
            { q: 'How long does the review process take?', a: 'Initial editorial screening takes 1\u20132 weeks. Peer review typically takes 4\u20136 weeks. You will receive a decision within 6\u20138 weeks of submission. Revisions may require an additional 2\u20134 weeks.' },
          ],
        },
        {
          category: 'Peer Review',
          items: [
            { q: 'What type of peer review does AMHSJ use?', a: 'AMHSJ uses a double-blind peer review process. Neither the authors nor the reviewers know each other\'s identities throughout the review process.' },
            { q: 'How many reviewers evaluate my manuscript?', a: 'Each manuscript is reviewed by at least two independent experts in the relevant field. In some cases, the editor may invite additional reviewers for specialized topics.' },
            { q: 'Can I suggest reviewers for my manuscript?', a: 'Yes. You may suggest up to 3 potential reviewers with relevant expertise. You must not suggest anyone with a conflict of interest. The editorial team has the final say on reviewer selection.' },
            { q: 'What happens if reviewers give conflicting recommendations?', a: 'When reviewers disagree, the editor may seek an additional review, make an independent assessment, or convene an editorial board discussion before reaching a decision.' },
          ],
        },
        {
          category: 'Publication',
          items: [
            { q: 'What happens after my manuscript is accepted?', a: 'Accepted manuscripts enter the production process: copyediting, typesetting, author proofreading, and final publication. Articles are published online within 2 weeks of final acceptance.' },
            { q: 'What license are articles published under?', a: 'All articles are published under the Creative Commons Attribution 4.0 International (CC BY 4.0) license, ensuring immediate and unrestricted access.' },
            { q: 'How do I track my submission?', a: 'Log in to your author dashboard at /dashboard to track the status of your manuscript at every stage, from submission through review to publication.' },
            { q: 'Can I request corrections after publication?', a: 'Yes. If you identify errors in your published article, contact the editorial office. Minor corrections are published as corrigenda; major issues may require a formal erratum or retraction.' },
          ],
        },
        {
          category: 'Account & Access',
          items: [
            { q: 'I forgot my password. How do I reset it?', a: 'Visit the login page at /login and click "Forgot Password." A reset link will be sent to your registered email address.' },
            { q: 'How do I update my profile information?', a: 'Log in and navigate to your profile settings in the dashboard. You can update your name, affiliation, ORCID, and other details.' },
            { q: 'Can I access articles without an account?', a: 'Yes. AMHSJ is a fully open-access journal. All published articles are freely available to anyone without requiring an account or subscription.' },
          ],
        },
      ],
    },
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
