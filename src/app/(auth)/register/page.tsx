'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Input';
import { cn } from '@/lib/utils';
import Image from 'next/image';
import { Mail, Lock, Eye, EyeOff, User, Building, Award, AlertCircle, CheckCircle, ChevronLeft, ChevronRight } from 'lucide-react';
import { toast } from 'sonner';

const roleOptions = [
  { value: 'AUTHOR', label: 'Author - Submit and track manuscripts' },
  { value: 'REVIEWER', label: 'Reviewer - Review assigned manuscripts' },
];

const registerSchema = z.object({
  firstName: z.string().min(1, 'First name is required'),
  middleName: z.string().optional(),
  lastName: z.string().min(1, 'Last name is required'),
  email: z.string().email('Invalid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters')
    .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
    .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
    .regex(/[0-9]/, 'Password must contain at least one number'),
  confirmPassword: z.string(),
  affiliation: z.string().min(1, 'Affiliation is required'),
  department: z.string().optional(),
  orcid: z.string().optional(),
  country: z.string().optional(),
  role: z.enum(['AUTHOR', 'REVIEWER']),
  agreeTerms: z.boolean().refine(v => v === true, 'You must agree to the terms'),
  agreePrivacy: z.boolean().refine(v => v === true, 'You must agree to the privacy policy'),
}).refine(data => data.password === data.confirmPassword, {
  message: 'Passwords do not match',
  path: ['confirmPassword'],
});

type RegisterFormData = z.infer<typeof registerSchema>;

const steps = [
  { id: 1, title: 'Account', description: 'Create your login credentials' },
  { id: 2, title: 'Profile', description: 'Add your professional information' },
  { id: 3, title: 'Role', description: 'Select your role in the journal' },
  { id: 4, title: 'Confirm', description: 'Review and submit your registration' },
];

