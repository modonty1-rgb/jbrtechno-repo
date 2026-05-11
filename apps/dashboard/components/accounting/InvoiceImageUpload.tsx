'use client';

import { useState, useRef } from 'react';
import { X, Receipt, Loader2, CheckCircle2, AlertCircle } from 'lucide-react';
import { Button } from '@jbrtechno/ui';
import { validateImage } from '@/lib/validations/application';
import Image from 'next/image';

interface InvoiceImageUploadProps {
  onUploadSuccess: (url: string, publicId: string) => void;
  onUploadError: (error: string) => void;
  disabled?: boolean;
  currentImageUrl?: string | null;
}

export function InvoiceImageUpload({ 
  onUploadSuccess, 
  onUploadError, 
  disabled,
  currentImageUrl 
}: InvoiceImageUploadProps) {
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [imageUrl, setImageUrl] = useState<string | null>(currentImageUrl || null);
  const [uploadStatus, setUploadStatus] = useState<'idle' | 'uploading' | 'success' | 'error'>('idle');
  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFile = async (file: File) => {
    const validation = validateImage(file);
    if (!validation.valid) {
      setUploadStatus('error');
      onUploadError(validation.error || 'Invalid image');
      return;
    }

    setUploading(true);
    setUploadStatus('uploading');
    setUploadProgress(0);

    const reader = new FileReader();
    reader.onloadend = () => {
      setImageUrl(reader.result as string);
    };
    reader.readAsDataURL(file);

    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('type', 'image');

      const progressInterval = setInterval(() => {
        setUploadProgress((prev) => {
          if (prev >= 90) return prev;
          return prev + 10;
        });
      }, 300);

      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      clearInterval(progressInterval);
      setUploadProgress(100);

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Upload failed');
      }

      setUploadStatus('success');
      setImageUrl(data.url);
      onUploadSuccess(data.url, data.publicId);
    } catch (error) {
      console.error('Upload error:', error);
      setUploadStatus('error');
      onUploadError(error instanceof Error ? error.message : 'Upload failed');
      setImageUrl(null);
    } finally {
      setUploading(false);
    }
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    e.preventDefault();
    if (e.target.files && e.target.files[0]) {
      handleFile(e.target.files[0]);
    }
  };

  const handleRemove = () => {
    setImageUrl(null);
    setUploadProgress(0);
    setUploadStatus('idle');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
    onUploadSuccess('', '');
  };

  return (
    <div className="space-y-2">
      {imageUrl ? (
        <div className="relative">
          <div className="relative w-full h-32 rounded-lg border border-border overflow-hidden bg-muted">
            <Image
              src={imageUrl}
              alt="Invoice"
              fill
              className="object-contain"
            />
          </div>
          <Button
            type="button"
            variant="destructive"
            size="sm"
            className="absolute top-1 right-1 h-6 w-6 p-0"
            onClick={handleRemove}
            disabled={disabled || uploading}
          >
            <X className="h-3 w-3" />
          </Button>
        </div>
      ) : (
        <div
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
          className={`relative w-full rounded-lg border-2 border-dashed transition-colors ${
            dragActive
              ? 'border-primary bg-primary/5'
              : 'border-border bg-muted/50 hover:bg-muted'
          } ${disabled || uploading ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp,image/jpg"
            onChange={handleChange}
            disabled={disabled || uploading}
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer disabled:cursor-not-allowed"
          />
          <div className="flex flex-col items-center justify-center p-4 text-center min-h-[80px]">
            {uploadStatus === 'uploading' ? (
              <>
                <Loader2 className="h-6 w-6 text-primary animate-spin mb-2" />
                <p className="text-xs font-medium mb-1">Uploading...</p>
                <div className="w-full bg-secondary rounded-full h-1.5 max-w-[200px]">
                  <div
                    className="bg-primary h-1.5 rounded-full transition-all duration-300"
                    style={{ width: `${uploadProgress}%` }}
                  />
                </div>
              </>
            ) : uploadStatus === 'success' ? (
              <>
                <CheckCircle2 className="h-6 w-6 text-emerald-500 mb-2" />
                <p className="text-xs font-medium text-emerald-600 dark:text-emerald-400">
                  Upload successful!
                </p>
              </>
            ) : uploadStatus === 'error' ? (
              <>
                <AlertCircle className="h-6 w-6 text-destructive mb-2" />
                <p className="text-xs font-medium text-destructive">
                  Upload failed. Please try again.
                </p>
              </>
            ) : (
              <>
                <Receipt className="h-6 w-6 text-muted-foreground mb-1" />
                <p className="text-xs font-medium mb-0.5">
                  Click to upload invoice image
                </p>
                <p className="text-[10px] text-muted-foreground">
                  JPG, PNG, WebP (max 2MB)
                </p>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
















