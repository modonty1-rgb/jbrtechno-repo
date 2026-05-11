'use client';

import { useState, useMemo } from 'react';
import { Card, CardContent } from '@jbrtechno/ui';
import { Badge } from '@jbrtechno/ui';
import { Input } from '@jbrtechno/ui';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@jbrtechno/ui';
import { InterviewCard } from './InterviewCard';
import {
  CalendarClock,
  AlertCircle,
  Search,
  CheckCircle2,
  XCircle,
  Clock,
  TrendingUp,
} from 'lucide-react';
import { formatDateTimeWithArabicTime } from '@/helpers/formatDateTime';
import { groupInterviewsByDate, DayGroup } from '@/helpers/groupInterviewsByDate';

interface Interview {
  id: string;
  applicantName: string;
  position: string;
  phone: string;
  profileImageUrl: string;
  scheduledInterviewDate: Date | string | null;
  interviewResponseSubmittedAt: Date | string | null;
  appointmentConfirmed?: boolean;
  lastSalary?: string | null;
  expectedSalary?: string | null;
  interviewResult?: {
    result: 'PASSED' | 'FAILED' | 'PENDING';
  } | null;
}

interface InterviewsPageClientProps {
  interviews: Interview[];
  statistics: {
    total: number;
    upcoming: number;
    passed: number;
    failed: number;
    pending: number;
  };
  locale: string;
}

