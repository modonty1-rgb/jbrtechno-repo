'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Button, Badge, Card, CardContent } from '@jbrtechno/ui';
import { ArrowRight, Users, Pencil, FileText, IdCard, ExternalLink } from 'lucide-react';
import { StaffStatus } from '@jbrtechno/database';
import type { Staff } from '@/actions/staff';
import { baseSalaryForMonth } from '@/helpers/payrollFormula';
import { cn } from '@jbrtechno/shared';

// Reusable staff profile route — linked from the staff list, payroll sheet,
// and anywhere else that needs the full record.

function formatDate(date: Date | string | null) {
  if (!date) return '—';
  return new Intl.DateTimeFormat('ar-SA-u-nu-latn-ca-gregory', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  }).format(new Date(date));
}

function DetailRow({ label, value, ltr }: { label: string; value: React.ReactNode; ltr?: boolean }) {
  return (
    <div className="space-y-0.5 min-w-0">
      <div className="text-[11px] text-muted-foreground">{label}</div>
      <div className={cn('text-sm font-medium truncate', ltr && 'text-left')} dir={ltr ? 'ltr' : undefined}>
        {value || '—'}
      </div>
    </div>
  );
}

function DetailSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="space-y-2">
      <h4 className="text-xs font-bold text-primary">{title}</h4>
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 rounded-lg border border-border/60 bg-muted/20 p-3">
        {children}
      </div>
    </div>
  );
}

const STATUS_LABELS: Record<StaffStatus, string> = {
  ACTIVE: 'نشط',
  INACTIVE: 'غير نشط',
  ON_LEAVE: 'في إجازة',
};

