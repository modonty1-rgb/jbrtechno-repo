'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  Button,
  Input,
  Label,
  Textarea,
  Checkbox,
  Card,
  CardContent,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@jbrtechno/ui';
import { ArrowRight, UserPlus, CheckCircle2, CalendarClock, ImagePlus, FileText, X, Loader2 } from 'lucide-react';
import { cn } from '@jbrtechno/shared';
import { createStaff, updateStaffHr } from '@/actions/staffHr';

type SalaryMode = 'AGREED' | 'EVALUATION';
type Currency = 'SAR' | 'EGP';

const CURRENCY_LABELS: Record<Currency, { name: string; suffix: string }> = {
  SAR: { name: 'ريال سعودي', suffix: 'ريال' },
  EGP: { name: 'جنيه مصري', suffix: 'جنيه' },
};

const compactInput = 'h-9';

function Section({
  n,
  title,
  desc,
  children,
}: {
  n: number;
  title: string;
  desc?: string;
  children: React.ReactNode;
}) {
  return (
    <Card>
      <div className="flex items-center gap-2 px-4 py-2.5 border-b border-border/60">
        <span className="flex items-center justify-center w-6 h-6 rounded-full bg-primary/15 text-primary text-xs font-extrabold shrink-0">
          {n}
        </span>
        <h3 className="text-sm font-bold">{title}</h3>
        {desc && <span className="text-xs text-muted-foreground hidden sm:inline">— {desc}</span>}
      </div>
      <CardContent className="p-4">{children}</CardContent>
    </Card>
  );
}

function Field({
  label,
  htmlFor,
  required,
  className,
  children,
}: {
  label: string;
  htmlFor?: string;
  required?: boolean;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <div className={cn('space-y-1.5', className)}>
      <Label htmlFor={htmlFor} className="text-xs font-semibold text-muted-foreground">
        {label}
        {required && <span className="text-destructive"> *</span>}
      </Label>
      {children}
    </div>
  );
}

// Two-option picks (nationality, country) render as inline radio buttons —
// one click instead of open-dropdown-then-pick.
function ChoiceRow({
  options,
  value,
  onChange,
}: {
  options: string[];
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <div className="flex gap-2">
      {options.map((opt) => {
        const active = value === opt;
        return (
          <button
            key={opt}
            type="button"
            role="radio"
            aria-checked={active}
            onClick={() => onChange(opt)}
            className={cn(
              'flex-1 flex items-center justify-center gap-2 h-9 rounded-md border text-sm transition-colors',
              active ? 'border-primary bg-primary/10 text-primary font-bold' : 'border-border text-muted-foreground hover:border-primary/50'
            )}
          >
            <span
              className={cn(
                'w-3.5 h-3.5 rounded-full border-2 flex items-center justify-center',
                active ? 'border-primary' : 'border-muted-foreground/50'
              )}
            >
              {active && <span className="w-1.5 h-1.5 rounded-full bg-primary" />}
            </span>
            {opt}
          </button>
        );
      })}
    </div>
  );
}

function SalaryInput({ suffix, ...props }: React.ComponentProps<typeof Input> & { suffix: string }) {
  return (
    <div className="relative">
      <Input {...props} className={cn(compactInput, 'pe-12')} />
      <span className="absolute end-3 top-1/2 -translate-y-1/2 text-[11px] font-bold text-muted-foreground pointer-events-none">
        {suffix}
      </span>
    </div>
  );
}

