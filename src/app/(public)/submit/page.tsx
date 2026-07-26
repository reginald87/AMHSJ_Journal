import { Metadata } from 'next';
import { SubmissionWizard } from './SubmissionWizardClient';

export const metadata: Metadata = {
  title: 'Submit Manuscript',
  description: 'Submit your manuscript to Advances in Medicine and Health Sciences Journal',
};

export default function SubmitPage() {
  return <SubmissionWizard />;
}