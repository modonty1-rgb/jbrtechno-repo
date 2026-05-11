'use client';

import { useState } from 'react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@jbrtechno/ui';
import { Button } from '@jbrtechno/ui';
import { Input } from '@jbrtechno/ui';
import { Label } from '@jbrtechno/ui';
import { Loader2, Copy, CheckCircle2 } from 'lucide-react';
import { updateStaffPassword } from '@/actions/staff';

interface PasswordResetDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  staffId: string;
  locale: string;
  onSuccess?: (password: string) => void;
}

export function PasswordResetDialog({
  open,
  onOpenChange,
  staffId,
  locale,
  onSuccess,
}: PasswordResetDialogProps) {
  const isArabic = true;
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [password, setPassword] = useState('');
  const [generatedPassword, setGeneratedPassword] = useState<string | null>(
    null
  );
  const [copied, setCopied] = useState(false);

  const handleReset = async () => {
    setError('');
    setIsSubmitting(true);

    try {
      const result = await updateStaffPassword(
        staffId,
        password || undefined
      );

      if (result.success && result.password) {
        setGeneratedPassword(result.password);
        setPassword('');
        onSuccess?.(result.password);
      } else {
        setError(result.error || (isArabic ? 'فشل في إعادة تعيين كلمة المرور' : 'Failed to reset password'));
      }
    } catch (err: unknown) {
      const errorMessage =
        err instanceof Error
          ? err.message
          : isArabic
            ? 'حدث خطأ أثناء إعادة تعيين كلمة المرور'
            : 'An error occurred while resetting password';
      setError(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCopy = async () => {
    if (generatedPassword) {
      await navigator.clipboard.writeText(generatedPassword);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleClose = () => {
    if (!isSubmitting) {
      setError('');
      setPassword('');
      setGeneratedPassword(null);
      setCopied(false);
      onOpenChange(false);
    }
  };

  if (generatedPassword) {
    return (
      <AlertDialog open={open} onOpenChange={handleClose}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {isArabic ? 'تم إعادة تعيين كلمة المرور' : 'Password Reset Successful'}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {isArabic
                ? 'تم إنشاء كلمة مرور جديدة. يرجى نسخها وحفظها في مكان آمن.'
                : 'A new password has been generated. Please copy it and save it in a secure place.'}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>{isArabic ? 'كلمة المرور الجديدة' : 'New Password'}</Label>
              <div className="flex gap-2">
                <Input
                  type="text"
                  value={generatedPassword}
                  readOnly
                  className="font-mono"
                />
                <Button
                  variant="outline"
                  size="icon"
                  onClick={handleCopy}
                  title={isArabic ? 'نسخ' : 'Copy'}
                >
                  {copied ? (
                    <CheckCircle2 className="h-4 w-4 text-green-600" />
                  ) : (
                    <Copy className="h-4 w-4" />
                  )}
                </Button>
              </div>
            </div>
          </div>
          <AlertDialogFooter>
            <AlertDialogAction onClick={handleClose}>
              {isArabic ? 'تم' : 'Done'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    );
  }

  return (
    <AlertDialog open={open} onOpenChange={handleClose}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>
            {isArabic ? 'إعادة تعيين كلمة المرور' : 'Reset Password'}
          </AlertDialogTitle>
          <AlertDialogDescription>
            {isArabic
              ? 'اترك الحقل فارغاً لإنشاء كلمة مرور تلقائياً، أو أدخل كلمة مرور مخصصة.'
              : 'Leave empty to auto-generate a password, or enter a custom password.'}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="password">
              {isArabic ? 'كلمة المرور' : 'Password'}
            </Label>
            <Input
              id="password"
              type="text"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder={
                isArabic
                  ? 'اتركه فارغاً للإنشاء التلقائي'
                  : 'Leave empty for auto-generation'
              }
              disabled={isSubmitting}
            />
            <p className="text-xs text-muted-foreground">
              {isArabic
                ? 'يجب أن تحتوي على 6 أحرف على الأقل'
                : 'Must be at least 6 characters'}
            </p>
          </div>

          {error && (
            <div className="rounded-md bg-destructive/15 p-3 text-sm text-destructive">
              {error}
            </div>
          )}
        </div>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isSubmitting}>
            {isArabic ? 'إلغاء' : 'Cancel'}
          </AlertDialogCancel>
          <AlertDialogAction
            onClick={handleReset}
            disabled={
              isSubmitting ||
              (password.length > 0 && password.length < 6)
            }
          >
            {isSubmitting ? (
              <>
                <Loader2 className={`h-4 w-4 animate-spin ${isArabic ? 'ml-2' : 'mr-2'}`} />
                {isArabic ? 'جاري المعالجة...' : 'Processing...'}
              </>
            ) : (
              isArabic ? 'إعادة التعيين' : 'Reset Password'
            )}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}









