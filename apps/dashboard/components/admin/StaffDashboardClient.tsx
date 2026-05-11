'use client';

import { Button } from '@jbrtechno/ui';
import { CheckCircle2 } from 'lucide-react';
import { useState, useTransition } from 'react';
import { useParams } from 'next/navigation';

interface StaffDashboardClientProps {
  noteId?: string;
  taskId?: string;
  userId: string;
  currentStatus?: string;
  onMarkAsRead?: (noteId: string, userId: string) => Promise<{ success: boolean; error?: string }>;
  onUpdateTaskStatus?: (
    taskId: string,
    status: string,
    userId: string
  ) => Promise<{ success: boolean; error?: string }>;
}

export function StaffDashboardClient({
  noteId,
  taskId,
  userId,
  currentStatus,
  onMarkAsRead,
  onUpdateTaskStatus,
}: StaffDashboardClientProps) {
  const params = useParams();
  const locale = (params.locale as string) || 'ar';
  const isArabic = true;
  const [isPending, startTransition] = useTransition();
  const [isRead, setIsRead] = useState(false);
  const [taskStatus, setTaskStatus] = useState(currentStatus || 'PENDING');

  const handleMarkAsRead = () => {
    if (!noteId || !onMarkAsRead || isRead) return;

    startTransition(async () => {
      const result = await onMarkAsRead(noteId, userId);
      if (result.success) {
        setIsRead(true);
      }
    });
  };

  const handleUpdateTaskStatus = (newStatus: string) => {
    if (!taskId || !onUpdateTaskStatus) return;

    startTransition(async () => {
      const result = await onUpdateTaskStatus(taskId, newStatus, userId);
      if (result.success) {
        setTaskStatus(newStatus);
      }
    });
  };

  if (noteId) {
    return (
      <Button
        variant="outline"
        size="sm"
        onClick={handleMarkAsRead}
        disabled={isPending || isRead}
        className="w-full sm:w-auto"
      >
        <CheckCircle2 className="h-4 w-4 mr-2" />
        {isRead
          ? isArabic
            ? 'تم القراءة'
            : 'Read'
          : isArabic
            ? 'تمييز كمقروء'
            : 'Mark as read'}
      </Button>
    );
  }

  if (taskId) {
    return (
      <div className="flex gap-2 flex-wrap">
        {taskStatus !== 'COMPLETED' && (
          <Button
            variant="default"
            size="sm"
            onClick={() => handleUpdateTaskStatus('COMPLETED')}
            disabled={isPending}
            className="flex-1 sm:flex-initial"
          >
            <CheckCircle2 className="h-4 w-4 mr-2" />
            {isArabic ? 'إكمال' : 'Mark Complete'}
          </Button>
        )}
        {taskStatus === 'PENDING' && (
          <Button
            variant="outline"
            size="sm"
            onClick={() => handleUpdateTaskStatus('IN_PROGRESS')}
            disabled={isPending}
            className="flex-1 sm:flex-initial"
          >
            {isArabic ? 'بدء العمل' : 'Start Work'}
          </Button>
        )}
      </div>
    );
  }

  return null;
}








