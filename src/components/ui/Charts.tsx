'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend } from 'recharts';

const STATUS_COLORS: Record<string, string> = {
  SUBMITTED: '#3b82f6',
  UNDER_REVIEW: '#f59e0b',
  UNDER_REVISION: '#f97316',
  ACCEPTED: '#22c55e',
  REJECTED: '#ef4444',
  PUBLISHED: '#a855f7',
  WITHDRAWN: '#6b7280',
};

interface StatusChartProps {
  statusCounts: Record<string, number>;
}

export function ManuscriptStatusPieChart({ statusCounts }: StatusChartProps) {
  const data = Object.entries(statusCounts).map(([status, count]) => ({
    name: status.replace(/_/g, ' '),
    value: count,
    color: STATUS_COLORS[status] || '#6b7280',
  }));

  if (data.length === 0) {
    return (
      <div className="flex items-center justify-center h-64 text-sm text-slate-500 dark:text-slate-400">
        No data available
      </div>
    );
  }

  return (
    <ResponsiveContainer width="100%" height={280}>
      <PieChart>
        <Pie
          data={data}
          cx="50%"
          cy="50%"
          innerRadius={60}
          outerRadius={100}
          paddingAngle={3}
          dataKey="value"
          nameKey="name"
        >
          {data.map((entry, i) => (
            <Cell key={i} fill={entry.color} />
          ))}
        </Pie>
        <Tooltip
          contentStyle={{ borderRadius: '8px', border: '1px solid #e2e8f0', fontSize: '13px' }}
          formatter={(value: unknown, name: unknown) => [`${value} manuscripts`, String(name)]}
        />
        <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: '12px' }} />
      </PieChart>
    </ResponsiveContainer>
  );
}

interface SubmissionTrendProps {
  data: { month: string; count: number }[];
}

export function SubmissionTrendChart({ data }: SubmissionTrendProps) {
  if (data.length === 0) {
    return (
      <div className="flex items-center justify-center h-64 text-sm text-slate-500 dark:text-slate-400">
        No data available
      </div>
    );
  }

  return (
    <ResponsiveContainer width="100%" height={280}>
      <BarChart data={data}>
        <XAxis dataKey="month" tick={{ fontSize: 12 }} tickLine={false} axisLine={false} />
        <YAxis tick={{ fontSize: 12 }} tickLine={false} axisLine={false} allowDecimals={false} />
        <Tooltip
          contentStyle={{ borderRadius: '8px', border: '1px solid #e2e8f0', fontSize: '13px' }}
          formatter={(value: unknown) => [`${value}`, 'Submissions']}
        />
        <Bar dataKey="count" fill="#fbbf24" radius={[4, 4, 0, 0]} name="Submissions" />
      </BarChart>
    </ResponsiveContainer>
  );
}

interface ArticleTypeChartProps {
  data: { type: string; count: number }[];
}

const TYPE_COLORS = ['#102a43', '#1e3a5f', '#334e68', '#486581', '#627d98', '#829ab1', '#9fb3c8', '#bcccdc', '#d9e2ec', '#fbbf24'];

export function ArticleTypeBarChart({ data }: ArticleTypeChartProps) {
  if (data.length === 0) {
    return (
      <div className="flex items-center justify-center h-64 text-sm text-slate-500 dark:text-slate-400">
        No data available
      </div>
    );
  }

  return (
    <ResponsiveContainer width="100%" height={280}>
      <BarChart data={data} layout="vertical">
        <XAxis type="number" tick={{ fontSize: 12 }} tickLine={false} axisLine={false} allowDecimals={false} />
        <YAxis type="category" dataKey="type" tick={{ fontSize: 11 }} tickLine={false} axisLine={false} width={120} />
        <Tooltip
          contentStyle={{ borderRadius: '8px', border: '1px solid #e2e8f0', fontSize: '13px' }}
          formatter={(value: unknown) => [`${value}`, 'Articles']}
        />
        <Bar dataKey="count" radius={[0, 4, 4, 0]} name="Articles">
          {data.map((_, i) => (
            <Cell key={i} fill={TYPE_COLORS[i % TYPE_COLORS.length]} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}
