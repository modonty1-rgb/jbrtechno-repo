import { Application } from '@jbrtechno/database';
import { Card, CardContent, CardHeader } from '@jbrtechno/ui';
import { ApplicationStatusBadge } from './ApplicationStatusBadge';
import { Badge } from '@jbrtechno/ui';
import {
  Mail,
  Phone,
  Calendar,
  Briefcase,
  FileText,
  ExternalLink,
  User,
  MapPin,
  CalendarClock,
  Languages,
  ShieldCheck,
  DollarSign,
  TrendingUp,
  CheckCircle2,
  XCircle,
} from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import { Button } from '@jbrtechno/ui';
import { getCVFileType } from '@/lib/applications';
import { cn } from '@jbrtechno/shared';
import { formatTimeWithArabicTime } from '@/helpers/formatDateTime';

type ExtendedApplication = Application & {
  availabilityDate?: Date | string | null;
  currentLocation?: string | null;
  arabicProficiency?: string | null;
  englishProficiency?: string | null;
  consentToDataUsage?: boolean | null;
  lastSalary?: string | null;
  expectedSalary?: string | null;
  interviewResponseSubmittedAt?: Date | string | null;
  scheduledInterviewDate?: Date | string | null;
};

interface ApplicationCardProps {
  application: ExtendedApplication;
  locale: string;
}

