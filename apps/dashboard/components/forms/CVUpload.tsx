'use client';

import { useState, useRef } from 'react';
import { Upload, X, Loader2, CheckCircle2, AlertCircle } from 'lucide-react';
import { Button } from '@jbrtechno/ui';
import { validateFile } from '@/lib/validations/application';

interface CVUploadProps {
  onUploadSuccess: (url: string, publicId: string) => void;
  onUploadError: (error: string) => void;
  disabled?: boolean;
}

export function CVUpload({ onUploadSuccess, onUploadError, disabled }: CVUploadProps) {
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [fileName, setFileName] = useState<string | null>(null);
  const [fileSize, setFileSize] = useState<string | null>(null);
  const [uploadStatus, setUploadStatus] = useState<'idle' | 'uploading' | 'success' | 'error'>('idle');
  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
  };

  const handleFile = async (file: File) => {
    // Validate file
    const validation = validateFile(file);
    if (!validation.valid) {
      setUploadStatus('error');
      onUploadError(validation.error || 'Invalid file');
      return;
    }

    setUploading(true);
    setUploadStatus('uploading');
    setFileName(file.name);
    setFileSize(formatFileSize(file.size));
    setUploadProgress(0);

    try {
      const formData = new FormData();
      formData.append('file', file);

      // Simulate progress (since fetch doesn't support real progress tracking)
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
      onUploadSuccess(data.url, data.publicId);
    } catch (error) {
      console.error('Upload error:', error);
      setUploadStatus('error');
      onUploadError(error instanceof Error ? error.message : 'Upload failed');
      setFileName(null);
      setFileSize(null);
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
    setFileName(null);
    setFileSize(null);
    setUploadProgress(0);
    setUploadStatus('idle');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className="space-y-2">
      <input
        ref={fileInputRef}
        type="file"
        accept=".pdf,.doc,.docx"
        onChange={handleChange}
        className="hidden"
        disabled={disabled || uploading}
      />

      {uploadStatus === 'idle' ? (
        <div
          className={`
            relative border-2 border-dashed rounded-lg p-8 text-center transition-all duration-300
            ${dragActive ? 'border-primary bg-primary/10 scale-[1.02]' : 'border-border'}
            ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer hover:border-primary hover:bg-primary/5'}
          `}
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
          onClick={() => !disabled && fileInputRef.current?.click()}
        >
          <div className="flex flex-col items-center gap-3">
            <div className="relative">
              <Upload className="h-12 w-12 text-muted-foreground transition-transform hover:scale-110" />
              {dragActive && (
                <div className="absolute inset-0 animate-ping">
                  <Upload className="h-12 w-12 text-primary opacity-75" />
                </div>
              )}
            </div>
            <div>
              <p className="text-sm font-medium">
                {dragActive ? 'Drop file here' : 'Click to upload or drag and drop'}
              </p>
              <p className="text-xs text-muted-foreground mt-1">PDF or DOCX (max 5MB)</p>
            </div>
          </div>
        </div>
      ) : uploadStatus === 'uploading' ? (
        <div className="p-6 border rounded-lg bg-gradient-to-br from-primary/5 to-transparent">
          <div className="flex items-start gap-4">
            <div className="relative">
              <Loader2 className="h-10 w-10 text-primary animate-spin" />
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-xs font-bold text-primary">{uploadProgress}%</span>
              </div>
            </div>
            <div className="flex-1 min-w-0 space-y-2">
              <div>
                <p className="text-sm font-medium truncate">{fileName}</p>
                <p className="text-xs text-muted-foreground">{fileSize}</p>
              </div>
              <div className="space-y-1">
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>Uploading to cloud storage...</span>
                  <span>{uploadProgress}%</span>
                </div>
                <div className="w-full bg-muted rounded-full h-2 overflow-hidden">
                  <div
                    className="bg-primary h-full transition-all duration-300 ease-out rounded-full"
                    style={{ width: `${uploadProgress}%` }}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : uploadStatus === 'success' ? (
        <div className="p-4 border-2 border-green-500/20 rounded-lg bg-gradient-to-br from-green-500/10 to-transparent">
          <div className="flex items-center gap-3">
            <div className="relative">
              <CheckCircle2 className="h-10 w-10 text-green-600 dark:text-green-400" />
              <div className="absolute inset-0 animate-ping opacity-75">
                <CheckCircle2 className="h-10 w-10 text-green-600 dark:text-green-400" />
              </div>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-green-700 dark:text-green-400">Upload Successful!</p>
              <p className="text-xs font-medium truncate mt-0.5">{fileName}</p>
              <p className="text-xs text-muted-foreground">{fileSize}</p>
            </div>
            {!disabled && (
              <Button
                type="button"
                variant="ghost"
                size="icon"
                onClick={handleRemove}
                className="flex-shrink-0 hover:bg-destructive/10"
              >
                <X className="h-4 w-4" />
              </Button>
            )}
          </div>
        </div>
      ) : (
        <div className="p-4 border-2 border-destructive/20 rounded-lg bg-gradient-to-br from-destructive/10 to-transparent">
          <div className="flex items-center gap-3">
            <AlertCircle className="h-10 w-10 text-destructive flex-shrink-0" />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-destructive">Upload Failed</p>
              <p className="text-xs text-muted-foreground mt-0.5">Please try again</p>
            </div>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleRemove}
              className="flex-shrink-0"
            >
              Try Again
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
















