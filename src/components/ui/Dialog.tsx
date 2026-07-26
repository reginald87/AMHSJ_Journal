'use client';

import * as React from 'react';
import { cn } from '@/lib/utils';
import { X } from 'lucide-react';

interface DialogContextType {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const DialogContext = React.createContext<DialogContextType | null>(null);

const useDialogContext = () => {
  return React.useContext(DialogContext);
};

export const Dialog = ({ children, open, onOpenChange }: { children: React.ReactNode; open: boolean; onOpenChange: (open: boolean) => void }) => {
  if (!open) return null;

  return (
    <DialogContext.Provider value={{ open, onOpenChange }}>
      {children}
    </DialogContext.Provider>
  );
};

export const DialogTrigger = ({ children, onClick, ...props }: React.ComponentProps<'button'>) => {
  const ctx = useDialogContext();
  return (
    <button onClick={(e) => { ctx?.onOpenChange(true); onClick?.(e); }} {...props}>
      {children}
    </button>
  );
};

export const DialogContent = ({ children, className, ...props }: React.ComponentProps<'div'>) => {
  const ctx = useDialogContext();
  return (
    <div className={cn('fixed inset-0 z-[100] flex items-center justify-center p-4', className)} onClick={(e) => e.target === e.currentTarget && ctx?.onOpenChange(false)}>
      <div className="fixed inset-0 bg-black/50 animate-fade-in" onClick={() => ctx?.onOpenChange(false)} />
      <div className="relative z-[101] w-full max-w-lg max-h-[90vh] overflow-y-auto rounded-xl bg-white dark:bg-navy-900 shadow-xl animate-slide-in" {...props}>
        <div className="flex flex-col max-h-[90vh]">
          {children}
        </div>
      </div>
    </div>
  );
};

export const DialogHeader = ({ children, className, ...props }: React.ComponentProps<'div'>) => {
  return <div className={cn('flex flex-col space-y-1.5 p-6', className)} {...props}>{children}</div>;
};

export const DialogTitle = ({ children, className, ...props }: React.ComponentProps<'h2'>) => {
  return <h2 className={cn('text-xl font-semibold text-navy-900 dark:text-white', className)} {...props}>{children}</h2>;
};

export const DialogDescription = ({ children, className, ...props }: React.ComponentProps<'p'>) => {
  return <p className={cn('text-sm text-slate-600 dark:text-slate-400', className)} {...props}>{children}</p>;
};

export const DialogFooter = ({ children, className, ...props }: React.ComponentProps<'div'>) => {
  return <div className={cn('flex items-center justify-end gap-2 p-6 border-t border-slate-200 dark:border-navy-800', className)} {...props}>{children}</div>;
};

export const DialogClose = ({ className, onClick, ...props }: React.ComponentProps<'button'>) => {
  const ctx = useDialogContext();
  return (
    <button
      type="button"
      onClick={(e) => { ctx?.onOpenChange(false); onClick?.(e); }}
      className={cn('absolute right-4 top-4 rounded-lg p-1 text-slate-500 hover:text-navy-900 dark:hover:text-white transition-colors', className)}
      {...props}
    >
      <X className="w-5 h-5" />
    </button>
  );
};

export const DialogPrimitive = Dialog;