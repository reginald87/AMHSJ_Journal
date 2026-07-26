'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import Image from 'next/image';
import { AlertCircle, CheckCircle, ArrowLeft, Loader2, Mail } from 'lucide-react';

const schema = z.object({
  email: z.string().email('Invalid email address'),
});

type FormData = z.infer<typeof schema>;

export default function ForgotPasswordPage() {
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [message, setMessage] = useState('');

  const { register, handleSubmit, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
  });

  const onSubmit = async (data: FormData) => {
    setStatus('loading');
    try {
      const res = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: data.email }),
      });

      const result = await res.json();
      if (!res.ok) throw new Error(result.error || 'Failed to send reset email');

      setStatus('success');
      setMessage(result.message || 'Check your email for a password reset link.');
    } catch (err: unknown) {
      setStatus('error');
      setMessage(err instanceof Error ? err.message : 'Something went wrong');
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-navy-950 flex items-center justify-center py-12 px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-2 mb-6">
            <Image src="/logo.png" alt="AMHSJ" width={48} height={48} className="w-12 h-12 rounded-xl" />
            <span className="font-bold text-navy-900 dark:text-white text-2xl">AMHSJ</span>
          </Link>
          <h1 className="text-3xl font-bold text-navy-900 dark:text-white">Forgot Password</h1>
          <p className="text-slate-600 dark:text-slate-400 mt-2">
            Enter your email and we&apos;ll send you a reset link.
          </p>
        </div>

        <div className="bg-white dark:bg-navy-900 rounded-xl border border-slate-200 dark:border-navy-800 p-6">
          {status === 'success' ? (
            <div className="text-center py-4">
              <div className="w-12 h-12 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle className="w-6 h-6 text-green-600 dark:text-green-400" />
              </div>
              <h2 className="text-lg font-semibold text-navy-900 dark:text-white mb-2">Check Your Email</h2>
              <p className="text-slate-600 dark:text-slate-400 text-sm mb-6">{message}</p>
              <Link href="/login">
                <Button variant="outline">
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Back to Sign In
                </Button>
              </Link>
            </div>
          ) : (
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
              <div className="flex items-center gap-3 p-3 bg-gold-50 dark:bg-gold-900/20 border border-gold-200 dark:border-gold-800 rounded-lg">
                <Mail className="w-5 h-5 text-gold-600 dark:text-gold-400 flex-shrink-0" />
                <p className="text-sm text-navy-900 dark:text-white">We&apos;ll send a password reset link to your registered email address.</p>
              </div>

              <Input
                label="Email Address"
                type="email"
                placeholder="john.doe@university.edu"
                error={errors.email?.message}
                {...register('email')}
              />

              {status === 'error' && (
                <div className="flex items-center gap-2 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg text-red-700 dark:text-red-400 text-sm">
                  <AlertCircle className="w-5 h-5 flex-shrink-0" />
                  {message}
                </div>
              )}

              <Button type="submit" className="w-full" size="lg" loading={status === 'loading'}>
                Send Reset Link
              </Button>

              <div className="text-center">
                <Link href="/login" className="text-sm text-gold-600 hover:text-gold-700 inline-flex items-center gap-1">
                  <ArrowLeft className="w-3.5 h-3.5" />
                  Back to Sign In
                </Link>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
