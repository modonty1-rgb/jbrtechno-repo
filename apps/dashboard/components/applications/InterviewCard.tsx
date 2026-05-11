'use client';

import { useState, useTransition } from 'react';
import { Card, CardContent, CardHeader, CardFooter } from '@jbrtechno/ui';
import { Badge } from '@jbrtechno/ui';
import { buttonVariants } from '@jbrtechno/ui';
import { Checkbox } from '@jbrtechno/ui';
import {
  CalendarClock,
  User,
  Briefcase,
  CheckCircle2,
  XCircle,
  Clock,
  FileText,
  ArrowRight,
  Send,
  DollarSign,
  TrendingUp,
  Phone,
} from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import { formatTimeWithArabicTime, formatDateTimeWithArabicTime } from '@/helpers/formatDateTime';
import { cn } from '@jbrtechno/shared';
import { updateAppointmentConfirmed } from '@/actions/updateApplicationStatus';

interface InterviewCardProps {
  application: {
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
  };
  interviewResult?: {
    result: 'PASSED' | 'FAILED' | 'PENDING';
  } | null;
  locale: string;
}

export function InterviewCard({ application, interviewResult, locale }: InterviewCardProps) {
  const isArabic = true;
  const hasScheduled = !!application.scheduledInterviewDate;
  const hasResponse = !!application.interviewResponseSubmittedAt;
  const [isConfirmed, setIsConfirmed] = useState(application.appointmentConfirmed ?? false);
  const [isPending, startTransition] = useTransition();

  const isUpcoming = hasScheduled && application.scheduledInterviewDate
    ? new Date(application.scheduledInterviewDate) >= new Date()
    : false;

  const handleConfirmationChange = (checked: boolean) => {
    setIsConfirmed(checked);
    startTransition(async () => {
      await updateAppointmentConfirmed(application.id, checked);
    });
  };

  const getResultBadge = () => {
    if (!interviewResult) {
      return (
        <Badge variant="outline" className="bg-muted/50 text-muted-foreground border-dashed">
          <Clock className="h-3 w-3 mr-1" />
          {isArabic ? 'بدون نتيجة' : 'No Result'}
        </Badge>
      );
    }

    const resultConfig = {
      PASSED: {
        label: isArabic ? 'نجح' : 'Passed',
        className: 'bg-gradient-to-r from-green-500/20 to-green-600/10 text-green-700 dark:text-green-400 border-green-500/30 shadow-sm',
        icon: CheckCircle2,
      },
      FAILED: {
        label: isArabic ? 'فشل' : 'Failed',
        className: 'bg-gradient-to-r from-red-500/20 to-red-600/10 text-red-700 dark:text-red-400 border-red-500/30 shadow-sm',
        icon: XCircle,
      },
      PENDING: {
        label: isArabic ? 'قيد المراجعة' : 'Pending',
        className: 'bg-gradient-to-r from-yellow-500/20 to-yellow-600/10 text-yellow-700 dark:text-yellow-400 border-yellow-500/30 shadow-sm',
        icon: Clock,
      },
    };

    const config = resultConfig[interviewResult.result];
    const Icon = config.icon;

    return (
      <Badge className={cn('flex items-center gap-1.5 px-2.5 py-1 font-semibold', config.className)}>
        <Icon className="h-3.5 w-3.5" />
        {config.label}
      </Badge>
    );
  };

  return (
    <Card className={cn(
      "relative overflow-hidden border-2 bg-gradient-to-br from-card via-card/95 to-card/90",
      isConfirmed 
        ? "border-green-500/60 shadow-green-500/20 shadow-lg" 
        : "border-border/50"
    )}>
      {/* Status indicator bar */}
      {isUpcoming && (
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-500 via-primary to-blue-500" />
      )}

      {/* Card Header */}
      <CardHeader className="pb-3 relative z-10">
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1 min-w-0">
            {/* Applicant Name with Confirmation Checkbox */}
            <div className="flex items-center gap-2 mb-2">
              <h3 className="font-bold text-xl line-clamp-1 flex-1">
                {application.applicantName}
              </h3>
              <div className="flex items-center gap-2 flex-shrink-0">
                <Checkbox
                  id={`confirm-${application.id}`}
                  checked={isConfirmed}
                  onCheckedChange={handleConfirmationChange}
                  disabled={isPending}
                  className={cn(
                    "h-4 w-4",
                    isConfirmed && "border-green-500 data-[state=checked]:bg-green-500"
                  )}
                />
                <label
                  htmlFor={`confirm-${application.id}`}
                  className={cn(
                    "text-xs font-medium cursor-pointer select-none",
                    isConfirmed 
                      ? "text-green-600 dark:text-green-400" 
                      : "text-muted-foreground"
                  )}
                >
                  {isArabic ? 'مؤكد' : 'Confirmed'}
                </label>
              </div>
            </div>
            {/* Job Title */}
            <div className="flex items-center gap-2 w-full px-2.5 py-1.5 rounded-lg bg-primary/10 border border-primary/20 mb-2">
              <div className="p-1 rounded-md bg-primary/20 flex-shrink-0">
                <Briefcase className="h-3.5 w-3.5 text-primary" />
              </div>
              <span className="text-sm font-semibold text-foreground break-words flex-1">
                {application.position}
              </span>
            </div>
            {/* Interview Time - Prominent Display */}
            {hasScheduled && (
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-gradient-to-r from-primary/20 to-primary/10 border-2 border-primary/40 shadow-sm">
                <CalendarClock className="h-4 w-4 text-primary" />
                <span className="text-base font-bold text-primary">
                  {formatTimeWithArabicTime(application.scheduledInterviewDate!)}
                </span>
              </div>
            )}
          </div>
          {getResultBadge()}
        </div>
      </CardHeader>

      {/* Card Content */}
      <CardContent className="relative z-10">
        <div className="flex items-start gap-4">
          {/* Profile Image */}
          <div className="relative flex-shrink-0">
            <div className="relative">
              <div className={cn(
                "w-20 h-20 rounded-2xl overflow-hidden border-2 shadow-lg",
                isUpcoming 
                  ? "border-blue-400/50 ring-2 ring-blue-500/20"
                  : "border-primary/30 ring-2 ring-primary/10"
              )}>
                <Image
                  src={application.profileImageUrl}
                  alt={application.applicantName}
                  width={80}
                  height={80}
                  className="object-cover w-full h-full"
                />
              </div>
              {isUpcoming && (
                <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-blue-500 rounded-full border-2 border-background flex items-center justify-center">
                  <div className="w-2 h-2 bg-white rounded-full animate-pulse" />
                </div>
              )}
            </div>
          </div>

          <div className="flex-1 min-w-0 space-y-2">
            {/* Phone Number */}
            <div className="flex items-center gap-2 p-2 rounded-lg bg-purple-50/50 dark:bg-purple-950/20 border border-purple-200/50 dark:border-purple-800/50">
              <Phone className="h-4 w-4 text-purple-600 dark:text-purple-400 flex-shrink-0" />
              <div className="flex-1 min-w-0">
                <p className="text-xs font-medium text-foreground">
                  {application.phone}
                </p>
              </div>
            </div>

            {hasResponse && (
              <div className="flex items-center gap-2 p-2 rounded-lg bg-blue-50/50 dark:bg-blue-950/20 border border-blue-200/50 dark:border-blue-800/50">
                <Send className="h-4 w-4 text-blue-600 dark:text-blue-400 flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-medium text-foreground">
                    {formatDateTimeWithArabicTime(
                      application.interviewResponseSubmittedAt!,
                      { month: 'numeric', day: 'numeric' }
                    )}
                  </p>
                </div>
              </div>
            )}

            {/* Financial Information */}
            {(application.lastSalary || application.expectedSalary) && (
              <div className="space-y-1.5 p-2.5 rounded-lg bg-gradient-to-br from-emerald-50/50 to-emerald-100/30 dark:from-emerald-950/20 dark:to-emerald-900/10 border border-emerald-200/50 dark:border-emerald-800/50">
                <div className="flex items-center gap-1.5 mb-1.5">
                  <DollarSign className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400" />
                  <span className="text-xs font-semibold text-emerald-700 dark:text-emerald-400">
                    {isArabic ? 'المعلومات المالية' : 'Financial'}
                  </span>
                </div>
                <div className="space-y-1">
                  {application.lastSalary && (
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-muted-foreground">
                        {isArabic ? 'السابق' : 'Last'}
                      </span>
                      <span className="font-semibold text-foreground">
                        {application.lastSalary}
                      </span>
                    </div>
                  )}
                  {application.expectedSalary && (
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-muted-foreground flex items-center gap-1">
                        <TrendingUp className="h-3 w-3" />
                        {isArabic ? 'المتوقع' : 'Expected'}
                      </span>
                      <span className="font-bold text-emerald-600 dark:text-emerald-400">
                        {application.expectedSalary}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </CardContent>

      {/* Card Footer */}
      <CardFooter className="relative z-10 pt-0">
        <div className="flex items-center gap-2 w-full">
              <Link
                href={`/applications/${application.id}`}
                className={cn(
                  buttonVariants({ variant: 'outline', size: 'sm' }),
                  'flex-1'
                )}
              >
            <User className={`h-4 w-4 ${isArabic ? 'ml-2' : 'mr-2'}`} />
            <span className="font-medium">{isArabic ? 'التفاصيل' : 'Details'}</span>
          </Link>

              <Link
                href={`/applications/interview-result/${application.id}`}
                className={cn(
                  buttonVariants({
                    variant: interviewResult ? 'secondary' : 'default',
                    size: 'sm',
                  }),
                  'flex-1 shadow-sm'
                )}
              >
            <FileText className={`h-4 w-4 ${isArabic ? 'ml-2' : 'mr-2'}`} />
                <span className="font-medium">
                  {isArabic ? 'النتيجة' : 'Result'}
                </span>
          </Link>
        </div>
      </CardFooter>

    </Card>
  );
}
















