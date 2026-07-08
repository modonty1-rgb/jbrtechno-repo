import { Application } from '@jbrtechno/database';
import Link from 'next/link';
import Image from 'next/image';
import { User, FileText, CalendarClock, MapPin } from 'lucide-react';
import { Card, Button } from '@jbrtechno/ui';
import { cn } from '@jbrtechno/shared';
import { ApplicationStatusBadge } from './ApplicationStatusBadge';
import { WhatsAppIcon } from './WhatsAppIcon';
import { formatRelativeAr, formatFullDateAr } from '@/helpers/relativeDate';
import {
  statusAccentClass,
  whatsappHref,
  experienceLabel,
  languageLabel,
  interviewLabel,
  EXPECTED_SALARY_CHIP,
  LAST_SALARY_CHIP,
  NOT_REPLIED_TOOLTIP,
} from './applicationDisplay';

interface ApplicationCardProps {
  application: Application;
}

export function ApplicationCard({ application }: ApplicationCardProps) {
  const interview = interviewLabel(application.scheduledInterviewDate);
  const hasReplied = Boolean(application.interviewResponseSubmittedAt);
  const arabic = languageLabel(application.arabicProficiency);
  const english = languageLabel(application.englishProficiency);

  return (
    <Card className="relative overflow-hidden transition-colors hover:border-primary/50">
      <span aria-hidden className={cn('absolute inset-y-0 start-0 w-1', statusAccentClass(application.status))} />

      <div className="flex items-center gap-3 px-5 pt-4 pb-2.5">
        {application.profileImageUrl ? (
          <div className="relative w-12 h-12 rounded-full overflow-hidden shrink-0">
            <Image src={application.profileImageUrl} alt={application.applicantName} fill sizes="48px" className="object-cover" />
          </div>
        ) : (
          <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center shrink-0">
            <User className="h-6 w-6 text-muted-foreground" />
          </div>
        )}
        <div className="flex-1 min-w-0">
          <h3 className="font-bold text-[15.5px] truncate">{application.applicantName}</h3>
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <span title={formatFullDateAr(application.createdAt)}>قدّم {formatRelativeAr(application.createdAt)}</span>
            {application.currentLocation && (
              <span className="inline-flex items-center gap-0.5 truncate">
                <MapPin className="h-3 w-3 shrink-0" />
                {application.currentLocation}
              </span>
            )}
          </div>
        </div>
        <ApplicationStatusBadge status={application.status} locale="ar" className="shrink-0" />
      </div>

      <div className="px-5 pb-3 space-y-2 text-[13px] text-muted-foreground">
        <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
          <span>
            خبرة <b className="text-foreground font-bold">{experienceLabel(application.yearsOfExperience)}</b>
          </span>
          {arabic && (
            <span>
              · العربية <b className="text-foreground font-bold">{arabic}</b>
            </span>
          )}
          {english && (
            <span>
              · الإنجليزية <b className="text-foreground font-bold">{english}</b>
            </span>
          )}
          {interview && (
            <span className="inline-flex items-center gap-1 text-[11.5px] font-bold px-2.5 py-0.5 rounded-full border border-[hsl(262_83%_65%/.4)] bg-[hsl(262_83%_65%/.12)] text-[hsl(262_83%_65%)]">
              <CalendarClock className="h-3 w-3" />
              {interview}
            </span>
          )}
          {!hasReplied && (
            <span className="text-warning cursor-help" title={NOT_REPLIED_TOOLTIP}>⚠ ما جاوب الأسئلة</span>
          )}
        </div>

        {(application.expectedSalary || application.lastSalary) && (
          <div className="flex flex-wrap gap-2">
            {application.expectedSalary && (
              <span className={cn(EXPECTED_SALARY_CHIP, 'max-w-full')} title={`الراتب المتوقع: ${application.expectedSalary}`}>
                متوقع {application.expectedSalary}
              </span>
            )}
            {application.lastSalary && (
              <span className={cn(LAST_SALARY_CHIP, 'max-w-full')} title={`الراتب السابق: ${application.lastSalary}`}>
                سابق {application.lastSalary}
              </span>
            )}
          </div>
        )}
      </div>

      <div className="flex items-center gap-1.5 border-t border-border px-5 py-2.5">
        <a
          href={whatsappHref(application.phone)}
          target="_blank"
          rel="noopener noreferrer"
          title="تواصل واتساب"
          className="flex items-center justify-center w-9 h-9 rounded-lg border border-success/40 text-success transition-colors hover:bg-success/10 hover:border-success"
        >
          <WhatsAppIcon className="h-[18px] w-[18px]" />
        </a>
        <a
          href={application.cvUrl}
          target="_blank"
          rel="noopener noreferrer"
          title="السيرة الذاتية"
          className="flex items-center justify-center w-9 h-9 rounded-lg border border-border transition-colors hover:bg-muted"
        >
          <FileText className="h-4 w-4" />
        </a>
        <Link href={`/applications/${application.id}`} className="flex-1">
          <Button size="sm" className="w-full">
            عرض التفاصيل
          </Button>
        </Link>
      </div>
    </Card>
  );
}
