'use client';

import { TimesheetDetailBody } from './TimesheetDetail';
import type { TimeSummary } from '@/lib/clockify';

interface TimesheetDetailPageProps {
  staffName: string;
  summary: TimeSummary;
  startDate: Date;
  endDate: Date;
  locale: string;
}

export function TimesheetDetailPage({
  staffName,
  summary,
  startDate,
  endDate,
  locale,
}: TimesheetDetailPageProps) {
  return (
    <TimesheetDetailBody
      staffName={staffName}
      summary={summary}
      startDate={startDate}
      endDate={endDate}
      locale={locale}
    />
  );
}