export function ApplicationCard({ application, locale }: ApplicationCardProps) {
  const formattedDate = new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  }).format(new Date(application.createdAt));

  const formattedAvailability = application.availabilityDate
    ? new Intl.DateTimeFormat('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      }).format(new Date(application.availabilityDate))
    : null;

  const languageLabel = (value: string | null | undefined) => {
    if (!value) return null;
    const map: Record<string, string> = {
      excellent: 'ممتاز',
      very_good: 'جيد جدًا',
      good: 'جيد',
      fair: 'مقبول',
    };
    return map[value] ?? value;
  };

  const hasValidInterviewDate = (date: Date | string | null | undefined): boolean => {
    if (!date) return false;
    if (date === 'null' || date === 'undefined') return false;
    if (typeof date === 'string' && date.trim() === '') return false;
    try {
      const parsedDate = new Date(date);
      return !isNaN(parsedDate.getTime());
    } catch {
      return false;
    }
  };

  const hasNewInterviewResponse = Boolean(application.interviewResponseSubmittedAt);
  const hasInterview = hasValidInterviewDate(application.scheduledInterviewDate);

  return (
    <Card
      className={cn(
        'hover:shadow-lg transition-shadow',
        hasInterview && 'border-2 border-purple-500',
        !hasInterview && hasNewInterviewResponse && 'border-2 border-green-500'
      )}
    >
      <div className="px-6 pt-4 pb-2">
        <div className="flex items-center justify-center gap-2 mb-3">
          {hasNewInterviewResponse ? (
            <div className="flex items-center gap-2 text-green-600">
              <CheckCircle2 className="h-5 w-5" />
              <span className="text-sm font-medium">
                تم الرد
              </span>
            </div>
          ) : (
            <div className="flex items-center gap-2 text-muted-foreground">
              <XCircle className="h-5 w-5" />
              <span className="text-sm font-medium">
                لم يتم الرد
              </span>
            </div>
          )}
        </div>
        {application.status === 'ACCEPTED' && (
          <div className="flex items-center justify-center gap-1.5 text-xs mb-2">
            {hasValidInterviewDate(application.scheduledInterviewDate) ? (
              <>
                <CalendarClock className="h-3.5 w-3.5 text-primary" />
                <span className="text-muted-foreground font-medium">
                  {`${new Intl.DateTimeFormat('en-US', {
                      month: 'short',
                      day: 'numeric',
                    }).format(new Date(application.scheduledInterviewDate!))} - ${formatTimeWithArabicTime(application.scheduledInterviewDate!)}`}
                </span>
              </>
            ) : (
              <>
                <CalendarClock className="h-3.5 w-3.5 text-muted-foreground" />
                <span className="text-muted-foreground italic">
                  لم يتم تحديد موعد بعد
                </span>
              </>
            )}
          </div>
        )}
        <ApplicationStatusBadge
          status={application.status}
          locale={locale}
          className="w-full justify-center py-2 text-sm"
        />
      </div>
      <CardHeader className="pt-4 pb-3">
        <div className="flex items-start gap-4">
          <div className="flex items-start gap-3 flex-1">
            {/* Profile Image */}
            <div className="flex-shrink-0">
              {application.profileImageUrl ? (
                <div className="relative w-16 h-16 rounded-full overflow-hidden border-2 border-primary/20">
                  <Image
                    src={application.profileImageUrl}
                    alt={application.applicantName}
                    fill
                    className="object-cover"
                  />
                </div>
              ) : (
                <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center">
                  <User className="h-8 w-8 text-muted-foreground" />
                </div>
              )}
            </div>

            {/* Info */}
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold text-lg mb-1 truncate">{application.applicantName}</h3>
              <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
                <Briefcase className="h-4 w-4 flex-shrink-0" />
                <span className="truncate">{application.position}</span>
              </div>
            </div>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-3">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Mail className="h-4 w-4 flex-shrink-0" />
          <span className="truncate">{application.email}</span>
        </div>

        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Phone className="h-4 w-4 flex-shrink-0" />
          <span>{application.phone}</span>
        </div>

        {application.currentLocation && (
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <MapPin className="h-4 w-4 flex-shrink-0" />
            <span className="truncate">{application.currentLocation}</span>
          </div>
        )}

        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Calendar className="h-4 w-4 flex-shrink-0" />
          <span>{formattedDate}</span>
        </div>

        {formattedAvailability && (
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <CalendarClock className="h-4 w-4 flex-shrink-0" />
            <span>
              {locale === 'ar' ? 'متاح بدءًا من:' : 'Available from:'}{' '}
              {formattedAvailability}
            </span>
          </div>
        )}

        <div className="flex items-center gap-2 text-sm">
          <span className="text-muted-foreground">
            {locale === 'ar' ? 'سنوات الخبرة:' : 'Experience:'}
          </span>
          <Badge variant="secondary">{application.yearsOfExperience} {locale === 'ar' ? 'سنة' : 'years'}</Badge>
        </div>

        {(application.arabicProficiency || application.englishProficiency) && (
          <div className="flex items-start gap-2 text-sm text-muted-foreground">
            <Languages className="h-4 w-4 flex-shrink-0 mt-0.5" />
            <div className="flex flex-wrap gap-2">
              {application.arabicProficiency && (
                <Badge variant="outline">
                  العربية: {languageLabel(application.arabicProficiency)}
                </Badge>
              )}
              {application.englishProficiency && (
                <Badge variant="outline">
                  الإنجليزية: {languageLabel(application.englishProficiency)}
                </Badge>
              )}
            </div>
          </div>
        )}

        {application.consentToDataUsage && (
          <div className="flex items-center gap-2 text-xs text-primary">
            <ShieldCheck className="h-4 w-4 flex-shrink-0" />
            <span>
              تمت الموافقة على استخدام البيانات
            </span>
          </div>
        )}

        {/* Salary Information */}
        {(application.lastSalary || application.expectedSalary) && (
          <div className="pt-3 border-t">
            <div className="bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-950/20 dark:to-emerald-950/20 rounded-lg p-3 space-y-2.5 border border-green-200/50 dark:border-green-900/30">
              {application.lastSalary && (
                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-2">
                    <div className="p-1.5 rounded-md bg-blue-100 dark:bg-blue-900/30">
                      <DollarSign className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                    </div>
                    <span className="text-sm font-medium text-muted-foreground">
                      {locale === 'ar' ? 'الراتب الأخير' : 'Last Salary'}
                    </span>
                  </div>
                  <Badge variant="secondary" className="bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 font-bold text-sm px-3 py-1">
                    {application.lastSalary}
                  </Badge>
                </div>
              )}
              {application.expectedSalary && (
                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-2">
                    <div className="p-1.5 rounded-md bg-green-100 dark:bg-green-900/30">
                      <TrendingUp className="h-4 w-4 text-green-600 dark:text-green-400" />
                    </div>
                    <span className="text-sm font-medium text-muted-foreground">
                      {locale === 'ar' ? 'الراتب المتوقع' : 'Expected Salary'}
                    </span>
                  </div>
                  <Badge variant="secondary" className="bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 font-bold text-sm px-3 py-1">
                    {application.expectedSalary}
                  </Badge>
                </div>
              )}
            </div>
          </div>
        )}

        {/* CV Preview */}
        <div className="flex items-center gap-2 text-sm">
          <FileText className="h-4 w-4 text-muted-foreground flex-shrink-0" />
          <span className="text-muted-foreground mr-2">
            {locale === 'ar' ? 'السيرة الذاتية:' : 'CV:'}
          </span>
          <Badge variant="outline" className="text-xs">
            {getCVFileType(application.cvUrl)}
          </Badge>
          <a
            href={application.cvUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="text-primary hover:underline flex items-center gap-1 text-xs"
          >
            <ExternalLink className="h-3 w-3" />
            {locale === 'ar' ? 'فتح' : 'Open'}
          </a>
        </div>

        <div className="pt-2 border-t">
          <Link href={`/applications/${application.id}`}>
            <Button className="w-full" size="sm">
              {locale === 'ar' ? 'عرض التفاصيل' : 'View Details'}
            </Button>
          </Link>
        </div>
      </CardContent>
    </Card>
  );
}
















