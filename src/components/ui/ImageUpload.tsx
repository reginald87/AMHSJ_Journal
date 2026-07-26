'use client';

import { useState, useCallback, useRef } from 'react';
import { cn } from '@/lib/utils';
import { Upload, X, Image, Loader2, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/Button';

interface ImageUploadProps {
  value?: string;
  onChange: (url: string) => void;
  label?: string;
  accept?: string;
  maxSizeMB?: number;
  className?: string;
}

export function ImageUpload({ value, onChange, label = 'Image', accept = 'image/*', maxSizeMB = 10, className }: ImageUploadProps) {
  const [preview, setPreview] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = useCallback(async (file: File) => {
    if (!file.type.startsWith('image/')) {
      setError('Please select an image file');
      return;
    }

    if (file.size > maxSizeMB * 1024 * 1024) {
      setError(`File size must be less than ${maxSizeMB}MB`);
      return;
    }

    setError(null);
    setUploading(true);

    try {
      // Create preview
      const reader = new FileReader();
      reader.onload = (e) => {
        setPreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);

      // In a real app, you would upload to your server/cloud storage here
      // For now, we'll just use the preview as the value
      await new Promise(resolve => setTimeout(resolve, 500));
      onChange(preview || URL.createObjectURL(file));
    } catch (err) {
      setError('Failed to upload image');
      console.error('Image upload error:', err);
    } finally {
      setUploading(false);
    }
  }, [maxSizeMB, onChange]);

  const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleFileSelect(file);
    }
  }, [handleFileSelect]);

  const removeImage = useCallback(() => {
    setPreview(null);
    onChange('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  }, [onChange]);

  return (
    <div className={cn('space-y-3', className)}>
      <label className="block text-sm font-medium text-navy-900 dark:text-white">
        {label}
      </label>
      
      {error && (
        <div className="text-sm text-red-600 dark:text-red-400" role="alert">
          {error}
        </div>
      )}

      <div className="relative">
        <input
          ref={fileInputRef}
          type="file"
          accept={accept}
          onChange={handleChange}
          className="sr-only"
          id="image-upload"
          disabled={uploading}
        />

        {(preview || value) && (
          <div className="relative group mb-3">
            <div className="relative aspect-video rounded-lg overflow-hidden bg-slate-100 dark:bg-navy-800">
              <img
                src={preview || value}
                alt="Preview"
                className="w-full h-full object-cover"
              />
              {uploading && (
                <div className="absolute inset-0 flex items-center justify-center bg-black/50">
                  <Loader2 className="w-8 h-8 text-white animate-spin" />
                </div>
              )}
            </div>
            <button
              type="button"
              onClick={removeImage}
              className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 hover:bg-red-600 transition-opacity"
              aria-label="Remove image"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        )}

        <label
          htmlFor="image-upload"
          className={cn(
            'flex flex-col items-center justify-center p-8 border-2 border-dashed rounded-lg cursor-pointer transition-colors',
            'border-slate-300 dark:border-navy-700',
            'hover:border-gold-400 dark:hover:border-gold-400',
            'bg-slate-50 dark:bg-navy-800/50',
            uploading && 'opacity-50 pointer-events-none'
          )}
        >
          <input
            type="file"
            ref={fileInputRef}
            accept={accept}
            onChange={handleChange}
            className="sr-only"
            id="image-upload"
            disabled={uploading}
          />
          <Upload className="w-10 h-10 text-slate-400 dark:text-slate-500 mb-3" />
          <p className="text-sm font-medium text-slate-600 dark:text-slate-400">
            {label ? `Upload ${label}` : 'Upload Image'}
          </p>
          <p className="text-xs text-slate-500 dark:text-slate-500 mt-1">
            Max {maxSizeMB}MB · {accept}
          </p>
        </label>
      </div>

    </div>
  );
}