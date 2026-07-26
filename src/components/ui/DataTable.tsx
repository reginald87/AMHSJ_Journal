'use client';

import { useState, useEffect, useCallback } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/Table';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { ChevronLeft, ChevronRight, ArrowUpDown, ArrowUp, ArrowDown, Search } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface Column<T> {
  key: string;
  label: string;
  sortable?: boolean;
  className?: string;
  render?: (value: unknown, row: T) => React.ReactNode;
}

export interface SortState {
  field: string;
  direction: 'asc' | 'desc';
}

interface DataTableProps<T> {
  columns: Column<T>[];
  data: T[];
  total: number;
  page: number;
  pageSize: number;
  sort?: SortState;
  search?: string;
  searchPlaceholder?: string;
  loading?: boolean;
  emptyMessage?: string;
  onPageChange: (page: number) => void;
  onSort?: (sort: SortState) => void;
  onSearch?: (search: string) => void;
  actions?: (row: T) => React.ReactNode;
}

export function DataTable<T extends Record<string, unknown>>({
  columns,
  data,
  total,
  page,
  pageSize,
  sort,
  search,
  searchPlaceholder = 'Search...',
  loading = false,
  emptyMessage = 'No data found',
  onPageChange,
  onSort,
  onSearch,
  actions,
}: DataTableProps<T>) {
  const totalPages = Math.ceil(total / pageSize);
  const [localSearch, setLocalSearch] = useState(search || '');

  useEffect(() => {
    setLocalSearch(search || '');
  }, [search]);

  const handleSearch = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault();
      onSearch?.(localSearch);
    },
    [localSearch, onSearch],
  );

  const handleSort = (field: string) => {
    if (!onSort) return;
    if (sort?.field === field) {
      onSort({ field, direction: sort.direction === 'asc' ? 'desc' : 'asc' });
    } else {
      onSort({ field, direction: 'asc' });
    }
  };

  const renderSortIcon = (field: string) => {
    if (!sort || sort.field !== field) return <ArrowUpDown className="w-3 h-3 ml-1 opacity-40" />;
    return sort.direction === 'asc' ? (
      <ArrowUp className="w-3 h-3 ml-1 text-gold-600" />
    ) : (
      <ArrowDown className="w-3 h-3 ml-1 text-gold-600" />
    );
  };

  return (
    <div className="space-y-4">
      {onSearch && (
        <form onSubmit={handleSearch} className="flex gap-2">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <Input
              placeholder={searchPlaceholder}
              value={localSearch}
              onChange={(e) => setLocalSearch(e.target.value)}
              className="pl-9"
            />
          </div>
          <Button type="submit" variant="outline" size="sm">Search</Button>
        </form>
      )}

      <div className="border border-slate-200 dark:border-navy-800 rounded-xl overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="bg-slate-50 dark:bg-navy-800/50">
              {columns.map((col) => (
                <TableHead key={col.key} className={cn(col.sortable && 'cursor-pointer select-none hover:bg-slate-100 dark:hover:bg-navy-700', col.className)} onClick={() => col.sortable && handleSort(col.key)}>
                  <span className="inline-flex items-center">
                    {col.label}
                    {col.sortable && renderSortIcon(col.key)}
                  </span>
                </TableHead>
              ))}
              {actions && <TableHead className="w-[80px]">Actions</TableHead>}
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={columns.length + (actions ? 1 : 0)}>
                  <div className="py-12 text-center">
                    <div className="w-6 h-6 border-2 border-gold-400 border-t-transparent rounded-full animate-spin mx-auto" />
                    <p className="text-sm text-slate-500 mt-2">Loading...</p>
                  </div>
                </TableCell>
              </TableRow>
            ) : data.length === 0 ? (
              <TableRow>
                <TableCell colSpan={columns.length + (actions ? 1 : 0)}>
                  <div className="py-12 text-center text-sm text-slate-500 dark:text-slate-400">
                    {emptyMessage}
                  </div>
                </TableCell>
              </TableRow>
            ) : (
              data.map((row, i) => (
                <TableRow key={i}>
                  {columns.map((col) => (
                    <TableCell key={col.key} className={col.className}>
                      {col.render ? col.render(row[col.key], row) : String(row[col.key] ?? '—')}
                    </TableCell>
                  ))}
                  {actions && <TableCell>{actions(row)}</TableCell>}
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {totalPages > 1 && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Showing {((page - 1) * pageSize) + 1}–{Math.min(page * pageSize, total)} of {total}
          </p>
          <div className="flex items-center gap-1">
            <Button variant="outline" size="icon" className="h-8 w-8" onClick={() => onPageChange(page - 1)} disabled={page <= 1}>
              <ChevronLeft className="w-4 h-4" />
            </Button>
            {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
              let pageNum: number;
              if (totalPages <= 5) {
                pageNum = i + 1;
              } else if (page <= 3) {
                pageNum = i + 1;
              } else if (page >= totalPages - 2) {
                pageNum = totalPages - 4 + i;
              } else {
                pageNum = page - 2 + i;
              }
              return (
                <Button
                  key={pageNum}
                  variant={page === pageNum ? 'gold' : 'outline'}
                  size="icon"
                  className="h-8 w-8"
                  onClick={() => onPageChange(pageNum)}
                >
                  {pageNum}
                </Button>
              );
            })}
            <Button variant="outline" size="icon" className="h-8 w-8" onClick={() => onPageChange(page + 1)} disabled={page >= totalPages}>
              <ChevronRight className="w-4 h-4" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
