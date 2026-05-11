'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@jbrtechno/ui';
import { CalendarClock } from 'lucide-react';

interface FilterInterviewDropdownProps {
  locale: string;
  currentValue?: string;
}

export function FilterInterviewDropdown({ locale, currentValue = 'all' }: FilterInterviewDropdownProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const isArabic = true;

  const handleFilterChange = (value: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (value === 'all') {
      params.delete('interviewFilter');
    } else {
      params.set('interviewFilter', value);
    }
    router.push(`?${params.toString()}`);
  };

  return (
    <div className="flex items-center gap-2">
      <CalendarClock className="h-4 w-4 text-muted-foreground" />
      <Select value={currentValue} onValueChange={handleFilterChange}>
        <SelectTrigger className="w-[200px]">
          <SelectValue placeholder={isArabic ? 'فلترة حسب الموعد' : 'Filter by appointment'} />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">
            {isArabic ? 'الكل' : 'All'}
          </SelectItem>
          <SelectItem value="has">
            {isArabic ? 'لديهم موعد' : 'Has appointment'}
          </SelectItem>
          <SelectItem value="not-yet">
            {isArabic ? 'لم يحصلوا على موعد بعد' : 'Not yet get appointment'}
          </SelectItem>
        </SelectContent>
      </Select>
    </div>
  );
}
