export function RegisterPage() {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(1);
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    getValues,
    formState: { errors, isValid },
    trigger,
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
    mode: 'onChange',
    defaultValues: {
      role: 'AUTHOR',
      agreeTerms: false,
      agreePrivacy: false,
    },
  });

  const password = watch('password');
  const passwordStrength = getPasswordStrength(password);

  const nextStep = async (step: number) => {
    const stepFields: Record<number, (keyof RegisterFormData)[]> = {
      1: ['firstName', 'lastName', 'email', 'password', 'confirmPassword'],
      2: ['affiliation', 'department', 'orcid', 'country'],
      3: ['role'],
      4: ['agreeTerms', 'agreePrivacy'],
    };

    if (stepFields[currentStep]) {
      const isValid = await trigger(stepFields[currentStep]);
      if (isValid) {
        setCurrentStep(step);
      }
    } else {
      setCurrentStep(step);
    }
  };

  const prevStep = () => {
    setCurrentStep(currentStep - 1);
  };

  const onSubmit = async (data: RegisterFormData) => {
    setIsSubmitting(true);
    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Registration failed');
      }

      toast.success('Registration successful! Please check your email to verify your account.');
      router.push('/login?verified=true');
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Registration failed. Please try again.';
      toast.error(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleFinalSubmit = async () => {
    const allValues = getValues();
    const cleaned = {
      ...allValues,
      agreeTerms: Boolean(allValues.agreeTerms),
      agreePrivacy: Boolean(allValues.agreePrivacy),
    };
    const result = registerSchema.safeParse(cleaned);
    if (result.success) {
      onSubmit(cleaned);
    } else {
      const firstError = result.error.issues[0];
      toast.error(firstError?.message || 'Please fix the errors in the form before submitting.');
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-navy-950 py-12 px-4">
      <div className="max-w-2xl mx-auto">
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-2 mb-6">
            <Image src="/logo.png" alt="AMHSJ" width={48} height={48} className="w-12 h-12 rounded-xl" />
            <span className="font-bold text-navy-900 dark:text-white text-2xl">AMHSJ</span>
          </Link>
          <h1 className="text-3xl font-bold text-navy-900 dark:text-white">Create Account</h1>
          <p className="text-slate-600 dark:text-slate-400 mt-2">
            Join Advances in Medicine and Health Sciences Journal
          </p>
        </div>

        <div className="mb-8">
          <div className="flex items-center justify-between">
            {steps.map((step, index) => (
              <div key={step.id} className="flex items-center">
                <div className={cn(
                  'flex items-center justify-center w-10 h-10 rounded-full text-sm font-bold transition-all',
                  currentStep > step.id
                    ? 'bg-gold-400 text-navy-950'
                    : currentStep === step.id
                    ? 'bg-gold-400 text-navy-950 ring-4 ring-gold-400/30'
                    : 'bg-slate-200 dark:bg-navy-700 text-slate-500 dark:text-slate-400'
                )}>
                  {currentStep > step.id ? <CheckCircle className="w-5 h-5" /> : step.id}
                </div>
                {index < steps.length - 1 && (
                  <div className={cn(
                    'hidden md:block w-16 h-1 mx-2',
                    currentStep > step.id ? 'bg-gold-400' : 'bg-slate-200 dark:bg-navy-700'
                  )} />
                )}
              </div>
            ))}
          </div>
          <div className="mt-4 text-center">
            <p className="text-sm font-medium text-navy-900 dark:text-white">{steps[currentStep - 1].title}</p>
            <p className="text-sm text-slate-500 dark:text-slate-400">{steps[currentStep - 1].description}</p>
          </div>
        </div>

        <form onSubmit={(e) => e.preventDefault()} className="space-y-6" noValidate>
          {currentStep === 1 && (
            <Step1Fields register={register} errors={errors} showPassword={showPassword} setShowPassword={setShowPassword} watch={watch} passwordStrength={passwordStrength} />
          )}
          {currentStep === 2 && (
            <Step2Fields register={register} errors={errors} watch={watch} />
          )}
          {currentStep === 3 && (
            <Step3Fields register={register} errors={errors} watch={watch} />
          )}
          {currentStep === 4 && (
            <Step4Fields register={register} errors={errors} watch={watch} />
          )}

          <div className="flex justify-between pt-4 border-t border-slate-200 dark:border-navy-800">
            {currentStep > 1 && (
              <Button type="button" variant="outline" onClick={prevStep}>
                <ChevronLeft className="w-4 h-4 mr-2" />
                Back
              </Button>
            )}
            {currentStep < steps.length ? (
              <Button type="button" onClick={() => nextStep(currentStep + 1)}>
                Next
                <ChevronRight className="w-4 h-4 ml-2" />
              </Button>
            ) : (
              <Button type="button" size="lg" loading={isSubmitting} onClick={handleFinalSubmit} className="w-full sm:w-auto">
                Create Account
              </Button>
            )}
          </div>
        </form>

        <div className="mt-6 text-center">
          <p className="text-slate-600 dark:text-slate-400">
            Already have an account?{' '}
            <Link href="/login" className="text-gold-600 hover:text-gold-700 font-medium">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

interface Step1FieldsProps {
  register: ReturnType<typeof useForm<RegisterFormData>>['register'];
  errors: ReturnType<typeof useForm<RegisterFormData>>['formState']['errors'];
  showPassword: boolean;
  setShowPassword: (show: boolean) => void;
  watch: ReturnType<typeof useForm<RegisterFormData>>['watch'];
  passwordStrength: ReturnType<typeof getPasswordStrength>;
}

function Step1Fields({ register, errors, showPassword, setShowPassword, watch, passwordStrength }: Step1FieldsProps) {
  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold text-navy-900 dark:text-white">Account Information</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Input label="First Name *" error={errors.firstName?.message} {...register('firstName')} />
        <Input label="Last Name *" error={errors.lastName?.message} {...register('lastName')} />
      </div>
      <Input label="Middle Name" {...register('middleName')} />
      <Input label="Email Address *" type="email" error={errors.email?.message} {...register('email')} />
      <div className="relative">
        <Input
          label="Password *"
          type={showPassword ? 'text' : 'password'}
          error={errors.password?.message}
          {...register('password')}
        />
        <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-[38px] text-slate-400 hover:text-navy-600">
          {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
        </button>
      </div>
      <Input
        label="Confirm Password *"
        type={showPassword ? 'text' : 'password'}
        error={errors.confirmPassword?.message}
        {...register('confirmPassword')}
      />

      <div className="space-y-2">
        <div className="flex items-center justify-between text-sm">
          <span className="text-slate-600 dark:text-slate-400">Password Strength</span>
          <span className={cn('font-medium', passwordStrength.color)}>{passwordStrength.label}</span>
        </div>
        <div className="h-2 bg-slate-200 dark:bg-navy-700 rounded-full overflow-hidden">
          <div className={cn('h-full transition-all duration-300', passwordStrength.bg)} style={{ width: `${passwordStrength.width}%` }} />
        </div>
        <p className="text-xs text-slate-500 dark:text-slate-400">{passwordStrength.feedback}</p>
      </div>
    </div>
  );
}

interface Step2FieldsProps {
  register: ReturnType<typeof useForm<RegisterFormData>>['register'];
  errors: ReturnType<typeof useForm<RegisterFormData>>['formState']['errors'];
  watch: ReturnType<typeof useForm<RegisterFormData>>['watch'];
}

function Step2Fields({ register, errors, watch }: Step2FieldsProps) {
  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold text-navy-900 dark:text-white">Professional Profile</h3>
      <Input label="Affiliation / Institution *" error={errors.affiliation?.message} {...register('affiliation')} />
      <Input label="Department" {...register('department')} />
      <Input label="ORCID ID" placeholder="0000-0000-0000-0000" {...register('orcid')} />
      <Select
        label="Country"
        placeholder="Select your country"
        options={[
          { value: 'AF', label: 'Afghanistan' },
          { value: 'AL', label: 'Albania' },
          { value: 'DZ', label: 'Algeria' },
          { value: 'AO', label: 'Angola' },
          { value: 'AR', label: 'Argentina' },
          { value: 'AM', label: 'Armenia' },
          { value: 'AU', label: 'Australia' },
          { value: 'AT', label: 'Austria' },
          { value: 'AZ', label: 'Azerbaijan' },
          { value: 'BD', label: 'Bangladesh' },
          { value: 'BY', label: 'Belarus' },
          { value: 'BE', label: 'Belgium' },
          { value: 'BJ', label: 'Benin' },
          { value: 'BO', label: 'Bolivia' },
          { value: 'BA', label: 'Bosnia and Herzegovina' },
          { value: 'BW', label: 'Botswana' },
          { value: 'BR', label: 'Brazil' },
          { value: 'BG', label: 'Bulgaria' },
          { value: 'BF', label: 'Burkina Faso' },
          { value: 'BI', label: 'Burundi' },
          { value: 'KH', label: 'Cambodia' },
          { value: 'CM', label: 'Cameroon' },
          { value: 'CA', label: 'Canada' },
          { value: 'TD', label: 'Chad' },
          { value: 'CL', label: 'Chile' },
          { value: 'CN', label: 'China' },
          { value: 'CO', label: 'Colombia' },
          { value: 'CG', label: 'Congo' },
          { value: 'CR', label: 'Costa Rica' },
          { value: 'HR', label: 'Croatia' },
          { value: 'CU', label: 'Cuba' },
          { value: 'CZ', label: 'Czech Republic' },
          { value: 'CD', label: 'DR Congo' },
          { value: 'DK', label: 'Denmark' },
          { value: 'DO', label: 'Dominican Republic' },
          { value: 'EC', label: 'Ecuador' },
          { value: 'EG', label: 'Egypt' },
          { value: 'SV', label: 'El Salvador' },
          { value: 'GQ', label: 'Equatorial Guinea' },
          { value: 'ER', label: 'Eritrea' },
          { value: 'EE', label: 'Estonia' },
          { value: 'SZ', label: 'Eswatini' },
          { value: 'ET', label: 'Ethiopia' },
          { value: 'FI', label: 'Finland' },
          { value: 'FR', label: 'France' },
          { value: 'GA', label: 'Gabon' },
          { value: 'GM', label: 'Gambia' },
          { value: 'GE', label: 'Georgia' },
          { value: 'DE', label: 'Germany' },
          { value: 'GH', label: 'Ghana' },
          { value: 'GR', label: 'Greece' },
          { value: 'GT', label: 'Guatemala' },
          { value: 'GN', label: 'Guinea' },
          { value: 'GW', label: 'Guinea-Bissau' },
          { value: 'HT', label: 'Haiti' },
          { value: 'HN', label: 'Honduras' },
          { value: 'HU', label: 'Hungary' },
          { value: 'IN', label: 'India' },
          { value: 'ID', label: 'Indonesia' },
          { value: 'IR', label: 'Iran' },
          { value: 'IQ', label: 'Iraq' },
          { value: 'IE', label: 'Ireland' },
          { value: 'IL', label: 'Israel' },
          { value: 'IT', label: 'Italy' },
          { value: 'CI', label: 'Ivory Coast' },
          { value: 'JM', label: 'Jamaica' },
          { value: 'JP', label: 'Japan' },
          { value: 'JO', label: 'Jordan' },
          { value: 'KZ', label: 'Kazakhstan' },
          { value: 'KE', label: 'Kenya' },
          { value: 'KR', label: 'South Korea' },
          { value: 'KW', label: 'Kuwait' },
          { value: 'KG', label: 'Kyrgyzstan' },
          { value: 'LA', label: 'Laos' },
          { value: 'LV', label: 'Latvia' },
          { value: 'LB', label: 'Lebanon' },
          { value: 'LS', label: 'Lesotho' },
          { value: 'LR', label: 'Liberia' },
          { value: 'LY', label: 'Libya' },
          { value: 'LT', label: 'Lithuania' },
          { value: 'MG', label: 'Madagascar' },
          { value: 'MW', label: 'Malawi' },
          { value: 'MY', label: 'Malaysia' },
          { value: 'ML', label: 'Mali' },
          { value: 'MR', label: 'Mauritania' },
          { value: 'MU', label: 'Mauritius' },
          { value: 'MX', label: 'Mexico' },
          { value: 'MD', label: 'Moldova' },
          { value: 'MN', label: 'Mongolia' },
          { value: 'MA', label: 'Morocco' },
          { value: 'MZ', label: 'Mozambique' },
          { value: 'MM', label: 'Myanmar' },
          { value: 'NA', label: 'Namibia' },
          { value: 'NP', label: 'Nepal' },
          { value: 'NL', label: 'Netherlands' },
          { value: 'NZ', label: 'New Zealand' },
          { value: 'NI', label: 'Nicaragua' },
          { value: 'NE', label: 'Niger' },
          { value: 'NG', label: 'Nigeria' },
          { value: 'MK', label: 'North Macedonia' },
          { value: 'NO', label: 'Norway' },
          { value: 'OM', label: 'Oman' },
          { value: 'PK', label: 'Pakistan' },
          { value: 'PA', label: 'Panama' },
          { value: 'PG', label: 'Papua New Guinea' },
          { value: 'PY', label: 'Paraguay' },
          { value: 'PE', label: 'Peru' },
          { value: 'PH', label: 'Philippines' },
          { value: 'PL', label: 'Poland' },
          { value: 'PT', label: 'Portugal' },
          { value: 'QA', label: 'Qatar' },
          { value: 'RO', label: 'Romania' },
          { value: 'RU', label: 'Russia' },
          { value: 'RW', label: 'Rwanda' },
          { value: 'SA', label: 'Saudi Arabia' },
          { value: 'SN', label: 'Senegal' },
          { value: 'RS', label: 'Serbia' },
          { value: 'SL', label: 'Sierra Leone' },
          { value: 'SG', label: 'Singapore' },
          { value: 'SK', label: 'Slovakia' },
          { value: 'SI', label: 'Slovenia' },
          { value: 'SO', label: 'Somalia' },
          { value: 'ZA', label: 'South Africa' },
          { value: 'SS', label: 'South Sudan' },
          { value: 'ES', label: 'Spain' },
          { value: 'LK', label: 'Sri Lanka' },
          { value: 'SD', label: 'Sudan' },
          { value: 'SE', label: 'Sweden' },
          { value: 'CH', label: 'Switzerland' },
          { value: 'SY', label: 'Syria' },
          { value: 'TW', label: 'Taiwan' },
          { value: 'TJ', label: 'Tajikistan' },
          { value: 'TZ', label: 'Tanzania' },
          { value: 'TH', label: 'Thailand' },
          { value: 'TG', label: 'Togo' },
          { value: 'TN', label: 'Tunisia' },
          { value: 'TR', label: 'Turkey' },
          { value: 'UG', label: 'Uganda' },
          { value: 'UA', label: 'Ukraine' },
          { value: 'AE', label: 'United Arab Emirates' },
          { value: 'GB', label: 'United Kingdom' },
          { value: 'US', label: 'United States' },
          { value: 'UY', label: 'Uruguay' },
          { value: 'UZ', label: 'Uzbekistan' },
          { value: 'VE', label: 'Venezuela' },
          { value: 'VN', label: 'Vietnam' },
          { value: 'YE', label: 'Yemen' },
          { value: 'ZM', label: 'Zambia' },
          { value: 'ZW', label: 'Zimbabwe' },
          { value: 'OTHER', label: 'Other' },
        ]}
        {...register('country')}
      />
    </div>
  );
}

interface Step3FieldsProps {
  register: ReturnType<typeof useForm<RegisterFormData>>['register'];
  errors: ReturnType<typeof useForm<RegisterFormData>>['formState']['errors'];
  watch: ReturnType<typeof useForm<RegisterFormData>>['watch'];
}

function Step3Fields({ register, errors, watch }: Step3FieldsProps) {
  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold text-navy-900 dark:text-white">Select Your Role</h3>
      <p className="text-slate-600 dark:text-slate-400">
        Choose the role that best describes how you&apos;ll use AMHSJ. You can request additional roles later.
      </p>
      <div className="space-y-3">
        {roleOptions.map((role) => (
          <label
            key={role.value}
            className={cn(
              'relative flex items-start p-4 rounded-lg border-2 cursor-pointer transition-all',
              watch('role') === role.value
                ? 'border-gold-400 bg-gold-50 dark:bg-gold-900/10'
                : 'border-slate-200 dark:border-navy-700 hover:border-gold-300'
            )}
          >
            <input
              type="radio"
              value={role.value}
              {...register('role')}
              className="sr-only"
            />
            <div className="flex items-start gap-3">
              <div className={cn(
                'w-6 h-6 rounded-full border-2 flex items-center justify-center flex-shrink-0 mt-0.5',
                watch('role') === role.value
                  ? 'bg-gold-400 border-gold-400'
                  : 'border-slate-300 dark:border-navy-600'
              )}>
                {watch('role') === role.value && <span className="w-2 h-2 bg-navy-950 rounded-full" />}
              </div>
              <div className="flex-1">
                <span className="block font-medium text-navy-900 dark:text-white">{role.value}</span>
                <span className="block text-sm text-slate-500 dark:text-slate-400 mt-0.5">{role.label}</span>
              </div>
            </div>
          </label>
        ))}
      </div>
    </div>
  );
}

interface Step4FieldsProps {
  register: ReturnType<typeof useForm<RegisterFormData>>['register'];
  errors: ReturnType<typeof useForm<RegisterFormData>>['formState']['errors'];
  watch: ReturnType<typeof useForm<RegisterFormData>>['watch'];
}

function Step4Fields({ register, errors, watch }: Step4FieldsProps) {
  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold text-navy-900 dark:text-white">Terms & Agreements</h3>
      <p className="text-slate-600 dark:text-slate-400">
        Please review and accept the following agreements to complete your registration.
      </p>
      <div className="space-y-4">
        <label className={cn(
          'flex items-start gap-3 p-4 rounded-lg border-2 cursor-pointer transition-all',
          watch('agreeTerms')
            ? 'border-gold-400 bg-gold-50 dark:bg-gold-900/10'
            : 'border-slate-200 dark:border-navy-700 hover:border-gold-300'
        )}>
          <input type="checkbox" {...register('agreeTerms')} className="w-5 h-5 text-gold-600 border-slate-300 rounded focus:ring-gold-500 mt-0.5" />
          <div>
            <span className="block font-medium text-navy-900 dark:text-white">Terms of Service</span>
            <span className="block text-sm text-slate-500 dark:text-slate-400 mt-0.5">I agree to the <a href="/terms" className="text-gold-600 hover:underline">Terms of Service</a> for using AMHSJ.</span>
          </div>
        </label>
        <label className={cn(
          'flex items-start gap-3 p-4 rounded-lg border-2 cursor-pointer transition-all',
          watch('agreePrivacy')
            ? 'border-gold-400 bg-gold-50 dark:bg-gold-900/10'
            : 'border-slate-200 dark:border-navy-700 hover:border-gold-300'
        )}>
          <input type="checkbox" {...register('agreePrivacy')} className="w-5 h-5 text-gold-600 border-slate-300 rounded focus:ring-gold-500 mt-0.5" />
          <div>
            <span className="block font-medium text-navy-900 dark:text-white">Privacy Policy</span>
            <span className="block text-sm text-slate-500 dark:text-slate-400 mt-0.5">I agree to the <a href="/privacy" className="text-gold-600 hover:underline">Privacy Policy</a> regarding my personal data.</span>
          </div>
        </label>
        <label className={cn(
          'flex items-start gap-3 p-4 rounded-lg border-2 cursor-pointer transition-all',
          watch('agreeTerms')
            ? 'border-gold-400 bg-gold-50 dark:bg-gold-900/10'
            : 'border-slate-200 dark:border-navy-700 hover:border-gold-300'
        )}>
          <input type="checkbox" {...register('agreeTerms')} className="w-5 h-5 text-gold-600 border-slate-300 rounded focus:ring-gold-500 mt-0.5" />
          <div>
            <span className="block font-medium text-navy-900 dark:text-white">Publication Ethics</span>
            <span className="block text-sm text-slate-500 dark:text-slate-400 mt-0.5">I agree to comply with the <a href="/ethics" className="text-gold-600 hover:underline">Publication Ethics</a> and COPE guidelines.</span>
          </div>
        </label>
      </div>

      <div className="bg-slate-50 dark:bg-navy-800 rounded-lg p-4">
        <h4 className="font-medium text-navy-900 dark:text-white mb-2">What happens next?</h4>
        <ul className="text-sm text-slate-600 dark:text-slate-400 space-y-1">
          <li>• You&apos;ll receive a verification email at your registered address</li>
          <li>• Click the link in the email to activate your account</li>
          <li>• Once verified, you can sign in and start using AMHSJ</li>
          <li>• Authors can immediately submit manuscripts</li>
          <li>• Reviewers will be added to our reviewer database</li>
        </ul>
      </div>
    </div>
  );
}

