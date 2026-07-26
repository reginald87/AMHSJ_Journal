'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { formatDate, getStatusVariant } from '@/lib/utils';
import { toast } from 'sonner';
import {
  ArrowLeft,
  FileText,
  Users,
  Clock,
  CheckCircle,
  Download,
  Tag,
} from 'lucide-react';

interface Author {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  affiliation?: string;
}

interface ManuscriptFile {
  id: string;
  fileName: string;
  fileUrl: string;
  fileSize: number;
  mimeType: string;
  fileType: string;
}

interface Version {
  id: string;
  versionNumber: number;
  createdAt: string;
  notes?: string;
}

interface Manuscript {
  id: string;
  title: string;
  status: string;
  articleType: string;
  section?: string;
  abstract?: string;
  keywords?: string[];
  authors?: Author[];
  files?: ManuscriptFile[];
  versions?: Version[];
  submittedAt: string;
  updatedAt: string;
  correspondingAuthor?: Author;
}

const STATUS_TIMELINE = [
  'SUBMITTED',
  'UNDER_REVIEW',
  'UNDER_REVISION',
  'ACCEPTED',
  'PUBLISHED',
];

function getStatusIndex(status: string): number {
  const idx = STATUS_TIMELINE.indexOf(status);
  if (idx >= 0) return idx;
  if (status === 'REJECTED') return -1;
  if (status === 'WITHDRAWN') return -1;
  return 0;
}

function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

