'use client';

import { useState, useTransition } from 'react';
import { Badge } from '@jbrtechno/ui';
import { updateRequirementStatus, RequirementStatus } from '@/actions/updateRequirementStatus';
import { Loader2, ChevronDown, Check } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@jbrtechno/ui';

interface InteractiveStatusBadgeProps {
  id: string;
  status: RequirementStatus;
  isArabic: boolean;
}

export function InteractiveStatusBadge({ id, status, isArabic }: InteractiveStatusBadgeProps) {
  const [currentStatus, setCurrentStatus] = useState<RequirementStatus>(status);
  const [isPending, startTransition] = useTransition();
  const [showSuccess, setShowSuccess] = useState(false);
  const [isOpen, setIsOpen] = useState(false);

  const statusOptions: { value: RequirementStatus; label: string; color: string }[] = [
    {
      value: 'PENDING',
      label: isArabic ? 'معلق' : 'Pending',
      color: 'text-orange-600 dark:text-orange-400',
    },
    {
      value: 'IN_PROGRESS',
      label: isArabic ? 'قيد التنفيذ' : 'In Progress',
      color: 'text-blue-600 dark:text-blue-400',
    },
    {
      value: 'COMPLETED',
      label: isArabic ? 'مكتمل' : 'Completed',
      color: 'text-green-600 dark:text-green-400',
    },
  ];

  const statusConfig = {
    COMPLETED: {
      label: isArabic ? 'مكتمل' : 'Completed',
      variant: 'default' as const,
      className: 'bg-green-500/20 text-green-700 dark:text-green-400 border-green-500/30',
    },
    IN_PROGRESS: {
      label: isArabic ? 'قيد التنفيذ' : 'In Progress',
      variant: 'secondary' as const,
      className: 'bg-blue-500/20 text-blue-700 dark:text-blue-400 border-blue-500/30',
    },
    PENDING: {
      label: isArabic ? 'معلق' : 'Pending',
      variant: 'outline' as const,
      className: 'bg-orange-500/10 text-orange-700 dark:text-orange-400 border-orange-500/30',
    },
  };

  const config = statusConfig[currentStatus];

  const handleStatusChange = (newStatus: RequirementStatus) => {
    if (newStatus === currentStatus) {
      setIsOpen(false);
      return;
    }

    startTransition(async () => {
      setCurrentStatus(newStatus);
      setIsOpen(false);
      const result = await updateRequirementStatus(id, newStatus);

      if (result.success) {
        setShowSuccess(true);
        setTimeout(() => setShowSuccess(false), 1000);
      } else {
        setCurrentStatus(currentStatus);
        console.error('Failed to update status:', result.error);
      }
    });
  };

  return (
    <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
      <DropdownMenuTrigger
        disabled={isPending}
        className={`relative group ${showSuccess ? 'scale-110' : ''} transition-transform duration-200 focus:outline-none`}
        onClick={(e) => e.stopPropagation()}
      >
        <Badge
          variant={config.variant}
          className={`text-xs ${config.className} cursor-pointer hover:scale-105 hover:shadow-md transition-all ${isPending ? 'opacity-50' : ''
            } ${showSuccess ? 'ring-2 ring-primary' : ''} flex items-center gap-1`}
        >
          {isPending ? (
            <>
              <Loader2 className="h-3 w-3 animate-spin" />
              {config.label}
            </>
          ) : (
            <>
              {config.label}
              <ChevronDown className="h-3 w-3" />
            </>
          )}
        </Badge>
      </DropdownMenuTrigger>
      <DropdownMenuContent align={isArabic ? 'end' : 'start'} className="min-w-[140px]">
        {statusOptions.map((option) => (
          <DropdownMenuItem
            key={option.value}
            onClick={() => handleStatusChange(option.value)}
            className={`cursor-pointer ${option.color} flex items-center justify-between`}
          >
            <span>{option.label}</span>
            {currentStatus === option.value && <Check className="h-4 w-4" />}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
















