'use client';

import { useEffect, useMemo, useState, useTransition } from 'react';
import {
  Button,
  Card,
  CardContent,
  Badge,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@jbrtechno/ui';
import Link from 'next/link';
import { Wallet, Lock, LockOpen, Loader2, Copy, Check, Landmark, ExternalLink } from 'lucide-react';
import { cn } from '@jbrtechno/shared';
import { closePayrollMonth, getPayrollMonth, getEgpRate, type PayrollMonthData, type PayrollRowData } from '@/actions/staffHr';
import { Input, Label } from '@jbrtechno/ui';
import { isCloseAllowed } from '@/helpers/payrollFormula';

type Currency = 'SAR' | 'EGP';
const CURRENCY_SUFFIX: Record<Currency, string> = { SAR: 'ريال', EGP: 'جنيه' };

function fmt(amount: number, currency: Currency) {
  return `${amount.toLocaleString('en')} ${CURRENCY_SUFFIX[currency]}`;
}

export function PayrollPageClient({ initialData }: { initialData: PayrollMonthData }) {
  const [data, setData] = useState<PayrollMonthData>(initialData);
  const [isPending, startTransition] = useTransition();
  const [closeOpen, setCloseOpen] = useState(false);
  const [egpInSar, setEgpInSar] = useState('');
  const [egpRate, setEgpRate] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [payoutRow, setPayoutRow] = useState<PayrollRowData | null>(null);

  const copyValue = (key: string, value: string) => {
    navigator.clipboard.writeText(value.replace(/\s/g, ''));
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 1500);
  };

  // 3 future months + current + 8 past, newest first
  const monthOptions = useMemo(() => {
    const opts: { value: string; label: string }[] = [];
    const [y0, m0] = initialData.month.split('-').map(Number);
    const d = new Date(y0, m0 - 1 + 3, 1);
    for (let i = 0; i < 12; i++) {
      const value = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
      const label = d.toLocaleDateString('ar-SA-u-nu-latn-ca-gregory', { month: 'long', year: 'numeric' });
      opts.push({ value, label });
      d.setMonth(d.getMonth() - 1);
    }
    return opts;
  }, [initialData.month]);

  const changeMonth = (value: string) => {
    setError(null);
    startTransition(async () => {
      setData(await getPayrollMonth(value));
    });
  };

  const hasEgp = data.totals.EGP.net > 0;

  // Open the close dialog; for EGP salaries fetch today's rate and prefill
  // the editable SAR-equivalent field.
  const openCloseDialog = () => {
    setError(null);
    setEgpRate(null);
    setEgpInSar('');
    setCloseOpen(true);
    if (hasEgp) {
      startTransition(async () => {
        const { rate } = await getEgpRate();
        setEgpRate(rate);
        if (rate) setEgpInSar(String(Math.round(data.totals.EGP.net / rate)));
      });
    }
  };

  const handleConfirmClose = () => {
    setError(null);
    startTransition(async () => {
      const result = await closePayrollMonth(data.month, {
        egpInSar: hasEgp ? Number(egpInSar) : undefined,
        egpRate: egpRate ?? undefined,
      });
      if (!result.success) {
        setError(result.error || 'فشل إقفال الشهر');
      } else {
        setCloseOpen(false);
        setData(await getPayrollMonth(data.month));
      }
    });
  };

  const canConfirmClose = !isPending && (!hasEgp || Number(egpInSar) > 0);

  const activeCurrencies = (['SAR', 'EGP'] as Currency[]).filter(
    (c) => data.totals[c] && (data.totals[c].net !== 0 || data.totals[c].base !== 0)
  );

  // Grand total in SAR: Egypt salaries converted — frozen rate for closed
  // months, today's reference rate for open ones.
  const [liveRate, setLiveRate] = useState<number | null>(null);
  useEffect(() => {
    setLiveRate(null);
    if (data.totals.EGP.net > 0 && !(data.closed && data.totals.meta?.egpInSar)) {
      getEgpRate().then((r) => setLiveRate(r.rate));
    }
  }, [data.month, data.closed, data.totals.EGP.net, data.totals.meta?.egpInSar]);

  const egpAsSar =
    data.totals.EGP.net === 0
      ? 0
      : data.closed && data.totals.meta?.egpInSar
        ? data.totals.meta.egpInSar
        : liveRate
          ? Math.round(data.totals.EGP.net / liveRate)
          : null;
  const grandTotalSar = egpAsSar === null ? null : data.totals.SAR.net + egpAsSar;

  return (
    <div className="container mx-auto px-4 py-6 max-w-6xl">
      {/* Header */}
      <div className="flex items-center justify-between gap-3 flex-wrap mb-5">
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-lg bg-gradient-to-br from-primary/20 to-primary/5">
            <Wallet className="h-5 w-5 text-primary" />
          </div>
          <h1 className="text-xl font-bold">مسير الرواتب</h1>
          {data.closed ? (
            <Badge className="bg-success/15 text-success border-transparent gap-1">
              <Lock className="h-3 w-3" />
              مقفل
            </Badge>
          ) : (
            <Badge variant="secondary" className="gap-1">
              <LockOpen className="h-3 w-3" />
              مفتوح
            </Badge>
          )}
          {isPending && <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />}
        </div>
        <div className="flex items-center gap-2">
          <Select value={data.month} onValueChange={changeMonth}>
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
          {!data.closed && data.rows.length > 0 && (() => {
            const window = isCloseAllowed(data.month);
            if (!window.allowed && window.reason?.includes('لم يبدأ')) return null;
            return (
              <div className="flex items-center gap-2">
                {!window.allowed && (
                  <span className="text-[11px] text-muted-foreground">{window.reason}</span>
                )}
                <Button size="sm" className="h-9" onClick={openCloseDialog} disabled={isPending || !window.allowed}>
                  <Lock className="h-4 w-4 me-1.5" />
                  إقفال الشهر
                </Button>
              </div>
            );
          })()}
        </div>
      </div>

      {error && (
        <div className="rounded-lg border border-destructive/40 bg-destructive/10 text-destructive px-4 py-2.5 text-sm font-bold mb-4">
          {error}
        </div>
      )}

      {/* Per-currency totals + unified grand total in SAR */}
      {activeCurrencies.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 mb-5">
          {(['SAR', 'EGP'] as Currency[]).map((c) => {
            const t = data.totals[c];
            return (
              <Card key={c}>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-bold text-muted-foreground">
                      إجمالي {c === 'SAR' ? 'السعودية (ريال)' : 'مصر (جنيه)'}
                    </span>
                    <span className="text-lg font-extrabold text-primary">{fmt(t.net, c)}</span>
                  </div>
                  <div className="flex flex-wrap gap-x-4 gap-y-1 text-[11px] text-muted-foreground">
                    <span>أساسي: {fmt(t.base, c)}</span>
                    <span className="text-success">حوافز: +{fmt(t.bonuses, c)}</span>
                    <span className="text-destructive">خصومات: −{fmt(t.deductions, c)}</span>
                  </div>
                </CardContent>
              </Card>
            );
          })}
          <Card className="border-primary/40 bg-primary/5">
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold text-muted-foreground">الإجمالي النهائي (بالريال)</span>
                <span className="text-lg font-extrabold text-primary">
                  {grandTotalSar !== null ? fmt(grandTotalSar, 'SAR') : '...'}
                </span>
              </div>
              <div className="text-[11px] text-muted-foreground">
                {data.totals.EGP.net === 0
                  ? 'لا رواتب مصرية هذا الشهر'
                  : data.closed && data.totals.meta?.egpInSar
                    ? `رواتب مصر بالمبلغ المدفوع فعلياً عند الإقفال (${data.totals.meta.egpInSar.toLocaleString('en')} ريال)`
                    : liveRate
                      ? `رواتب مصر محوّلة بسعر اليوم (1 ريال = ${liveRate.toFixed(2)} جنيه) — تقريبي حتى الإقفال`
                      : 'جاري جلب سعر الصرف...'}
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      <Card>
        <CardContent className="p-0">
          {data.rows.length === 0 ? (
            <div className="py-10 text-center text-sm text-muted-foreground">
              لا يوجد موظفون في هذا الشهر
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="text-right">الموظف</TableHead>
                    <TableHead className="text-right">أيام العمل</TableHead>
                    <TableHead className="text-right">الراتب الأساسي</TableHead>
                    <TableHead className="text-right">الحوافز</TableHead>
                    <TableHead className="text-right">الخصومات</TableHead>
                    <TableHead className="text-right">الصافي</TableHead>
                    <TableHead className="text-right">التحويل إلى</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {data.rows.map((row) => (
                    <TableRow key={row.staffId}>
                      <TableCell className="font-medium">
                        <div className="flex items-center gap-2">
                          <Link
                            href={`/staff/${row.staffId}`}
                            className="inline-flex items-center gap-1.5 hover:text-primary hover:underline"
                          >
                            {row.name}
                            <ExternalLink className="h-3 w-3 opacity-40" />
                          </Link>
                          {row.isNewHire && (
                            <Badge className="bg-info/15 text-info border-transparent hover:bg-info/15 text-[10px]">
                              جديد
                            </Badge>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        {row.workedDays != null && row.monthDays != null ? (
                          <span
                            dir="ltr"
                            className={cn(
                              'font-medium whitespace-nowrap',
                              row.workedDays < row.monthDays && 'text-warning font-bold'
                            )}
                          >
                            {row.workedDays} / {row.monthDays}
                          </span>
                        ) : (
                          '—'
                        )}
                      </TableCell>
                      <TableCell>{fmt(row.base, row.currency)}</TableCell>
                      <TableCell className={cn(row.bonuses > 0 && 'text-success font-bold')}>
                        {row.bonuses > 0 ? `+${fmt(row.bonuses, row.currency)}` : '—'}
                      </TableCell>
                      <TableCell className={cn(row.deductions > 0 && 'text-destructive font-bold')}>
                        {row.deductions > 0 ? `−${fmt(row.deductions, row.currency)}` : '—'}
                      </TableCell>
                      <TableCell className="font-extrabold text-primary">{fmt(row.net, row.currency)}</TableCell>
                      <TableCell>
                        <Button variant="outline" size="sm" className="h-8" onClick={() => setPayoutRow(row)}>
                          <Landmark className="h-3.5 w-3.5 me-1.5" />
                          البيانات البنكية
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Month-close dialog: confirm totals, convert EGP, post to the ledger */}
      <Dialog open={closeOpen} onOpenChange={(open) => !open && setCloseOpen(false)}>
        <DialogContent className="max-w-md" dir="rtl">
          <DialogHeader>
            <DialogTitle asChild>
              <div className="flex items-center gap-2 text-start">
                <Lock className="h-4 w-4 text-primary" />
                <span>
                  إقفال {monthOptions.find((m) => m.value === data.month)?.label} — نهائي
                </span>
              </div>
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            {data.totals.SAR.net > 0 && (
              <div className="flex items-center justify-between rounded-lg border border-border/60 bg-muted/20 px-3 py-2.5 text-sm">
                <span className="text-muted-foreground">رواتب السعودية</span>
                <b>{fmt(data.totals.SAR.net, 'SAR')}</b>
              </div>
            )}
            {hasEgp && (
              <div className="space-y-2 rounded-lg border border-warning/30 bg-warning/5 p-3">
                <p className="text-xs leading-relaxed">
                  رواتب مصر <b>بالجنيه</b>، لكن دفتر المحاسبة <b>بالريال</b> — فنسجلها بما كلفتك فعلياً وقت
                  التحويل.
                </p>
                <div className="rounded-md bg-muted/40 px-3 py-2 text-xs space-y-1">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">رواتب مصر</span>
                    <b>{fmt(data.totals.EGP.net, 'EGP')}</b>
                  </div>
                  {egpRate ? (
                    <>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">سعر الصرف اليوم</span>
                        <span dir="ltr">1 ريال = {egpRate.toFixed(2)} جنيه</span>
                      </div>
                      <div className="flex justify-between border-t border-border/60 pt-1">
                        <span className="text-muted-foreground">التقدير بالريال</span>
                        <b className="text-primary" dir="ltr">
                          {data.totals.EGP.net.toLocaleString('en')} ÷ {egpRate.toFixed(2)} ≈{' '}
                          {Math.round(data.totals.EGP.net / egpRate).toLocaleString('en')} ريال
                        </b>
                      </div>
                    </>
                  ) : (
                    <div className="text-muted-foreground">
                      {isPending ? 'جاري جلب سعر الصرف...' : 'تعذر جلب سعر الصرف — اكتب المبلغ يدوياً'}
                    </div>
                  )}
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="egp-in-sar" className="text-xs font-semibold">
                    كم ريالاً دفعت (أو ستدفع) فعلياً لتحويل رواتب مصر؟ *
                  </Label>
                  <div className="relative">
                    <Input
                      id="egp-in-sar"
                      type="number"
                      min={0}
                      className="h-9 pe-12"
                      value={egpInSar}
                      onChange={(e) => setEgpInSar(e.target.value)}
                      placeholder={egpRate ? '' : 'اكتب المبلغ يدوياً'}
                    />
                    <span className="absolute end-3 top-1/2 -translate-y-1/2 text-[11px] font-bold text-muted-foreground pointer-events-none">
                      ريال
                    </span>
                  </div>
                  <p className="text-[11px] text-muted-foreground">
                    عبّيناه بالتقدير — لو البنك حوّل بمبلغ مختلف (رسوم أو هامش)، صحّح الرقم قبل التأكيد
                  </p>
                </div>
              </div>
            )}
            <div className="rounded-lg border border-info/30 bg-info/10 px-3 py-2.5 text-xs">
              عند التأكيد يتجمد الكشف نهائياً، وتتسجل الرواتب تلقائياً كمصروف في المحاسبة تحت تصنيف «الرواتب»
            </div>
            {error && <p className="text-xs font-bold text-destructive">{error}</p>}
            <div className="flex gap-2 justify-end">
              <Button variant="outline" size="sm" onClick={() => setCloseOpen(false)} disabled={isPending}>
                إلغاء
              </Button>
              <Button variant="destructive" size="sm" onClick={handleConfirmClose} disabled={!canConfirmClose}>
                {isPending ? <Loader2 className="h-4 w-4 me-1.5 animate-spin" /> : <Lock className="h-4 w-4 me-1.5" />}
                تأكيد الإقفال النهائي
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Transfer-details dialog: everything needed to pay this employee */}
      <Dialog open={payoutRow !== null} onOpenChange={(open) => !open && setPayoutRow(null)}>
        <DialogContent className="max-w-md" dir="rtl">
          {payoutRow && (
            <>
              <DialogHeader>
                <DialogTitle asChild>
                  <div className="flex items-center gap-3 text-start">
                    <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                      <Landmark className="h-5 w-5 text-primary" />
                    </div>
                    <div className="text-base font-bold truncate">{payoutRow.name}</div>
                  </div>
                </DialogTitle>
              </DialogHeader>
              <div className="space-y-2">
                {/* The amount to transfer — the headline of this dialog */}
                <div className="flex items-center justify-between rounded-xl border border-primary/40 bg-primary/10 px-4 py-3">
                  <span className="text-xs font-bold text-muted-foreground">الصافي المستحق</span>
                  <div className="flex items-center gap-2">
                    <span className="text-2xl font-extrabold text-primary whitespace-nowrap">
                      {fmt(payoutRow.net, payoutRow.currency)}
                    </span>
                    <button
                      type="button"
                      onClick={() => copyValue('amount', String(payoutRow.net))}
                      className="p-1.5 rounded-md text-muted-foreground hover:text-primary hover:bg-primary/10 transition-colors"
                      aria-label="نسخ المبلغ"
                    >
                      {copiedKey === 'amount' ? <Check className="h-4 w-4 text-success" /> : <Copy className="h-4 w-4" />}
                    </button>
                  </div>
                </div>
                {[
                  { key: 'bank', label: 'البنك', value: payoutRow.bankName, copyable: false },
                  { key: 'iban', label: 'الآيبان', value: payoutRow.iban, copyable: true },
                  { key: 'instapay', label: 'إنستاباي', value: payoutRow.instapay, copyable: true },
                  { key: 'vodafone', label: 'فودافون كاش', value: payoutRow.vodafoneCash, copyable: true },
                ]
                  .filter((item) => item.value)
                  .map((item) => (
                    <div key={item.key} className="flex items-center gap-3 rounded-lg border border-border/60 bg-muted/20 px-3 py-2.5">
                      <span className="text-xs text-muted-foreground w-20 shrink-0">{item.label}</span>
                      <span className={cn('text-sm font-medium flex-1 min-w-0 truncate', item.copyable && 'font-mono text-left')} dir={item.copyable ? 'ltr' : undefined}>
                        {item.value}
                      </span>
                      {item.copyable && (
                        <button
                          type="button"
                          onClick={() => copyValue(item.key, item.value!)}
                          className="p-1.5 rounded-md text-muted-foreground hover:text-primary hover:bg-primary/10 transition-colors shrink-0"
                          aria-label={`نسخ ${item.label}`}
                        >
                          {copiedKey === item.key ? <Check className="h-4 w-4 text-success" /> : <Copy className="h-4 w-4" />}
                        </button>
                      )}
                    </div>
                  ))}
                {!payoutRow.bankName && !payoutRow.iban && !payoutRow.instapay && !payoutRow.vodafoneCash && (
                  <p className="text-sm text-muted-foreground text-center py-4">
                    لا توجد بيانات بنكية مسجلة لهذا الموظف — أضفها من ملفه
                  </p>
                )}
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>

      {data.closed && data.closedAt && (
        <p className="text-xs text-muted-foreground mt-3">
          أُقفل هذا الشهر بتاريخ{' '}
          <span dir="ltr">{new Date(data.closedAt).toLocaleDateString('ar-SA-u-nu-latn-ca-gregory', { year: 'numeric', month: 'long', day: 'numeric' })}</span>{' '}
          — الأرقام أعلاه لقطة ثابتة لا تتأثر بأي تعديل لاحق.
        </p>
      )}
    </div>
  );
}
