'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import {
  Button,
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
import { ArrowRight, UserMinus, CheckCircle2, AlertTriangle, Loader2 } from 'lucide-react';
import { cn } from '@jbrtechno/shared';
import { useRouter } from 'next/navigation';
import { terminateStaff, type StaffOption } from '@/actions/staffHr';

// Termination only — there is no temporary-suspension flow in this company.

// Final-settlement checklist.
const CLEARANCE_ITEMS = [
  { key: 'finalPay', label: 'تسوية الراتب الأخير والمستحقات' },
  { key: 'assets', label: 'استرجاع العهدة والأجهزة' },
  { key: 'access', label: 'إيقاف البريد الرسمي والوصول للأنظمة' },
  { key: 'release', label: 'توقيع المخالصة النهائية' },
] as const;

type ClearanceKey = (typeof CLEARANCE_ITEMS)[number]['key'];

const compactInput = 'h-9';

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

export function OffboardForm({ staffOptions }: { staffOptions: StaffOption[] }) {
  const router = useRouter();
  const today = new Date();
  const currentMonth = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}`;

  const [employeeId, setEmployeeId] = useState('');
  const [month, setMonth] = useState(currentMonth);
  const [day, setDay] = useState(today.getDate());
  const [reason, setReason] = useState('');
  const [clearance, setClearance] = useState<Record<ClearanceKey, boolean>>({
    finalPay: false,
    assets: false,
    access: false,
    release: false,
  });
  const [notes, setNotes] = useState('');
  const [confirmed, setConfirmed] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Last working day = month dropdown + day dropdown (no native MM/DD/YYYY input)
  const monthOptions = useMemo(() => {
    const opts: { value: string; label: string }[] = [];
    const d = new Date();
    d.setDate(1);
    d.setMonth(d.getMonth() - 3);
    for (let i = 0; i < 7; i++) {
      const value = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
      const label = d.toLocaleDateString('ar-SA-u-nu-latn-ca-gregory', { month: 'long', year: 'numeric' });
      opts.push({ value, label });
      d.setMonth(d.getMonth() + 1);
    }
    return opts;
  }, []);

  const daysInMonth = useMemo(() => {
    const [y, m] = month.split('-').map(Number);
    return new Date(y, m, 0).getDate();
  }, [month]);

  const employee = staffOptions.find((e) => e.id === employeeId);
  const effectiveDate = `${month}-${String(Math.min(day, daysInMonth)).padStart(2, '0')}`;

  const canSubmit = Boolean(employeeId && reason.trim() && confirmed && !isSubmitting);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!canSubmit) return;
    setError(null);
    setIsSubmitting(true);
    const result = await terminateStaff({
      staffId: employeeId,
      effectiveDate,
      reason,
      clearance,
      notes: notes.trim() || undefined,
    });
    setIsSubmitting(false);
    if (!result.success) {
      setError(result.error || 'فشل تنفيذ الإجراء');
      return;
    }
    setSubmitted(true);
    setTimeout(() => router.push('/staff'), 1200);
  };

  const updateField = <T,>(setter: (v: T) => void) => (v: T) => {
    setter(v);
    setSubmitted(false);
    setConfirmed(false);
  };

  return (
    <div className="container mx-auto px-4 py-6 max-w-3xl">
      <div className="flex items-center gap-3 mb-5">
        <Link href="/staff">
          <Button variant="ghost" size="sm">
            <ArrowRight className="h-4 w-4 me-1.5" />
            الموظفون
          </Button>
        </Link>
        <span className="text-muted-foreground/40">/</span>
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-lg bg-gradient-to-br from-destructive/20 to-destructive/5">
            <UserMinus className="h-5 w-5 text-destructive" />
          </div>
          <h1 className="text-xl font-bold">إنهاء خدمات موظف</h1>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <Card>
          <CardContent className="p-4 space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-6 gap-3">
              <Field label="الموظف" required className="sm:col-span-3">
                <Select value={employeeId} onValueChange={updateField(setEmployeeId)}>
                  <SelectTrigger className={compactInput}>
                    <SelectValue placeholder={staffOptions.length ? 'اختر الموظف' : 'لا يوجد موظفون بعد'} />
                  </SelectTrigger>
                  <SelectContent>
                    {staffOptions.map((e) => (
                      <SelectItem key={e.id} value={e.id}>
                        {e.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </Field>
              <Field label="آخر يوم عمل" required className="sm:col-span-2">
                <Select value={month} onValueChange={updateField(setMonth)}>
                  <SelectTrigger className={compactInput}>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {monthOptions.map((m) => (
                      <SelectItem key={m.value} value={m.value}>
                        {m.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </Field>
              <Field label="اليوم" required>
                <Select value={String(Math.min(day, daysInMonth))} onValueChange={(v) => updateField(setDay)(Number(v))}>
                  <SelectTrigger className={compactInput}>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {Array.from({ length: daysInMonth }, (_, i) => i + 1).map((d) => (
                      <SelectItem key={d} value={String(d)}>
                        {d}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </Field>
            </div>

            <Field label="السبب" htmlFor="offboard-reason" required>
              <Textarea
                id="offboard-reason"
                rows={2}
                value={reason}
                onChange={(e) => {
                  setReason(e.target.value);
                  setSubmitted(false);
                  setConfirmed(false);
                }}
                placeholder="مثال: استقالة — انتقال لوظيفة أخرى"
              />
            </Field>

            <div className="space-y-2 rounded-lg border border-border bg-muted/30 p-3">
              <p className="text-xs font-bold text-muted-foreground">قائمة المخالصة</p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {CLEARANCE_ITEMS.map((item) => (
                  <label key={item.key} className="flex items-center gap-2 cursor-pointer">
                    <Checkbox
                      checked={clearance[item.key]}
                      onCheckedChange={(v) => setClearance((c) => ({ ...c, [item.key]: v === true }))}
                    />
                    <span className="text-sm">{item.label}</span>
                  </label>
                ))}
              </div>
            </div>

            <Field label="ملاحظات" htmlFor="offboard-notes">
              <Textarea id="offboard-notes" rows={2} value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="أي تفاصيل إضافية عن الإجراء..." />
            </Field>
          </CardContent>
        </Card>

        {/* Confirmation gate before the destructive action */}
        <div className="rounded-lg border border-destructive/40 bg-destructive/10 px-4 py-3 flex items-center gap-3">
          <AlertTriangle className="h-4 w-4 shrink-0 text-destructive" />
          <label className="flex items-center gap-2 cursor-pointer text-sm font-bold flex-1">
            <Checkbox checked={confirmed} onCheckedChange={(v) => setConfirmed(v === true)} />
            <span>
              أؤكد إنهاء خدمات {employee ? <b>{employee.name}</b> : 'الموظف المحدد'} اعتباراً من <b dir="ltr">{effectiveDate}</b>
            </span>
          </label>
        </div>

        {error && (
          <div className="rounded-lg border border-destructive/40 bg-destructive/10 text-destructive px-4 py-2.5 text-sm font-bold">
            {error}
          </div>
        )}

        {submitted && (
          <div className="flex items-center gap-2 rounded-lg border border-success/40 bg-success/10 text-success px-4 py-2.5 text-sm font-bold">
            <CheckCircle2 className="h-4 w-4" />
            تم إنهاء الخدمات وتحديث حالة الموظف ✓ — جاري التحويل لقائمة الموظفين
          </div>
        )}

        <div className="flex gap-3">
          <Button type="submit" size="sm" variant="destructive" className="px-6" disabled={!canSubmit}>
            {isSubmitting ? (
              <>
                <Loader2 className="h-4 w-4 me-1.5 animate-spin" />
                جاري التنفيذ...
              </>
            ) : (
              'إنهاء الخدمات'
            )}
          </Button>
          <Link href="/staff">
            <Button type="button" variant="outline" size="sm">
              رجوع
            </Button>
          </Link>
        </div>
      </form>
    </div>
  );
}
