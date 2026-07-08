import { ApplicationStatus } from '@jbrtechno/database';
import { formatTimeWithArabicTime } from '@/helpers/formatDateTime';

// Display helpers shared by ApplicationRow + ApplicationCard.

export function statusAccentClass(status: ApplicationStatus): string {
  switch (status) {
    case 'ACCEPTED':
      return 'bg-success';
    case 'REJECTED':
      return 'bg-destructive';
    case 'REVIEWED':
      return 'bg-info';
    default:
      return 'bg-warning';
  }
}

export function whatsappHref(phone: string): string {
  return `https://wa.me/${phone.replace(/[^\d]/g, '')}`;
}

export function experienceLabel(years: number): string {
  if (years === 0) return 'أقل من سنة';
  if (years === 1) return 'سنة';
  if (years === 2) return 'سنتان';
  return `${years} سنوات`;
}

const LANGUAGE_LABELS: Record<string, string> = {
  excellent: 'ممتاز',
  very_good: 'جيد جدًا',
  good: 'جيد',
  fair: 'مقبول',
};

export function languageLabel(value: string | null | undefined): string | null {
  if (!value) return null;
  return LANGUAGE_LABELS[value] ?? value;
}

// Shared chip styles so the row and card render salaries identically.
export const EXPECTED_SALARY_CHIP =
  'text-xs font-bold px-3 py-1 rounded-lg border border-success/30 bg-success/10 text-success truncate';
export const LAST_SALARY_CHIP =
  'text-xs font-bold px-3 py-1 rounded-lg border border-info/30 bg-info/10 text-info truncate';

// Interview questions are part of the apply form now, so answering is the
// norm — we only flag the rare legacy applicants who never answered them.
export const NOT_REPLIED_TOOLTIP =
  'متقدم قديم — لم يكمل نموذج أسئلة ما قبل المقابلة (الرواتب، فترة الإشعار...)';

export function interviewLabel(date: Date | string | null | undefined): string | null {
  if (!date) return null;
  const parsed = new Date(date);
  if (isNaN(parsed.getTime())) return null;
  const weekday = parsed.toLocaleDateString('ar-SA-u-nu-latn-ca-gregory', {
    weekday: 'long',
    day: 'numeric',
    month: 'numeric',
  });
  return `${weekday} · ${formatTimeWithArabicTime(parsed)}`;
}