export function StaffDetailClient({ staff }: { staff: Staff }) {
  const router = useRouter();

  // Return to wherever the user came from (staff list, payroll, ...);
  // fall back to the staff list on a direct/deep link.
  const goBack = () => {
    if (window.history.length > 1) router.back();
    else router.push('/staff');
  };

  const now = new Date();
  const currentMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
  const currencySuffix = staff.currency === 'EGP' ? 'جنيه' : 'ريال';
  const displayName = staff.fullName || staff.application?.applicantName || '—';

  const inTrial = (() => {
    if (!staff.trialEndDate) return false;
    const end = new Date(staff.trialEndDate);
    const trialEndMonth = `${end.getFullYear()}-${String(end.getMonth() + 1).padStart(2, '0')}`;
    return currentMonth < trialEndMonth;
  })();

  const currentSalary = baseSalaryForMonth(
    {
      trialSalary: staff.trialSalary,
      salary: staff.salary,
      salaryMode: staff.salaryMode,
      trialEndDate: staff.trialEndDate ? new Date(staff.trialEndDate) : null,
    },
    currentMonth
  );

  return (
    <div className="container mx-auto px-4 py-6 max-w-3xl">
      <div className="flex items-center gap-3 mb-5">
        <Button variant="ghost" size="sm" onClick={goBack}>
          <ArrowRight className="h-4 w-4 me-1.5" />
          رجوع
        </Button>
        <span className="text-muted-foreground/40">/</span>
        <span className="text-sm font-bold truncate">{displayName}</span>
        <Link href={`/staff/${staff.id}/edit`} className="ms-auto">
          <Button size="sm" variant="outline">
            <Pencil className="h-3.5 w-3.5 me-1.5" />
            تعديل
          </Button>
        </Link>
      </div>

      <Card>
        <CardContent className="p-4 space-y-4">
          {/* Header */}
          <div className="flex items-center gap-3">
            {staff.photoUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={staff.photoUrl} alt="" className="w-14 h-14 rounded-full object-cover border border-border" />
            ) : (
              <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center">
                <Users className="h-6 w-6 text-primary" />
              </div>
            )}
            <div className="min-w-0">
              <div className="text-lg font-bold truncate">{displayName}</div>
              <div className="text-xs text-muted-foreground">
                {staff.department || staff.application?.position || '—'}
              </div>
            </div>
            <Badge variant={staff.status === 'ACTIVE' ? 'default' : 'secondary'} className="ms-auto">
              {STATUS_LABELS[staff.status]}
            </Badge>
          </div>

          <DetailSection title="البيانات الأساسية">
            <DetailRow label="رقم الهوية / الإقامة" value={staff.nationalId} ltr />
            <DetailRow label="الجنسية" value={staff.nationality} />
            <DetailRow label="تاريخ الميلاد" value={formatDate(staff.birthDate)} />
            <DetailRow label="الجوال" value={staff.phone || staff.application?.phone} ltr />
            <DetailRow label="البريد الرسمي" value={staff.officialEmail} ltr />
            <DetailRow label="الإيميل الشخصي" value={staff.personalEmail || staff.application?.email} ltr />
            <DetailRow label="الدولة" value={staff.country} />
            <DetailRow label="المدينة" value={staff.city} />
            <DetailRow label="العنوان" value={staff.address} />
          </DetailSection>

          <DetailSection title="الراتب وفترة التجربة">
            <DetailRow
              label="راتب فترة التجربة"
              value={staff.trialSalary ? `${staff.trialSalary.toLocaleString('en')} ${currencySuffix}` : '—'}
            />
            <DetailRow
              label="الراتب بعد التثبيت"
              value={
                staff.salaryMode === 'EVALUATION'
                  ? 'يُحدد بعد التقييم'
                  : staff.salary
                    ? `${staff.salary.toLocaleString('en')} ${currencySuffix}`
                    : '—'
              }
            />
            <DetailRow
              label="الراتب الحالي"
              value={
                <span className="text-primary font-bold">
                  {currentSalary.toLocaleString('en')} {currencySuffix}
                  {inTrial && ' (تجربة)'}
                </span>
              }
            />
            <DetailRow label="تاريخ المباشرة" value={formatDate(staff.hireDate)} />
            <DetailRow label="نهاية التجربة" value={formatDate(staff.trialEndDate)} />
            <DetailRow label="مدة التجربة" value={staff.trialMonths ? `${staff.trialMonths} أشهر` : '—'} />
          </DetailSection>

          <DetailSection title="بيانات الدفع">
            <DetailRow label="البنك" value={staff.bankName} />
            <DetailRow label="الآيبان" value={staff.iban} ltr />
            {staff.currency === 'EGP' && (
              <>
                <DetailRow label="إنستاباي" value={staff.instapay} ltr />
                <DetailRow label="فودافون كاش" value={staff.vodafoneCash} ltr />
              </>
            )}
          </DetailSection>

          <DetailSection title="المستندات والتوقيعات">
            <DetailRow label="الموافقة على العرض" value={staff.offerAcceptedDate ? formatDate(staff.offerAcceptedDate) : 'لم توقّع'} />
            <DetailRow label="عقد العمل" value={staff.contractSignedDate ? formatDate(staff.contractSignedDate) : 'لم يوقّع'} />
            <DetailRow label="اتفاقية السرية" value={staff.ndaSignedDate ? formatDate(staff.ndaSignedDate) : 'لم توقّع'} />
          </DetailSection>

          {(staff.idCardUrl || staff.cvUrl || staff.application?.cvUrl) && (
            <div className="flex flex-wrap gap-2">
              {staff.idCardUrl && (
                <a href={staff.idCardUrl} target="_blank" rel="noreferrer">
                  <Button variant="outline" size="sm" className="h-8">
                    <IdCard className="h-3.5 w-3.5 me-1.5" />
                    صورة الهوية
                    <ExternalLink className="h-3 w-3 ms-1.5 opacity-60" />
                  </Button>
                </a>
              )}
              {(staff.cvUrl || staff.application?.cvUrl) && (
                <a href={staff.cvUrl || staff.application?.cvUrl} target="_blank" rel="noreferrer">
                  <Button variant="outline" size="sm" className="h-8">
                    <FileText className="h-3.5 w-3.5 me-1.5" />
                    السيرة الذاتية
                    <ExternalLink className="h-3 w-3 ms-1.5 opacity-60" />
                  </Button>
                </a>
              )}
            </div>
          )}

          {staff.jobDuties && (
            <div className="space-y-1">
              <h4 className="text-xs font-bold text-primary">المهام الوظيفية</h4>
              <p className="text-sm whitespace-pre-line rounded-lg border border-border/60 bg-muted/20 p-3">
                {staff.jobDuties}
              </p>
            </div>
          )}

          {staff.emergencyContact1 && (
            <div className="space-y-1">
              <h4 className="text-xs font-bold text-primary">جهة اتصال للطوارئ</h4>
              <p className="text-sm rounded-lg border border-border/60 bg-muted/20 p-3">
                {staff.emergencyContact1.name}
                {staff.emergencyContact1.phone && (
                  <span dir="ltr" className="ms-2 text-muted-foreground">
                    {staff.emergencyContact1.phone}
                  </span>
                )}
              </p>
            </div>
          )}

          {staff.terminationDate && (
            <div className="space-y-1">
              <h4 className="text-xs font-bold text-destructive">إنهاء الخدمات</h4>
              <p className="text-sm rounded-lg border border-destructive/40 bg-destructive/10 p-3">
                اعتباراً من {formatDate(staff.terminationDate)}
                {staff.terminationReason && ` — ${staff.terminationReason}`}
              </p>
            </div>
          )}

          {staff.notes && (
            <div className="space-y-1">
              <h4 className="text-xs font-bold text-primary">ملاحظات</h4>
              <p className="text-sm whitespace-pre-line rounded-lg border border-border/60 bg-muted/20 p-3">
                {staff.notes}
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