// Image picker: local preview for a new file; in edit mode shows the current
// stored image with a replace action.
function ImagePicker({
  id,
  label,
  file,
  onChange,
  existingUrl,
}: {
  id: string;
  label: string;
  file: File | null;
  onChange: (file: File | null) => void;
  existingUrl?: string | null;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const previewUrl = useMemo(() => (file ? URL.createObjectURL(file) : null), [file]);

  useEffect(() => {
    return () => {
      if (previewUrl) URL.revokeObjectURL(previewUrl);
    };
  }, [previewUrl]);

  return (
    <div className="space-y-1.5">
      <Label htmlFor={id} className="text-xs font-semibold text-muted-foreground">
        {label}
      </Label>
      <input
        ref={inputRef}
        id={id}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => onChange(e.target.files?.[0] ?? null)}
      />
      {!previewUrl && existingUrl ? (
        <div className="relative h-24 rounded-lg border border-border overflow-hidden group">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={existingUrl} alt={label} className="h-full w-full object-cover" />
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            className="absolute inset-0 flex items-center justify-center bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity text-white text-xs font-bold"
          >
            استبدال الصورة
          </button>
        </div>
      ) : previewUrl ? (
        <div className="relative h-24 rounded-lg border border-border overflow-hidden">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={previewUrl} alt={label} className="h-full w-full object-cover" />
          <button
            type="button"
            onClick={() => {
              onChange(null);
              if (inputRef.current) inputRef.current.value = '';
            }}
            className="absolute top-1.5 end-1.5 flex items-center justify-center w-6 h-6 rounded-full bg-destructive text-destructive-foreground shadow"
            aria-label={`إزالة ${label}`}
          >
            <X className="h-3.5 w-3.5" />
          </button>
          <div className="absolute bottom-0 inset-x-0 bg-black/50 text-white text-[10px] px-2 py-1 truncate" dir="ltr">
            {file?.name}
          </div>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          className="flex flex-col items-center justify-center gap-1 h-24 w-full rounded-lg border-2 border-dashed border-border hover:border-primary/50 hover:bg-muted/40 transition-colors text-muted-foreground"
        >
          <ImagePlus className="h-5 w-5" />
          <span className="text-xs">اضغط لاختيار الصورة</span>
        </button>
      )}
    </div>
  );
}

// Document picker (CV): name + size instead of an image preview; in edit mode
// shows the stored file with open/replace actions.
function DocPicker({
  id,
  label,
  file,
  onChange,
  existingUrl,
}: {
  id: string;
  label: string;
  file: File | null;
  onChange: (file: File | null) => void;
  existingUrl?: string | null;
}) {
  const inputRef = useRef<HTMLInputElement>(null);

  return (
    <div className="space-y-1.5">
      <Label htmlFor={id} className="text-xs font-semibold text-muted-foreground">
        {label}
      </Label>
      <input
        ref={inputRef}
        id={id}
        type="file"
        accept=".pdf,.doc,.docx"
        className="hidden"
        onChange={(e) => onChange(e.target.files?.[0] ?? null)}
      />
      {!file && existingUrl ? (
        <div className="flex flex-col items-center justify-center gap-1.5 h-24 rounded-lg border border-border bg-muted/40 px-2">
          <FileText className="h-6 w-6 text-primary" />
          <div className="flex gap-2">
            <a href={existingUrl} target="_blank" rel="noreferrer" className="text-[11px] font-bold text-primary hover:underline">
              فتح الملف الحالي
            </a>
            <button type="button" onClick={() => inputRef.current?.click()} className="text-[11px] font-bold text-muted-foreground hover:text-primary">
              استبدال
            </button>
          </div>
        </div>
      ) : file ? (
        <div className="relative flex flex-col items-center justify-center gap-1 h-24 rounded-lg border border-border bg-muted/40 px-2">
          <FileText className="h-6 w-6 text-primary" />
          <span className="text-[11px] font-medium max-w-full truncate" dir="ltr">
            {file.name}
          </span>
          <span className="text-[10px] text-muted-foreground">
            {file.size >= 1024 * 1024
              ? `${(file.size / 1024 / 1024).toFixed(1)} م.ب`
              : `${Math.max(1, Math.round(file.size / 1024))} ك.ب`}
          </span>
          <button
            type="button"
            onClick={() => {
              onChange(null);
              if (inputRef.current) inputRef.current.value = '';
            }}
            className="absolute top-1.5 end-1.5 flex items-center justify-center w-6 h-6 rounded-full bg-destructive text-destructive-foreground shadow"
            aria-label={`إزالة ${label}`}
          >
            <X className="h-3.5 w-3.5" />
          </button>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          className="flex flex-col items-center justify-center gap-1 h-24 w-full rounded-lg border-2 border-dashed border-border hover:border-primary/50 hover:bg-muted/40 transition-colors text-muted-foreground"
        >
          <FileText className="h-5 w-5" />
          <span className="text-xs">اضغط لاختيار الملف (PDF)</span>
        </button>
      )}
    </div>
  );
}

