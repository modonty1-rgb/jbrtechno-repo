import { Application } from '@jbrtechno/database';
import Link from 'next/link';
import Image from 'next/image';
import { User, FileText, CalendarClock, MapPin } from 'lucide-react';
import { Button } from '@jbrtechno/ui';
import { cn } from '@jbrtechno/shared';
import { ApplicationStatusBadge } from './ApplicationStatusBadge';
import { WhatsAppIcon } from './WhatsAppIcon';
import { formatRelativeAr, formatFullDateAr } from '@/helpers/relativeDate';
import {
  statusAccentClass,
  whatsappHref,
  experienceLabel,
  interviewLabel,
  EXPECTED_SALARY_CHIP,
  LAST_SALARY_CHIP,
  NOT_REPLIED_TOOLTIP,
} from './applicationDisplay';

interface ApplicationRowProps {
  application: Application;
}

export function ApplicationRow({ application }: ApplicationRowProps) {
  const interview = interviewLabel(application.scheduledInterviewDate);
  const hasReplied = Boolean(application.interviewResponseSubmittedAt);

  return (
    <div className="relative flex items-center gap-4 rounded-xl border border-border bg-card ps-4 pe-4 py-3 overflow-hidden transition-colors hover:border-primary/50">
      <span aria-hidden className={cn('absolute inset-y-0 start-0 w-1', statusAccentClass(application.status))} />

      {application.profileImageUrl ? (
        <div className="relative w-11 h-11 rounded-full overflow-hidden shrink-0 ms-1">
          <Image src={application.profileImageUrl} alt={application.applicantName} fill sizes="44px" className="object-cover" />
        </div>
      ) : (
        <div className="w-11 h-11 rounded-full bg-muted flex items-center justify-center shrink-0 ms-1">
          <User className="h-5 w-5 text-muted-foreground" />
        </div>
      )}

      <div className="flex-1 min-w-0">
        <h3 className="font-bold text-[15px] truncate">{application.applicantName}</h3>
        <div className="flex flex-wrap items-center gap-x-4 gap-y-0.5 text-xs text-muted-foreground">
          <span>
            خبرة <b className="text-foreground font-bold">{experienceLabel(application.yearsOfExperience)}</b>
          </span>
          {application.currentLocation && (
            <span className="inline-flex items-center gap-1">
              <MapPin className="h-3 w-3" />
              {application.currentLocation}
            </span>
          )}
          <span title={formatFullDateAr(application.createdAt)}>
            قدّم <b className="text-foreground font-bold">{formatRelativeAr(application.createdAt)}</b>
          </span>
        </div>
      </div>

      {(application.expectedSalary || application.lastSalary) && (
        <div className="hidden lg:flex items-center gap-1.5 shrink-0 max-w-64">
          {application.expectedSalary && (
            <span className={cn(EXPECTED_SALARY_CHIP, 'max-w-32')} title={`الراتب المتوقع: ${application.expectedSalary}`}>
              متوقع {application.expectedSalary}
            </span>
          )}
          {application.lastSalary && (
            <span className={cn(LAST_SALARY_CHIP, 'max-w-32')} title={`الراتب السابق: ${application.lastSalary}`}>
              سابق {application.lastSalary}
            </span>
          )}
        </div>
      )}

      <div className="flex items-center gap-2 shrink-0">
        {interview && (
          <span className="inline-flex items-center gap-1 text-[11.5px] font-bold px-2.5 py-1 rounded-full border border-[hsl(262_83%_65%/.4)] bg-[hsl(262_83%_65%/.12)] text-[hsl(262_83%_65%)] whitespace-nowrap">
            <CalendarClock className="h-3 w-3" />
            {interview}
          </span>
        )}
        {!hasReplied && (
          <span className="text-xs text-warning whitespace-nowrap cursor-help" title={NOT_REPLIED_TOOLTIP}>
            ⚠ ما جاوب الأسئلة
          </span>
        )}
        <ApplicationStatusBadge status={application.status} locale="ar" />
      </div>

      <div className="flex items-center gap-1.5 shrink-0">
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
        <Link href={`/applications/${application.id}`}>
          <Button size="sm">التفاصيل</Button>
        </Link>
      </div>
    </div>
  );
}