function getPasswordStrength(password: string) {
  if (!password) return { width: 0, label: 'Very Weak', color: 'text-red-500', bg: 'bg-red-500', feedback: 'Enter a password' };
  
  let score = 0;
  if (password.length >= 8) score += 1;
  if (password.length >= 12) score += 1;
  if (/[A-Z]/.test(password)) score += 1;
  if (/[a-z]/.test(password)) score += 1;
  if (/[0-9]/.test(password)) score += 1;
  if (/[^A-Za-z0-9]/.test(password)) score += 1;

  const configs = [
    { width: 20, label: 'Very Weak', color: 'text-red-500', bg: 'bg-red-500', feedback: 'Too short or simple' },
    { width: 40, label: 'Weak', color: 'text-orange-500', bg: 'bg-orange-500', feedback: 'Add more characters' },
    { width: 60, label: 'Fair', color: 'text-yellow-500', bg: 'bg-yellow-500', feedback: 'Add uppercase/lowercase/numbers' },
    { width: 80, label: 'Good', color: 'text-green-500', bg: 'bg-green-500', feedback: 'Add special characters' },
    { width: 100, label: 'Strong', color: 'text-green-600', bg: 'bg-green-600', feedback: 'Excellent password!' },
  ];

  return configs[Math.min(score, 4)];
}

export default RegisterPage;