interface NewStaffFormProps {
  positionTitles: string[];
  // Edit mode: pass the staff id + prefilled values + stored file URLs
  staffId?: string;
  initialValues?: Partial<typeof INITIAL_FORM>;
  existingFiles?: { photoUrl?: string | null; idCardUrl?: string | null; cvUrl?: string | null };
}

const INITIAL_FORM = {
  fullName: '',
  department: '',
  status: 'ACTIVE' as 'ACTIVE' | 'INACTIVE' | 'ON_LEAVE',
  jobDuties: '',
  nationalId: '',
  nationality: '',
  birthDate: '',
  phone: '',
  officialEmail: '',
  personalEmail: '',
  country: 'السعودية',
  city: '',
  address: '',
  hireDate: '',
  bankName: '',
  iban: '',
  instapay: '',
  vodafoneCash: '',
  trialMonths: 3,
  trialSalary: '',
  salaryMode: 'AGREED' as SalaryMode,
  postTrialSalary: '',
  offerAccepted: false,
  contractSigned: false,
  ndaSigned: false,
  emergencyName: '',
  emergencyPhone: '',
  notes: '',
};

export function NewStaffForm({ positionTitles, staffId, initialValues, existingFiles }: NewStaffFormProps) {
  const router = useRouter();
  const isEdit = Boolean(staffId);
  // Baseline for dirty-checking: the prefilled values in edit mode
  const [baseline] = useState(() => ({ ...INITIAL_FORM, ...initialValues }));
  const [form, setForm] = useState(baseline);
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [idCardFile, setIdCardFile] = useState<File | null>(null);
  const [cvFile, setCvFile] = useState<File | null>(null);
  const [submitted, setSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const update = <K extends keyof typeof form>(key: K, value: (typeof form)[K]) => {
    setForm((f) => ({ ...f, [key]: value }));
    setSubmitted(false);
  };

  // End of trial = hire date + trial months (evaluation or salary switch date)
  const trialEndDate = useMemo(() => {
    if (!form.hireDate) return null;
    const d = new Date(form.hireDate);
    if (isNaN(d.getTime())) return null;
    d.setMonth(d.getMonth() + Number(form.trialMonths || 0));
    return d;
  }, [form.hireDate, form.trialMonths]);

  const trialEndLabel = trialEndDate
    ? trialEndDate.toLocaleDateString('ar-SA-u-nu-latn-ca-gregory', { year: 'numeric', month: 'long', day: 'numeric' })
    : '—';

  // Business rule: currency follows the employee's country — Saudi Arabia pays
  // SAR, Egypt pays EGP. No separate currency field.
  const isEgypt = form.country === 'مصر';
  const currency: Currency = isEgypt ? 'EGP' : 'SAR';
  const suffix = CURRENCY_LABELS[currency].suffix;

  const isDirty =
    JSON.stringify(form) !== JSON.stringify(baseline) || photoFile !== null || idCardFile !== null || cvFile !== null;

  const [confirmCancel, setConfirmCancel] = useState(false);
  useEffect(() => {
    if (!confirmCancel) return;
    const t = setTimeout(() => setConfirmCancel(false), 4000);
    return () => clearTimeout(t);
  }, [confirmCancel]);

  const handleCancel = () => {
    if (!isDirty || confirmCancel) {
      router.push('/staff');
      return;
    }
    setConfirmCancel(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!form.fullName.trim()) return setError('اكتب اسم الموظف الكامل');
    if (!form.department.trim()) return setError('اختر المسمى الوظيفي');
    if (!form.nationalId.trim()) return setError('اكتب رقم الهوية أو الإقامة');
    if (!form.phone.trim()) return setError('اكتب رقم الجوال');
    if (!form.hireDate) return setError('حدد تاريخ المباشرة');
    if (!form.trialSalary || Number(form.trialSalary) <= 0) return setError('اكتب راتب فترة التجربة');
    if (form.salaryMode === 'AGREED' && (!form.postTrialSalary || Number(form.postTrialSalary) <= 0)) {
      return setError('اكتب الراتب المتفق عليه بعد التثبيت، أو بدّل الخيار إلى «يُحدد بعد التقييم»');
    }

    setIsSubmitting(true);
    const fd = new FormData();
    Object.entries(form).forEach(([key, value]) => fd.append(key, String(value)));
    if (photoFile) fd.append('photoFile', photoFile);
    if (idCardFile) fd.append('idCardFile', idCardFile);
    if (cvFile) fd.append('cvFile', cvFile);

    const result = staffId ? await updateStaffHr(staffId, fd) : await createStaff(fd);
    setIsSubmitting(false);
    if (!result.success) {
      setError(result.error || 'فشل حفظ الموظف');
      return;
    }
    setSubmitted(true);
    setTimeout(() => router.push(staffId ? `/staff/${staffId}` : '/staff'), 1200);
  };

  return (
    <div className="container mx-auto px-4 py-6 max-w-5xl">
      {/* Compact header: back + title on one row */}
      <div className="flex items-center gap-3 mb-5">
        <Link href="/staff">
          <Button variant="ghost" size="sm">
            <ArrowRight className="h-4 w-4 me-1.5" />
            الموظفون
          </Button>
        </Link>
        <span className="text-muted-foreground/40">/</span>
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-lg bg-gradient-to-br from-primary/20 to-primary/5">
            <UserPlus className="h-5 w-5 text-primary" />
          </div>
          <h1 className="text-xl font-bold">{isEdit ? 'تعديل بيانات موظف' : 'تسجيل موظف جديد'}</h1>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4 pb-24">
        <Section n={1} title="البيانات الأساسية" desc="هوية الموظف وبيانات التواصل">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            <Field label="الاسم الرباعي (مطابق للهوية)" htmlFor="fullName" required>
              <Input id="fullName" className={compactInput} value={form.fullName} onChange={(e) => update('fullName', e.target.value)} placeholder="مثال: أحمد محمد سعد العتيبي" />
            </Field>
            <Field label="المسمى الوظيفي" required>
              <Select value={form.department} onValueChange={(v) => update('department', v)}>
                <SelectTrigger className={compactInput}>
                  <SelectValue placeholder="اختر من وظائف الشركة" />
                </SelectTrigger>
                <SelectContent>
                  {positionTitles.map((title) => (
                    <SelectItem key={title} value={title}>
                      {title}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </Field>
            {isEdit && (
              <Field label="حالة الموظف">
                <Select value={form.status} onValueChange={(v) => update('status', v as typeof form.status)}>
                  <SelectTrigger className={compactInput}>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ACTIVE">نشط</SelectItem>
                    <SelectItem value="INACTIVE">غير نشط</SelectItem>
                    <SelectItem value="ON_LEAVE">في إجازة</SelectItem>
                  </SelectContent>
                </Select>
              </Field>
            )}
            <Field label="رقم الهوية / الإقامة" htmlFor="nationalId" required>
              <Input id="nationalId" className={compactInput} dir="ltr" value={form.nationalId} onChange={(e) => update('nationalId', e.target.value)} placeholder={isEgypt ? 'الرقم القومي — 14 رقم' : '1xxxxxxxxx'} />
            </Field>
            <Field label="الجنسية">
              <ChoiceRow options={['سعودي', 'مصري']} value={form.nationality} onChange={(v) => update('nationality', v)} />
            </Field>
            <Field label="تاريخ الميلاد" htmlFor="birthDate">
              <Input id="birthDate" className={compactInput} type="date" value={form.birthDate} onChange={(e) => update('birthDate', e.target.value)} />
            </Field>
            <Field label="رقم الجوال" htmlFor="phone" required>
              <Input id="phone" className={compactInput} dir="ltr" value={form.phone} onChange={(e) => update('phone', e.target.value)} placeholder={isEgypt ? '+201xxxxxxxxx' : '+9665xxxxxxxx'} />
            </Field>
            <Field label="البريد الرسمي (الشركة)" htmlFor="officialEmail">
              <Input id="officialEmail" className={compactInput} dir="ltr" type="email" value={form.officialEmail} onChange={(e) => update('officialEmail', e.target.value)} placeholder="name@jbrtechno.com" />
            </Field>
            <Field label="الإيميل الشخصي" htmlFor="personalEmail">
              <Input id="personalEmail" className={compactInput} dir="ltr" type="email" value={form.personalEmail} onChange={(e) => update('personalEmail', e.target.value)} placeholder="name@gmail.com" />
            </Field>
            <Field label="الدولة">
              <ChoiceRow options={['السعودية', 'مصر']} value={form.country} onChange={(v) => update('country', v)} />
            </Field>
            <Field label="المدينة" htmlFor="city">
              <Input id="city" className={compactInput} value={form.city} onChange={(e) => update('city', e.target.value)} placeholder={isEgypt ? 'مثال: القاهرة' : 'مثال: جدة'} />
            </Field>
            <Field label="العنوان داخل المدينة" htmlFor="address" className="sm:col-span-2 lg:col-span-2">
              <Input id="address" className={compactInput} value={form.address} onChange={(e) => update('address', e.target.value)} placeholder={isEgypt ? 'مثال: مدينة نصر، شارع عباس العقاد' : 'مثال: حي الروضة، شارع الأمير سلطان'} />
            </Field>
            <Field label="المهام الوظيفية" htmlFor="jobDuties" className="sm:col-span-2 lg:col-span-3">
              <Textarea
                id="jobDuties"
                rows={3}
                value={form.jobDuties}
                onChange={(e) => update('jobDuties', e.target.value)}
                placeholder={'المهام المتفق عليها مع الموظف — مهمة في كل سطر:\n- كتابة 8 مقالات شهرياً\n- مراجعة المحتوى قبل النشر'}
              />
            </Field>
          </div>
        </Section>

        <Section n={2} title="الراتب وفترة التجربة" desc="كل موظف يبدأ بفترة تجربة، وبعدها إما راتب متفق عليه أو تقييم">
          <div className="space-y-3">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              <Field label="تاريخ المباشرة" htmlFor="hireDate" required>
                <Input id="hireDate" className={compactInput} type="date" value={form.hireDate} onChange={(e) => update('hireDate', e.target.value)} />
              </Field>
              <Field label="راتب فترة التجربة" htmlFor="trialSalary" required>
                <SalaryInput id="trialSalary" suffix={suffix} type="number" min={0} value={form.trialSalary} onChange={(e) => update('trialSalary', e.target.value)} placeholder="4000" />
              </Field>
              <Field label="مدة التجربة (أشهر)" htmlFor="trialMonths">
                <Input id="trialMonths" className={compactInput} type="number" min={1} max={6} value={form.trialMonths} onChange={(e) => update('trialMonths', Number(e.target.value))} />
              </Field>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 items-start">
              <div className="space-y-1.5">
                <span className="text-xs font-semibold text-muted-foreground">
                  الراتب بعد فترة التجربة <span className="text-destructive">*</span>
                </span>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => update('salaryMode', 'AGREED')}
                    className={cn(
                      'relative rounded-lg border p-2.5 text-start transition-colors',
                      form.salaryMode === 'AGREED' ? 'border-primary bg-primary/10' : 'border-border hover:border-primary/50'
                    )}
                  >
                    {form.salaryMode === 'AGREED' && (
                      <CheckCircle2 className="absolute top-2 end-2 h-4 w-4 text-primary" />
                    )}
                    <div className="font-bold text-sm mb-0.5">متفق عليه من البداية</div>
                    <div className="text-[11px] text-muted-foreground">الموظف يعرف راتبه بعد التثبيت من يوم التوقيع</div>
                  </button>
                  <button
                    type="button"
                    onClick={() => update('salaryMode', 'EVALUATION')}
                    className={cn(
                      'relative rounded-lg border p-2.5 text-start transition-colors',
                      form.salaryMode === 'EVALUATION' ? 'border-primary bg-primary/10' : 'border-border hover:border-primary/50'
                    )}
                  >
                    {form.salaryMode === 'EVALUATION' && (
                      <CheckCircle2 className="absolute top-2 end-2 h-4 w-4 text-primary" />
                    )}
                    <div className="font-bold text-sm mb-0.5">يُحدد بعد التقييم</div>
                    <div className="text-[11px] text-muted-foreground">تقييم نهاية التجربة يحدد الراتب الجديد</div>
                  </button>
                </div>
              </div>

              <div className="space-y-3">
                {form.salaryMode === 'AGREED' && (
                  <Field label="الراتب المتفق عليه بعد التثبيت" htmlFor="postTrialSalary" required>
                    <SalaryInput id="postTrialSalary" suffix={suffix} type="number" min={0} value={form.postTrialSalary} onChange={(e) => update('postTrialSalary', e.target.value)} placeholder="6000" />
                  </Field>
                )}
                <div className="flex items-center gap-2 rounded-lg border border-info/30 bg-info/10 px-3 py-2 text-xs">
                  <CalendarClock className="h-4 w-4 text-info shrink-0" />
                  <span>
                    {form.salaryMode === 'AGREED' ? 'تاريخ تفعيل الراتب الجديد:' : 'تاريخ تقييم نهاية التجربة:'}{' '}
                    <b className="text-info">{trialEndLabel}</b>
                  </span>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <Field label="اسم البنك" htmlFor="bankName">
                <Input id="bankName" className={compactInput} value={form.bankName} onChange={(e) => update('bankName', e.target.value)} placeholder={isEgypt ? 'مثال: البنك الأهلي المصري' : 'مثال: الراجحي'} />
              </Field>
              <Field label="رقم الآيبان (لتحويل الراتب)" htmlFor="iban">
                <Input id="iban" className={compactInput} dir="ltr" value={form.iban} onChange={(e) => update('iban', e.target.value.toUpperCase())} placeholder={isEgypt ? 'EG00 0000 0000 0000 0000 0000 0000 0' : 'SA00 0000 0000 0000 0000 0000'} />
              </Field>
              {/* Egypt-only payout fallbacks when the employee has no bank account */}
              {isEgypt && (
                <>
                  <Field label="رقم إنستاباي (اختياري — بديل للبنك)" htmlFor="instapay">
                    <Input id="instapay" className={compactInput} dir="ltr" value={form.instapay} onChange={(e) => update('instapay', e.target.value)} placeholder="username@instapay أو رقم الجوال" />
                  </Field>
                  <Field label="رقم فودافون كاش (اختياري — بديل للبنك)" htmlFor="vodafoneCash">
                    <Input id="vodafoneCash" className={compactInput} dir="ltr" value={form.vodafoneCash} onChange={(e) => update('vodafoneCash', e.target.value)} placeholder="+2010xxxxxxxx" />
                  </Field>
                </>
              )}
            </div>
          </div>
        </Section>

        <Section n={3} title="المستندات والملاحظات">
          <div className="space-y-3">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <ImagePicker id="photoFile" label="الصورة الشخصية" file={photoFile} onChange={setPhotoFile} existingUrl={existingFiles?.photoUrl} />
              <ImagePicker id="idCardFile" label="صورة الهوية / الإقامة" file={idCardFile} onChange={setIdCardFile} existingUrl={existingFiles?.idCardUrl} />
              <DocPicker id="cvFile" label="السيرة الذاتية" file={cvFile} onChange={setCvFile} existingUrl={existingFiles?.cvUrl} />
            </div>
            <div className="flex flex-wrap gap-x-6 gap-y-2">
              <label className="flex items-center gap-2 cursor-pointer">
                <Checkbox checked={form.offerAccepted} onCheckedChange={(v) => update('offerAccepted', v === true)} />
                <span className="text-sm">الموافقة المبدئية على العرض</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <Checkbox checked={form.contractSigned} onCheckedChange={(v) => update('contractSigned', v === true)} />
                <span className="text-sm">عقد العمل موقّع</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <Checkbox checked={form.ndaSigned} onCheckedChange={(v) => update('ndaSigned', v === true)} />
                <span className="text-sm">اتفاقية السرية موقّعة</span>
              </label>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              <Field label="جهة اتصال للطوارئ — الاسم" htmlFor="emergencyName">
                <Input id="emergencyName" className={compactInput} value={form.emergencyName} onChange={(e) => update('emergencyName', e.target.value)} />
              </Field>
              <Field label="جهة اتصال للطوارئ — الجوال" htmlFor="emergencyPhone">
                <Input id="emergencyPhone" className={compactInput} dir="ltr" value={form.emergencyPhone} onChange={(e) => update('emergencyPhone', e.target.value)} />
              </Field>
              <Field label="ملاحظات" htmlFor="notes" className="sm:col-span-2 lg:col-span-1">
                <Textarea id="notes" rows={2} value={form.notes} onChange={(e) => update('notes', e.target.value)} placeholder="أي تفاصيل إضافية عن الاتفاق..." />
              </Field>
            </div>
          </div>
        </Section>

        {error && (
          <div className="rounded-lg border border-destructive/40 bg-destructive/10 text-destructive px-4 py-2.5 text-sm font-bold">
            {error}
          </div>
        )}

        {submitted && (
          <div className="flex items-center gap-2 rounded-lg border border-success/40 bg-success/10 text-success px-4 py-2.5 text-sm font-bold">
            <CheckCircle2 className="h-4 w-4" />
            {isEdit ? 'تم حفظ التعديلات ✓ — جاري التحويل لملف الموظف' : 'تم تسجيل الموظف بنجاح ✓ — جاري التحويل لقائمة الموظفين'}
          </div>
        )}

        {/* Sticky action bar: live summary always visible while filling */}
        <div className="fixed bottom-0 inset-x-0 z-30 border-t border-border bg-background/95 backdrop-blur">
          <div className="container mx-auto px-4 max-w-5xl py-3 flex items-center gap-3">
            <div className="flex-1 min-w-0 text-xs text-muted-foreground truncate">
              {form.fullName.trim() && form.trialSalary ? (
                <>
                  <b className="text-foreground">{form.fullName}</b>
                  {form.department.trim() && <> · {form.department}</>}
                  {' · '}تجربة <b className="text-foreground">{form.trialMonths} أشهر</b> براتب{' '}
                  <b className="text-foreground">
                    {Number(form.trialSalary).toLocaleString('en')} {suffix}
                  </b>
                  {' · '}بعدها:{' '}
                  {form.salaryMode === 'AGREED' ? (
                    form.postTrialSalary ? (
                      <b className="text-success">
                        {Number(form.postTrialSalary).toLocaleString('en')} {suffix}
                      </b>
                    ) : (
                      <span className="text-warning">حدد المبلغ</span>
                    )
                  ) : (
                    <b className="text-info">تقييم في {trialEndLabel}</b>
                  )}
                </>
              ) : (
                <span>املأ الاسم وراتب التجربة ليظهر ملخص الاتفاق هنا</span>
              )}
            </div>
            <Button
              type="button"
              variant={confirmCancel ? 'destructive' : 'outline'}
              size="sm"
              onClick={handleCancel}
            >
              {confirmCancel ? 'متأكد؟ البيانات ستضيع' : 'إلغاء'}
            </Button>
            <Button type="submit" size="sm" className="px-6" disabled={isSubmitting}>
              {isSubmitting ? (
                <>
                  <Loader2 className="h-4 w-4 me-1.5 animate-spin" />
                  جاري الحفظ...
                </>
              ) : isEdit ? (
                'حفظ التعديلات'
              ) : (
                'تسجيل الموظف'
              )}
            </Button>
          </div>
        </div>
      </form>
    </div>
  );
}
