'use client';

import { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { CheckCircle, AlertCircle, Loader2, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/Button';

export function VerifyEmailPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get('token');
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [message, setMessage] = useState('');

  const verifyEmail = async (verificationToken: string) => {
    try {
      const response = await fetch(`/api/auth/verify-email?token=${verificationToken}`, {
        method: 'POST',
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Verification failed');
      }

      setStatus('success');
      setMessage(data.message || 'Email verified successfully!');
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Verification failed. Please try again.';
      setStatus('error');
      setMessage(errorMessage);
    }
  };

  if (status === 'loading') {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-navy-950 flex items-center justify-center py-12 px-4">
        <div className="w-full max-w-md text-center">
          <div className="w-12 h-12 rounded-xl flex items-center justify-center mx-auto mb-6">
            <Image src="/logo.png" alt="AMHSJ" width={48} height={48} className="w-12 h-12 rounded-xl" />
          </div>
          <h1 className="text-2xl font-bold text-navy-900 dark:text-white mb-2">Verifying your email</h1>
          <p className="text-slate-600 dark:text-slate-400">Please wait while we verify your email address...</p>
          <Loader2 className="w-8 h-8 mx-auto mt-6 text-gold-400 animate-spin" />
        </div>
      </div>
    );
  }

  const isSuccess = status === 'success';

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-navy-950 flex items-center justify-center py-12 px-4">
      <div className="w-full max-w-md">
        <div className="bg-white dark:bg-navy-900 rounded-xl border border-slate-200 dark:border-navy-800 p-8 text-center">
          <div className="w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-6">
            {isSuccess ? (
              <CheckCircle className="w-8 h-8 text-green-500" />
            ) : (
              <AlertCircle className="w-8 h-8 text-red-500" />
            )}
          </div>

          <h1 className="text-2xl font-bold text-navy-900 dark:text-white mb-3">
            {isSuccess ? 'Email Verified!' : 'Verification Failed'}
          </h1>

          <p className="text-slate-600 dark:text-slate-400 mb-8">
            {message}
          </p>

          {isSuccess && (
            <div className="space-y-4">
              <Link href="/login?verified=true">
                <Button size="lg">
                  <ArrowRight className="w-4 h-4 mr-2" />
                  Continue to Sign In
                </Button>
              </Link>
              <p className="text-sm text-slate-500 dark:text-slate-400">
                Or <Link href="/" className="text-gold-600 hover:text-gold-700">return to homepage</Link>
              </p>
            </div>
          )}

          {!isSuccess && (
            <div className="space-y-4">
              <Button size="lg" variant="outline" onClick={() => router.back()}>
                Go Back
              </Button>
              <p className="text-sm text-slate-500 dark:text-slate-400">
                Need a new verification link? <Link href="/resend-verification" className="text-gold-600 hover:text-gold-700">Request one</Link>
              </p>
            </div>
          )}
        </div>

        <div className="mt-6 text-center">
          <p className="text-sm text-slate-500 dark:text-slate-400">
            © {new Date().getFullYear()} AMHSJ. All rights reserved.
          </p>
        </div>
      </div>
    </div>
  );
}

export default VerifyEmailPage;