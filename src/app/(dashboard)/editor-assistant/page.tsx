'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { FileText, BookOpen, CheckCircle, Clock, ArrowRight } from 'lucide-react';

interface Stats {
  accepted: number;
  published: number;
  pendingFormatting: number;
}

export default function EditorAssistantDashboard() {
  const [stats, setStats] = useState<Stats>({ accepted: 0, published: 0, pendingFormatting: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await fetch('/api/editor-assistant/manuscripts');
        if (res.ok) {
          const data = await res.json();
          const manuscripts = data.manuscripts || [];
          setStats({
            accepted: manuscripts.filter((m: { status: string }) => m.status === 'ACCEPTED').length,
            published: manuscripts.filter((m: { status: string }) => m.status === 'PUBLISHED').length,
            pendingFormatting: manuscripts.filter((m: { status: string }) => m.status === 'ACCEPTED').length,
          });
        }
      } catch {}
      finally { setLoading(false); }
    };
    fetchStats();
  }, []);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold text-navy-900 dark:text-white">Editor Assistant Dashboard</h1>
        <p className="text-slate-600 dark:text-slate-400 mt-1">Upload formatted manuscripts and publish accepted articles</p>
      </div>

      <div className="grid sm:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-gold-100 dark:bg-gold-900/30 rounded-lg flex items-center justify-center">
                <Clock className="w-6 h-6 text-gold-600 dark:text-gold-400" />
              </div>
              <div>
                <p className="text-2xl font-bold text-navy-900 dark:text-white">{loading ? '—' : stats.accepted}</p>
                <p className="text-sm text-slate-500 dark:text-slate-400">Ready to Format</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-green-100 dark:bg-green-900/30 rounded-lg flex items-center justify-center">
                <CheckCircle className="w-6 h-6 text-green-600 dark:text-green-400" />
              </div>
              <div>
                <p className="text-2xl font-bold text-navy-900 dark:text-white">{loading ? '—' : stats.published}</p>
                <p className="text-sm text-slate-500 dark:text-slate-400">Published</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center">
                <BookOpen className="w-6 h-6 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <p className="text-2xl font-bold text-navy-900 dark:text-white">{loading ? '—' : stats.pendingFormatting}</p>
                <p className="text-sm text-slate-500 dark:text-slate-400">Pending Formatting</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid sm:grid-cols-2 gap-4">
        <Link href="/admin/manuscripts">
          <Card className="hover:shadow-md transition-shadow cursor-pointer">
            <CardContent className="p-6 flex items-center gap-4">
              <FileText className="w-8 h-8 text-gold-500" />
              <div className="flex-1">
                <h3 className="font-semibold text-navy-900 dark:text-white">Manage Manuscripts</h3>
                <p className="text-sm text-slate-500 dark:text-slate-400">Browse and manage all manuscripts in the editorial workflow</p>
              </div>
              <ArrowRight className="w-5 h-5 text-slate-400" />
            </CardContent>
          </Card>
        </Link>
        <Link href="/editor-assistant/publish">
          <Card className="hover:shadow-md transition-shadow cursor-pointer">
            <CardContent className="p-6 flex items-center gap-4">
              <BookOpen className="w-8 h-8 text-gold-500" />
              <div className="flex-1">
                <h3 className="font-semibold text-navy-900 dark:text-white">Publish Article</h3>
                <p className="text-sm text-slate-500 dark:text-slate-400">Upload formatted PDF and publish to a volume</p>
              </div>
              <ArrowRight className="w-5 h-5 text-slate-400" />
            </CardContent>
          </Card>
        </Link>
      </div>
    </div>
  );
}
