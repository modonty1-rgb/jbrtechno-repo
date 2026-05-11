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
} from '@jbrtechno/ui';
import { Button } from '@jbrtechno/ui';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@jbrtechno/ui';
import { Input } from '@jbrtechno/ui';
import { Label } from '@jbrtechno/ui';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@jbrtechno/ui';
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
import { Alert, AlertDescription } from '@jbrtechno/ui';
import { Plus, Edit, Trash2, Key, Loader2, Shield } from 'lucide-react';
import { createUser, updateUser, deleteUser, resetPassword, updateUserClockifyId } from '@/actions/users';
function formatDateTime(date: Date): string {
  return new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(date));
}

interface User {
  id: string;
  email: string;
  name: string | null;
  role: UserRole;
  isActive: boolean;
  lastLogin: Date | null;
  password: string;
  createdAt: Date;
  updatedAt: Date;
  staff?: {
    id: string;
    clockifyUserId: string | null;
  } | null;
}

interface UsersPageClientProps {
  users: User[];
  locale: string;
  currentUserId: string;
}

export function UsersPageClient({ users, locale, currentUserId }: UsersPageClientProps) {
  const router = useRouter();
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isResetPasswordOpen, setIsResetPasswordOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [deletingUser, setDeletingUser] = useState<User | null>(null);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  // Create form state
  const [createForm, setCreateForm] = useState<{
    email: string;
    password: string;
    name: string;
    role: UserRole;
  }>({
    email: '',
    password: '',
    name: '',
    role: UserRole.STAFF,
  });

  // Edit form state
  const [editForm, setEditForm] = useState<{
    name: string;
    role: UserRole;
    isActive: boolean;
    clockifyUserId: string;
  }>({
    name: '',
    role: UserRole.STAFF,
    isActive: true,
    clockifyUserId: '',
  });

  // Reset password form state
  const [resetPasswordForm, setResetPasswordForm] = useState({
    newPassword: '',
  });

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
      setError(err.message || 'Failed to create user');
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

      // Update linked staff Clockify ID if staff record exists
      if (editingUser.staff) {
        await updateUserClockifyId(
          editingUser.id,
          editForm.clockifyUserId.trim() || null
        );
      }
      setIsEditOpen(false);
      setEditingUser(null);
      router.refresh();
    } catch (err: any) {
      setError(err.message || 'Failed to update user');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteClick = (user: User) => {
    setDeletingUser(user);
    setIsDeleteOpen(true);
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
      setError(err.message || 'Failed to delete user');
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
      setError(err.message || 'Failed to reset password');
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
      clockifyUserId: user.staff?.clockifyUserId || '',
    });
    setIsEditOpen(true);
  };

  const openResetPasswordDialog = (user: User) => {
    setEditingUser(user);
    setResetPasswordForm({ newPassword: '' });
    setIsResetPasswordOpen(true);
  };

  const getRoleBadgeVariant = (role: UserRole) => {
    switch (role) {
      case UserRole.SUPER_ADMIN:
        return 'default';
      case UserRole.STAFF:
        return 'outline';
      default:
        return 'outline';
    }
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">User Management</h1>
          <p className="text-muted-foreground">Manage users and their roles</p>
        </div>
        <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Create User
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create New User</DialogTitle>
              <DialogDescription>Add a new user to the system</DialogDescription>
            </DialogHeader>
            <form onSubmit={handleCreate} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="create-email">Email *</Label>
                <Input
                  id="create-email"
                  type="email"
                  value={createForm.email}
                  onChange={(e) => setCreateForm({ ...createForm, email: e.target.value })}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="create-password">Password *</Label>
                <Input
                  id="create-password"
                  type="password"
                  value={createForm.password}
                  onChange={(e) => setCreateForm({ ...createForm, password: e.target.value })}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="create-name">Name</Label>
                <Input
                  id="create-name"
                  type="text"
                  value={createForm.name}
                  onChange={(e) => setCreateForm({ ...createForm, name: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="create-role">Role *</Label>
                <Select
                  value={createForm.role}
                  onValueChange={(value) => setCreateForm({ ...createForm, role: value as UserRole })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value={UserRole.STAFF}>STAFF</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              {error && (
                <Alert variant="destructive">
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}
              <Button type="submit" className="w-full" disabled={isSubmitting}>
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Creating...
                  </>
                ) : (
                  'Create User'
                )}
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {error && !isCreateOpen && !isEditOpen && !isResetPasswordOpen && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <div className="border rounded-lg">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Email</TableHead>
              <TableHead>Name</TableHead>
              <TableHead>Role</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Last Login</TableHead>
              <TableHead>Password</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {users.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center text-muted-foreground">
                  No users found
                </TableCell>
              </TableRow>
            ) : (
              users.map((user) => (
                <TableRow key={user.id}>
                  <TableCell className="font-medium">{user.email}</TableCell>
                  <TableCell>{user.name || '-'}</TableCell>
                  <TableCell>
                    <Badge variant={getRoleBadgeVariant(user.role)}>{user.role}</Badge>
                  </TableCell>
                  <TableCell>
                    <Badge variant={user.isActive ? 'default' : 'secondary'}>
                      {user.isActive ? 'Active' : 'Inactive'}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {user.lastLogin ? formatDateTime(user.lastLogin) : 'Never'}
                  </TableCell>
                  <TableCell className="font-mono text-sm">{user.password}</TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => router.push(`/users/${user.id}/permissions`)}
                        disabled={isSubmitting || user.role === UserRole.SUPER_ADMIN}
                        title={user.role === UserRole.SUPER_ADMIN ? 'SUPER_ADMIN has access to all routes' : 'إدارة الصلاحيات'}
                      >
                        <Shield className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => openEditDialog(user)}
                        disabled={isSubmitting}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => openResetPasswordDialog(user)}
                        disabled={isSubmitting}
                      >
                        <Key className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDeleteClick(user)}
                        disabled={isSubmitting || user.id === currentUserId}
                      >
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Edit Dialog */}
      <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit User</DialogTitle>
            <DialogDescription>Update user information</DialogDescription>
          </DialogHeader>
          {editingUser && (
            <form onSubmit={handleEdit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="edit-email">Email</Label>
                <Input id="edit-email" type="email" value={editingUser.email} disabled />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-name">Name</Label>
                <Input
                  id="edit-name"
                  type="text"
                  value={editForm.name}
                  onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-role">Role</Label>
                <Select
                  value={editForm.role}
                  onValueChange={(value) => setEditForm({ ...editForm, role: value as UserRole })}
                  disabled={editingUser.role === UserRole.SUPER_ADMIN}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {editingUser.role === UserRole.SUPER_ADMIN ? (
                      <SelectItem value={UserRole.SUPER_ADMIN}>SUPER_ADMIN</SelectItem>
                    ) : (
                      <SelectItem value={UserRole.STAFF}>STAFF</SelectItem>
                    )}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-active">Status</Label>
                <Select
                  value={editForm.isActive ? 'active' : 'inactive'}
                  onValueChange={(value) => setEditForm({ ...editForm, isActive: value === 'active' })}
                  disabled={editingUser.role === UserRole.SUPER_ADMIN}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="inactive">Inactive</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              {editingUser.staff ? (
                <div className="space-y-2">
                  <Label htmlFor="edit-clockify-id">Clockify User ID (for time tracking)</Label>
                  <Input
                    id="edit-clockify-id"
                    type="text"
                    value={editForm.clockifyUserId}
                    onChange={(e) =>
                      setEditForm({ ...editForm, clockifyUserId: e.target.value })
                    }
                    placeholder="Paste Clockify user ID"
                  />
                  <p className="text-xs text-muted-foreground">
                    Copy the ID from the Clockify Users page and paste it here to link time tracking.
                  </p>
                </div>
              ) : (
                <p className="text-xs text-muted-foreground">
                  This user is not linked to a staff record, so Clockify ID cannot be set here.
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
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Updating...
                  </>
                ) : (
                  'Update User'
                )}
              </Button>
            </form>
          )}
        </DialogContent>
      </Dialog>

      {/* Reset Password Dialog */}
      <Dialog open={isResetPasswordOpen} onOpenChange={setIsResetPasswordOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Reset Password</DialogTitle>
            <DialogDescription>Set a new password for {editingUser?.email}</DialogDescription>
          </DialogHeader>
          {editingUser && (
            <form onSubmit={handleResetPassword} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="reset-password">New Password *</Label>
                <Input
                  id="reset-password"
                  type="text"
                  value={resetPasswordForm.newPassword}
                  onChange={(e) =>
                    setResetPasswordForm({ newPassword: e.target.value })
                  }
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
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Resetting...
                  </>
                ) : (
                  'Reset Password'
                )}
              </Button>
            </form>
          )}
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
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
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete User</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this user? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          {deletingUser && (
            <div className="p-4 bg-muted rounded-lg space-y-2">
              <div>
                <p className="text-sm font-medium mb-1">Email:</p>
                <p className="text-sm text-muted-foreground">{deletingUser.email}</p>
              </div>
              {deletingUser.name && (
                <div>
                  <p className="text-sm font-medium mb-1">Name:</p>
                  <p className="text-sm text-muted-foreground">{deletingUser.name}</p>
                </div>
              )}
              <div>
                <p className="text-sm font-medium mb-1">Role:</p>
                <p className="text-sm text-muted-foreground">{deletingUser.role}</p>
              </div>
            </div>
          )}
          <AlertDialogFooter>
            <AlertDialogCancel
              onClick={() => {
                setDeletingUser(null);
                setIsSubmitting(false);
              }}
            >
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={isSubmitting}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Deleting...
                </>
              ) : (
                'Delete User'
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

    </div>
  );
}

