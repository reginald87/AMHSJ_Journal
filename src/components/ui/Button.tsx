'use client';

import { forwardRef, type ButtonHTMLAttributes } from 'react';
import { cn } from '@/lib/utils';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'destructive' | 'gold' | 'navy';
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'icon';
  loading?: boolean;
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'primary', size = 'md', loading, disabled, children, ...props }, ref) => {
    const variants = {
      primary: 'bg-navy-900 text-white hover:bg-navy-800 focus:ring-navy-500 dark:bg-navy-900 dark:hover:bg-navy-800',
      secondary: 'bg-slate-100 text-slate-900 hover:bg-slate-200 focus:ring-slate-500 dark:bg-navy-800 dark:text-slate-100 dark:hover:bg-navy-700',
      outline: 'border-2 border-navy-900 text-navy-900 hover:bg-navy-50 focus:ring-navy-500 dark:border-navy-200 dark:text-navy-100 dark:hover:bg-navy-900',
      ghost: 'text-navy-700 hover:bg-navy-100 focus:ring-navy-500 dark:text-navy-300 dark:hover:bg-navy-800',
      destructive: 'bg-danger-500 text-white hover:bg-danger-600 focus:ring-danger-500',
      gold: 'bg-gold-400 text-navy-950 hover:bg-gold-500 focus:ring-gold-400 font-semibold',
      navy: 'bg-navy-900 text-white hover:bg-navy-800 focus:ring-navy-500',
    };

    const sizes = {
      sm: 'px-3 py-1.5 text-sm gap-1.5',
      md: 'px-4 py-2 text-sm gap-2',
      lg: 'px-6 py-3 text-base gap-2',
      xl: 'px-8 py-4 text-lg gap-2.5',
      icon: 'p-2',
    };

    return (
      <button
        ref={ref}
        className={cn(
          'inline-flex items-center justify-center font-medium rounded-lg transition-all duration-200',
          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2',
          'disabled:opacity-50 disabled:pointer-events-none',
          'active:scale-[0.98]',
          variants[variant],
          sizes[size],
          className
        )}
        disabled={disabled || loading}
        {...props}
      >
        {loading && (
          <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" fill="none" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
          </svg>
        )}
        {children}
      </button>
    );
  }
);
Button.displayName = 'Button';

export { Button };