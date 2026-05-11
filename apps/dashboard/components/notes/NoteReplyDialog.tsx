'use client';

import { useState, useEffect } from 'react';
import { Button } from '@jbrtechno/ui';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@jbrtechno/ui';
import { Textarea } from '@jbrtechno/ui';
import { Label } from '@jbrtechno/ui';
import { MessageSquare, AlertCircle } from 'lucide-react';
import { Alert, AlertDescription } from '@jbrtechno/ui';
import { createNoteReply } from '@/actions/managementNotes';

interface NoteReplyDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  parentNoteId: string;
  locale?: string;
  onSuccess?: () => void;
}

export function NoteReplyDialog({
  open,
  onOpenChange,
  parentNoteId,
  locale = 'en',
  onSuccess,
}: NoteReplyDialogProps) {
  const [content, setContent] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const isRTL = true;

  useEffect(() => {
    if (!open) {
      setContent('');
      setError('');
    }
  }, [open]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!content.trim()) {
      setError(locale === 'ar' ? 'يرجى إدخال محتوى الرد' : 'Please enter reply content');
      return;
    }

    setIsSubmitting(true);

    try {
      const result = await createNoteReply(parentNoteId, content.trim());

      if (!result.success) {
        setError(result.error || (locale === 'ar' ? 'فشل في إرسال الرد' : 'Failed to send reply'));
        return;
      }

      onSuccess?.();
      onOpenChange(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : (locale === 'ar' ? 'حدث خطأ' : 'An error occurred'));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className={`${isRTL ? 'text-right' : ''} max-w-2xl`} dir={isRTL ? 'rtl' : 'ltr'}>
        <DialogHeader className="space-y-3 pb-4 border-b border-primary/20">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-primary/10">
              <MessageSquare className="h-5 w-5 text-primary" />
            </div>
            <div>
              <DialogTitle className="text-xl font-semibold bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
                {locale === 'ar' ? 'إضافة رد' : 'Add Reply'}
              </DialogTitle>
              <DialogDescription className="text-sm text-muted-foreground mt-1">
                {locale === 'ar'
                  ? 'أدخل ردك على هذه الملاحظة'
                  : 'Enter your reply to this note'}
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="space-y-4 px-4 py-6">
            <div className="space-y-2">
              <Label htmlFor="content" className="text-sm font-medium flex items-center gap-2 text-foreground">
                <div className="p-1 rounded bg-primary/10">
                  <MessageSquare className="h-3.5 w-3.5 text-primary" />
                </div>
                {locale === 'ar' ? 'المحتوى' : 'Content'} *
              </Label>
              <Textarea
                id="content"
                value={content}
                onChange={(e) => setContent(e.target.value)}
                required
                placeholder={locale === 'ar' ? 'أدخل محتوى الرد' : 'Enter reply content'}
                rows={6}
                className="resize-none focus:border-primary focus:ring-primary/20 transition-colors"
              />
              <p className={`text-xs flex items-center gap-1 ${content.length > 0 ? 'text-primary/70' : 'text-muted-foreground'
                }`}>
                <span className={content.length > 0 ? 'font-medium' : ''}>
                  {content.length}
                </span>
                <span>{locale === 'ar' ? 'حرف' : 'characters'}</span>
              </p>
            </div>

            {error && (
              <Alert variant="destructive" className="border-destructive/50 bg-destructive/10">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription className="font-medium">{error}</AlertDescription>
              </Alert>
            )}
          </div>

          <DialogFooter className={`${isRTL ? 'flex-row-reverse' : ''} gap-3 pt-4 border-t border-border`}>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isSubmitting}
              className="min-w-[100px] hover:bg-muted"
            >
              {locale === 'ar' ? 'إلغاء' : 'Cancel'}
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting || !content.trim()}
              className="min-w-[100px] bg-primary hover:bg-primary/90 shadow-md hover:shadow-lg transition-all"
            >
              {isSubmitting
                ? locale === 'ar'
                  ? 'جاري الإرسال...'
                  : 'Sending...'
                : locale === 'ar'
                  ? 'إرسال'
                  : 'Send'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}








