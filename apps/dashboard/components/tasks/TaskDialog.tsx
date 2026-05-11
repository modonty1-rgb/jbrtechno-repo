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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@jbrtechno/ui';
import { TaskStatus, TaskPriority } from '@jbrtechno/database';
import { createTask, updateTask } from '@/actions/tasks';

interface User {
  id: string;
  name: string | null;
  email: string;
}

interface TaskDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  task?: {
    id: string;
    title: string;
    description?: string | null;
    assignedToUserId: string;
    priority: TaskPriority;
    dueDate?: Date | string | null;
    status?: TaskStatus;
  } | null;
  users: User[];
  locale?: string;
  onSuccess?: () => void;
}

export function TaskDialog({
  open,
  onOpenChange,
  task,
  users,
  locale = 'en',
  onSuccess,
}: TaskDialogProps) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [assignedToUserId, setAssignedToUserId] = useState('');
  const [priority, setPriority] = useState<TaskPriority>(TaskPriority.MEDIUM);
  const [dueDate, setDueDate] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const isRTL = true;

  useEffect(() => {
    if (task) {
      setTitle(task.title);
      setDescription(task.description || '');
      setAssignedToUserId(task.assignedToUserId);
      setPriority(task.priority);
      setDueDate(
        task.dueDate
          ? new Date(task.dueDate).toISOString().split('T')[0]
          : ''
      );
    } else {
      setTitle('');
      setDescription('');
      setAssignedToUserId('');
      setPriority(TaskPriority.MEDIUM);
      setDueDate('');
    }
    setError('');
  }, [task, open]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsSubmitting(true);

    try {
      if (task) {
        const result = await updateTask(task.id, {
          title,
          description: description || undefined,
          assignedToUserId,
          priority,
          dueDate: dueDate || undefined,
        });

        if (!result.success) {
          setError(result.error || 'Failed to update task');
          return;
        }
      } else {
        if (!assignedToUserId) {
          setError('يرجى اختيار المستخدم');
          setIsSubmitting(false);
          return;
        }

        const result = await createTask({
          title,
          description: description || undefined,
          assignedToUserId,
          priority,
          dueDate: dueDate || undefined,
        });

        if (!result.success) {
          setError(result.error || 'Failed to create task');
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

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className={isRTL ? 'text-right' : ''} dir={isRTL ? 'rtl' : 'ltr'}>
        <DialogHeader>
          <DialogTitle>
            {task ? 'تعديل المهمة' : 'إنشاء مهمة جديدة'}
          </DialogTitle>
          <DialogDescription>
            {task ? 'قم بتعديل تفاصيل المهمة' : 'أدخل تفاصيل المهمة الجديدة'}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="title">
                العنوان *
              </Label>
              <Input
                id="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
                placeholder="أدخل عنوان المهمة"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">
                الوصف
              </Label>
              <Textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="أدخل وصف المهمة"
                rows={4}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="assignedTo">
                مخصص لـ *
              </Label>
              <Select
                value={assignedToUserId}
                onValueChange={setAssignedToUserId}
                required
              >
                <SelectTrigger id="assignedTo">
                  <SelectValue
                    placeholder="اختر المستخدم"
                  />
                </SelectTrigger>
                <SelectContent>
                  {users.map((user) => (
                    <SelectItem key={user.id} value={user.id}>
                      {user.name || user.email}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="priority">
                  الأولوية
                </Label>
                <Select
                  value={priority}
                  onValueChange={(value) => setPriority(value as TaskPriority)}
                >
                  <SelectTrigger id="priority">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value={TaskPriority.LOW}>
                      منخفض
                    </SelectItem>
                    <SelectItem value={TaskPriority.MEDIUM}>
                      متوسط
                    </SelectItem>
                    <SelectItem value={TaskPriority.HIGH}>
                      عالي
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="dueDate">
                  تاريخ الاستحقاق
                </Label>
                <Input
                  id="dueDate"
                  type="date"
                  value={dueDate}
                  onChange={(e) => setDueDate(e.target.value)}
                />
              </div>
            </div>

            {error && (
              <div className="text-sm text-red-600 dark:text-red-400">{error}</div>
            )}
          </div>

          <DialogFooter className={isRTL ? 'flex-row-reverse' : ''}>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isSubmitting}
            >
              إلغاء
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting
                ? 'جاري الحفظ...'
                : task
                  ? 'حفظ التغييرات'
                  : 'إنشاء'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}









