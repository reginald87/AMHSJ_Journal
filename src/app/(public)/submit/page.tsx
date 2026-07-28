import { Metadata } from 'next';
import { SubmissionWizard } from './SubmissionWizardClient';
import { prisma } from '@/lib/prisma';

export const metadata: Metadata = {
  title: 'Submit Manuscript',
  description: 'Submit your manuscript to Advances in Medicine and Health Sciences Journal',
};

export default async function SubmitPage() {
  const journal = await prisma.journal.findFirst({
    where: { isActive: true },
    include: { settings: true },
  });

  const journalSettings = {
    referenceStyle: journal?.settings?.referenceStyle ?? 'VANCOUVER',
    manuscriptTemplate: journal?.settings?.manuscriptTemplate ?? '',
  };

  return <SubmissionWizard journalSettings={journalSettings} />;
}