'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Card, CardContent, CardHeader } from '@jbrtechno/ui';
import { Button } from '@jbrtechno/ui';
import { Badge } from '@jbrtechno/ui';
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
import { NoteType, TargetAudience, UserRole } from '@jbrtechno/database';
import { NoteReplyDialog } from '@/components/notes/NoteReplyDialog';
import { NoteDialog } from '@/components/notes/NoteDialog';
import { UserAvatar } from '@jbrtechno/ui';
import { markNoteAsRead, deleteManagementNote } from '@/actions/managementNotes';
import { formatRelativeTime } from '@/helpers/formatRelativeTime';
import { formatDateTimeWithArabicTime } from '@/helpers/formatDateTime';
import {
  ArrowLeft,
  Reply,
  Calendar,
  MessageSquare,
  CheckCircle2,
  XCircle,
  Gift,
  Award,
  AlertCircle,
  Bell,
  Edit,
  Trash2,
  MoreVertical,
  ChevronRight,
  Sparkles,
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@jbrtechno/ui';

interface Note {
  id: string;
  title: string;
  content: string;
  type: NoteType;
  targetAudience: TargetAudience;
  isImportant: boolean;
  rewardAmount?: number | null;
  rewardCurrency?: string | null;
  expiresAt?: Date | string | null;
  createdAt: Date | string;
  readBy?: string[];
  createdBy?: {
    id: string;
    name: string | null;
    email: string;
    staff?: {
      profileImageUrl: string | null;
    } | null;
  } | null;
  targetUser?: {
    id: string;
    name: string | null;
    email: string;
    staff?: {
      profileImageUrl: string | null;
    } | null;
  } | null;
  replies?: Array<{
    id: string;
    content: string;
    createdAt: Date | string;
    createdBy?: {
      id: string;
      name: string | null;
      email: string;
      staff?: {
        profileImageUrl: string | null;
      } | null;
    } | null;
  }>;
}

interface User {
  id: string;
  name: string | null;
  email: string;
}

interface NoteThreadClientProps {
  note: Note;
  currentUserId: string;
  userRole: UserRole;
  locale: string;
  users: User[];
}

const typeConfig = {
  [NoteType.ANNOUNCEMENT]: {
    label: { en: 'Announcement', ar: 'إعلان' },
    icon: Bell,
    className: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400 border-blue-200 dark:border-blue-800',
  },
  [NoteType.REWARD]: {
    label: { en: 'Reward', ar: 'مكافأة' },
    icon: Award,
    className: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400 border-yellow-200 dark:border-yellow-800',
  },
  [NoteType.TASK]: {
    label: { en: 'Task', ar: 'مهمة' },
    icon: CheckCircle2,
    className: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400 border-green-200 dark:border-green-800',
  },
  [NoteType.GENERAL]: {
    label: { en: 'General', ar: 'عام' },
    icon: MessageSquare,
    className: 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400 border-gray-200 dark:border-gray-800',
  },
};

const audienceConfig = {
  [TargetAudience.ALL]: { label: { en: 'All', ar: 'الكل' } },
  [TargetAudience.STAFF]: { label: { en: 'Staff', ar: 'الموظفين' } },
  [TargetAudience.ADMIN]: { label: { en: 'Admin', ar: 'المديرين' } },
  [TargetAudience.SPECIFIC_DEPARTMENT]: { label: { en: 'Department', ar: 'قسم' } },
  [TargetAudience.SPECIFIC_USER]: { label: { en: 'Specific User', ar: 'مستخدم محدد' } },
};

export function NoteThreadClient({
  note,
  currentUserId,
  userRole,
  locale,
  users,
}: NoteThreadClientProps) {
  const router = useRouter();
  const isRTL = true;
  const [replyingToNoteId, setReplyingToNoteId] = useState<string | null>(null);
  const [editingNote, setEditingNote] = useState<Note | null>(null);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [isMarkingAsRead, setIsMarkingAsRead] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isRead, setIsRead] = useState(note.readBy?.includes(currentUserId) || false);

  const replies = note.replies || [];
  const allMessages = [note, ...replies].sort(
    (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
  );

  const type = typeConfig[note.type];
  const TypeIcon = type.icon;
  const canEdit = userRole === UserRole.SUPER_ADMIN || currentUserId === note.createdBy?.id;
  const canDelete = userRole === UserRole.SUPER_ADMIN;
  const canReply = note.targetAudience === TargetAudience.SPECIFIC_USER &&
    currentUserId &&
    (currentUserId === note.targetUser?.id || currentUserId === note.createdBy?.id);

  const handleMarkAsRead = async () => {
    if (isRead) return;
    setIsMarkingAsRead(true);
    const result = await markNoteAsRead(note.id, currentUserId);
    if (result.success) {
      setIsRead(true);
    }
    setIsMarkingAsRead(false);
  };

  const handleDelete = async () => {
    setIsDeleting(true);
    const result = await deleteManagementNote(note.id);
    if (result.success) {
      router.push('/notes');
    }
    setIsDeleting(false);
    setShowDeleteDialog(false);
  };

  const handleEditSuccess = () => {
    setEditingNote(null);
    router.refresh();
  };

  const handleReplySuccess = () => {
    router.refresh();
  };

  const getMessageAuthor = (message: Note | typeof replies[0]) => {
    if ('createdBy' in message) {
      return message.createdBy;
    }
    return null;
  };

  const isCurrentUser = (authorId?: string | null) => {
    return authorId === currentUserId;
  };

  const formatTimestamp = (date: Date | string) => {
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    const relative = formatRelativeTime(dateObj);
    const absolute = formatDateTimeWithArabicTime(dateObj, {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
    return { relative, absolute };
  };

  return (
    <div className="container mx-auto px-4 py-6 max-w-5xl" dir={isRTL ? 'rtl' : 'ltr'}>
      {/* Breadcrumb and Header */}
      <div className="mb-6">
        <div className={`flex items-center gap-2 text-sm text-muted-foreground mb-4 ${isRTL ? 'flex-row-reverse' : ''}`}>
          <Link href="/notes" className="hover:text-foreground transition-colors">
            الملاحظات
          </Link>
          <ChevronRight className={`h-4 w-4 ${isRTL ? 'rotate-180' : ''}`} />
          <span className="text-foreground font-medium">{note.title}</span>
        </div>

        <div className={`flex items-start justify-between gap-4 ${isRTL ? 'flex-row-reverse' : ''}`}>
          <div className="flex-1">
            <div className={`flex items-center gap-3 mb-3 ${isRTL ? 'flex-row-reverse' : ''}`}>
              <Link href="/notes">
                <Button variant="ghost" size="sm" className="hover:bg-muted">
                  <ArrowLeft className={`h-4 w-4 ${isRTL ? 'ml-2' : 'mr-2'}`} />
                  العودة
                </Button>
              </Link>
              <div className="h-6 w-px bg-border" />
              <h1 className="text-2xl font-bold text-foreground">{note.title}</h1>
            </div>

            <div className={`flex flex-wrap items-center gap-2 ${isRTL ? 'flex-row-reverse' : ''}`}>
              <Badge className={type.className} variant="secondary">
                <TypeIcon className={`h-3 w-3 ${isRTL ? 'ml-1' : 'mr-1'}`} />
                {type.label[locale as 'en' | 'ar']}
              </Badge>
              {note.isImportant && (
                <Badge variant="destructive" className="text-xs">
                  عاجل
                </Badge>
              )}
              <Badge variant="outline" className="text-xs">
                {audienceConfig[note.targetAudience].label[locale as 'en' | 'ar']}
              </Badge>
              {note.rewardAmount && (
                <Badge variant="secondary" className="bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400">
                  {note.rewardAmount.toLocaleString()} {note.rewardCurrency || 'SAR'}
                </Badge>
              )}
              {replies.length > 0 && (
                <Badge variant="outline" className="text-xs">
                  <MessageSquare className={`h-3 w-3 ${isRTL ? 'ml-1' : 'mr-1'}`} />
                  {replies.length} رد
                </Badge>
              )}
            </div>
          </div>

          {/* Quick Actions */}
          <div className={`flex items-center gap-2 ${isRTL ? 'flex-row-reverse' : ''}`}>
            {!isRead && (
              <Button
                size="sm"
                variant="outline"
                onClick={handleMarkAsRead}
                disabled={isMarkingAsRead}
                className="text-xs"
              >
                <CheckCircle2 className={`h-3.5 w-3.5 ${isRTL ? 'ml-1' : 'mr-1'}`} />
                {locale === 'ar' ? 'تم القراءة' : 'Mark as Read'}
              </Button>
            )}
            {(canEdit || canDelete) && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button size="sm" variant="outline">
                    <MoreVertical className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align={isRTL ? 'start' : 'end'}>
                  {canEdit && (
                    <DropdownMenuItem onClick={() => setEditingNote(note)}>
                      <Edit className={`h-4 w-4 ${isRTL ? 'ml-2' : 'mr-2'}`} />
                      {locale === 'ar' ? 'تعديل' : 'Edit'}
                    </DropdownMenuItem>
                  )}
                  {canDelete && (
                    <>
                      {canEdit && <DropdownMenuSeparator />}
                      <DropdownMenuItem
                        onClick={() => setShowDeleteDialog(true)}
                        className="text-destructive focus:text-destructive"
                      >
                        <Trash2 className={`h-4 w-4 ${isRTL ? 'ml-2' : 'mr-2'}`} />
                        {locale === 'ar' ? 'حذف' : 'Delete'}
                      </DropdownMenuItem>
                    </>
                  )}
                </DropdownMenuContent>
              </DropdownMenu>
            )}
          </div>
        </div>
      </div>

      {/* Original Note */}
      <Card className="mb-6 border-2 shadow-md">
        <CardHeader className="pb-4">
          <div className={`flex items-start justify-between gap-4 ${isRTL ? 'flex-row-reverse' : ''}`}>
            <div className="flex-1 space-y-3">
              <div className={`flex items-center gap-3 ${isRTL ? 'flex-row-reverse' : ''}`}>
                <UserAvatar
                  name={note.createdBy?.name}
                  email={note.createdBy?.email}
                  size="md"
                />
                <div className="flex-1 min-w-0">
                  <div className="font-semibold text-foreground">
                    {note.createdBy?.name || note.createdBy?.email || 'Unknown'}
                  </div>
                  {note.targetUser && note.targetUser.id !== note.createdBy?.id && (
                    <div className="text-sm text-muted-foreground">
                      {locale === 'ar' ? 'إلى: ' : 'To: '}
                      {note.targetUser.name || note.targetUser.email}
                    </div>
                  )}
                </div>
              </div>
              <div className={`flex items-center gap-2 text-sm text-muted-foreground ${isRTL ? 'flex-row-reverse' : ''}`}>
                <Calendar className="h-4 w-4" />
                <span>{formatTimestamp(note.createdAt).absolute}</span>
                <span className="text-muted-foreground/60">•</span>
                <span>{formatTimestamp(note.createdAt).relative}</span>
              </div>
            </div>
            {canReply && (
              <Button
                size="sm"
                variant="outline"
                onClick={() => setReplyingToNoteId(note.id)}
              >
                <Reply className={`h-4 w-4 ${isRTL ? 'ml-1' : 'mr-1'}`} />
                {locale === 'ar' ? 'رد' : 'Reply'}
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className={`text-base leading-relaxed whitespace-pre-wrap ${isRTL ? 'text-right' : ''}`}>
            {note.content}
          </div>
          {note.rewardAmount && (
            <div className={`flex items-center gap-2 p-3 bg-yellow-50 dark:bg-yellow-950/20 rounded-lg border border-yellow-200 dark:border-yellow-900 ${isRTL ? 'flex-row-reverse' : ''}`}>
              <Award className="h-5 w-5 text-yellow-600 dark:text-yellow-400" />
              <div>
                <div className="text-sm font-medium text-yellow-900 dark:text-yellow-100">
                  مكافأة
                </div>
                <div className="text-lg font-bold text-yellow-700 dark:text-yellow-300">
                  {note.rewardAmount.toLocaleString()} {note.rewardCurrency || 'SAR'}
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Replies Section */}
      {replies.length > 0 && (
        <div className="space-y-4">
          <div className={`flex items-center gap-2 text-sm font-medium text-muted-foreground ${isRTL ? 'flex-row-reverse' : ''}`}>
            <MessageSquare className="h-4 w-4" />
            <span>
              {locale === 'ar' ? `${replies.length} ${replies.length === 1 ? 'رد' : 'ردود'}` : `${replies.length} ${replies.length === 1 ? 'Reply' : 'Replies'}`}
            </span>
          </div>
          {replies.map((reply) => {
            const author = getMessageAuthor(reply);
            const isAuthor = isCurrentUser(author?.id);
            const timestamp = formatTimestamp(reply.createdAt);

            return (
              <Card
                key={reply.id}
                className={`border-l-4 ${isAuthor ? 'border-l-primary' : 'border-l-muted'} ${isRTL ? 'border-l-0 border-r-4' : ''} ${isRTL && isAuthor ? 'border-r-primary' : ''} ${isRTL && !isAuthor ? 'border-r-muted' : ''}`}
              >
                <CardHeader className="pb-3">
                  <div className={`flex items-start justify-between gap-4 ${isRTL ? 'flex-row-reverse' : ''}`}>
                    <div className="flex-1 space-y-2">
                      <div className={`flex items-center gap-3 ${isRTL ? 'flex-row-reverse' : ''}`}>
                        <UserAvatar
                          name={author?.name}
                          email={author?.email}
                          imageUrl={author?.staff?.profileImageUrl || null}
                          size="sm"
                        />
                        <div className="flex-1 min-w-0">
                          <div className="font-medium text-foreground">
                            {author?.name || author?.email || 'Unknown'}
                            {isAuthor && (
                              <Badge variant="secondary" className="ml-2 text-xs">
                                {locale === 'ar' ? 'أنت' : 'You'}
                              </Badge>
                            )}
                          </div>
                        </div>
                      </div>
                      <div className={`flex items-center gap-2 text-xs text-muted-foreground ${isRTL ? 'flex-row-reverse' : ''}`}>
                        <Calendar className="h-3 w-3" />
                        <span>{timestamp.absolute}</span>
                        <span className="text-muted-foreground/60">•</span>
                        <span>{timestamp.relative}</span>
                      </div>
                    </div>
                    {canReply && (
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => setReplyingToNoteId(reply.id)}
                        className="h-8"
                      >
                        <Reply className={`h-3.5 w-3.5 ${isRTL ? 'ml-1' : 'mr-1'}`} />
                        {locale === 'ar' ? 'رد' : 'Reply'}
                      </Button>
                    )}
                  </div>
                </CardHeader>
                <CardContent>
                  <div className={`text-sm leading-relaxed whitespace-pre-wrap ${isRTL ? 'text-right' : ''}`}>
                    {reply.content}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {/* Reply Dialog */}
      {replyingToNoteId && (
        <NoteReplyDialog
          open={!!replyingToNoteId}
          onOpenChange={(open) => !open && setReplyingToNoteId(null)}
          parentNoteId={replyingToNoteId}
          locale={locale}
          onSuccess={handleReplySuccess}
        />
      )}

      {/* Edit Dialog */}
      {editingNote && (
        <NoteDialog
          open={!!editingNote}
          onOpenChange={(open) => !open && setEditingNote(null)}
          note={editingNote}
          users={users}
          locale={locale}
          onSuccess={handleEditSuccess}
        />
      )}

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent dir={isRTL ? 'rtl' : 'ltr'}>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {locale === 'ar' ? 'تأكيد الحذف' : 'Confirm Delete'}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {locale === 'ar'
                ? 'هل أنت متأكد من حذف هذه الملاحظة؟ لا يمكن التراجع عن هذا الإجراء.'
                : 'Are you sure you want to delete this note? This action cannot be undone.'}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="p-4 bg-muted rounded-lg space-y-2">
            <div>
              <p className="text-sm font-medium mb-1">
                {locale === 'ar' ? 'العنوان:' : 'Title:'}
              </p>
              <p className="text-sm text-muted-foreground">{note.title}</p>
            </div>
          </div>
          <AlertDialogFooter className={isRTL ? 'flex-row-reverse' : ''}>
            <AlertDialogCancel disabled={isDeleting}>
              {locale === 'ar' ? 'إلغاء' : 'Cancel'}
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={isDeleting}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isDeleting
                ? locale === 'ar'
                  ? 'جاري الحذف...'
                  : 'Deleting...'
                : locale === 'ar'
                  ? 'حذف'
                  : 'Delete'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}








