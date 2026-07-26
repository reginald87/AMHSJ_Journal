'use client';

import { forwardRef, useImperativeHandle } from 'react';
import { cn } from '@/lib/utils';
import { X, ChevronDown } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';

interface TabsProps {
  value: string;
  onValueChange: (value: string) => void;
  children: React.ReactNode;
  className?: string;
}

const Tabs = forwardRef<HTMLDivElement, TabsProps>(
  ({ value, onValueChange, children, className }, ref) => {
    return (
      <div ref={ref} className={cn('w-full', className)}>
        {children}
      </div>
    );
  }
);
Tabs.displayName = 'Tabs';

interface TabsListProps {
  children: React.ReactNode;
  className?: string;
}

const TabsList = forwardRef<HTMLDivElement, TabsListProps>(
  ({ children, className }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(
          'inline-flex h-10 items-center justify-center rounded-md bg-slate-100 dark:bg-navy-800 p-1 text-slate-600 dark:text-slate-400',
          className
        )}
        role="tablist"
        aria-orientation="horizontal"
      >
        {children}
      </div>
    );
  }
);
TabsList.displayName = 'TabsList';

interface TabsTriggerProps {
  value: string;
  children: React.ReactNode;
  className?: string;
  disabled?: boolean;
}

const TabsTrigger = forwardRef<HTMLButtonElement, TabsTriggerProps>(
  ({ value, children, className, disabled }, ref) => {
    return (
      <button
        ref={ref}
        type="button"
        role="tab"
        aria-selected={false}
        aria-disabled={disabled}
        data-state="inactive"
        data-value={value}
        disabled={disabled}
        onClick={() => {}}
        className={cn(
          'inline-flex items-center justify-center whitespace-nowrap rounded-sm px-3 py-1.5 text-sm font-medium ring-offset-white dark:ring-offset-navy-950 transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold-400 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 data-[state=active]:bg-white dark:data-[state=active]:bg-navy-900 data-[state=active]:text-navy-900 dark:data-[state=active]:text-white data-[state=active]:shadow-sm',
          className
        )}
      >
        {children}
      </button>
    );
  }
);
TabsTrigger.displayName = 'TabsTrigger';

interface TabsContentProps {
  value: string;
  children: React.ReactNode;
  className?: string;
}

const TabsContent = forwardRef<HTMLDivElement, TabsContentProps>(
  ({ value, children, className }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(
          'mt-2 ring-offset-white dark:ring-offset-navy-950 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold-400 focus-visible:ring-offset-2',
          className
        )}
        role="tabpanel"
        aria-labelledby={value}
        hidden={false}
      >
        {children}
      </div>
    );
  }
);
TabsContent.displayName = 'TabsContent';

export { Tabs, TabsList, TabsTrigger, TabsContent };