export function InterviewsPageClient({
  interviews,
  statistics,
  locale,
}: InterviewsPageClientProps) {
  const isArabic = true;
  const [searchQuery, setSearchQuery] = useState('');
  const [resultFilter, setResultFilter] = useState<string>('all');
  const [sortBy, setSortBy] = useState<string>('date-desc');

  const filteredAndSortedInterviews = useMemo(() => {
    let filtered = interviews;

    // Search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (interview) =>
          interview.applicantName.toLowerCase().includes(query) ||
          interview.position.toLowerCase().includes(query)
      );
    }

    // Result filter
    if (resultFilter !== 'all') {
      filtered = filtered.filter((interview) => {
        if (resultFilter === 'no-result') {
          return !interview.interviewResult;
        }
        return interview.interviewResult?.result === resultFilter;
      });
    }

    // Sort
    const sorted = [...filtered].sort((a, b) => {
      if (sortBy === 'date-desc') {
        const dateA = a.scheduledInterviewDate
          ? new Date(a.scheduledInterviewDate).getTime()
          : 0;
        const dateB = b.scheduledInterviewDate
          ? new Date(b.scheduledInterviewDate).getTime()
          : 0;
        return dateB - dateA;
      } else if (sortBy === 'date-asc') {
        const dateA = a.scheduledInterviewDate
          ? new Date(a.scheduledInterviewDate).getTime()
          : 0;
        const dateB = b.scheduledInterviewDate
          ? new Date(b.scheduledInterviewDate).getTime()
          : 0;
        return dateA - dateB;
      } else if (sortBy === 'name-asc') {
        return a.applicantName.localeCompare(b.applicantName);
      } else if (sortBy === 'name-desc') {
        return b.applicantName.localeCompare(a.applicantName);
      }
      return 0;
    });

    return sorted;
  }, [interviews, searchQuery, resultFilter, sortBy]);

  // Group filtered interviews by date
  const dayGroups = useMemo(() => {
    return groupInterviewsByDate(filteredAndSortedInterviews, locale);
  }, [filteredAndSortedInterviews, locale]);

  return (
    <div className="space-y-6">
      {/* Statistics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        <Card className="border-primary/20 bg-gradient-to-br from-primary/5 to-transparent">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">
                  {isArabic ? 'إجمالي المقابلات' : 'Total Interviews'}
                </p>
                <p className="text-3xl font-bold mt-1 text-primary">{statistics.total}</p>
              </div>
              <CalendarClock className="h-8 w-8 text-primary" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-blue-200 dark:border-blue-800 bg-gradient-to-br from-blue-50 to-transparent dark:from-blue-950/20">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">
                  {isArabic ? 'قادمة' : 'Upcoming'}
                </p>
                <p className="text-3xl font-bold mt-1 text-blue-600">{statistics.upcoming}</p>
              </div>
              <TrendingUp className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-green-200 dark:border-green-800 bg-gradient-to-br from-green-50 to-transparent dark:from-green-950/20">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">
                  {isArabic ? 'نجح' : 'Passed'}
                </p>
                <p className="text-3xl font-bold mt-1 text-green-600">{statistics.passed}</p>
              </div>
              <CheckCircle2 className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-red-200 dark:border-red-800 bg-gradient-to-br from-red-50 to-transparent dark:from-red-950/20">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">
                  {isArabic ? 'فشل' : 'Failed'}
                </p>
                <p className="text-3xl font-bold mt-1 text-red-600">{statistics.failed}</p>
              </div>
              <XCircle className="h-8 w-8 text-red-600" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-yellow-200 dark:border-yellow-800 bg-gradient-to-br from-yellow-50 to-transparent dark:from-yellow-950/20">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">
                  {isArabic ? 'قيد المراجعة' : 'Pending'}
                </p>
                <p className="text-3xl font-bold mt-1 text-yellow-600">{statistics.pending}</p>
              </div>
              <Clock className="h-8 w-8 text-yellow-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters and Search */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className={`absolute top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground ${isArabic ? 'right-3' : 'left-3'}`} />
              <Input
                type="text"
                placeholder={isArabic ? 'البحث بالاسم أو الوظيفة...' : 'Search by name or position...'}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className={isArabic ? 'pr-10' : 'pl-10'}
              />
            </div>
            <Select value={resultFilter} onValueChange={setResultFilter}>
              <SelectTrigger className="w-full sm:w-[180px]">
                <SelectValue placeholder={isArabic ? 'فلترة النتيجة' : 'Filter by result'} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{isArabic ? 'الكل' : 'All'}</SelectItem>
                <SelectItem value="no-result">{isArabic ? 'بدون نتيجة' : 'No Result'}</SelectItem>
                <SelectItem value="PASSED">{isArabic ? 'نجح' : 'Passed'}</SelectItem>
                <SelectItem value="FAILED">{isArabic ? 'فشل' : 'Failed'}</SelectItem>
                <SelectItem value="PENDING">{isArabic ? 'قيد المراجعة' : 'Pending'}</SelectItem>
              </SelectContent>
            </Select>
            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger className="w-full sm:w-[180px]">
                <SelectValue placeholder={isArabic ? 'ترتيب حسب' : 'Sort by'} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="date-desc">
                  {isArabic ? 'التاريخ (الأحدث)' : 'Date (Newest)'}
                </SelectItem>
                <SelectItem value="date-asc">
                  {isArabic ? 'التاريخ (الأقدم)' : 'Date (Oldest)'}
                </SelectItem>
                <SelectItem value="name-asc">
                  {isArabic ? 'الاسم (أ-ي)' : 'Name (A-Z)'}
                </SelectItem>
                <SelectItem value="name-desc">
                  {isArabic ? 'الاسم (ي-أ)' : 'Name (Z-A)'}
                </SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Results Count */}
      {filteredAndSortedInterviews.length !== interviews.length && (
        <div className="text-sm text-muted-foreground">
          {isArabic
            ? `عرض ${filteredAndSortedInterviews.length} من ${interviews.length} مقابلة`
            : `Showing ${filteredAndSortedInterviews.length} of ${interviews.length} interviews`}
        </div>
      )}

      {/* Interview Cards by Day */}
      {dayGroups.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-16 text-center">
            <AlertCircle className="h-16 w-16 text-muted-foreground mb-4" />
            <p className="text-lg font-medium text-foreground mb-2">
              {isArabic ? 'لا توجد مقابلات' : 'No interviews found'}
            </p>
            <p className="text-sm text-muted-foreground">
              {searchQuery || resultFilter !== 'all'
                ? isArabic
                  ? 'جرب تغيير معايير البحث أو الفلترة'
                  : 'Try adjusting your search or filter criteria'
                : isArabic
                ? 'لا توجد مقابلات مجدولة حتى الآن'
                : 'No scheduled interviews yet'}
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-6">
          {dayGroups.map((dayGroup) => (
            <div key={dayGroup.dateKey} className="space-y-4">
              {/* Day Section Header */}
              <div className="flex items-center justify-between pb-2 border-b-2 border-border/50">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-primary/10">
                    <CalendarClock className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-foreground">
                      {dayGroup.dayName}
                    </h2>
                    <p className="text-sm text-muted-foreground mt-0.5">
                      {dayGroup.formattedDate}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant="secondary" className="text-sm font-semibold px-3 py-1">
                    {dayGroup.interviews.length} {isArabic ? 'مقابلة' : dayGroup.interviews.length === 1 ? 'interview' : 'interviews'}
                  </Badge>
                  <Badge variant="outline" className="text-sm font-semibold px-3 py-1 border-green-500/50 text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-950/20">
                    {isArabic ? 'مؤكدة' : 'Confirmed'}: {dayGroup.interviews.filter((i) => i.appointmentConfirmed).length}
                  </Badge>
                </div>
              </div>

              {/* Interview Cards for this day */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {dayGroup.interviews.map((interview) => (
                  <InterviewCard
                    key={interview.id}
                    application={{
                      id: interview.id,
                      applicantName: interview.applicantName,
                      position: interview.position,
                      phone: interview.phone,
                      profileImageUrl: interview.profileImageUrl,
                      scheduledInterviewDate: interview.scheduledInterviewDate,
                      interviewResponseSubmittedAt: interview.interviewResponseSubmittedAt,
                      appointmentConfirmed: interview.appointmentConfirmed,
                      lastSalary: interview.lastSalary,
                      expectedSalary: interview.expectedSalary,
                    }}
                    interviewResult={interview.interviewResult || null}
                    locale={locale}
                  />
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
















