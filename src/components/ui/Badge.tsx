'use client';

import { forwardRef, type HTMLAttributes } from 'react';
import { cn } from '@/lib/utils';

interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  variant?: 'default' | 'gold' | 'success' | 'warning' | 'danger' | 'info' | 'outline' | 'navy';
  size?: 'sm' | 'md' | 'lg';
}

const Badge = forwardRef<HTMLSpanElement, BadgeProps>(
  ({ className, variant = 'default', size = 'md', children, ...props }, ref) => {
    const variants = {
      default: 'bg-slate-100 text-slate-800 dark:bg-navy-800 dark:text-slate-200',
      gold: 'bg-gold-100 text-gold-800 dark:bg-gold-900/30 dark:text-gold-400',
      navy: 'bg-navy-100 text-navy-800 dark:bg-navy-900 dark:text-navy-200',
      success: 'bg-success-100 text-success-800 dark:bg-success-900/30 dark:text-success-400',
      warning: 'bg-warning-100 text-warning-800 dark:bg-warning-900/30 dark:text-warning-400',
      danger: 'bg-danger-100 text-danger-800 dark:bg-danger-900/30 dark:text-danger-400',
      info: 'bg-info-100 text-info-800 dark:bg-info-900/30 dark:text-info-400',
      outline: 'border-2 border-slate-300 text-slate-700 dark:border-navy-600 dark:text-slate-300',
    };

    const sizes = {
      sm: 'px-2 py-0.5 text-xs',
      md: 'px-2.5 py-1 text-xs',
      lg: 'px-3 py-1 text-sm',
    };

    return (
      <span
        ref={ref}
        className={cn(
          'inline-flex items-center font-medium rounded-full',
          variants[variant],
          sizes[size],
          className
        )}
        {...props}
      >
        {children}
      </span>
    );
  }
);
Badge.displayName = 'Badge';

export { Badge };