'use client';

import { forwardRef } from 'react';
import { cn } from '@/lib/utils';

type TableProps = React.TableHTMLAttributes<HTMLTableElement>;

const Table = forwardRef<HTMLTableElement, TableProps>(
  ({ className, ...props }, ref) => {
    return (
      <div className="relative w-full overflow-x-auto">
        <table
          ref={ref}
          className={cn('w-full caption-bottom text-sm', className)}
          {...props}
        />
      </div>
    );
  }
);
Table.displayName = 'Table';

type TableHeaderProps = React.HTMLAttributes<HTMLTableSectionElement>;

const TableHeader = forwardRef<HTMLTableSectionElement, TableHeaderProps>(
  ({ className, ...props }, ref) => {
    return (
      <thead ref={ref} className={cn('[&_tr]:border-b', className)} {...props} />
    );
  }
);
TableHeader.displayName = 'TableHeader';

type TableBodyProps = React.HTMLAttributes<HTMLTableSectionElement>;

const TableBody = forwardRef<HTMLTableSectionElement, TableBodyProps>(
  ({ className, ...props }, ref) => {
    return (
      <tbody ref={ref} className={cn('[&_tr:last-child]:border-0', className)} {...props} />
    );
  }
);
TableBody.displayName = 'TableBody';

type TableFooterProps = React.HTMLAttributes<HTMLTableSectionElement>;

const TableFooter = forwardRef<HTMLTableSectionElement, TableFooterProps>(
  ({ className, ...props }, ref) => {
    return (
      <tfoot ref={ref} className={cn('border-t font-medium [&>tr]:last:border-b-0', className)} {...props} />
    );
  }
);
TableFooter.displayName = 'TableFooter';

type TableRowProps = React.HTMLAttributes<HTMLTableRowElement>;

const TableRow = forwardRef<HTMLTableRowElement, TableRowProps>(
  ({ className, ...props }, ref) => {
    return (
      <tr
        ref={ref}
        className={cn(
          'border-b border-slate-200 dark:border-navy-800 transition-colors hover:bg-slate-50 dark:hover:bg-navy-800/50 data-[state=selected]:bg-slate-100 dark:data-[state=selected]:bg-navy-800',
          className
        )}
        {...props}
      />
    );
  }
);
TableRow.displayName = 'TableRow';

type TableHeadProps = React.ThHTMLAttributes<HTMLTableCellElement>;

const TableHead = forwardRef<HTMLTableCellElement, TableHeadProps>(
  ({ className, ...props }, ref) => {
    return (
      <th
        ref={ref}
        className={cn(
          'h-12 px-4 text-left align-middle font-medium text-slate-500 dark:text-slate-400 [&:has([role=checkbox])]:pr-0',
          className
        )}
        {...props}
      />
    );
  }
);
TableHead.displayName = 'TableHead';

type TableCellProps = React.TdHTMLAttributes<HTMLTableCellElement>;

const TableCell = forwardRef<HTMLTableCellElement, TableCellProps>(
  ({ className, ...props }, ref) => {
    return (
      <td
        ref={ref}
        className={cn('p-4 align-middle [&:has([role=checkbox])]:pr-0', className)}
        {...props}
      />
    );
  }
);
TableCell.displayName = 'TableCell';

type TableCaptionProps = React.HTMLAttributes<HTMLTableCaptionElement>;

const TableCaption = forwardRef<HTMLTableCaptionElement, TableCaptionProps>(
  ({ className, ...props }, ref) => {
    return (
      <caption ref={ref} className={cn('mt-4 text-sm text-slate-500 dark:text-slate-400', className)} {...props} />
    );
  }
);
TableCaption.displayName = 'TableCaption';

export { Table, TableHeader, TableBody, TableFooter, TableHead, TableRow, TableCell, TableCaption };