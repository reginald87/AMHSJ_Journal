'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Textarea } from '@/components/ui/Input';
import { Select } from '@/components/ui/Input';
import { Badge } from '@/components/ui/Badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import {
  FileText,
  Users,
  Upload,
  Shield,
  CheckCircle,
  ChevronRight,
  ChevronLeft,
  X,
  Plus,
  Trash2,
  Eye,
  Download,
  Loader2,
  Sparkles,
} from 'lucide-react';

const articleTypes = [
  { value: 'ORIGINAL_RESEARCH', label: 'Original Research' },
  { value: 'REVIEW', label: 'Review Article' },
  { value: 'SYSTEMATIC_REVIEW', label: 'Systematic Review' },
  { value: 'META_ANALYSIS', label: 'Meta-Analysis' },
  { value: 'CASE_REPORT', label: 'Case Report' },
  { value: 'CASE_SERIES', label: 'Case Series' },
  { value: 'CLINICAL_TRIAL', label: 'Clinical Trial' },
  { value: 'SHORT_COMMUNICATION', label: 'Short Communication' },
  { value: 'LETTER_TO_EDITOR', label: 'Letter to Editor' },
  { value: 'EDITORIAL', label: 'Editorial' },
  { value: 'COMMENTARY', label: 'Commentary' },
  { value: 'PERSPECTIVE', label: 'Perspective' },
];

const sections = [
  { value: 'INTERNAL_MEDICINE', label: 'Internal Medicine' },
  { value: 'CARDIOLOGY', label: 'Cardiology' },
  { value: 'NEUROLOGY', label: 'Neurology' },
  { value: 'ONCOLOGY', label: 'Oncology' },
  { value: 'PEDIATRICS', label: 'Pediatrics' },
  { value: 'SURGERY', label: 'Surgery' },
  { value: 'RADIOLOGY', label: 'Radiology' },
  { value: 'PATHOLOGY', label: 'Pathology' },
  { value: 'PHARMACOLOGY', label: 'Pharmacology' },
  { value: 'PUBLIC_HEALTH', label: 'Public Health' },
  { value: 'MEDICAL_EDUCATION', label: 'Medical Education' },
  { value: 'HEALTH_POLICY', label: 'Health Policy' },
  { value: 'OTHER', label: 'Other' },
];

const manuscriptSchema = z.object({
  // Step 1: Files
  manuscriptFile: z.instanceof(File).optional(),
  supplementaryFiles: z.array(z.instanceof(File)).optional(),
  coverLetter: z.string().optional(),

  // Step 2: Manuscript Details
  title: z.string().min(10, 'Title must be at least 10 characters').max(200, 'Title must not exceed 200 characters'),
  shortTitle: z.string().max(50, 'Short title must not exceed 50 characters').optional(),
  articleType: z.enum(articleTypes.map((t) => t.value) as [string, ...string[]]),
  section: z.string().min(1, 'Please select a section'),
  abstract: z.string().min(100, 'Abstract must be at least 100 characters').max(3000, 'Abstract must not exceed 3000 characters'),
  keywords: z.string().min(1, 'Please add at least one keyword'),

  // Step 3: Authors
  correspondingAuthor: z.object({
    firstName: z.string().min(1, 'First name is required'),
    lastName: z.string().min(1, 'Last name is required'),
    middleName: z.string().optional(),
    email: z.string().email('Invalid email address'),
    affiliation: z.string().min(1, 'Affiliation is required'),
    orcid: z.string().optional(),
  }),
  coAuthors: z
    .array(
      z.object({
        firstName: z.string().min(1, 'First name is required'),
        lastName: z.string().min(1, 'Last name is required'),
        middleName: z.string().optional(),
        email: z.string().email('Invalid email address'),
        affiliation: z.string().min(1, 'Affiliation is required'),
        orcid: z.string().optional(),
        contribution: z.string().optional(),
      }),
    )
    .optional(),

  // Step 4: Declarations
  competingInterests: z.string().optional(),
  fundingStatement: z.string().optional(),
  ethicsApproval: z.string().optional(),
  dataAvailability: z.string().optional(),
  authorContributions: z.string().optional(),
  acknowledgments: z.string().optional(),

  // Step 5: Confirmation
  confirmOriginality: z.boolean().refine((v) => v === true, 'You must confirm originality'),
  confirmEthics: z.boolean().refine((v) => v === true, 'You must confirm ethical compliance'),
  confirmDataAvailability: z.boolean().refine((v) => v === true, 'You must confirm data availability'),
  confirmAuthorship: z.boolean().refine((v) => v === true, 'You must confirm authorship criteria'),
  confirmCopyright: z.boolean().refine((v) => v === true, 'You must agree to copyright terms'),
});

