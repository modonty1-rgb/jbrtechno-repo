'use client';

import { useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@jbrtechno/ui';
import { Button } from '@jbrtechno/ui';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@jbrtechno/ui';
import { Badge } from '@jbrtechno/ui';
import { TaskCard } from '@/components/tasks/TaskCard';
import { TaskFilters } from '@/components/tasks/TaskFilters';
import { TaskStatus, TaskPriority } from '@jbrtechno/database';
import { updateTaskStatus } from '@/actions/tasks';
import { ListTodo, CheckCircle2, Clock, AlertCircle } from 'lucide-react';

interface Task {
  id: string;
  title: string;
  description?: string | null;
  status: TaskStatus;
  priority: TaskPriority;
  dueDate?: Date | string | null;
  createdBy?: {
    id: string;
    name: string | null;
    email: string;
  } | null;
  completedAt?: Date | string | null;
  createdAt: Date | string;
}

interface MyTasksPageClientProps {
  tasks: Task[];
  currentUserId: string;
  locale: string;
}

export function MyTasksPageClient({
  tasks: initialTasks,
  currentUserId,
  locale,
}: MyTasksPageClientProps) {
  const router = useRouter();
  const [tasks, setTasks] = useState(initialTasks);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [priorityFilter, setPriorityFilter] = useState('all');
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

      return matchesSearch && matchesStatus && matchesPriority;
    });
  }, [tasks, searchQuery, statusFilter, priorityFilter]);

  const stats = useMemo(() => {
    return {
      total: tasks.length,
      pending: tasks.filter((t) => t.status === TaskStatus.PENDING).length,
      inProgress: tasks.filter((t) => t.status === TaskStatus.IN_PROGRESS).length,
      completed: tasks.filter((t) => t.status === TaskStatus.COMPLETED).length,
    };
  }, [tasks]);

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

  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl" dir={isRTL ? 'rtl' : 'ltr'}>
      <div className={`flex items-center justify-between mb-6 ${isRTL ? 'flex-row-reverse' : ''}`}>
        <div>
          <h1 className="text-4xl font-bold mb-2">
            {locale === 'ar' ? 'مهامي' : 'My Tasks'}
          </h1>
          <p className="text-muted-foreground">
            {locale === 'ar'
              ? 'عرض وإدارة المهام المخصصة لك'
              : 'View and manage tasks assigned to you'}
          </p>
        </div>
        <Button
          variant="outline"
          onClick={() => setViewMode(viewMode === 'table' ? 'cards' : 'table')}
        >
          {viewMode === 'table' ? (
            <>
              <ListTodo className="h-4 w-4 mr-2" />
              {locale === 'ar' ? 'بطاقات' : 'Cards'}
            </>
          ) : (
            <>
              <ListTodo className="h-4 w-4 mr-2" />
              {locale === 'ar' ? 'جدول' : 'Table'}
            </>
          )}
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>{locale === 'ar' ? 'إجمالي' : 'Total'}</CardDescription>
            <CardTitle className="text-2xl">{stats.total}</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>{locale === 'ar' ? 'قيد الانتظار' : 'Pending'}</CardDescription>
            <CardTitle className="text-2xl">{stats.pending}</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>{locale === 'ar' ? 'قيد التنفيذ' : 'In Progress'}</CardDescription>
            <CardTitle className="text-2xl">{stats.inProgress}</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>{locale === 'ar' ? 'مكتمل' : 'Completed'}</CardDescription>
            <CardTitle className="text-2xl">{stats.completed}</CardTitle>
          </CardHeader>
        </Card>
      </div>

      <Card className="mb-6">
        <CardHeader>
          <CardTitle>{locale === 'ar' ? 'الفلاتر' : 'Filters'}</CardTitle>
        </CardHeader>
        <CardContent>
          <TaskFilters
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
            statusFilter={statusFilter}
            onStatusFilterChange={setStatusFilter}
            priorityFilter={priorityFilter}
            onPriorityFilterChange={setPriorityFilter}
            assignedToFilter="all"
            onAssignedToFilterChange={() => { }}
            users={[]}
            locale={locale}
            showAssignedTo={false}
          />
        </CardContent>
      </Card>

      {viewMode === 'table' ? (
        <Card>
          <CardHeader>
            <CardTitle>
              {locale === 'ar' ? 'مهامي' : 'My Tasks'} ({filteredTasks.length})
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
                              <CheckCircle2 className="h-4 w-4 mr-1" />
                              {locale === 'ar' ? 'إكمال' : 'Complete'}
                            </Button>
                          )}
                          {task.status === TaskStatus.PENDING && (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleStatusChange(task.id, TaskStatus.IN_PROGRESS)}
                            >
                              {locale === 'ar' ? 'بدء' : 'Start'}
                            </Button>
                          )}
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
              onStatusChange={handleStatusChange}
              showActions={true}
              locale={locale}
            />
          ))}
        </div>
      )}
    </div>
  );
}








