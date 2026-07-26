'use client';

import { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import Image from 'next/image';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Eye, EyeOff, AlertCircle, CheckCircle } from 'lucide-react';
import { signIn } from 'next-auth/react';
import { toast } from 'sonner';

const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(1, 'Password is required'),
  rememberMe: z.boolean().optional(),
});

type LoginFormData = z.infer<typeof loginSchema>;

export function LoginPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const callbackUrl = searchParams.get('callbackUrl') || '/dashboard';
  const verified = searchParams.get('verified');

  const {
    register,
    handleSubmit,
    formState: { errors },
    setError,
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: LoginFormData) => {
    setIsLoading(true);
    try {
      const result = await signIn('credentials', {
        email: data.email,
        password: data.password,
        redirect: false,
        callbackUrl,
      });

      if (result?.error) {
        throw new Error(result.error);
      }

      toast.success('Welcome back!');

      if (callbackUrl && callbackUrl !== '/dashboard') {
        router.push(callbackUrl);
      } else {
        const res = await fetch('/api/auth/session');
        const session = await res.json();
        const role = session?.user?.role;
        if (role === 'ADMIN' || role === 'EDITOR_IN_CHIEF') {
          router.push('/admin/overview');
        } else if (['EDITOR', 'DEPUTY_EDITOR_IN_CHIEF', 'ASSOCIATE_EDITOR'].includes(role)) {
          router.push('/editor');
        } else if (role === 'REVIEWER') {
          router.push('/reviewer');
        } else {
          router.push('/dashboard');
        }
      }
      router.refresh();
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Invalid credentials';
      setError('root', { message: errorMessage });
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
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
          <h1 className="text-3xl font-bold text-navy-900 dark:text-white">Welcome Back</h1>
          <p className="text-slate-600 dark:text-slate-400 mt-2">
            Sign in to your Advances in Medicine and Health Sciences Journal account
          </p>
        </div>

        {verified && (
          <div className="mb-6 p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg text-green-700 dark:text-green-400 flex items-center gap-3">
            <CheckCircle className="w-5 h-5 flex-shrink-0" />
            <p className="text-sm">Email verified successfully! You can now sign in.</p>
          </div>
        )}

        <div className="bg-white dark:bg-navy-900 rounded-xl border border-slate-200 dark:border-navy-800 p-6">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5" noValidate>
            <Input
              label="Email Address"
              type="email"
              error={errors.email?.message}
              {...register('email')}
              placeholder="john.doe@university.edu"
            />

            <div className="relative">
              <Input
                label="Password"
                type={showPassword ? 'text' : 'password'}
                error={errors.password?.message}
                {...register('password')}
                placeholder="Enter your password"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-[38px] text-slate-400 hover:text-navy-600"
                aria-label={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>

            <div className="flex items-center justify-between">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  {...register('rememberMe')}
                  className="w-4 h-4 rounded border-slate-300 text-gold-600 focus:ring-gold-500"
                />
                <span className="text-sm text-slate-600 dark:text-slate-400">Remember me</span>
              </label>
              <Link href="/forgot-password" className="text-sm text-gold-600 hover:text-gold-700">
                Forgot password?
              </Link>
            </div>

            {errors.root && (
              <div className="flex items-center gap-2 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg text-red-700 dark:text-red-400 text-sm">
                <AlertCircle className="w-5 h-5 flex-shrink-0" />
                {errors.root.message}
              </div>
            )}

            <Button type="submit" className="w-full" size="lg" loading={isLoading}>
              Sign In
            </Button>
          </form>

          <div className="mt-6">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-slate-200 dark:border-navy-700" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white dark:bg-navy-900 text-slate-500 dark:text-slate-400">Or continue with</span>
              </div>
            </div>

            <div className="mt-4 grid grid-cols-2 gap-3">
              <Button variant="outline" onClick={() => signIn('google', { callbackUrl })}>
                <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                </svg>
                Google
              </Button>
              <Button variant="outline" onClick={() => signIn('orcid', { callbackUrl })}>
                <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm5.521 17.34c-.18.27-.39.474-.39.474s-3.507 1.701-4.131 1.884c-.624.18-1.188-.396-1.476-1.14l-1.824-4.644 7.584-1.764 2.256 1.656c.36.3.552.768.6 1.272.06.624-.432 1.116-.9 1.26zm.444-4.44c-.36-1.32-1.596-1.968-2.508-2.004l-1.368-.06v-1.308c0-.6.384-.96.972-1.008.6-.036 1.008.252 1.236.816l.816 1.896h-.012zm-2.928 2.304c-.432 1.032-1.716 1.56-2.736 1.56-.612 0-1.26-.336-1.716-.996l-1.836-2.64 8.208-1.908 1.452 2.208c.456.768.528 1.68.264 2.532-.156.516-.552 1.02-1.116 1.14l-4.62.828.132 1.356zm2.052-8.28c-.336-1.248-1.5-1.86-2.436-1.896l-1.008-.048v-.864c0-.564.324-.936.852-.936.528 0 .912.3.996.816l.348.852h.012zm-4.32.048c-.384-.54-.924-1.02-1.656-1.02-.384 0-.768.144-1.092.432l-1.488 1.284 4.224 1.284.012-2.016zm2.736 5.724c.48 1.068 1.752 1.584 2.772 1.584.648 0 1.296-.348 1.752-1.008l1.896-2.736-8.352 1.956-1.548-2.364c-.48-.78-.576-1.716-.252-2.556.156-.504.564-1.008 1.128-1.128l4.644-.828-.012-1.368zm1.104-3.384c-.432 1.032-1.716 1.56-2.736 1.56-.612 0-1.26-.336-1.716-.996l-1.836-2.64 8.208-1.908 1.452 2.208c.456.768.528 1.68.264 2.532-.156.516-.552 1.02-1.116 1.14l-4.62.828.132 1.356z"/>
                </svg>
                ORCID
              </Button>
            </div>
          </div>

          <div className="mt-6 text-center">
            <p className="text-slate-600 dark:text-slate-400">
              Don&apos;t have an account?{' '}
              <Link href="/register" className="text-gold-600 hover:text-gold-700 font-medium">
                Register
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}