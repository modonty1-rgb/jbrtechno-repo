'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import type { Position } from '@jbrtechno/database';
import { createPosition, updatePosition, type PositionInput } from '@/actions/positions';
import { Button, Input, Label, Textarea, Checkbox, Select, SelectContent, SelectItem, SelectTrigger, SelectValue, Card, CardHeader, CardContent } from '@jbrtechno/ui';
import { Loader2 } from 'lucide-react';

interface Props {
  initial?: Position;
}

export function PositionForm({ initial }: Props) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const [form, setForm] = useState({
    title: initial?.title ?? '',
    titleEn: initial?.titleEn ?? '',
    count: initial?.count ?? 1,
    phase: initial?.phase ?? 0,
    employmentType: initial?.employmentType ?? 'full-time',
    salaryMin: initial?.salaryMin ?? 0,
    salaryMax: initial?.salaryMax ?? 0,
    requirementsText: (initial?.requirements ?? []).join('\n'),
    requirementsEnText: (initial?.requirementsEn ?? []).join('\n'),
    filledBy: initial?.filledBy ?? '',
    isOpen: initial?.isOpen ?? true,
    order: initial?.order ?? 0,
  });

  const update = <K extends keyof typeof form>(k: K, v: (typeof form)[K]) => setForm((f) => ({ ...f, [k]: v }));

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    const input: PositionInput = {
      title: form.title,
      titleEn: form.titleEn,
      count: Number(form.count),
      phase: Number(form.phase),
      employmentType: form.employmentType,
      salaryMin: Number(form.salaryMin),
      salaryMax: Number(form.salaryMax),
      requirements: form.requirementsText.split('\n').map((s) => s.trim()).filter(Boolean),
      requirementsEn: form.requirementsEnText.split('\n').map((s) => s.trim()).filter(Boolean),
      filledBy: form.filledBy.trim() || null,
      isOpen: form.isOpen,
      order: Number(form.order),
    };
    startTransition(async () => {
      try {
        if (initial) {
          await updatePosition(initial.id, input);
        } else {
          await createPosition(input);
        }
        router.push('/positions');
        router.refresh();
      } catch (err) {
        setError(err instanceof Error ? err.message : 'فشل الحفظ');
      }
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6" dir="rtl">
      <Card>
        <CardHeader>
          <h2 className="text-lg font-semibold">معلومات أساسية</h2>
        </CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="title">العنوان (مرجعي للـURL) *</Label>
            <Input id="title" value={form.title} onChange={(e) => update('title', e.target.value)} required />
          </div>
          <div>
            <Label htmlFor="titleEn">العنوان بالإنجليزية *</Label>
            <Input id="titleEn" value={form.titleEn} onChange={(e) => update('titleEn', e.target.value)} required />
          </div>
          <div>
            <Label htmlFor="count">عدد الوظائف الشاغرة</Label>
            <Input id="count" type="number" min={1} value={form.count} onChange={(e) => update('count', Number(e.target.value))} />
          </div>
          <div>
            <Label htmlFor="phase">المرحلة (0-4)</Label>
            <Input id="phase" type="number" min={0} max={10} value={form.phase} onChange={(e) => update('phase', Number(e.target.value))} />
          </div>
          <div>
            <Label>نوع العمل</Label>
            <Select value={form.employmentType} onValueChange={(v) => update('employmentType', v)}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="full-time">دوام كامل</SelectItem>
                <SelectItem value="part-time">دوام جزئي</SelectItem>
                <SelectItem value="project-based">حسب المشروع</SelectItem>
                <SelectItem value="contract">عقد</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label htmlFor="order">ترتيب العرض</Label>
            <Input id="order" type="number" value={form.order} onChange={(e) => update('order', Number(e.target.value))} />
          </div>
          <div>
            <Label htmlFor="salaryMin">الراتب الأدنى (SAR)</Label>
            <Input id="salaryMin" type="number" min={0} value={form.salaryMin} onChange={(e) => update('salaryMin', Number(e.target.value))} />
          </div>
          <div>
            <Label htmlFor="salaryMax">الراتب الأقصى (SAR)</Label>
            <Input id="salaryMax" type="number" min={0} value={form.salaryMax} onChange={(e) => update('salaryMax', Number(e.target.value))} />
          </div>
          <div className="md:col-span-2">
            <Label htmlFor="filledBy">شاغل الوظيفة حالياً (اختياري)</Label>
            <Input id="filledBy" value={form.filledBy} onChange={(e) => update('filledBy', e.target.value)} placeholder="مثال: المهندس خالد" />
          </div>
          <div className="flex items-center gap-2 md:col-span-2">
            <Checkbox id="isOpen" checked={form.isOpen} onCheckedChange={(c) => update('isOpen', Boolean(c))} />
            <Label htmlFor="isOpen" className="cursor-pointer">الوظيفة مفتوحة للتقديم</Label>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <h2 className="text-lg font-semibold">المتطلبات</h2>
          <p className="text-xs text-muted-foreground">سطر واحد لكل متطلب</p>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="requirements">المتطلبات بالعربية</Label>
            <Textarea id="requirements" rows={6} value={form.requirementsText} onChange={(e) => update('requirementsText', e.target.value)} placeholder="3+ سنوات خبرة..." />
          </div>
          <div>
            <Label htmlFor="requirementsEn">Requirements (English)</Label>
            <Textarea id="requirementsEn" rows={6} value={form.requirementsEnText} onChange={(e) => update('requirementsEnText', e.target.value)} placeholder="3+ years experience..." />
          </div>
        </CardContent>
      </Card>

      {error && <div className="text-sm text-destructive bg-destructive/10 p-3 rounded">{error}</div>}

      <div className="flex gap-2">
        <Button type="submit" disabled={pending}>
          {pending && <Loader2 className="ml-2 h-4 w-4 animate-spin" />}
          {initial ? 'حفظ التعديلات' : 'إنشاء الوظيفة'}
        </Button>
        <Button type="button" variant="outline" onClick={() => router.push('/positions')} disabled={pending}>
          إلغاء
        </Button>
      </div>
    </form>
  );
}