export default function ManuscriptDetailPage() {
  const params = useParams();
  const id = params.id as string;
  const [manuscript, setManuscript] = useState<Manuscript | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    async function fetchManuscript() {
      try {
        const res = await fetch(`/api/author/manuscripts/${id}`);
        if (!res.ok) throw new Error('Not found');
        const data = await res.json();
        setManuscript(data);
      } catch {
        setError(true);
        toast.error('Failed to load manuscript details');
      } finally {
        setLoading(false);
      }
    }
    fetchManuscript();
  }, [id]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="w-8 h-8 border-4 border-gold-400 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (error || !manuscript) {
    return (
      <div className="text-center py-20">
        <FileText className="w-12 h-12 text-slate-300 dark:text-slate-600 mx-auto mb-3" />
        <p className="font-medium text-navy-900 dark:text-white">Manuscript not found</p>
        <Link href="/dashboard/manuscripts">
          <Button variant="ghost" className="mt-4">
            <ArrowLeft className="w-4 h-4" />
            Back to Manuscripts
          </Button>
        </Link>
      </div>
    );
  }

  const currentIdx = getStatusIndex(manuscript.status);
  const isRejected = manuscript.status === 'REJECTED' || manuscript.status === 'WITHDRAWN';

  return (
    <div className="space-y-6 max-w-4xl">
      <div className="flex items-start justify-between">
        <div className="space-y-1">
          <Link
            href="/dashboard/manuscripts"
            className="inline-flex items-center gap-1 text-sm text-slate-500 hover:text-navy-900 dark:hover:text-white transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Manuscripts
          </Link>
          <h1 className="text-2xl font-bold text-navy-900 dark:text-white">{manuscript.title}</h1>
          <div className="flex items-center gap-3">
            <Badge variant={getStatusVariant(manuscript.status)}>
              {manuscript.status?.replace(/_/g, ' ')}
            </Badge>
            <span className="text-sm text-slate-500">
              Submitted {formatDate(manuscript.submittedAt)}
            </span>
          </div>
        </div>
      </div>

      {/* Status Timeline */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="w-5 h-5 text-gold-600" />
            Review Status Timeline
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isRejected ? (
            <div className="flex items-center gap-3 py-4">
              <div className="w-8 h-8 rounded-full bg-danger-100 dark:bg-danger-900/30 flex items-center justify-center">
                <span className="w-3 h-3 rounded-full bg-danger-500" />
              </div>
              <div>
                <p className="font-medium text-navy-900 dark:text-white">{manuscript.status.replace(/_/g, ' ')}</p>
                <p className="text-sm text-slate-500">This manuscript has been {manuscript.status.toLowerCase()}</p>
              </div>
            </div>
          ) : (
            <div className="relative">
              <div className="flex items-center justify-between">
                {STATUS_TIMELINE.map((step, idx) => {
                  const isPast = idx < currentIdx;
                  const isCurrent = idx === currentIdx;
                  const isFuture = idx > currentIdx;

                  return (
                    <div key={step} className="flex flex-col items-center flex-1">
                      <div className="relative z-10">
                        <div
                          className={`w-10 h-10 rounded-full flex items-center justify-center border-2 transition-colors ${
                            isPast
                              ? 'bg-success-500 border-success-500 text-white'
                              : isCurrent
                              ? 'bg-gold-400 border-gold-400 text-navy-900'
                              : 'bg-white dark:bg-navy-800 border-slate-300 dark:border-navy-600 text-slate-400'
                          }`}
                        >
                          {isPast ? (
                            <CheckCircle className="w-5 h-5" />
                          ) : isCurrent ? (
                            <span className="w-3 h-3 rounded-full bg-navy-900" />
                          ) : (
                            <span className="w-2 h-2 rounded-full bg-slate-300 dark:bg-navy-500" />
                          )}
                        </div>
                      </div>
                      <p
                        className={`mt-2 text-xs font-medium text-center ${
                          isPast
                            ? 'text-success-600 dark:text-success-400'
                            : isCurrent
                            ? 'text-gold-600 dark:text-gold-400'
                            : 'text-slate-400 dark:text-slate-500'
                        }`}
                      >
                        {step.replace(/_/g, ' ')}
                      </p>
                    </div>
                  );
                })}
              </div>
              <div className="absolute top-5 left-[10%] right-[10%] h-0.5 bg-slate-200 dark:bg-navy-700">
                <div
                  className="h-full bg-success-500 transition-all duration-500"
                  style={{ width: `${(currentIdx / (STATUS_TIMELINE.length - 1)) * 100}%` }}
                />
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          {/* Details */}
          <Card>
            <CardHeader>
              <CardTitle>Manuscript Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-medium text-slate-500 dark:text-slate-400">Article Type</p>
                  <p className="text-navy-900 dark:text-white capitalize">
                    {manuscript.articleType?.replace(/_/g, ' ').toLowerCase()}
                  </p>
                </div>
                {manuscript.section && (
                  <div>
                    <p className="text-sm font-medium text-slate-500 dark:text-slate-400">Section</p>
                    <p className="text-navy-900 dark:text-white capitalize">
                      {manuscript.section?.replace(/_/g, ' ').toLowerCase()}
                    </p>
                  </div>
                )}
              </div>

              {manuscript.abstract && (
                <div>
                  <p className="text-sm font-medium text-slate-500 dark:text-slate-400 mb-1">Abstract</p>
                  <p className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed whitespace-pre-wrap">
                    {manuscript.abstract}
                  </p>
                </div>
              )}

              {manuscript.keywords && manuscript.keywords.length > 0 && (
                <div>
                  <p className="text-sm font-medium text-slate-500 dark:text-slate-400 mb-2 flex items-center gap-1">
                    <Tag className="w-4 h-4" />
                    Keywords
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {manuscript.keywords.map((kw, i) => (
                      <Badge key={i} variant="outline" size="sm">
                        {kw}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Authors */}
          {manuscript.authors && manuscript.authors.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="w-5 h-5 text-gold-600" />
                  Authors
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {manuscript.authors.map((author, idx) => (
                    <div
                      key={author.id || idx}
                      className="flex items-center justify-between p-3 rounded-lg bg-slate-50 dark:bg-navy-800"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full bg-navy-900 dark:bg-navy-700 flex items-center justify-center text-gold-400 font-semibold text-sm">
                          {author.firstName?.[0]}{author.lastName?.[0]}
                        </div>
                        <div>
                          <p className="font-medium text-navy-900 dark:text-white text-sm">
                            {author.firstName} {author.lastName}
                            {manuscript.correspondingAuthor?.id === author.id && (
                              <Badge variant="gold" size="sm" className="ml-2">Corresponding</Badge>
                            )}
                          </p>
                          <p className="text-xs text-slate-500">{author.email}</p>
                        </div>
                      </div>
                      {author.affiliation && (
                        <span className="text-xs text-slate-500 hidden sm:block">{author.affiliation}</span>
                      )}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Files */}
          {manuscript.files && manuscript.files.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="w-5 h-5 text-gold-600" />
                  Files
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {manuscript.files.map((file) => (
                    <div
                      key={file.id}
                      className="flex items-center justify-between p-3 rounded-lg bg-slate-50 dark:bg-navy-800"
                    >
                      <div className="flex items-center gap-3">
                        <FileText className="w-5 h-5 text-slate-400" />
                        <div>
                          <p className="text-sm font-medium text-navy-900 dark:text-white">
                            {file.fileName || '(unnamed)'}
                          </p>
                          <p className="text-xs text-slate-500">
                            {file.mimeType} &middot; {formatFileSize(file.fileSize)}
                          </p>
                        </div>
                      </div>
                      {file.fileUrl && (
                        <a href={file.fileUrl} target="_blank" rel="noopener noreferrer">
                          <Button variant="ghost" size="sm">
                            <Download className="w-4 h-4" />
                          </Button>
                        </a>
                      )}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Sidebar: Version History */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Version History</CardTitle>
            </CardHeader>
            <CardContent>
              {manuscript.versions && manuscript.versions.length > 0 ? (
                <div className="space-y-3">
                  {manuscript.versions.map((v) => (
                    <div
                      key={v.id}
                      className="p-3 rounded-lg bg-slate-50 dark:bg-navy-800 border-l-4 border-gold-400"
                    >
                      <div className="flex items-center justify-between">
                        <p className="text-sm font-medium text-navy-900 dark:text-white">
                          Version {v.versionNumber}
                        </p>
                        <p className="text-xs text-slate-500">{formatDate(v.createdAt)}</p>
                      </div>
                      {v.notes && (
                        <p className="text-xs text-slate-500 mt-1">{v.notes}</p>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-6">
                  <p className="text-sm text-slate-500">No version history</p>
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-slate-500">Submitted</span>
                <span className="text-navy-900 dark:text-white font-medium">{formatDate(manuscript.submittedAt)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-slate-500">Last Updated</span>
                <span className="text-navy-900 dark:text-white font-medium">{formatDate(manuscript.updatedAt)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-slate-500">Status</span>
                <Badge variant={getStatusVariant(manuscript.status)}>
                  {manuscript.status?.replace(/_/g, ' ')}
                </Badge>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
