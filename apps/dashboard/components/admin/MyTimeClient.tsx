'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@jbrtechno/ui';
import { Clock } from 'lucide-react';
import type { TimeSummary } from '@/lib/clockify';
import { TimesheetDetailPage } from './TimesheetDetailPage';

interface MyTimeClientProps {
  summary: TimeSummary | null;
  staffName: string;
  startDate: string; // ISO string
  endDate: string;   // ISO string
  locale: string;
}

export function MyTimeClient({ summary, staffName, startDate, endDate, locale }: MyTimeClientProps) {
  const isArabic = true;
  const start = new Date(startDate);
  const end = new Date(endDate);

  return (
    <div className="container mx-auto px-4 py-6 max-w-4xl space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between gap-2 flex-wrap">
            <div>
              <CardTitle className="flex items-center gap-2 text-2xl font-bold">
                <Clock className="h-6 w-6" />
                {isArabic ? 'سجل وقتي' : 'My Time'}
              </CardTitle>
              <p className="text-muted-foreground mt-1 text-sm">
                {isArabic
                  ? 'عرض ساعات عملك وتفاصيل السجل الزمني لهذا الشهر'
                  : 'View your worked hours and detailed time entries for this month.'}
              </p>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {!summary && (
            <p className="text-sm text-muted-foreground" dir={isArabic ? 'rtl' : 'ltr'}>
              {isArabic
                ? 'لا توجد بيانات وقت مسجلة لهذا الشهر أو لم يتم ربط حسابك بـ Clockify بعد.'
                : 'No time data found for this month, or your account is not linked to Clockify yet.'}
            </p>
          )}
        </CardContent>
      </Card>

      {summary && (
        <TimesheetDetailPage
          staffName={staffName}
          summary={summary}
          startDate={start}
          endDate={end}
          locale={locale}
        />
      )}
    </div>
  );
}


