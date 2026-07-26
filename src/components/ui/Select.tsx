'use client';

import * as React from 'react';
import { cn } from '@/lib/utils';
import { ChevronDown, Check } from 'lucide-react';

interface SelectContextValue {
  value: string;
  onValueChange: (value: string) => void;
  open: boolean;
  setOpen: (open: boolean) => void;
}

const SelectContext = React.createContext<SelectContextValue>({
  value: '',
  onValueChange: () => {},
  open: false,
  setOpen: () => {},
});

interface SelectProps {
  value?: string;
  onValueChange?: (value: string) => void;
  children: React.ReactNode;
  className?: string;
}

function Select({ value = '', onValueChange = () => {}, children, className }: SelectProps) {
  const [open, setOpen] = React.useState(false);
  return (
    <SelectContext.Provider value={{ value, onValueChange, open, setOpen }}>
      <div className={cn('relative', className)} onKeyDown={(e) => { if (e.key === 'Escape') setOpen(false); }}>
        {children}
      </div>
    </SelectContext.Provider>
  );
}

interface SelectTriggerProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children?: React.ReactNode;
}

const SelectTrigger = React.forwardRef<HTMLButtonElement, SelectTriggerProps>(
  ({ className, children, ...props }, ref) => {
    const { open, setOpen } = React.useContext(SelectContext);
    return (
      <button
        ref={ref}
        type="button"
        className={cn(
          'flex h-10 w-full items-center justify-between rounded-lg border bg-white px-3 py-2 text-sm',
          'border-slate-300 dark:border-navy-700 dark:bg-navy-900 dark:text-white',
          'placeholder:text-slate-400 dark:placeholder:text-slate-500',
          'focus:outline-none focus:ring-2 focus:ring-gold-400 focus:border-transparent',
          'hover:border-gold-400 dark:hover:border-gold-600',
          'disabled:cursor-not-allowed disabled:opacity-50',
          open && 'ring-2 ring-gold-400 border-gold-400',
          className
        )}
        onClick={() => setOpen(!open)}
        aria-haspopup="listbox"
        aria-expanded={open}
        {...props}
      >
        {children}
        <ChevronDown className={cn('h-4 w-4 text-slate-400 transition-transform', open && 'rotate-180')} />
      </button>
    );
  }
);
SelectTrigger.displayName = 'SelectTrigger';

function SelectValue({ placeholder }: { placeholder?: string }) {
  const { value } = React.useContext(SelectContext);
  return (
    <span className={cn(!value && 'text-slate-400 dark:text-slate-500')}>
      {value || placeholder}
    </span>
  );
}

interface SelectContentProps {
  children: React.ReactNode;
  className?: string;
}

function SelectContent({ children, className }: SelectContentProps) {
  const { open, setOpen } = React.useContext(SelectContext);
  const ref = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    if (!open) return;
    const handleClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, [open, setOpen]);

  if (!open) return null;

  return (
    <div
      ref={ref}
      className={cn(
        'absolute z-50 mt-1 max-h-60 w-full overflow-auto rounded-lg border bg-white shadow-lg',
        'border-slate-200 dark:border-navy-700 dark:bg-navy-900',
        'animate-fade-in',
        className
      )}
      role="listbox"
    >
      {children}
    </div>
  );
}

interface SelectItemProps {
  value: string;
  children: React.ReactNode;
  disabled?: boolean;
}

function SelectItem({ value, children, disabled }: SelectItemProps) {
  const ctx = React.useContext(SelectContext);
  const isSelected = ctx.value === value;
  return (
    <div
      className={cn(
        'relative flex cursor-pointer select-none items-center py-2 pl-8 pr-3 text-sm transition-colors',
        'hover:bg-slate-100 dark:hover:bg-navy-800',
        isSelected && 'bg-gold-50 dark:bg-gold-900/20',
        disabled && 'opacity-50 cursor-not-allowed',
        'text-slate-900 dark:text-white'
      )}
      role="option"
      aria-selected={isSelected}
      onClick={() => {
        if (!disabled) {
          ctx.onValueChange(value);
          ctx.setOpen(false);
        }
      }}
    >
      <span className="absolute left-2 flex h-4 w-4 items-center justify-center">
        {isSelected && <Check className="h-4 w-4 text-gold-600 dark:text-gold-400" />}
      </span>
      <span className="pl-4">{children}</span>
    </div>
  );
}

function SelectSeparator({ className }: { className?: string }) {
  return <hr className={cn('my-1 border-slate-200 dark:border-navy-800', className)} />;
}

function SelectLabel({ children, className }: { children: React.ReactNode; className?: string }) {
  return <div className={cn('px-3 py-1.5 text-xs font-semibold text-slate-500 dark:text-slate-400', className)}>{children}</div>;
}

export { Select, SelectTrigger, SelectValue, SelectContent, SelectItem, SelectSeparator, SelectLabel };
