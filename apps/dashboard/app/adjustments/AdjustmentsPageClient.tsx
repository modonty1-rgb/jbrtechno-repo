'use client';

import { useMemo, useState, useTransition } from 'react';
import {
  Button,
  Input,
  Label,
  Card,
  CardContent,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@jbrtechno/ui';
import { ArrowUpDown, Plus, Trash2, TrendingUp, TrendingDown, Loader2 } from 'lucide-react';
import { cn } from '@jbrtechno/shared';
import {
  createAdjustment,
  deleteAdjustment,
  getAdjustments,
  type AdjustmentRow,
  type StaffOption,
} from '@/actions/staffHr';
import { dayRate } from '@/helpers/payrollFormula';

type AdjType = 'BONUS' | 'DEDUCTION';
type Currency = 'SAR' | 'EGP';

const TYPE_META: Record<AdjType, { label: string; badge: string; sign: '+' | '−' }> = {
  BONUS: { label: 'حافز', badge: 'bg-success/15 text-success', sign: '+' },
  DEDUCTION: { label: 'خصم', badge: 'bg-destructive/15 text-destructive', sign: '−' },
};

const CURRENCY_SUFFIX: Record<Currency, string> = { SAR: 'ريال', EGP: 'جنيه' };

function fmtAmount(amount: number, currency: Currency) {
  return `${amount.toLocaleString('en')} ${CURRENCY_SUFFIX[currency]}`;
}

// Totals per currency so SAR and EGP never get summed together.
function fmtTotals(rows: AdjustmentRow[]) {
  const t: Record<Currency, number> = { SAR: 0, EGP: 0 };
  for (const row of rows) t[row.currency] += row.amount;
  const parts: string[] = [];
  if (t.SAR > 0) parts.push(fmtAmount(t.SAR, 'SAR'));
  if (t.EGP > 0) parts.push(fmtAmount(t.EGP, 'EGP'));
  return parts.length ? parts.join(' · ') : '—';
}

const compactInput = 'h-9';

interface AdjustmentsPageClientProps {
  initialMonth: string;
  initialRows: AdjustmentRow[];
  staffOptions: StaffOption[];
}

export function AdjustmentsPageClient({ initialMonth, initialRows, staffOptions }: AdjustmentsPageClientProps) {
  const [rows, setRows] = useState<AdjustmentRow[]>(initialRows);
  const [month, setMonth] = useState(initialMonth);
  const [typeFilter, setTypeFilter] = useState<AdjType | 'ALL'>('ALL');
  const [isPending, startTransition] = useTransition();
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [draft, setDraft] = useState({
    employeeId: '',
    type: 'BONUS' as AdjType,
    unit: 'AMOUNT' as 'AMOUNT' | 'DAYS',
    amount: '',
    note: '',
  });

  // 3 future months + current + 8 past, newest first
  const monthOptions = useMemo(() => {
    const opts: { value: string; label: string }[] = [];
    const [y0, m0] = initialMonth.split('-').map(Number);
    const d = new Date(y0, m0 - 1 + 3, 1);
    for (let i = 0; i < 12; i++) {
      const value = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
      const label = d.toLocaleDateString('ar-SA-u-nu-latn-ca-gregory', { month: 'long', year: 'numeric' });
      opts.push({ value, label });
      d.setMonth(d.getMonth() - 1);
    }
    return opts;
  }, [initialMonth]);

  const changeMonth = (value: string) => {
    setMonth(value);
    startTransition(async () => {
      setRows(await getAdjustments(value));
    });
  };

  // Both bonus and deduction can be a fixed amount or N days of salary.
  const draftEmployee = draft.employeeId ? staffOptions.find((s) => s.id === draft.employeeId) : undefined;
  const isDaysMode = draft.unit === 'DAYS';
  const daysAmount =
    isDaysMode && draftEmployee && Number(draft.amount) > 0
      ? Math.round(dayRate(draftEmployee.baseSalary) * Number(draft.amount))
      : null;
  const canAdd = Boolean(draft.employeeId && Number(draft.amount) > 0 && (!isDaysMode || daysAmount !== null) && !isSaving);

  const monthRows = rows;
  const visibleRows = useMemo(
    () => (typeFilter === 'ALL' ? monthRows : monthRows.filter((r) => r.type === typeFilter)),
    [monthRows, typeFilter]
  );

  const handleAdd = () => {
    if (!canAdd) return;
    setError(null);
    setIsSaving(true);
    startTransition(async () => {
      const result = await createAdjustment({
        staffId: draft.employeeId,
        type: draft.type,
        month,
        note: draft.note,
        amount: isDaysMode ? undefined : Number(draft.amount),
        days: isDaysMode ? Number(draft.amount) : undefined,
      });
      if (!result.success) {
        setError(result.error || 'فشل حفظ الحركة');
      } else {
        setDraft((d) => ({ ...d, amount: '', note: '' }));
        setRows(await getAdjustments(month));
      }
      setIsSaving(false);
    });
  };

  const handleDelete = (id: string) => {
    setRows((prev) => prev.filter((r) => r.id !== id));
    startTransition(async () => {
      const result = await deleteAdjustment(id);
      if (!result.success) setRows(await getAdjustments(month));
    });
  };

  return (
    <div className="container mx-auto px-4 py-6 max-w-6xl">
      {/* Header */}
      <div className="flex items-center justify-between gap-3 flex-wrap mb-5">
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-lg bg-gradient-to-br from-primary/20 to-primary/5">
            <ArrowUpDown className="h-5 w-5 text-primary" />
          </div>
          <h1 className="text-xl font-bold">الخصومات والحوافز</h1>
          {isPending && <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />}
        </div>
        <Select value={month} onValueChange={changeMonth}>
          <SelectTrigger className="h-9 w-44" aria-label="الشهر">
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
      </div>

      {/* Add form first — the page's primary action, visually distinct */}
      <Card className="mb-5 border-primary/40 bg-gradient-to-l from-primary/10 via-primary/5 to-transparent shadow-md">
        <div className="flex items-center gap-2 px-4 pt-4">
          <span className="flex items-center justify-center w-7 h-7 rounded-lg bg-primary text-primary-foreground shrink-0">
            <Plus className="h-4 w-4" />
          </span>
          <h2 className="text-sm font-bold">تسجيل حركة جديدة</h2>
          <span className="text-xs text-muted-foreground hidden sm:inline">— حافز أو خصم</span>
        </div>
        <CardContent className="p-4 space-y-3">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 items-start">
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold text-muted-foreground">الموظف</Label>
              <Select value={draft.employeeId} onValueChange={(v) => setDraft((d) => ({ ...d, employeeId: v }))}>
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
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold text-muted-foreground">النوع</Label>
              <div className="flex gap-1.5">
                {(Object.keys(TYPE_META) as AdjType[]).map((t) => (
                  <button
                    key={t}
                    type="button"
                    onClick={() => setDraft((d) => ({ ...d, type: t }))}
                    className={cn(
                      'flex-1 h-9 rounded-md border text-xs font-bold transition-colors',
                      draft.type === t ? cn('border-transparent', TYPE_META[t].badge) : 'border-border text-muted-foreground hover:border-primary/50'
                    )}
                  >
                    {TYPE_META[t].label}
                  </button>
                ))}
              </div>
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold text-muted-foreground">طريقة الاحتساب</Label>
              <div className="flex gap-1.5">
                {(['AMOUNT', 'DAYS'] as const).map((u) => (
                  <button
                    key={u}
                    type="button"
                    onClick={() => setDraft((d) => ({ ...d, unit: u, amount: '' }))}
                    className={cn(
                      'flex-1 h-9 rounded-md border text-xs font-bold transition-colors',
                      draft.unit === u ? 'border-primary bg-primary/10 text-primary' : 'border-border text-muted-foreground hover:border-primary/50'
                    )}
                  >
                    {u === 'AMOUNT' ? 'مبلغ ثابت' : 'أيام من الراتب'}
                  </button>
                ))}
              </div>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="adj-amount" className="text-xs font-semibold text-muted-foreground">
                {isDaysMode ? 'عدد الأيام' : 'المبلغ'}
              </Label>
              <div className="relative">
                <Input
                  id="adj-amount"
                  className={cn(compactInput, 'pe-12')}
                  type="number"
                  min={0}
                  max={isDaysMode ? 30 : undefined}
                  value={draft.amount}
                  onChange={(e) => setDraft((d) => ({ ...d, amount: e.target.value }))}
                  placeholder={isDaysMode ? '1' : '500'}
                />
                <span className="absolute end-3 top-1/2 -translate-y-1/2 text-[11px] font-bold text-muted-foreground pointer-events-none">
                  {isDaysMode ? 'يوم' : draftEmployee ? CURRENCY_SUFFIX[draftEmployee.currency] : ''}
                </span>
              </div>
              {daysAmount !== null && draftEmployee && (
                <p className={cn('text-[11px] font-bold', draft.type === 'BONUS' ? 'text-success' : 'text-warning')}>
                  ≈ {fmtAmount(daysAmount, draftEmployee.currency)} (الراتب ÷ 30 × {Number(draft.amount)})
                </p>
              )}
            </div>
          </div>
          <div className="flex gap-3 items-end">
            <div className="space-y-1.5 flex-1">
              <Label htmlFor="adj-note" className="text-xs font-semibold text-muted-foreground">السبب / ملاحظة</Label>
              <Input id="adj-note" className={compactInput} value={draft.note} onChange={(e) => setDraft((d) => ({ ...d, note: e.target.value }))} placeholder="مثال: حافز إنجاز مشروع العميل" />
            </div>
            <Button type="button" size="sm" className="h-9 px-5" onClick={handleAdd} disabled={!canAdd}>
              {isSaving ? <Loader2 className="h-4 w-4 me-1.5 animate-spin" /> : <Plus className="h-4 w-4 me-1.5" />}
              إضافة
            </Button>
          </div>
          {error && <p className="text-xs font-bold text-destructive">{error}</p>}
        </CardContent>
      </Card>

      {/* Type filter + compact month totals above the table */}
      <div className="flex items-center gap-1.5 mb-3 flex-wrap">
        {(['ALL', ...(Object.keys(TYPE_META) as AdjType[])] as (AdjType | 'ALL')[]).map((t) => (
          <button
            key={t}
            type="button"
            onClick={() => setTypeFilter(t)}
            className={cn(
              'h-8 px-3 rounded-full border text-xs font-bold transition-colors',
              typeFilter === t ? 'border-primary bg-primary/10 text-primary' : 'border-border text-muted-foreground hover:border-primary/50'
            )}
          >
            {t === 'ALL' ? `الكل (${monthRows.length})` : `${TYPE_META[t].label} (${monthRows.filter((r) => r.type === t).length})`}
          </button>
        ))}
        <div className="ms-auto flex items-center gap-2 flex-wrap">
          <span className="flex items-center gap-1.5 rounded-full bg-success/15 text-success px-3 py-1.5 text-xs font-bold">
            <TrendingUp className="h-3.5 w-3.5" />
            الحوافز: {fmtTotals(monthRows.filter((r) => r.type === 'BONUS'))}
          </span>
          <span className="flex items-center gap-1.5 rounded-full bg-destructive/15 text-destructive px-3 py-1.5 text-xs font-bold">
            <TrendingDown className="h-3.5 w-3.5" />
            الخصومات: {fmtTotals(monthRows.filter((r) => r.type === 'DEDUCTION'))}
          </span>
        </div>
      </div>

      <Card>
        <CardContent className="p-0">
          {visibleRows.length === 0 ? (
            <div className="py-10 text-center text-sm text-muted-foreground">لا توجد حركات في هذا الشهر</div>
          ) : (
            <ul className="divide-y divide-border">
              {visibleRows.map((row) => {
                const meta = TYPE_META[row.type];
                return (
                  <li key={row.id} className="flex items-center gap-3 px-4 py-2.5 hover:bg-muted/40">
                    <span className={cn('shrink-0 w-20 text-center rounded-full px-2 py-1 text-[11px] font-bold', meta.badge)}>
                      {meta.label}
                    </span>
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-medium truncate">{row.staffName}</div>
                      {row.note && <div className="text-xs text-muted-foreground truncate">{row.note}</div>}
                    </div>
                    {row.days && (
                      <span className="shrink-0 text-[11px] text-warning font-bold">
                        {row.days === 1 ? 'يوم واحد' : row.days === 2 ? 'يومان' : `${row.days} أيام`}
                      </span>
                    )}
                    <div
                      className={cn(
                        'w-28 text-end text-sm font-extrabold shrink-0',
                        row.type === 'BONUS' ? 'text-success' : 'text-destructive'
                      )}
                    >
                      {meta.sign}
                      {fmtAmount(row.amount, row.currency)}
                    </div>
                    <button
                      type="button"
                      onClick={() => handleDelete(row.id)}
                      className="shrink-0 p-1.5 rounded-md text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors"
                      aria-label="حذف الحركة"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </li>
                );
              })}
            </ul>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
