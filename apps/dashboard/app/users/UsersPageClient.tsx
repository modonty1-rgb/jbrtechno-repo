'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { UserRole } from '@jbrtechno/database';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
  Button,
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  Input,
  Label,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  Badge,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  Alert,
  AlertDescription,
} from '@jbrtechno/ui';
import { Plus, Pencil, Trash2, Key, Loader2, Shield, UserCog } from 'lucide-react';
import { createUser, updateUser, deleteUser, resetPassword, updateUserClockifyId } from '@/actions/users';

function formatDateTime(date: Date): string {
  return new Intl.DateTimeFormat('ar-SA-u-nu-latn-ca-gregory', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(date));
}

const ROLE_LABELS: Record<UserRole, string> = {
  SUPER_ADMIN: 'أدمن',
  STAFF: 'موظف',
};

interface User {
  id: string;
  email: string;
  name: string | null;
  role: UserRole;
  isActive: boolean;
  lastLogin: Date | null;
  createdAt: Date;
  updatedAt: Date;
  staff?: {
    id: string;
    clockifyUserId: string | null;
  }[];
}

interface UsersPageClientProps {
  users: User[];
  locale: string;
  currentUserId: string;
}

export function UsersPageClient({ users, currentUserId }: UsersPageClientProps) {
  const router = useRouter();
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isResetPasswordOpen, setIsResetPasswordOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [deletingUser, setDeletingUser] = useState<User | null>(null);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  const [createForm, setCreateForm] = useState<{
    email: string;
    password: string;
    name: string;
    role: UserRole;
  }>({ email: '', password: '', name: '', role: UserRole.STAFF });

  const [editForm, setEditForm] = useState<{
    name: string;
    role: UserRole;
    isActive: boolean;
    clockifyUserId: string;
  }>({ name: '', role: UserRole.STAFF, isActive: true, clockifyUserId: '' });

  const [resetPasswordForm, setResetPasswordForm] = useState({ newPassword: '' });

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsSubmitting(true);
    try {
      await createUser(createForm.email, createForm.password, createForm.role, createForm.name || undefined);
      setIsCreateOpen(false);
      setCreateForm({ email: '', password: '', name: '', role: UserRole.STAFF });
      router.refresh();
    } catch (err: any) {
      setError(err.message || 'فشل إنشاء المستخدم');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingUser) return;
    setError('');
    setIsSubmitting(true);
    try {
      await updateUser(editingUser.id, {
        name: editForm.name || undefined,
        role: editForm.role,
        isActive: editForm.isActive,
      });
      if (editingUser.staff?.length) {
        await updateUserClockifyId(editingUser.id, editForm.clockifyUserId.trim() || null);
      }
      setIsEditOpen(false);
      setEditingUser(null);
      router.refresh();
    } catch (err: any) {
      setError(err.message || 'فشل تحديث المستخدم');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!deletingUser) return;
    setError('');
    setIsSubmitting(true);
    try {
      await deleteUser(deletingUser.id);
      setIsDeleteOpen(false);
      setDeletingUser(null);
      setIsSubmitting(false);
      router.refresh();
    } catch (err: any) {
      setError(err.message || 'فشل حذف المستخدم');
      setIsSubmitting(false);
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingUser) return;
    setError('');
    setIsSubmitting(true);
    try {
      await resetPassword(editingUser.id, resetPasswordForm.newPassword);
      setIsResetPasswordOpen(false);
      setEditingUser(null);
      setResetPasswordForm({ newPassword: '' });
      router.refresh();
    } catch (err: any) {
      setError(err.message || 'فشل تغيير كلمة المرور');
    } finally {
      setIsSubmitting(false);
    }
  };

  const openEditDialog = (user: User) => {
    setEditingUser(user);
    setEditForm({
      name: user.name || '',
      role: user.role,
      isActive: user.isActive,
      clockifyUserId: user.staff?.[0]?.clockifyUserId || '',
    });
    setIsEditOpen(true);
  };

  const openResetPasswordDialog = (user: User) => {
    setEditingUser(user);
    setResetPasswordForm({ newPassword: '' });
    setIsResetPasswordOpen(true);
  };

  return (
    <div className="container mx-auto px-4 py-6 max-w-5xl">
      {/* Header */}
      <div className="flex items-center justify-between gap-3 flex-wrap mb-5">
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-lg bg-gradient-to-br from-primary/20 to-primary/5">
            <UserCog className="h-5 w-5 text-primary" />
          </div>
          <h1 className="text-xl font-bold">المستخدمون والصلاحيات</h1>
        </div>
        <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
          <DialogTrigger asChild>
            <Button size="sm" className="h-9">
              <Plus className="h-4 w-4 me-1.5" />
              إنشاء مستخدم
            </Button>
          </DialogTrigger>
          <DialogContent dir="rtl">
            <DialogHeader>
              <DialogTitle className="text-start">إنشاء مستخدم جديد</DialogTitle>
              <DialogDescription className="text-start">
                حساب دخول للوحة التحكم — الصلاحيات تُحدد بعد الإنشاء من زر الدرع
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleCreate} className="space-y-3">
              <div className="space-y-1.5">
                <Label htmlFor="create-email" className="text-xs font-semibold text-muted-foreground">
                  البريد الإلكتروني *
                </Label>
                <Input
                  id="create-email"
                  className="h-9"
                  dir="ltr"
                  type="email"
                  value={createForm.email}
                  onChange={(e) => setCreateForm({ ...createForm, email: e.target.value })}
                  required
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="create-password" className="text-xs font-semibold text-muted-foreground">
                  كلمة المرور *
                </Label>
                <Input
                  id="create-password"
                  className="h-9"
                  dir="ltr"
                  type="password"
                  value={createForm.password}
                  onChange={(e) => setCreateForm({ ...createForm, password: e.target.value })}
                  required
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="create-name" className="text-xs font-semibold text-muted-foreground">
                  الاسم
                </Label>
                <Input
                  id="create-name"
                  className="h-9"
                  type="text"
                  value={createForm.name}
                  onChange={(e) => setCreateForm({ ...createForm, name: e.target.value })}
                />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold text-muted-foreground">الدور *</Label>
                <Select
                  value={createForm.role}
                  onValueChange={(value) => setCreateForm({ ...createForm, role: value as UserRole })}
                >
                  <SelectTrigger className="h-9">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value={UserRole.STAFF}>{ROLE_LABELS.STAFF}</SelectItem>
                    <SelectItem value={UserRole.SUPER_ADMIN}>{ROLE_LABELS.SUPER_ADMIN}</SelectItem>
                  </SelectContent>
                </Select>
                {createForm.role === UserRole.SUPER_ADMIN && (
                  <p className="text-[11px] text-warning font-bold">
                    الأدمن يملك كل الصلاحيات بما فيها الرواتب والمستخدمون — امنحه بحذر
                  </p>
                )}
              </div>
              {error && (
                <Alert variant="destructive">
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}
              <Button type="submit" className="w-full" disabled={isSubmitting}>
                {isSubmitting ? (
                  <>
                    <Loader2 className="me-2 h-4 w-4 animate-spin" />
                    جاري الإنشاء...
                  </>
                ) : (
                  'إنشاء المستخدم'
                )}
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {error && !isCreateOpen && !isEditOpen && !isResetPasswordOpen && (
        <Alert variant="destructive" className="mb-4">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <Card>
        <CardHeader>
          <div className="flex items-center gap-3">
            <CardTitle>قائمة المستخدمين</CardTitle>
            <Badge variant="secondary">{users.length} مستخدم</Badge>
          </div>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="text-right">المستخدم</TableHead>
                  <TableHead className="text-right">الدور</TableHead>
                  <TableHead className="text-right">الحالة</TableHead>
                  <TableHead className="text-right">آخر دخول</TableHead>
                  <TableHead className="text-right w-44">الإجراءات</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {users.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center text-muted-foreground py-8">
                      لا يوجد مستخدمون
                    </TableCell>
                  </TableRow>
                ) : (
                  users.map((user) => (
                    <TableRow key={user.id}>
                      <TableCell>
                        <div className="font-medium">{user.name || '—'}</div>
                        <div className="text-[11px] text-muted-foreground" dir="ltr">
                          {user.email}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant={user.role === UserRole.SUPER_ADMIN ? 'default' : 'outline'}>
                          {ROLE_LABELS[user.role]}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge variant={user.isActive ? 'default' : 'secondary'}>
                          {user.isActive ? 'نشط' : 'معطّل'}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-xs whitespace-nowrap">
                        {user.lastLogin ? formatDateTime(user.lastLogin) : 'لم يدخل بعد'}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          <Button
                            variant="outline"
                            size="sm"
                            className="h-8 px-2"
                            onClick={() => router.push(`/users/${user.id}/permissions`)}
                            disabled={isSubmitting || user.role === UserRole.SUPER_ADMIN}
                            title={
                              user.role === UserRole.SUPER_ADMIN
                                ? 'الأدمن يملك كل الصلاحيات تلقائياً'
                                : 'إدارة الصلاحيات'
                            }
                            aria-label="الصلاحيات"
                          >
                            <Shield className="h-3.5 w-3.5" />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            className="h-8 px-2"
                            onClick={() => openEditDialog(user)}
                            disabled={isSubmitting}
                            title="تعديل"
                            aria-label="تعديل"
                          >
                            <Pencil className="h-3.5 w-3.5" />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            className="h-8 px-2"
                            onClick={() => openResetPasswordDialog(user)}
                            disabled={isSubmitting}
                            title="تغيير كلمة المرور"
                            aria-label="تغيير كلمة المرور"
                          >
                            <Key className="h-3.5 w-3.5" />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            className="h-8 px-2 text-destructive border-destructive/40 hover:bg-destructive/10 hover:text-destructive"
                            onClick={() => {
                              setDeletingUser(user);
                              setIsDeleteOpen(true);
                            }}
                            disabled={isSubmitting || user.id === currentUserId}
                            title={user.id === currentUserId ? 'لا يمكنك حذف حسابك' : 'حذف'}
                            aria-label="حذف"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Edit dialog */}
      <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
        <DialogContent dir="rtl">
          <DialogHeader>
            <DialogTitle className="text-start">تعديل المستخدم</DialogTitle>
          </DialogHeader>
          {editingUser && (
            <form onSubmit={handleEdit} className="space-y-3">
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold text-muted-foreground">البريد الإلكتروني</Label>
                <Input className="h-9" dir="ltr" type="email" value={editingUser.email} disabled />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="edit-name" className="text-xs font-semibold text-muted-foreground">
                  الاسم
                </Label>
                <Input
                  id="edit-name"
                  className="h-9"
                  type="text"
                  value={editForm.name}
                  onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label className="text-xs font-semibold text-muted-foreground">الدور</Label>
                  <Select
                    value={editForm.role}
                    onValueChange={(value) => setEditForm({ ...editForm, role: value as UserRole })}
                    disabled={editingUser.id === currentUserId}
                  >
                    <SelectTrigger className="h-9">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value={UserRole.STAFF}>{ROLE_LABELS.STAFF}</SelectItem>
                      <SelectItem value={UserRole.SUPER_ADMIN}>{ROLE_LABELS.SUPER_ADMIN}</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs font-semibold text-muted-foreground">الحالة</Label>
                  <Select
                    value={editForm.isActive ? 'active' : 'inactive'}
                    onValueChange={(value) => setEditForm({ ...editForm, isActive: value === 'active' })}
                    disabled={editingUser.id === currentUserId}
                  >
                    <SelectTrigger className="h-9">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="active">نشط</SelectItem>
                      <SelectItem value="inactive">معطّل</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              {editingUser.staff?.length ? (
                <div className="space-y-1.5">
                  <Label htmlFor="edit-clockify-id" className="text-xs font-semibold text-muted-foreground">
                    معرف Clockify (لتتبع الوقت)
                  </Label>
                  <Input
                    id="edit-clockify-id"
                    className="h-9"
                    dir="ltr"
                    type="text"
                    value={editForm.clockifyUserId}
                    onChange={(e) => setEditForm({ ...editForm, clockifyUserId: e.target.value })}
                    placeholder="الصق معرف المستخدم من Clockify"
                  />
                </div>
              ) : (
                <p className="text-xs text-muted-foreground">
                  هذا المستخدم غير مرتبط بملف موظف، فلا يمكن ضبط معرف تتبع الوقت هنا.
                </p>
              )}
              {error && (
                <Alert variant="destructive">
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}
              <Button type="submit" className="w-full" disabled={isSubmitting}>
                {isSubmitting ? (
                  <>
                    <Loader2 className="me-2 h-4 w-4 animate-spin" />
                    جاري الحفظ...
                  </>
                ) : (
                  'حفظ التعديلات'
                )}
              </Button>
            </form>
          )}
        </DialogContent>
      </Dialog>

      {/* Reset password dialog */}
      <Dialog open={isResetPasswordOpen} onOpenChange={setIsResetPasswordOpen}>
        <DialogContent dir="rtl">
          <DialogHeader>
            <DialogTitle className="text-start">تغيير كلمة المرور</DialogTitle>
            <DialogDescription className="text-start" dir="ltr">
              {editingUser?.email}
            </DialogDescription>
          </DialogHeader>
          {editingUser && (
            <form onSubmit={handleResetPassword} className="space-y-3">
              <div className="space-y-1.5">
                <Label htmlFor="reset-password" className="text-xs font-semibold text-muted-foreground">
                  كلمة المرور الجديدة *
                </Label>
                <Input
                  id="reset-password"
                  className="h-9"
                  dir="ltr"
                  type="text"
                  value={resetPasswordForm.newPassword}
                  onChange={(e) => setResetPasswordForm({ newPassword: e.target.value })}
                  required
                />
              </div>
              {error && (
                <Alert variant="destructive">
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}
              <Button type="submit" className="w-full" disabled={isSubmitting}>
                {isSubmitting ? (
                  <>
                    <Loader2 className="me-2 h-4 w-4 animate-spin" />
                    جاري التغيير...
                  </>
                ) : (
                  'تغيير كلمة المرور'
                )}
              </Button>
            </form>
          )}
        </DialogContent>
      </Dialog>

      {/* Delete confirmation */}
      <AlertDialog
        open={isDeleteOpen}
        onOpenChange={(open) => {
          setIsDeleteOpen(open);
          if (!open) {
            setDeletingUser(null);
            setError('');
            setIsSubmitting(false);
          }
        }}
      >
        <AlertDialogContent dir="rtl">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-start">حذف المستخدم</AlertDialogTitle>
            <AlertDialogDescription className="text-start">
              متأكد من حذف هذا المستخدم؟ الإجراء نهائي ولا يمكن التراجع عنه.
            </AlertDialogDescription>
          </AlertDialogHeader>
          {deletingUser && (
            <div className="p-3 bg-muted rounded-lg text-sm space-y-1">
              <div className="font-medium">{deletingUser.name || '—'}</div>
              <div className="text-muted-foreground" dir="ltr">
                {deletingUser.email}
              </div>
              <Badge variant="outline">{ROLE_LABELS[deletingUser.role]}</Badge>
            </div>
          )}
          <AlertDialogFooter>
            <AlertDialogCancel
              onClick={() => {
                setDeletingUser(null);
                setIsSubmitting(false);
              }}
            >
              إلغاء
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={isSubmitting}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="me-2 h-4 w-4 animate-spin" />
                  جاري الحذف...
                </>
              ) : (
                'حذف نهائياً'
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
