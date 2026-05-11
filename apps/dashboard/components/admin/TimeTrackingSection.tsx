'use client';

import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@jbrtechno/ui';
import { Button } from '@jbrtechno/ui';
import { Clock, Eye } from 'lucide-react';

interface TimeTrackingSummary {
  staffId: string;
  staffName: string;
  clockifyUserId: string | null;
  totalHours: number;
  error?: string;
}

interface TimeTrackingSectionProps {
  summaries: TimeTrackingSummary[];
  startDate: Date;
  endDate: Date;
  locale: string;
}

function formatHours(hours: number): string {
  const h = Math.floor(hours);
  const m = Math.floor((hours - h) * 60);
  if (h > 0) {
    return `${h}h ${m}m`;
  }
  return `${m}m`;
}

export function TimeTrackingSection({
  summaries,
  startDate,
  endDate,
  locale,
}: TimeTrackingSectionProps) {
  const isArabic = true;

  const totalHours = summaries.reduce((sum, s) => sum + (s.totalHours || 0), 0);
  const staffWithHours = summaries.filter((s) => s.totalHours > 0 && !s.error);
  const staffWithErrors = summaries.filter((s) => s.error);

  return (
    <>
      <div className="space-y-4">
        <div>
          <div className="flex items-center justify-between gap-4">
            <div>
              <h2 className="text-2xl font-bold tracking-tight">
                {isArabic ? 'تتبع الوقت' : 'Time Tracking'}
              </h2>
              <p className="text-muted-foreground mt-1">
                {isArabic
                  ? 'عرض ساعات العمل لكل موظف'
                  : 'View worked hours for each staff member'}
              </p>
            </div>
          </div>
        </div>

        {/* Total Hours Card */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <Clock className="h-4 w-4" />
              {isArabic ? 'إجمالي الساعات (الشهر الحالي)' : 'Total Hours (Current Month)'}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-bold">{formatHours(totalHours)}</span>
              <span className="text-sm text-muted-foreground">
                ({staffWithHours.length} {isArabic ? 'موظف' : staffWithHours.length === 1 ? 'staff member' : 'staff members'})
              </span>
            </div>
          </CardContent>
        </Card>

        {/* Staff Hours List */}
        {staffWithHours.length > 0 && (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {staffWithHours.map((summary) => (
              <Card
                key={summary.staffId}
                className="hover:shadow-md transition-shadow cursor-pointer"
              >
                <CardHeader className="pb-3">
                  <CardTitle className="text-base font-medium">
                    {summary.staffName}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between">
                    <div className="flex items-baseline gap-2">
                      <span className="text-2xl font-bold">
                        {formatHours(summary.totalHours)}
                      </span>
                    </div>
                    <Link href={`/time-tracking/${summary.staffId}`}>
                      <Button
                        size="sm"
                        variant="outline"
                      >
                        <Eye className="h-4 w-4 mr-2" />
                        {isArabic ? 'عرض' : 'View'}
                      </Button>
                    </Link>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {staffWithHours.length === 0 && (
          <Card>
            <CardContent className="py-8 text-center text-muted-foreground">
              {isArabic
                ? 'لا توجد ساعات عمل مسجلة في هذا الشهر'
                : 'No working hours recorded for this month'}
            </CardContent>
          </Card>
        )}

        {staffWithErrors.length > 0 && (
          <Card className="border-yellow-500">
            <CardHeader>
              <CardTitle className="text-sm text-yellow-600 dark:text-yellow-400">
                {isArabic ? 'تحذيرات' : 'Warnings'}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-1 text-sm text-muted-foreground">
                {staffWithErrors.map((summary) => (
                  <li key={summary.staffId}>
                    {summary.staffName}: {summary.error}
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        )}
      </div>
    </>
  );
}




