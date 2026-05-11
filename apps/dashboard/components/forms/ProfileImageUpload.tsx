'use client';

import { useState, useRef } from 'react';
import { X, User, Loader2, CheckCircle2, AlertCircle } from 'lucide-react';
import { Button } from '@jbrtechno/ui';
import { validateImage } from '@/lib/validations/application';
import Image from 'next/image';

interface ProfileImageUploadProps {
  onUploadSuccess: (url: string, publicId: string) => void;
  onUploadError: (error: string) => void;
  disabled?: boolean;
}

export function ProfileImageUpload({ onUploadSuccess, onUploadError, disabled }: ProfileImageUploadProps) {
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [uploadStatus, setUploadStatus] = useState<'idle' | 'uploading' | 'success' | 'error'>('idle');
  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFile = async (file: File) => {
    // Validate image
    const validation = validateImage(file);
    if (!validation.valid) {
      setUploadStatus('error');
      onUploadError(validation.error || 'Invalid image');
      return;
    }

    setUploading(true);
    setUploadStatus('uploading');
    setUploadProgress(0);

    // Create preview
    const reader = new FileReader();
    reader.onloadend = () => {
      setImageUrl(reader.result as string);
    };
    reader.readAsDataURL(file);

    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('type', 'image'); // Flag to identify image uploads

      // Simulate progress
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
  };

  return (
    <div className="space-y-2">
      <input
        ref={fileInputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp,image/jpg"
        onChange={handleChange}
        className="hidden"
        disabled={disabled || uploading}
      />

      {uploadStatus === 'idle' ? (
        <div
          className={`
            relative border-2 border-dashed rounded-lg p-6 text-center transition-all duration-300
            ${dragActive ? 'border-primary bg-primary/10 scale-[1.02]' : 'border-border'}
            ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer hover:border-primary hover:bg-primary/5'}
          `}
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
          onClick={() => !disabled && fileInputRef.current?.click()}
        >
          <div className="flex flex-col items-center gap-2">
            <div className="relative">
              <div className="w-20 h-20 rounded-full bg-muted flex items-center justify-center">
                <User className="h-10 w-10 text-muted-foreground" />
              </div>
              {dragActive && (
                <div className="absolute inset-0 animate-ping">
                  <div className="w-20 h-20 rounded-full bg-primary/30" />
                </div>
              )}
            </div>
            <div>
              <p className="text-sm font-medium">
                {dragActive ? 'Drop image here' : 'Click to upload photo'}
              </p>
              <p className="text-xs text-muted-foreground mt-1">JPG, PNG, or WebP (max 2MB)</p>
            </div>
          </div>
        </div>
      ) : uploadStatus === 'uploading' ? (
        <div className="p-6 border rounded-lg bg-gradient-to-br from-primary/5 to-transparent">
          <div className="flex flex-col items-center gap-3">
            {imageUrl && (
              <div className="relative w-24 h-24 rounded-full overflow-hidden border-2 border-primary">
                <Image
                  src={imageUrl}
                  alt="Preview"
                  fill
                  className="object-cover"
                />
                <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                  <Loader2 className="h-8 w-8 text-white animate-spin" />
                </div>
              </div>
            )}
            <div className="w-full space-y-1">
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>Uploading photo...</span>
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
      ) : uploadStatus === 'success' ? (
        <div className="p-4 border-2 border-green-500/20 rounded-lg bg-gradient-to-br from-green-500/10 to-transparent">
          <div className="flex items-center gap-3">
            <div className="relative w-20 h-20 rounded-full overflow-hidden border-2 border-green-500/50">
              {imageUrl && (
                <Image
                  src={imageUrl}
                  alt="Profile"
                  fill
                  className="object-cover"
                />
              )}
              <div className="absolute bottom-0 right-0">
                <CheckCircle2 className="h-6 w-6 text-green-600 dark:text-green-400 bg-white rounded-full" />
              </div>
            </div>
            <div className="flex-1">
              <p className="text-sm font-semibold text-green-700 dark:text-green-400">Photo Uploaded!</p>
              <p className="text-xs text-muted-foreground">Your profile photo looks great</p>
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
            <div className="flex-1">
              <p className="text-sm font-semibold text-destructive">Upload Failed</p>
              <p className="text-xs text-muted-foreground">Please try again</p>
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
















