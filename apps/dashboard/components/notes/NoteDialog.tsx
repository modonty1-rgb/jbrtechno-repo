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
import { Input } from '@jbrtechno/ui';
import { Label } from '@jbrtechno/ui';
import { Textarea } from '@jbrtechno/ui';
import { Checkbox } from '@jbrtechno/ui';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@jbrtechno/ui';
import { NoteType, TargetAudience } from '@jbrtechno/database';
import { createManagementNote, updateManagementNote } from '@/actions/managementNotes';
import { User, FileText, AlertCircle, CheckCircle2, Gift, Award, MessageSquare, Bell } from 'lucide-react';
import { Alert, AlertDescription } from '@jbrtechno/ui';

interface User {
  id: string;
  name: string | null;
  email: string;
}

interface NoteDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  note?: {
    id: string;
    title: string;
    content: string;
    type: NoteType;
    targetAudience: TargetAudience;
    targetUserId?: string | null;
    department?: string | null;
    isImportant: boolean;
    rewardAmount?: number | null;
    rewardCurrency?: string | null;
    expiresAt?: Date | string | null;
  } | null;
  users: User[];
  locale?: string;
  onSuccess?: () => void;
}

export function NoteDialog({
  open,
  onOpenChange,
  note,
  users,
  locale = 'en',
  onSuccess,
}: NoteDialogProps) {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [type, setType] = useState<NoteType>(NoteType.GENERAL);
  const [targetUserId, setTargetUserId] = useState('');
  const [isImportant, setIsImportant] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const isRTL = true;

  useEffect(() => {
    if (note) {
      setTitle(note.title);
      setContent(note.content);
      setType(note.type);
      setTargetUserId(note.targetUserId || '');
      setIsImportant(note.isImportant);
    } else {
      setTitle('');
      setContent('');
      setType(NoteType.GENERAL);
      setTargetUserId('');
      setIsImportant(false);
    }
    setError('');
  }, [note, open]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsSubmitting(true);

    try {
      if (!targetUserId) {
        setError('يرجى اختيار المستخدم');
        setIsSubmitting(false);
        return;
      }

      const noteData: any = {
        title,
        content,
        type,
        targetAudience: TargetAudience.SPECIFIC_USER,
        targetUserId,
        isImportant,
      };

      if (note) {
        const result = await updateManagementNote(note.id, noteData);
        if (!result.success) {
          setError(result.error || 'Failed to update note');
          return;
        }
      } else {
        const result = await createManagementNote(noteData);
        if (!result.success) {
          setError(result.error || 'Failed to create note');
          return;
        }
      }

      onSuccess?.();
      onOpenChange(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setIsSubmitting(false);
    }
  };


  const getNoteTypeIcon = (noteType: NoteType) => {
    switch (noteType) {
      case NoteType.ANNOUNCEMENT:
        return Bell;
      case NoteType.TASK:
        return CheckCircle2;
      case NoteType.REWARD:
        return Gift;
      case NoteType.GENERAL:
        return MessageSquare;
      default:
        return MessageSquare;
    }
  };

  const TypeIcon = getNoteTypeIcon(type);
  const selectedUser = users.find(u => u.id === targetUserId);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className={isRTL ? 'text-right max-w-2xl' : 'max-w-2xl'} dir={isRTL ? 'rtl' : 'ltr'}>
        <DialogHeader className="space-y-3 pb-4 border-b">
          <DialogTitle className="text-xl font-semibold">
            {note ? 'تعديل الملاحظة' : 'إنشاء ملاحظة جديدة'}
          </DialogTitle>
          <DialogDescription className="text-sm">
            {note ? 'قم بتعديل تفاصيل الملاحظة' : 'أدخل تفاصيل الملاحظة الجديدة'}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="space-y-6 max-h-[60vh] overflow-y-auto px-4 py-6">
            {/* User Selection and Note Type in Same Row */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* User Selection */}
              <div className="space-y-2">
                <Label htmlFor="targetUserId" className="text-sm font-medium flex items-center gap-2">
                  <User className="h-4 w-4 text-muted-foreground" />
                  المستخدم *
                </Label>
                <Select value={targetUserId} onValueChange={setTargetUserId} required>
                  <SelectTrigger id="targetUserId" className="h-11">
                    <SelectValue
                      placeholder="اختر المستخدم"
                    />
                  </SelectTrigger>
                  <SelectContent>
                    {users.map((user) => (
                      <SelectItem key={user.id} value={user.id}>
                        <div className="flex items-center gap-2">
                          <User className="h-4 w-4 text-muted-foreground" />
                          <span>{user.name || user.email}</span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {selectedUser && (
                  <p className="text-xs text-muted-foreground flex items-center gap-1.5">
                    <span className="h-1.5 w-1.5 rounded-full bg-primary"></span>
                    سيتم إرسال الملاحظة إلى: {selectedUser.name || selectedUser.email}
                  </p>
                )}
              </div>

              {/* Note Type */}
              <div className="space-y-2">
                <Label htmlFor="type" className="text-sm font-medium flex items-center gap-2">
                  <TypeIcon className="h-4 w-4 text-muted-foreground" />
                  النوع *
                </Label>
                <Select value={type} onValueChange={(value) => setType(value as NoteType)}>
                  <SelectTrigger id="type" className="h-11">
                    <div className="flex items-center gap-2">
                      <TypeIcon className="h-4 w-4 text-muted-foreground" />
                      <SelectValue />
                    </div>
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value={NoteType.ANNOUNCEMENT}>
                      <div className="flex items-center gap-2">
                        <Bell className="h-4 w-4 text-blue-500" />
                        <span>إعلان</span>
                      </div>
                    </SelectItem>
                    <SelectItem value={NoteType.TASK}>
                      <div className="flex items-center gap-2">
                        <CheckCircle2 className="h-4 w-4 text-green-500" />
                        <span>مهمة</span>
                      </div>
                    </SelectItem>
                    <SelectItem value={NoteType.REWARD}>
                      <div className="flex items-center gap-2">
                        <Award className="h-4 w-4 text-yellow-500" />
                        <span>مكافأة</span>
                      </div>
                    </SelectItem>
                    <SelectItem value={NoteType.GENERAL}>
                      <div className="flex items-center gap-2">
                        <MessageSquare className="h-4 w-4 text-gray-500" />
                        <span>عام</span>
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Title */}
            <div className="space-y-2">
              <Label htmlFor="title" className="text-sm font-medium flex items-center gap-2">
                <FileText className="h-4 w-4 text-muted-foreground" />
                العنوان *
              </Label>
              <Input
                id="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
                placeholder="أدخل عنوان الملاحظة"
                className="h-11"
              />
            </div>

            {/* Urgent Checkbox */}
            <div className={`flex items-center gap-3 p-4 rounded-lg border-2 transition-colors ${isImportant
              ? 'border-red-200 dark:border-red-900 bg-red-50 dark:bg-red-950/20'
              : 'border-border bg-muted/30'
              }`}>
              <Checkbox
                id="isImportant"
                checked={isImportant}
                onCheckedChange={(checked) => setIsImportant(checked === true)}
                className="h-5 w-5"
              />
              <Label
                htmlFor="isImportant"
                className="text-sm font-medium leading-none cursor-pointer flex items-center gap-2 flex-1"
              >
                <AlertCircle className={`h-4 w-4 ${isImportant ? 'text-red-600 dark:text-red-400' : 'text-muted-foreground'}`} />
                <span className={isImportant ? 'text-red-600 dark:text-red-400 font-semibold' : ''}>
                  عاجل
                </span>
                {isImportant && (
                  <span className="text-xs text-muted-foreground ml-2">
                    (سيتم تمييز هذه الملاحظة كعاجلة)
                  </span>
                )}
              </Label>
            </div>

            {/* Content */}
            <div className="space-y-2">
              <Label htmlFor="content" className="text-sm font-medium flex items-center gap-2">
                <MessageSquare className="h-4 w-4 text-muted-foreground" />
                المحتوى *
              </Label>
              <Textarea
                id="content"
                value={content}
                onChange={(e) => setContent(e.target.value)}
                required
                placeholder="أدخل محتوى الملاحظة"
                rows={6}
                className="resize-none"
              />
              <p className="text-xs text-muted-foreground">
                {content.length} حرف
              </p>
            </div>

            {/* Error Alert */}
            {error && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
          </div>

          <DialogFooter className={`${isRTL ? 'flex-row-reverse' : ''} gap-3 pt-4 border-t`}>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isSubmitting}
              className="min-w-[100px]"
            >
              إلغاء
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting || !targetUserId || !title.trim() || !content.trim()}
              className="min-w-[100px]"
            >
              {isSubmitting
                ? 'جاري الحفظ...'
                : note
                  ? 'حفظ التغييرات'
                  : 'إنشاء'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}








