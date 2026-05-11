'use client';

import { Input } from '@jbrtechno/ui';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@jbrtechno/ui';
import { TaskStatus, TaskPriority } from '@jbrtechno/database';
import { Search, X } from 'lucide-react';
import { Button } from '@jbrtechno/ui';

interface TaskFiltersProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  statusFilter: string;
  onStatusFilterChange: (status: string) => void;
  priorityFilter: string;
  onPriorityFilterChange: (priority: string) => void;
  assignedToFilter: string;
  onAssignedToFilterChange: (userId: string) => void;
  users: Array<{ id: string; name: string | null; email: string }>;
  locale?: string;
  showAssignedTo?: boolean;
}

export function TaskFilters({
  searchQuery,
  onSearchChange,
  statusFilter,
  onStatusFilterChange,
  priorityFilter,
  onPriorityFilterChange,
  assignedToFilter,
  onAssignedToFilterChange,
  users,
  locale = 'en',
  showAssignedTo = true,
}: TaskFiltersProps) {
  const isRTL = true;
  const hasFilters =
    searchQuery || (statusFilter && statusFilter !== 'all') || (priorityFilter && priorityFilter !== 'all') || (assignedToFilter && assignedToFilter !== 'all');

  const clearFilters = () => {
    onSearchChange('');
    onStatusFilterChange('all');
    onPriorityFilterChange('all');
    if (showAssignedTo) {
      onAssignedToFilterChange('all');
    }
  };

  return (
    <div className={`space-y-4 ${isRTL ? 'text-right' : ''}`} dir={isRTL ? 'rtl' : 'ltr'}>
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1 relative">
          <Search className={`absolute top-2.5 h-4 w-4 text-muted-foreground ${isRTL ? 'right-3' : 'left-3'}`} />
          <Input
            placeholder={locale === 'ar' ? 'بحث في المهام...' : 'Search tasks...'}
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className={isRTL ? 'pr-9' : 'pl-9'}
          />
        </div>

        <Select value={statusFilter} onValueChange={onStatusFilterChange}>
          <SelectTrigger className="w-full sm:w-[180px]">
            <SelectValue
              placeholder={locale === 'ar' ? 'الحالة' : 'Status'}
            />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">
              {locale === 'ar' ? 'جميع الحالات' : 'All Statuses'}
            </SelectItem>
            <SelectItem value={TaskStatus.PENDING}>
              {locale === 'ar' ? 'قيد الانتظار' : 'Pending'}
            </SelectItem>
            <SelectItem value={TaskStatus.IN_PROGRESS}>
              {locale === 'ar' ? 'قيد التنفيذ' : 'In Progress'}
            </SelectItem>
            <SelectItem value={TaskStatus.COMPLETED}>
              {locale === 'ar' ? 'مكتمل' : 'Completed'}
            </SelectItem>
          </SelectContent>
        </Select>

        <Select value={priorityFilter} onValueChange={onPriorityFilterChange}>
          <SelectTrigger className="w-full sm:w-[180px]">
            <SelectValue
              placeholder={locale === 'ar' ? 'الأولوية' : 'Priority'}
            />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">
              {locale === 'ar' ? 'جميع الأولويات' : 'All Priorities'}
            </SelectItem>
            <SelectItem value={TaskPriority.LOW}>
              {locale === 'ar' ? 'منخفض' : 'Low'}
            </SelectItem>
            <SelectItem value={TaskPriority.MEDIUM}>
              {locale === 'ar' ? 'متوسط' : 'Medium'}
            </SelectItem>
            <SelectItem value={TaskPriority.HIGH}>
              {locale === 'ar' ? 'عالي' : 'High'}
            </SelectItem>
          </SelectContent>
        </Select>

        {showAssignedTo && (
          <Select
            value={assignedToFilter}
            onValueChange={onAssignedToFilterChange}
          >
            <SelectTrigger className="w-full sm:w-[180px]">
              <SelectValue
                placeholder={locale === 'ar' ? 'مخصص لـ' : 'Assigned To'}
              />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">
                {locale === 'ar' ? 'جميع المستخدمين' : 'All Users'}
              </SelectItem>
              {users.map((user) => (
                <SelectItem key={user.id} value={user.id}>
                  {user.name || user.email}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}

        {hasFilters && (
          <Button
            variant="outline"
            size="icon"
            onClick={clearFilters}
            title={locale === 'ar' ? 'مسح الفلاتر' : 'Clear filters'}
          >
            <X className="h-4 w-4" />
          </Button>
        )}
      </div>
    </div>
  );
}








