'use client';

import { useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@jbrtechno/ui';
import { Button } from '@jbrtechno/ui';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@jbrtechno/ui';
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
import { TaskCard } from '@/components/tasks/TaskCard';
import { TaskDialog } from '@/components/tasks/TaskDialog';
import { TaskFilters } from '@/components/tasks/TaskFilters';
import { TaskStatus, TaskPriority } from '@jbrtechno/database';
import { updateTaskStatus, deleteTask } from '@/actions/tasks';
import { Plus, ListTodo, CheckCircle2, Clock, AlertCircle } from 'lucide-react';

interface User {
  id: string;
  name: string | null;
  email: string;
}

interface Task {
  id: string;
  title: string;
  description?: string | null;
  status: TaskStatus;
  priority: TaskPriority;
  dueDate?: Date | string | null;
  assignedToUserId: string;
  createdByUserId: string;
  assignedTo?: User | null;
  createdBy?: User | null;
  completedAt?: Date | string | null;
  createdAt: Date | string;
}

interface TasksPageClientProps {
  tasks: Task[];
  users: User[];
  currentUserId: string;
  locale: string;
}

export function TasksPageClient({
  tasks: initialTasks,
  users,
  currentUserId,
  locale,
}: TasksPageClientProps) {
  const router = useRouter();
  const [tasks, setTasks] = useState(initialTasks);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [priorityFilter, setPriorityFilter] = useState('all');
  const [assignedToFilter, setAssignedToFilter] = useState('all');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [deletingTaskId, setDeletingTaskId] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<'table' | 'cards'>('table');
  const isRTL = true;

  const filteredTasks = useMemo(() => {
    return tasks.filter((task) => {
      const matchesSearch =
        !searchQuery ||
        task.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        task.description?.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesStatus = statusFilter === 'all' || task.status === statusFilter;
      const matchesPriority = priorityFilter === 'all' || task.priority === priorityFilter;
      const matchesAssignedTo = assignedToFilter === 'all' || task.assignedTo?.id === assignedToFilter;

      return matchesSearch && matchesStatus && matchesPriority && matchesAssignedTo;
    });
  }, [tasks, searchQuery, statusFilter, priorityFilter, assignedToFilter]);

  const stats = useMemo(() => {
    return {
      total: tasks.length,
      pending: tasks.filter((t) => t.status === TaskStatus.PENDING).length,
      inProgress: tasks.filter((t) => t.status === TaskStatus.IN_PROGRESS).length,
      completed: tasks.filter((t) => t.status === TaskStatus.COMPLETED).length,
    };
  }, [tasks]);

  const handleCreate = () => {
    setEditingTask(null);
    setIsDialogOpen(true);
  };

  const handleEdit = (task: Task) => {
    setEditingTask(task);
    setIsDialogOpen(true);
  };

  const handleDelete = async (taskId: string) => {
    const result = await deleteTask(taskId);
    if (result.success) {
      setTasks(tasks.filter((t) => t.id !== taskId));
      setDeletingTaskId(null);
      router.refresh();
    }
  };

  const handleStatusChange = async (taskId: string, status: TaskStatus) => {
    const result = await updateTaskStatus(taskId, status, currentUserId);
    if (result.success) {
      setTasks(
        tasks.map((t) =>
          t.id === taskId
            ? {
              ...t,
              status,
              completedAt: status === TaskStatus.COMPLETED ? new Date() : null,
            }
            : t
        )
      );
      router.refresh();
    }
  };

  const handleDialogSuccess = () => {
    router.refresh();
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl" dir={isRTL ? 'rtl' : 'ltr'}>
      <div className={`flex items-center justify-between mb-6 ${isRTL ? 'flex-row-reverse' : ''}`}>
        <div>
          <h1 className="text-4xl font-bold mb-2">
            إدارة المهام
          </h1>
          <p className="text-muted-foreground">
            {locale === 'ar'
              ? 'إنشاء وإدارة جميع المهام'
              : 'Create and manage all tasks'}
          </p>
        </div>
        <div className={`flex items-center gap-2 ${isRTL ? 'flex-row-reverse' : ''}`}>
          <Button
            variant="outline"
            onClick={() => setViewMode(viewMode === 'table' ? 'cards' : 'table')}
          >
            {viewMode === 'table' ? (
              <>
                <ListTodo className="h-4 w-4 mr-2" />
                بطاقات
              </>
            ) : (
              <>
                <ListTodo className="h-4 w-4 mr-2" />
                جدول
              </>
            )}
          </Button>
          <Button onClick={handleCreate}>
            <Plus className="h-4 w-4 mr-2" />
            مهمة جديدة
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>إجمالي</CardDescription>
            <CardTitle className="text-2xl">{stats.total}</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>قيد الانتظار</CardDescription>
            <CardTitle className="text-2xl">{stats.pending}</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>قيد التنفيذ</CardDescription>
            <CardTitle className="text-2xl">{stats.inProgress}</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>مكتمل</CardDescription>
            <CardTitle className="text-2xl">{stats.completed}</CardTitle>
          </CardHeader>
        </Card>
      </div>

      <Card className="mb-6">
        <CardHeader>
          <CardTitle>الفلاتر</CardTitle>
        </CardHeader>
        <CardContent>
          <TaskFilters
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
            statusFilter={statusFilter}
            onStatusFilterChange={setStatusFilter}
            priorityFilter={priorityFilter}
            onPriorityFilterChange={setPriorityFilter}
            assignedToFilter={assignedToFilter}
            onAssignedToFilterChange={setAssignedToFilter}
            users={users}
            locale={locale}
          />
        </CardContent>
      </Card>

      {viewMode === 'table' ? (
        <Card>
          <CardHeader>
            <CardTitle>
              {locale === 'ar' ? 'المهام' : 'Tasks'} ({filteredTasks.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            {filteredTasks.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                {locale === 'ar' ? 'لا توجد مهام' : 'No tasks found'}
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>{locale === 'ar' ? 'العنوان' : 'Title'}</TableHead>
                    <TableHead>{locale === 'ar' ? 'مخصص لـ' : 'Assigned To'}</TableHead>
                    <TableHead>{locale === 'ar' ? 'الحالة' : 'Status'}</TableHead>
                    <TableHead>{locale === 'ar' ? 'الأولوية' : 'Priority'}</TableHead>
                    <TableHead>{locale === 'ar' ? 'تاريخ الاستحقاق' : 'Due Date'}</TableHead>
                    <TableHead>{locale === 'ar' ? 'أنشأه' : 'Created By'}</TableHead>
                    <TableHead>{locale === 'ar' ? 'الإجراءات' : 'Actions'}</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredTasks.map((task) => (
                    <TableRow key={task.id}>
                      <TableCell className="font-medium">{task.title}</TableCell>
                      <TableCell>
                        {task.assignedTo?.name || task.assignedTo?.email || '-'}
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant="secondary"
                          className={
                            task.status === TaskStatus.COMPLETED
                              ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'
                              : task.status === TaskStatus.IN_PROGRESS
                                ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400'
                                : task.status === TaskStatus.PENDING
                                  ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400'
                                  : 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400'
                          }
                        >
                          {task.status}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">{task.priority}</Badge>
                      </TableCell>
                      <TableCell>
                        {task.dueDate
                          ? new Intl.DateTimeFormat(locale === 'ar' ? 'ar-EG' : 'en-US', {
                            year: 'numeric',
                            month: locale === 'ar' ? '2-digit' : 'short',
                            day: '2-digit',
                          }).format(new Date(task.dueDate))
                          : '-'}
                      </TableCell>
                      <TableCell>
                        {task.createdBy?.name || task.createdBy?.email || '-'}
                      </TableCell>
                      <TableCell>
                        <div className={`flex items-center gap-2 ${isRTL ? 'flex-row-reverse' : ''}`}>
                          {task.status !== TaskStatus.COMPLETED && (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleStatusChange(task.id, TaskStatus.COMPLETED)}
                            >
                              <CheckCircle2 className="h-4 w-4" />
                            </Button>
                          )}
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleEdit(task)}
                          >
                            {locale === 'ar' ? 'تعديل' : 'Edit'}
                          </Button>
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => setDeletingTaskId(task.id)}
                          >
                            {locale === 'ar' ? 'حذف' : 'Delete'}
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredTasks.map((task) => (
            <TaskCard
              key={task.id}
              task={task}
              onEdit={handleEdit}
              onDelete={(id) => setDeletingTaskId(id)}
              locale={locale}
            />
          ))}
        </div>
      )}

      <TaskDialog
        open={isDialogOpen}
        onOpenChange={setIsDialogOpen}
        task={editingTask}
        users={users}
        locale={locale}
        onSuccess={handleDialogSuccess}
      />

      <AlertDialog open={!!deletingTaskId} onOpenChange={(open) => !open && setDeletingTaskId(null)}>
        <AlertDialogContent dir={isRTL ? 'rtl' : 'ltr'}>
          <AlertDialogHeader>
            <AlertDialogTitle>
              تأكيد الحذف
            </AlertDialogTitle>
            <AlertDialogDescription>
              هل أنت متأكد من حذف هذه المهمة؟ لا يمكن التراجع عن هذا الإجراء.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className={isRTL ? 'flex-row-reverse' : ''}>
            <AlertDialogCancel>
              إلغاء
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={() => deletingTaskId && handleDelete(deletingTaskId)}
              className="bg-red-600 hover:bg-red-700"
            >
              {locale === 'ar' ? 'حذف' : 'Delete'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}