type ManuscriptFormData = z.infer<typeof manuscriptSchema>;

const steps = [
  { id: 1, title: 'Upload', description: 'Upload your manuscript file to auto-fill details' },
  { id: 2, title: 'Manuscript Details', description: 'Title, abstract, keywords, article type' },
  { id: 3, title: 'Authors', description: 'Corresponding author and co-authors' },
  { id: 4, title: 'Declarations', description: 'Ethics, funding, competing interests' },
  { id: 5, title: 'Review & Submit', description: 'Confirm and submit your manuscript' },
];

const stepIcons = [
  <Upload key="1" className="w-5 h-5" />,
  <FileText key="2" className="w-5 h-5" />,
  <Users key="3" className="w-5 h-5" />,
  <Shield key="4" className="w-5 h-5" />,
  <CheckCircle key="5" className="w-5 h-5" />,
];

interface ExtractedMetadata {
  title: string;
  abstract: string;
  keywords: string;
  authors: { firstName: string; lastName: string; email?: string; affiliation?: string }[];
}

export function SubmissionWizard() {
  const router = useRouter();
  const { data: session } = useSession();
  const [currentStep, setCurrentStep] = useState(1);
  const [fileErrors, setFileErrors] = useState<string[]>([]);
  const [manuscriptFileState, setManuscriptFileState] = useState<File | null>(null);
  const [supplementaryFilesState, setSupplementaryFilesState] = useState<File[]>([]);
  const [extracting, setExtracting] = useState(false);
  const [extractNotice, setExtractNotice] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    getValues,
    control,
    trigger,
    formState: { errors, isSubmitting, isValid },
    reset,
  } = useForm<ManuscriptFormData>({
    resolver: zodResolver(manuscriptSchema),
    defaultValues: {
      correspondingAuthor: {
        firstName: '',
        lastName: '',
        email: '',
        affiliation: '',
      },
      coAuthors: [],
    },
    mode: 'onChange',
  });

  const { fields: coAuthors, append: appendCoAuthor, remove: removeCoAuthor, replace: replaceCoAuthors } = useFieldArray({
    control,
    name: 'coAuthors',
  });

  const goToStep = (step: number) => {
    if (step < currentStep || step === currentStep + 1) {
      setCurrentStep(step);
    }
  };

  const validateStep = async (step: number): Promise<boolean> => {
    const stepFields: Record<number, string[]> = {
      1: ['manuscriptFile'],
      2: ['title', 'articleType', 'section', 'abstract', 'keywords'],
      3: ['correspondingAuthor.firstName', 'correspondingAuthor.lastName', 'correspondingAuthor.email', 'correspondingAuthor.affiliation'],
      4: ['competingInterests', 'fundingStatement', 'ethicsApproval', 'dataAvailability', 'authorContributions'],
      5: ['confirmOriginality', 'confirmEthics', 'confirmDataAvailability', 'confirmAuthorship', 'confirmCopyright'],
    };

    if (stepFields[step]) {
      try {
        await trigger(stepFields[step] as (keyof ManuscriptFormData)[]);
        return true;
      } catch {
        return false;
      }
    }
    return true;
  };

  const handleNext = async () => {
    if (currentStep === 1 && !manuscriptFileState) {
      setFileErrors(['Please upload your manuscript file to continue.']);
      return;
    }
    const valid = await validateStep(currentStep);
    if (valid) goToStep(currentStep + 1);
  };

  const handleFinalSubmit = async () => {
    if (!session) {
      router.push('/login?callbackUrl=/submit');
      return;
    }
    if (!manuscriptFileState) {
      alert('Please upload a manuscript file.');
      setCurrentStep(1);
      return;
    }
    const allValues = getValues();
    const cleaned = {
      ...allValues,
      manuscriptFile: manuscriptFileState,
      supplementaryFiles: supplementaryFilesState,
    };
    const result = manuscriptSchema.safeParse(cleaned);
    if (result.success) {
      onSubmit(cleaned);
    } else {
      const firstError = result.error.issues[0];
      alert(firstError?.message || 'Please fix the errors in the form before submitting.');
    }
  };

  const onSubmit = async (data: ManuscriptFormData) => {
    const formData = new FormData();
    formData.append('title', data.title);
    if (data.shortTitle) formData.append('shortTitle', data.shortTitle);
    formData.append('articleType', data.articleType);
    formData.append('section', data.section);
    formData.append('abstract', data.abstract);
    formData.append('keywords', data.keywords);
    formData.append('correspondingAuthor', JSON.stringify(data.correspondingAuthor));
    if (data.coAuthors?.length) formData.append('coAuthors', JSON.stringify(data.coAuthors));
    formData.append('coverLetter', data.coverLetter || '');
    formData.append('competingInterests', data.competingInterests || '');
    formData.append('fundingStatement', data.fundingStatement || '');
    formData.append('ethicsApproval', data.ethicsApproval || '');
    formData.append('dataAvailability', data.dataAvailability || '');
    formData.append('authorContributions', data.authorContributions || '');
    formData.append('acknowledgments', data.acknowledgments || '');

    if (data.manuscriptFile) formData.append('manuscriptFile', data.manuscriptFile);
    if (data.supplementaryFiles?.length) {
      data.supplementaryFiles.forEach((file) => formData.append('supplementaryFiles', file));
    }

    try {
      const response = await fetch('/api/manuscripts', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) throw new Error('Submission failed');

      const result = await response.json();
      reset();
      router.push(`/dashboard/manuscripts?submitted=true`);
    } catch (error) {
      console.error('Submission error:', error);
      alert('Submission failed. Please try again.');
    }
  };

  const handleFileChange = (field: string, files: FileList | null) => {
    if (!files || files.length === 0) return;

    const errorsList: string[] = [];
    const validFiles: File[] = [];

    Array.from(files).forEach((file) => {
      if (file.size > 50 * 1024 * 1024) {
        errorsList.push(`${file.name}: File size exceeds 50MB limit`);
      } else if (
        !['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'application/zip'].includes(
          file.type,
        )
      ) {
        errorsList.push(`${file.name}: Invalid file type. Allowed: PDF, DOC, DOCX, ZIP`);
      } else {
        validFiles.push(file);
      }
    });

    setFileErrors(errorsList);

    if (field === 'manuscriptFile') {
      if (validFiles[0]) {
        setManuscriptFileState(validFiles[0]);
        setExtractNotice(null);
        parseManuscript(validFiles[0]);
      }
    } else if (field === 'supplementaryFiles') {
      setSupplementaryFilesState(validFiles);
    }
  };

  const parseManuscript = async (file: File) => {
    setExtracting(true);
    setExtractNotice(null);
    try {
      const body = new FormData();
      body.append('file', file);
      const response = await fetch('/api/manuscripts/parse', { method: 'POST', body });
      const json = await response.json();

      if (!response.ok) {
        setExtractNotice(json?.error || 'Could not read the manuscript. Please fill details manually.');
        return;
      }

      const meta: ExtractedMetadata = json.metadata || { title: '', abstract: '', keywords: '', authors: [] };
      let filled = 0;

      if (meta.title) {
        setValue('title', meta.title, { shouldValidate: false });
        filled++;
      }
      if (meta.abstract) {
        setValue('abstract', meta.abstract, { shouldValidate: false });
        filled++;
      }
      if (meta.keywords) {
        setValue('keywords', meta.keywords, { shouldValidate: false });
        filled++;
      }

      const authors = meta.authors || [];
      if (authors.length > 0) {
        if (authors.length === 1) {
          if (authors[0].affiliation && !getValues('correspondingAuthor.affiliation')) {
            setValue('correspondingAuthor.affiliation', authors[0].affiliation, { shouldValidate: false });
          }
        } else {
          replaceCoAuthors(
            authors.map((a) => ({
              firstName: a.firstName,
              lastName: a.lastName,
              email: a.email || '',
              affiliation: a.affiliation || '',
            })),
          );
        }
      }

      if (filled > 0) {
        setExtractNotice(`We extracted ${filled} field(s) from your manuscript. Please review and complete the rest.`);
      } else {
        setExtractNotice('We could not auto-detect details from this file. Please fill them in manually.');
      }
    } catch (err) {
      console.error('Parse error:', err);
      setExtractNotice('Could not read the manuscript. Please fill details manually.');
    } finally {
      setExtracting(false);
    }
  };

  const currentStepData = steps[currentStep - 1];

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-navy-950">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-navy-900 dark:text-white">Submit Manuscript</h1>
          <p className="text-slate-600 dark:text-slate-400 mt-1">
            Upload your manuscript first — we'll extract the details for you to review and complete.
          </p>
        </div>

        <div className="mb-8 overflow-hidden rounded-xl bg-white dark:bg-navy-900 border border-slate-200 dark:border-navy-800">
          <div className="flex">
            {steps.map((step, index) => (
              <div
                key={step.id}
                className={cn(
                  'flex flex-1 items-center relative',
                  index < steps.length - 1 &&
                    'after:absolute after:top-1/2 after:-translate-y-1/2 after:right-0 after:w-full after:h-1 after:bg-slate-200 dark:after:bg-navy-700 after:z-0',
                )}
              >
                <div
                  className={cn(
                    'relative z-10 flex flex-col items-center px-4 py-4 transition-all',
                    currentStep >= step.id ? 'text-gold-600 dark:text-gold-400' : 'text-slate-400 dark:text-slate-500',
                  )}
                >
                  <div
                    className={cn(
                      'w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold mb-2 transition-all',
                      currentStep > step.id
                        ? 'bg-gold-400 text-navy-950'
                        : currentStep === step.id
                          ? 'bg-gold-400 text-navy-950 ring-4 ring-gold-400/30'
                          : 'bg-slate-200 dark:bg-navy-700 text-slate-500 dark:text-slate-400',
                    )}
                  >
                    {currentStep > step.id ? <CheckCircle className="w-5 h-5" /> : stepIcons[index]}
                  </div>
                  <span className="text-xs font-medium text-center whitespace-nowrap">{step.title}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        <Card className="bg-white dark:bg-navy-900 border-slate-200 dark:border-navy-800">
          <CardHeader className="pb-4">
            <CardTitle className="text-xl">{currentStepData.title}</CardTitle>
            <p className="text-slate-600 dark:text-slate-400 text-sm">{currentStepData.description}</p>
          </CardHeader>
          <CardContent>
            <form
              onSubmit={(e) => e.preventDefault()}
              className="space-y-6"
            >
              {currentStep === 1 && (
                <Step1Fields
                  register={register}
                  errors={errors}
                  fileErrors={fileErrors}
                  onFileChange={handleFileChange}
                  manuscriptFile={manuscriptFileState}
                  supplementaryFiles={supplementaryFilesState}
                  extracting={extracting}
                  extractNotice={extractNotice}
                />
              )}
              {currentStep === 2 && <Step2Fields register={register} errors={errors} watch={watch} />}
              {currentStep === 3 && (
                <Step3Fields
                  register={register}
                  errors={errors}
                  control={control}
                  coAuthors={coAuthors}
                  appendCoAuthor={appendCoAuthor}
                  removeCoAuthor={removeCoAuthor}
                />
              )}
              {currentStep === 4 && <Step4Fields register={register} errors={errors} />}
              {currentStep === 5 && <Step5Fields register={register} errors={errors} watch={watch} />}

              <div className="flex justify-between pt-4 border-t border-slate-200 dark:border-navy-800">
                {currentStep > 1 && (
                  <Button type="button" variant="outline" onClick={() => goToStep(currentStep - 1)}>
                    <ChevronLeft className="w-4 h-4 mr-2" />
                    Back
                  </Button>
                )}
                {currentStep < steps.length ? (
                  <Button type="button" onClick={handleNext} disabled={isSubmitting}>
                    Next
                    <ChevronRight className="w-4 h-4 ml-2" />
                  </Button>
                ) : (
                  <Button
                    type="button"
                    variant="gold"
                    loading={isSubmitting}
                    onClick={handleFinalSubmit}
                    className="w-full sm:w-auto"
                  >
                    Submit Manuscript
                  </Button>
                )}
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function Step1Fields({
  register,
  errors,
  fileErrors,
  onFileChange,
  manuscriptFile,
  supplementaryFiles,
  extracting,
  extractNotice,
}: {
  register: ReturnType<typeof useForm<ManuscriptFormData>>['register'];
  errors: ReturnType<typeof useForm<ManuscriptFormData>>['formState']['errors'];
  fileErrors: string[];
  onFileChange: (field: string, files: FileList | null) => void;
  manuscriptFile: File | null;
  supplementaryFiles: File[];
  extracting: boolean;
  extractNotice: string | null;
}) {
  return (
    <div className="space-y-6">
      <div>
        <label className="block text-sm font-medium text-navy-900 dark:text-white mb-2">
          Manuscript File (PDF, DOC, DOCX) *
        </label>
        <div
          className={cn(
            'border-2 border-dashed rounded-lg p-8 text-center transition-colors',
            manuscriptFile
              ? 'border-green-400 bg-green-50 dark:bg-green-900/10 dark:border-green-700'
              : 'border-slate-300 dark:border-navy-700 hover:border-gold-400',
          )}
        >
          <input
            type="file"
            accept=".pdf,.doc,.docx"
            className="sr-only"
            id="manuscriptFile"
            onChange={(e) => onFileChange('manuscriptFile', e.target.files)}
          />
          <label htmlFor="manuscriptFile" className="cursor-pointer">
            {extracting ? (
              <>
                <Loader2 className="w-12 h-12 mx-auto text-gold-500 mb-3 animate-spin" />
                <p className="font-medium text-navy-900 dark:text-white">Reading your manuscript…</p>
                <p className="text-xs text-slate-500 mt-1">Extracting title, authors, and abstract</p>
              </>
            ) : manuscriptFile ? (
              <>
                <CheckCircle className="w-12 h-12 mx-auto text-green-500 mb-3" />
                <p className="font-medium text-green-700 dark:text-green-400">{manuscriptFile.name}</p>
                <p className="text-xs text-slate-500 mt-1">
                  {(manuscriptFile.size / 1024).toFixed(1)} KB &middot; Click to replace
                </p>
              </>
            ) : (
              <>
                <Upload className="w-12 h-12 mx-auto text-slate-400 mb-3" />
                <p className="text-slate-600 dark:text-slate-400">Click to upload or drag and drop</p>
                <p className="text-xs text-slate-500 mt-1">Maximum file size: 50MB</p>
              </>
            )}
          </label>
        </div>
        {extractNotice && (
          <div className="mt-3 flex items-start gap-2 rounded-lg bg-gold-50 dark:bg-gold-900/20 border border-gold-200 dark:border-gold-800 p-3">
            <Sparkles className="w-4 h-4 text-gold-600 dark:text-gold-400 mt-0.5 shrink-0" />
            <p className="text-sm text-navy-900 dark:text-white">{extractNotice}</p>
          </div>
        )}
        {errors.manuscriptFile && <p className="text-sm text-red-600 mt-1">{String(errors.manuscriptFile.message)}</p>}
      </div>

      {fileErrors.length > 0 && (
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
          <h4 className="font-medium text-red-800 dark:text-red-400 mb-2">File Errors:</h4>
          <ul className="text-sm text-red-700 dark:text-red-300 space-y-1">
            {fileErrors.map((error, i) => (
              <li key={i}>• {error}</li>
            ))}
          </ul>
        </div>
      )}

      <div>
        <label className="block text-sm font-medium text-navy-900 dark:text-white mb-2">Supplementary Files (Optional)</label>
        <div className="border-2 border-dashed border-slate-300 dark:border-navy-700 rounded-lg p-8 text-center hover:border-gold-400 transition-colors">
          <input
            type="file"
            accept=".pdf,.doc,.docx,.zip,.xls,.xlsx,.ppt,.pptx,.jpg,.jpeg,.png,.tiff"
            multiple
            className="sr-only"
            id="supplementaryFiles"
            onChange={(e) => onFileChange('supplementaryFiles', e.target.files)}
          />
          <label htmlFor="supplementaryFiles" className="cursor-pointer">
            <Upload className="w-12 h-12 mx-auto text-slate-400 mb-3" />
            <p className="text-slate-600 dark:text-slate-400">Click to upload or drag and drop</p>
            <p className="text-xs text-slate-500 mt-1">Multiple files allowed. Maximum 50MB each.</p>
          </label>
        </div>
        {supplementaryFiles.length > 0 && (
          <ul className="mt-2 space-y-1">
            {supplementaryFiles.map((f, i) => (
              <li key={i} className="text-xs text-slate-600 dark:text-slate-400">
                {f.name}
              </li>
            ))}
          </ul>
        )}
      </div>

      <div>
        <label className="block text-sm font-medium text-navy-900 dark:text-white mb-2">Cover Letter (Optional)</label>
        <Textarea
          rows={4}
          placeholder="Address the editor, explain the significance of your work, suggest reviewers, etc."
          {...register('coverLetter')}
        />
      </div>
    </div>
  );
}

function Step2Fields({ register, errors, watch }: {
  register: ReturnType<typeof useForm<ManuscriptFormData>>['register'];
  errors: ReturnType<typeof useForm<ManuscriptFormData>>['formState']['errors'];
  watch: ReturnType<typeof useForm<ManuscriptFormData>>['watch'];
}) {
  return (
    <div className="space-y-6">
      <div className="bg-gold-50 dark:bg-gold-900/20 border border-gold-200 dark:border-gold-800 rounded-lg p-3 flex items-start gap-2">
        <Sparkles className="w-4 h-4 text-gold-600 dark:text-gold-400 mt-0.5 shrink-0" />
        <p className="text-sm text-navy-900 dark:text-white">
          These fields were auto-filled from your uploaded file. Please review and edit where needed.
        </p>
      </div>
      <div>
        <Input label="Manuscript Title *" placeholder="Enter the full title of your manuscript" error={errors.title?.message} {...register('title')} />
      </div>
      <div>
        <Input
          label="Short Title (Running Head)"
          placeholder="Short version for headers (max 50 characters)"
          error={errors.shortTitle?.message}
          {...register('shortTitle')}
        />
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <Select label="Article Type *" placeholder="Select article type" options={articleTypes} error={errors.articleType?.message} {...register('articleType')} />
        </div>
        <div>
          <Select label="Section *" placeholder="Select section" options={sections} error={errors.section?.message} {...register('section')} />
        </div>
      </div>
      <div>
        <Textarea
          label="Abstract *"
          placeholder="Enter a structured abstract (Background, Methods, Results, Conclusions). Minimum 100 characters, maximum 3000."
          rows={6}
          error={errors.abstract?.message}
          {...register('abstract')}
        />
        <p className="text-xs text-slate-500 mt-1">{watch('abstract')?.length || 0} / 3000 characters</p>
      </div>
      <div>
        <Input label="Keywords *" placeholder="Enter keywords separated by semicolons (;)" error={errors.keywords?.message} {...register('keywords')} />
        <p className="text-xs text-slate-500 mt-1">Separate keywords with semicolons (e.g., COVID-19; antiviral therapy; clinical trial)</p>
      </div>
    </div>
  );
}

function Step3Fields({
  register,
  errors,
  control,
  coAuthors,
  appendCoAuthor,
  removeCoAuthor,
}: {
  register: ReturnType<typeof useForm<ManuscriptFormData>>['register'];
  errors: ReturnType<typeof useForm<ManuscriptFormData>>['formState']['errors'];
  control: ReturnType<typeof useForm<ManuscriptFormData>>['control'];
  coAuthors: Array<{
    id: string;
    firstName: string;
    lastName: string;
    middleName?: string;
    email: string;
    affiliation: string;
    orcid?: string;
    contribution?: string;
  }>;
  appendCoAuthor: (value: {
    firstName: string;
    lastName: string;
    middleName?: string;
    email: string;
    affiliation: string;
    orcid?: string;
    contribution?: string;
  }) => void;
  removeCoAuthor: (index: number) => void;
}) {
  return (
    <div className="space-y-6">
      <div className="bg-gold-50 dark:bg-gold-900/20 border border-gold-200 dark:border-gold-800 rounded-lg p-3 flex items-start gap-2">
        <Sparkles className="w-4 h-4 text-gold-600 dark:text-gold-400 mt-0.5 shrink-0" />
        <p className="text-sm text-navy-900 dark:text-white">
          Authors were detected from your manuscript. Verify the corresponding author and add any missing co-authors.
        </p>
      </div>
      <div className="bg-gold-50 dark:bg-gold-900/20 border border-gold-200 dark:border-gold-800 rounded-lg p-4">
        <h3 className="font-semibold text-navy-900 dark:text-white mb-3">Corresponding Author</h3>
        <p className="text-sm text-slate-600 dark:text-slate-400 mb-4">This author will handle all correspondence</p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Input label="First Name *" error={errors.correspondingAuthor?.firstName?.message} {...register('correspondingAuthor.firstName')} />
          <Input label="Last Name *" error={errors.correspondingAuthor?.lastName?.message} {...register('correspondingAuthor.lastName')} />
          <Input label="Middle Name" {...register('correspondingAuthor.middleName')} />
          <Input label="Email *" type="email" error={errors.correspondingAuthor?.email?.message} {...register('correspondingAuthor.email')} />
          <Input label="Affiliation *" error={errors.correspondingAuthor?.affiliation?.message} {...register('correspondingAuthor.affiliation')} />
          <Input label="ORCID" placeholder="0000-0000-0000-0000" {...register('correspondingAuthor.orcid')} />
        </div>
      </div>

      <div>
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold text-navy-900 dark:text-white">Co-authors</h3>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => appendCoAuthor({ firstName: '', lastName: '', email: '', affiliation: '' })}
          >
            <Plus className="w-4 h-4 mr-1" /> Add Co-author
          </Button>
        </div>
        {coAuthors.length === 0 && <p className="text-slate-500 dark:text-slate-400 text-center py-8">No co-authors added yet</p>}
        {coAuthors.map((author, index: number) => {
          const coAuthorError = Array.isArray(errors.coAuthors) ? errors.coAuthors[index] : undefined;
          return (
            <div key={author.id} className="border border-slate-200 dark:border-navy-700 rounded-lg p-4 mb-4">
              <div className="flex items-center justify-between mb-3">
                <span className="font-medium text-navy-900 dark:text-white">Co-author {index + 1}</span>
                <Button type="button" variant="ghost" size="icon" onClick={() => removeCoAuthor(index)}>
                  <Trash2 className="w-4 h-4 text-red-500" />
                </Button>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input label="First Name *" error={coAuthorError?.firstName?.message} {...register(`coAuthors.${index}.firstName`)} />
                <Input label="Last Name *" error={coAuthorError?.lastName?.message} {...register(`coAuthors.${index}.lastName`)} />
                <Input label="Middle Name" {...register(`coAuthors.${index}.middleName`)} />
                <Input label="Email *" type="email" error={coAuthorError?.email?.message} {...register(`coAuthors.${index}.email`)} />
                <Input label="Affiliation *" error={coAuthorError?.affiliation?.message} {...register(`coAuthors.${index}.affiliation`)} />
                <Input label="ORCID" placeholder="0000-0000-0000-0000" {...register(`coAuthors.${index}.orcid`)} />
                <Textarea label="Contribution" rows={2} {...register(`coAuthors.${index}.contribution`)} />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function Step4Fields({ register, errors }: {
  register: ReturnType<typeof useForm<ManuscriptFormData>>['register'];
  errors: ReturnType<typeof useForm<ManuscriptFormData>>['formState']['errors'];
}) {
  return (
    <div className="space-y-6">
      <h3 className="font-semibold text-navy-900 dark:text-white">Required Declarations</h3>
      <Textarea
        label="Competing Interests *"
        placeholder="Declare any financial or personal relationships that could influence the work. Write 'None declared' if applicable."
        rows={3}
        error={errors.competingInterests?.message}
        {...register('competingInterests')}
      />
      <Textarea
        label="Funding Statement *"
        placeholder="Describe funding sources, grant numbers, and role of funders. Write 'No funding received' if applicable."
        rows={3}
        error={errors.fundingStatement?.message}
        {...register('fundingStatement')}
      />
      <Textarea
        label="Ethics Approval *"
        placeholder="Provide ethics committee name, approval number, and compliance declaration (e.g., Declaration of Helsinki)."
        rows={3}
        error={errors.ethicsApproval?.message}
        {...register('ethicsApproval')}
      />
      <Textarea
        label="Data Availability Statement *"
        placeholder="Describe where data supporting the findings can be found (repository, accession numbers, or 'available on request')."
        rows={3}
        error={errors.dataAvailability?.message}
        {...register('dataAvailability')}
      />
      <Textarea
        label="Author Contributions *"
        placeholder="Describe each author's contribution using CRediT taxonomy (Conceptualization, Methodology, Software, Validation, Formal Analysis, Investigation, Resources, Data Curation, Writing - Original Draft, Writing - Review & Editing, Visualization, Supervision, Project Administration, Funding Acquisition)."
        rows={4}
        error={errors.authorContributions?.message}
        {...register('authorContributions')}
      />
      <Textarea
        label="Acknowledgments (Optional)"
        placeholder="Acknowledge non-author contributors, technical assistance, etc."
        rows={2}
        {...register('acknowledgments')}
      />
    </div>
  );
}

function Step5Fields({ register, errors, watch }: {
  register: ReturnType<typeof useForm<ManuscriptFormData>>['register'];
  errors: ReturnType<typeof useForm<ManuscriptFormData>>['formState']['errors'];
  watch: ReturnType<typeof useForm<ManuscriptFormData>>['watch'];
}) {
  const confirmations: { key: keyof ManuscriptFormData; label: string }[] = [
    { key: 'confirmOriginality', label: 'This manuscript is original, has not been published before, and is not currently under consideration elsewhere.' },
    { key: 'confirmEthics', label: 'The research complies with ethical standards and has appropriate ethics approval.' },
    { key: 'confirmDataAvailability', label: 'Data supporting the findings will be made available as stated in the Data Availability Statement.' },
    { key: 'confirmAuthorship', label: 'All authors meet ICMJE authorship criteria and have approved the final manuscript.' },
    { key: 'confirmCopyright', label: 'I agree to the Creative Commons Attribution 4.0 International (CC BY 4.0) license upon publication.' },
  ];

  return (
    <div className="space-y-6">
      <div className="bg-gold-50 dark:bg-gold-900/20 border border-gold-200 dark:border-gold-800 rounded-lg p-4">
        <h3 className="font-semibold text-navy-900 dark:text-white mb-3">Final Confirmations</h3>
        <p className="text-sm text-slate-600 dark:text-slate-400 mb-4">Please confirm all of the following before submitting:</p>
        <div className="space-y-3">
          {confirmations.map((conf) => (
            <label key={conf.key} className="flex items-start gap-3 cursor-pointer">
              <input
                type="checkbox"
                className="mt-1 w-4 h-4 rounded border-slate-300 text-gold-600 focus:ring-gold-500"
                {...register(conf.key)}
              />
              <span className="text-sm text-slate-700 dark:text-slate-300">{conf.label}</span>
            </label>
          ))}
        </div>
        {confirmations.some((c) => errors[c.key]) && (
          <p className="text-sm text-red-600 mt-3">You must confirm all statements to proceed.</p>
        )}
      </div>

      <div className="bg-slate-50 dark:bg-navy-800 rounded-lg p-6">
        <h3 className="font-semibold text-navy-900 dark:text-white mb-4">Submission Summary</h3>
        <dl className="space-y-3 text-sm">
          <div className="flex justify-between">
            <dt className="text-slate-600 dark:text-slate-400">Title</dt>
            <dd className="font-medium text-navy-900 dark:text-white max-w-md text-right truncate">{watch('title')}</dd>
          </div>
          <div className="flex justify-between">
            <dt className="text-slate-600 dark:text-slate-400">Article Type</dt>
            <dd className="font-medium text-navy-900 dark:text-white">{articleTypes.find((t) => t.value === watch('articleType'))?.label}</dd>
          </div>
          <div className="flex justify-between">
            <dt className="text-slate-600 dark:text-slate-400">Corresponding Author</dt>
            <dd className="font-medium text-navy-900 dark:text-white text-right">
              {watch('correspondingAuthor.firstName')} {watch('correspondingAuthor.lastName')}
            </dd>
          </div>
          <div className="flex justify-between">
            <dt className="text-slate-600 dark:text-slate-400">Co-authors</dt>
            <dd className="font-medium text-navy-900 dark:text-white text-right">{watch('coAuthors')?.length || 0}</dd>
          </div>
        </dl>
      </div>
    </div>
  );
}
