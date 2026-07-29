'use client';

import { useState, useEffect, useCallback } from 'react';
import { Input, Textarea } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Plus, Trash2, GripVertical, AlertCircle, ChevronDown, ChevronRight } from 'lucide-react';

type SectionsEditorProps = {
  value: string;
  onChange: (value: string) => void;
};

function isObject(v: unknown): v is Record<string, unknown> {
  return typeof v === 'object' && v !== null && !Array.isArray(v);
}

function isStringArray(v: unknown): v is string[] {
  return Array.isArray(v) && v.every((x) => typeof x === 'string');
}

function isObjectArray(v: unknown): v is Record<string, unknown>[] {
  return Array.isArray(v) && v.length > 0 && v.every((x) => isObject(x));
}

function labelFromKey(key: string): string {
  return key
    .replace(/([A-Z])/g, ' $1')
    .replace(/^./, (c) => c.toUpperCase())
    .replace(/ id$/i, ' ID')
    .replace(/\s+/g, ' ')
    .trim();
}

function NestedField({ path, value, onChange, depth }: {
  path: string[];
  value: unknown;
  onChange: (path: string[], v: unknown) => void;
  depth: number;
}) {
  const key = path[path.length - 1];
  const label = labelFromKey(key);

  if (typeof value === 'string') {
    const isLong = value.length > 80 || value.includes('\n');
    const Cmp = isLong ? Textarea : Input;
    return (
      <Cmp
        label={label}
        value={value}
        onChange={(e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => onChange(path, e.target.value)}
        rows={isLong ? 3 : undefined}
      />
    );
  }

  if (isStringArray(value)) {
    return (
      <div className="space-y-2">
        <p className="text-sm font-medium text-navy-900 dark:text-white">{label}</p>
        {value.map((item, i) => (
          <div key={i} className="flex items-center gap-2">
            <Input
              value={item}
              onChange={(e) => {
                const next = [...value];
                next[i] = e.target.value;
                onChange(path, next);
              }}
              className="flex-1"
            />
            <Button type="button" variant="ghost" size="icon" onClick={() => onChange(path, value.filter((_, j) => j !== i))} className="text-red-600 h-9 w-9 shrink-0">
              <Trash2 className="w-4 h-4" />
            </Button>
          </div>
        ))}
        <Button type="button" variant="outline" size="sm" onClick={() => onChange(path, [...value, ''])}>
          <Plus className="w-4 h-4 mr-1" /> Add {label.slice(0, -1) || 'item'}
        </Button>
      </div>
    );
  }

  if (isObjectArray(value)) {
    const keys = [...new Set(value.flatMap(Object.keys))];
    return (
      <div className="space-y-3">
        <p className="text-sm font-medium text-navy-900 dark:text-white">{label}</p>
        {value.map((obj, i) => (
          <div key={i} className="border border-slate-200 dark:border-navy-700 rounded-lg p-4 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-slate-500">Item {i + 1}</span>
              <Button type="button" variant="ghost" size="icon" onClick={() => onChange(path, value.filter((_, j) => j !== i))} className="text-red-600 h-7 w-7">
                <Trash2 className="w-3.5 h-3.5" />
              </Button>
            </div>
            {keys.map((k) => (
              <NestedField
                key={k}
                path={[...path, String(i), k]}
                value={obj[k] ?? ''}
                onChange={onChange}
                depth={depth + 1}
              />
            ))}
          </div>
        ))}
        <Button type="button" variant="outline" size="sm" onClick={() => {
          const newObj: Record<string, string> = {};
          keys.forEach((k) => { newObj[k] = ''; });
          onChange(path, [...value, newObj]);
        }}>
          <Plus className="w-4 h-4 mr-1" /> Add item
        </Button>
      </div>
    );
  }

  if (isObject(value)) {
    const keys = Object.keys(value);
    if (depth > 3) {
      return <p className="text-xs text-slate-400 italic">{label}: (nested object)</p>;
    }
    return (
      <div className="space-y-3">
        <p className="text-sm font-medium text-navy-900 dark:text-white">{label}</p>
        <div className="border-l-2 border-slate-200 dark:border-navy-700 pl-4 space-y-3">
          {keys.map((k) => (
            <NestedField key={k} path={[...path, k]} value={(value as Record<string, unknown>)[k]} onChange={onChange} depth={depth + 1} />
          ))}
        </div>
      </div>
    );
  }

  return null;
}

export default function SectionsEditor({ value, onChange }: SectionsEditorProps) {
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<Record<string, unknown> | null>(null);

  useEffect(() => {
    if (!value || value === '{}') {
      setData({});
      setError(null);
      return;
    }
    try {
      const parsed = JSON.parse(value);
      if (isObject(parsed)) {
        setData(parsed);
        setError(null);
      } else {
        setData(null);
        setError('Sections must be a JSON object');
      }
    } catch {
      setData(null);
      setError('Invalid JSON');
    }
  }, [value]);

  const handleChange = useCallback((path: string[], v: unknown) => {
    setData((prev) => {
      if (!prev) return prev;
      const next = structuredClone(prev);
      function setAt(obj: unknown, idx: number): unknown {
        if (idx === path.length - 1) {
          const key = path[idx];
          const arrIdx = /^\d+$/.test(key) ? parseInt(key, 10) : -1;
          if (Array.isArray(obj) && arrIdx >= 0) { (obj as unknown[])[arrIdx] = v; }
          else { (obj as Record<string, unknown>)[key] = v; }
          return obj;
        }
        const key = path[idx];
        const arrIdx = /^\d+$/.test(key) ? parseInt(key, 10) : -1;
        const child = Array.isArray(obj) && arrIdx >= 0 ? (obj as unknown[])[arrIdx] : (obj as Record<string, unknown>)[key];
        setAt(child, idx + 1);
        return obj;
      }
      setAt(next, 0);
      onChange(JSON.stringify(next, null, 2));
      return next;
    });
  }, [onChange]);

  if (error) {
    return (
      <div className="space-y-2">
        <div className="flex items-center gap-2 text-sm text-red-600 dark:text-red-400">
          <AlertCircle className="w-4 h-4" />
          {error}
        </div>
        <Textarea
          label="Sections (JSON)"
          rows={8}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="font-mono text-xs"
        />
      </div>
    );
  }

  if (!data || Object.keys(data).length === 0) {
    return (
      <div className="rounded-lg border border-dashed border-slate-300 dark:border-navy-600 p-6 text-center">
        <p className="text-sm text-slate-500 dark:text-slate-400">No sections data yet. Save the page with content to generate editable fields.</p>
      </div>
    );
  }

  const keys = Object.keys(data);

  return (
    <div className="space-y-4">
      {keys.map((key) => (
        <NestedField
          key={key}
          path={[key]}
          value={data[key]}
          onChange={handleChange}
          depth={0}
        />
      ))}
    </div>
  );
}
