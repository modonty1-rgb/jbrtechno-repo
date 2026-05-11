'use client';

import { Card, CardContent, CardHeader } from '@jbrtechno/ui';
import { Badge } from '@jbrtechno/ui';
import { Button } from '@jbrtechno/ui';
import { TaskStatus, TaskPriority } from '@jbrtechno/database';
import { Calendar, User, Flag, CheckCircle2, Clock, XCircle, AlertCircle } from 'lucide-react';

interface TaskCardProps {
  task: {
    id: string;
    title: string;
    description?: string | null;
    status: TaskStatus;
    priority: TaskPriority;
    dueDate?: Date | string | null;
    assignedTo?: {
      id: string;
      name: string | null;
      email: string;
    } | null;
    createdBy?: {
      id: string;
      name: string | null;
      email: string;
    } | null;
    completedAt?: Date | string | null;
  };
  onStatusChange?: (taskId: string, status: TaskStatus) => void;
  onEdit?: (task: any) => void;
  onDelete?: (taskId: string) => void;
  showActions?: boolean;
  locale?: string;
}

const statusConfig = {
  [TaskStatus.PENDING]: {
    label: { en: 'Pending', ar: 'قيد الانتظار' },
    icon: Clock,
    className: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400',
  },
  [TaskStatus.IN_PROGRESS]: {
    label: { en: 'In Progress', ar: 'قيد التنفيذ' },
    icon: AlertCircle,
    className: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400',
  },
  [TaskStatus.COMPLETED]: {
    label: { en: 'Completed', ar: 'مكتمل' },
    icon: CheckCircle2,
    className: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400',
  },
};

const priorityConfig = {
  [TaskPriority.LOW]: {
    label: { en: 'Low', ar: 'منخفض' },
    className: 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400',
  },
  [TaskPriority.MEDIUM]: {
    label: { en: 'Medium', ar: 'متوسط' },
    className: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400',
  },
  [TaskPriority.HIGH]: {
    label: { en: 'High', ar: 'عالي' },
    className: 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400',
  },
};

export function TaskCard({
  task,
  onStatusChange,
  onEdit,
  onDelete,
  showActions = true,
  locale = 'en',
}: TaskCardProps) {
  const status = statusConfig[task.status] || statusConfig[TaskStatus.PENDING];
  const priority = priorityConfig[task.priority] || priorityConfig[TaskPriority.MEDIUM];
  const StatusIcon = status.icon;
  const isRTL = true;

  const isOverdue =
    task.dueDate &&
    new Date(task.dueDate) < new Date() &&
    task.status !== TaskStatus.COMPLETED;

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardHeader className="pb-3">
        <div className={`flex items-start justify-between gap-2 ${isRTL ? 'flex-row-reverse' : ''}`}>
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-lg mb-2 line-clamp-2">{task.title}</h3>
            {task.description && (
              <p className="text-sm text-muted-foreground line-clamp-2 mb-3">{task.description}</p>
            )}
          </div>
        </div>
        <div className={`flex flex-wrap items-center gap-2 ${isRTL ? 'flex-row-reverse' : ''}`}>
          <Badge className={status.className} variant="secondary">
            <StatusIcon className="h-3 w-3 mr-1" />
            {status.label.ar}
          </Badge>
          <Badge className={priority.className} variant="secondary">
            <Flag className="h-3 w-3 mr-1" />
            {priority.label.ar}
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        <div className={`space-y-2 text-sm ${isRTL ? 'text-right' : ''}`}>
          {task.assignedTo && (
            <div className={`flex items-center gap-2 ${isRTL ? 'flex-row-reverse' : ''}`}>
              <User className="h-4 w-4 text-muted-foreground" />
              <span className="text-muted-foreground">
                مخصص لـ: 
                {task.assignedTo.name || task.assignedTo.email}
              </span>
            </div>
          )}
          {task.dueDate && (
            <div className={`flex items-center gap-2 ${isRTL ? 'flex-row-reverse' : ''} ${isOverdue ? 'text-red-600 dark:text-red-400' : ''}`}>
              <Calendar className="h-4 w-4" />
              <span>
                تاريخ الاستحقاق: 
                {new Intl.DateTimeFormat('en-US', {
                  year: 'numeric',
                  month: 'short',
                  day: '2-digit',
                }).format(new Date(task.dueDate))}
                {isOverdue && ' (متأخر)'}
              </span>
            </div>
          )}
          {task.completedAt && (
            <div className={`flex items-center gap-2 ${isRTL ? 'flex-row-reverse' : ''} text-muted-foreground`}>
              <CheckCircle2 className="h-4 w-4" />
              <span>
                اكتمل في: 
                {new Intl.DateTimeFormat('en-US', {
                  year: 'numeric',
                  month: 'short',
                  day: '2-digit',
                }).format(new Date(task.completedAt))}
              </span>
            </div>
          )}
        </div>
        {showActions && (onStatusChange || onEdit || onDelete) && (
          <div className={`flex items-center gap-2 mt-4 pt-4 border-t ${isRTL ? 'flex-row-reverse justify-end' : ''}`}>
            {onStatusChange && task.status !== TaskStatus.COMPLETED && (
              <Button
                size="sm"
                variant="outline"
                onClick={() => onStatusChange(task.id, TaskStatus.COMPLETED)}
              >
                <CheckCircle2 className="h-4 w-4 mr-1" />
                إكمال
              </Button>
            )}
            {onEdit && (
              <Button size="sm" variant="outline" onClick={() => onEdit(task)}>
                تعديل
              </Button>
            )}
            {onDelete && (
              <Button size="sm" variant="destructive" onClick={() => onDelete(task.id)}>
                حذف
              </Button>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}








