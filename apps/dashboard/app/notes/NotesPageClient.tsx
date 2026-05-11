'use client';

import { useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@jbrtechno/ui';
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
import { NoteCard } from '@/components/notes/NoteCard';
import { NoteDialog } from '@/components/notes/NoteDialog';
import { NoteReplyDialog } from '@/components/notes/NoteReplyDialog';
import { NoteFilters } from '@/components/notes/NoteFilters';
import { NoteType, TargetAudience, UserRole } from '@jbrtechno/database';
import { markNoteAsRead, deleteManagementNote } from '@/actions/managementNotes';
import { Plus, StickyNote, Bell, AlertCircle, FileText, Inbox } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@jbrtechno/ui';

interface User {
  id: string;
  name: string | null;
  email: string;
}

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
  createdBy?: User | null;
  targetUser?: User | null;
  department?: string | null;
  createdAt: Date | string;
  readBy?: string[];
  replies?: Array<{
    id: string;
    content: string;
    createdAt: Date | string;
    createdBy?: {
      id: string;
      name: string | null;
      email: string;
    } | null;
  }>;
}

interface NotesPageClientProps {
  notes: Note[];
  users: User[];
  departments?: string[];
  currentUserId: string;
  userRole: UserRole;
  locale: string;
}

export function NotesPageClient({
  notes: initialNotes,
  users,
  departments = [],
  currentUserId,
  userRole,
  locale,
}: NotesPageClientProps) {
  const router = useRouter();
  const [notes, setNotes] = useState(initialNotes);
  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState('all');
  const [audienceFilter, setAudienceFilter] = useState('all');
  const [importantFilter, setImportantFilter] = useState<boolean | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingNote, setEditingNote] = useState<Note | null>(null);
  const [deletingNoteId, setDeletingNoteId] = useState<string | null>(null);
  const [replyingToNoteId, setReplyingToNoteId] = useState<string | null>(null);
  const isRTL = true;
  const isAdmin = userRole === UserRole.SUPER_ADMIN;

  const filteredNotes = useMemo(() => {
    return notes.filter((note) => {
      const matchesSearch =
        !searchQuery ||
        note.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        note.content.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesType = typeFilter === 'all' || note.type === typeFilter;
      const matchesAudience =
        userRole === UserRole.STAFF ||
        audienceFilter === 'all' ||
        note.targetAudience === audienceFilter;
      const matchesImportant =
        importantFilter === null || note.isImportant === importantFilter;

      return matchesSearch && matchesType && matchesAudience && matchesImportant;
    });
  }, [notes, searchQuery, typeFilter, audienceFilter, importantFilter, userRole]);

  const stats = useMemo(() => {
    const unreadCount = notes.filter(
      (n) => !n.readBy?.includes(currentUserId)
    ).length;
    const importantCount = notes.filter((n) => n.isImportant).length;

    const byType = notes.reduce((acc, note) => {
      acc[note.type] = (acc[note.type] || 0) + 1;
      return acc;
    }, {} as Record<NoteType, number>);

    return {
      total: notes.length,
      unread: unreadCount,
      important: importantCount,
      byType,
    };
  }, [notes, currentUserId]);

  const handleCreate = () => {
    setEditingNote(null);
    setIsDialogOpen(true);
  };

  const handleEdit = (note: Note) => {
    setEditingNote(note);
    setIsDialogOpen(true);
  };

  const handleDelete = async (noteId: string) => {
    const result = await deleteManagementNote(noteId);
    if (result.success) {
      setNotes(notes.filter((n) => n.id !== noteId));
      setDeletingNoteId(null);
      router.refresh();
    }
  };

  const handleMarkAsRead = async (noteId: string) => {
    const result = await markNoteAsRead(noteId, currentUserId);
    if (result.success) {
      setNotes(
        notes.map((n) =>
          n.id === noteId
            ? { ...n, readBy: [...(n.readBy || []), currentUserId] }
            : n
        )
      );
      router.refresh();
    }
  };

  const handleDialogSuccess = () => {
    router.refresh();
  };

  const handleReply = (noteId: string) => {
    setReplyingToNoteId(noteId);
  };

  const handleReplySuccess = () => {
    router.refresh();
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl" dir={isRTL ? 'rtl' : 'ltr'}>
      <div className={`flex items-center justify-between mb-6 ${isRTL ? 'flex-row-reverse' : ''}`}>
        <div>
          <h1 className="text-4xl font-bold mb-2">
            الملاحظات الإدارية
          </h1>
          <p className="text-muted-foreground">
            {locale === 'ar'
              ? 'عرض وإدارة الملاحظات الإدارية'
              : 'View and manage administrative notes'}
          </p>
        </div>
        <div className={`flex items-center gap-2 ${isRTL ? 'flex-row-reverse' : ''}`}>
          {isAdmin && (
            <Button onClick={handleCreate}>
              <Plus className={`h-4 w-4 ${isRTL ? 'ml-2' : 'mr-2'}`} />
              ملاحظة جديدة
            </Button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <Card className="hover:shadow-md transition-shadow">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardDescription className="text-sm font-medium">إجمالي</CardDescription>
              <div className="p-2 rounded-lg bg-blue-100 dark:bg-blue-900/30">
                <FileText className="h-4 w-4 text-blue-600 dark:text-blue-400" />
              </div>
            </div>
            <CardTitle className="text-3xl font-bold mt-2">{stats.total}</CardTitle>
          </CardHeader>
        </Card>
        <Card className="hover:shadow-md transition-shadow">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardDescription className="text-sm font-medium">غير مقروء</CardDescription>
              <div className="p-2 rounded-lg bg-orange-100 dark:bg-orange-900/30">
                <Inbox className="h-4 w-4 text-orange-600 dark:text-orange-400" />
              </div>
            </div>
            <CardTitle className="text-3xl font-bold mt-2">{stats.unread}</CardTitle>
            {stats.total > 0 && (
              <p className="text-xs text-muted-foreground mt-1">
                {Math.round((stats.unread / stats.total) * 100)}% من الإجمالي
              </p>
            )}
          </CardHeader>
        </Card>
        <Card className="hover:shadow-md transition-shadow">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardDescription className="text-sm font-medium">عاجل</CardDescription>
              <div className="p-2 rounded-lg bg-red-100 dark:bg-red-900/30">
                <AlertCircle className="h-4 w-4 text-red-600 dark:text-red-400" />
              </div>
            </div>
            <CardTitle className="text-3xl font-bold mt-2">{stats.important}</CardTitle>
            {stats.total > 0 && (
              <p className="text-xs text-muted-foreground mt-1">
                {Math.round((stats.important / stats.total) * 100)}% من الإجمالي
              </p>
            )}
          </CardHeader>
        </Card>
        <Card className="hover:shadow-md transition-shadow">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardDescription className="text-sm font-medium">الإعلانات</CardDescription>
              <div className="p-2 rounded-lg bg-purple-100 dark:bg-purple-900/30">
                <Bell className="h-4 w-4 text-purple-600 dark:text-purple-400" />
              </div>
            </div>
            <CardTitle className="text-3xl font-bold mt-2">
              {stats.byType[NoteType.ANNOUNCEMENT] || 0}
            </CardTitle>
            {stats.total > 0 && (
              <p className="text-xs text-muted-foreground mt-1">
                {Math.round(((stats.byType[NoteType.ANNOUNCEMENT] || 0) / stats.total) * 100)}% من الإجمالي
              </p>
            )}
          </CardHeader>
        </Card>
      </div>

      <Card className="mb-6">
        <CardHeader>
          <CardTitle>{locale === 'ar' ? 'الفلاتر' : 'Filters'}</CardTitle>
        </CardHeader>
        <CardContent>
          <NoteFilters
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
            typeFilter={typeFilter}
            onTypeFilterChange={setTypeFilter}
            audienceFilter={audienceFilter}
            onAudienceFilterChange={setAudienceFilter}
            importantFilter={importantFilter}
            onImportantFilterChange={setImportantFilter}
            locale={locale}
            hideAudienceFilter={userRole === UserRole.STAFF}
          />
        </CardContent>
      </Card>

      {filteredNotes.length === 0 ? (
        <Card>
          <CardContent className="py-12">
            <div className="text-center">
              <div className="flex flex-col items-center gap-4">
                <div className="p-4 rounded-full bg-muted">
                  <StickyNote className="h-8 w-8 text-muted-foreground" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold mb-1">
                    {locale === 'ar' ? 'لا توجد ملاحظات' : 'No notes found'}
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    {locale === 'ar'
                      ? 'لا توجد ملاحظات تطابق الفلاتر المحددة'
                      : 'No notes match the selected filters'}
                  </p>
                </div>
                {isAdmin && (
                  <Button onClick={handleCreate} variant="outline" className={`mt-2 ${isRTL ? 'flex-row-reverse' : ''}`}>
                    <Plus className={`h-4 w-4 ${isRTL ? 'ml-2' : 'mr-2'}`} />
                    {locale === 'ar' ? 'إنشاء ملاحظة جديدة' : 'Create New Note'}
                  </Button>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredNotes.map((note) => (
            <NoteCard
              key={note.id}
              note={note}
              currentUserId={currentUserId}
              userRole={userRole}
              onMarkAsRead={handleMarkAsRead}
              onEdit={isAdmin ? handleEdit : undefined}
              onDelete={isAdmin ? (id) => setDeletingNoteId(id) : undefined}
              onReply={handleReply}
              locale={locale}
            />
          ))}
        </div>
      )}

      {isAdmin && (
        <NoteDialog
          open={isDialogOpen}
          onOpenChange={setIsDialogOpen}
          note={editingNote}
          users={users}
          locale={locale}
          onSuccess={handleDialogSuccess}
        />
      )}

      {replyingToNoteId && (
        <NoteReplyDialog
          open={!!replyingToNoteId}
          onOpenChange={(open) => !open && setReplyingToNoteId(null)}
          parentNoteId={replyingToNoteId}
          locale={locale}
          onSuccess={handleReplySuccess}
        />
      )}

      <AlertDialog open={!!deletingNoteId} onOpenChange={(open) => !open && setDeletingNoteId(null)}>
        <AlertDialogContent dir={isRTL ? 'rtl' : 'ltr'}>
          <AlertDialogHeader>
            <AlertDialogTitle>
              تأكيد الحذف
            </AlertDialogTitle>
            <AlertDialogDescription>
              هل أنت متأكد من حذف هذه الملاحظة؟ لا يمكن التراجع عن هذا الإجراء.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className={isRTL ? 'flex-row-reverse' : ''}>
            <AlertDialogCancel>
              إلغاء
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={() => deletingNoteId && handleDelete(deletingNoteId)}
              className="bg-red-600 hover:bg-red-700"
            >
              حذف
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}








