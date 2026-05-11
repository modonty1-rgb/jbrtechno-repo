'use client';

import { useState, useTransition, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import type { Position } from '@jbrtechno/database';
import { deletePosition, togglePositionOpen } from '@/actions/positions';
import { Button, Input, Card, CardContent, Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@jbrtechno/ui';
import { Plus, Search, Pencil, Trash2, Eye, EyeOff } from 'lucide-react';

interface Props {
  positions: Position[];
}

export function PositionsPageClient({ positions }: Props) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [search, setSearch] = useState('');
  const [phaseFilter, setPhaseFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');

  const phases = useMemo(() => Array.from(new Set(positions.map((p) => p.phase))).sort(), [positions]);

  const filtered = useMemo(() => {
    return positions.filter((p) => {
      if (search) {
        const q = search.toLowerCase();
        if (!p.title.toLowerCase().includes(q) && !p.titleEn.toLowerCase().includes(q)) return false;
      }
      if (phaseFilter !== 'all' && p.phase !== Number(phaseFilter)) return false;
      if (statusFilter === 'open' && !p.isOpen) return false;
      if (statusFilter === 'closed' && p.isOpen) return false;
      return true;
    });
  }, [positions, search, phaseFilter, statusFilter]);

  const handleToggle = (id: string) => {
    startTransition(async () => {
      await togglePositionOpen(id);
      router.refresh();
    });
  };

  const handleDelete = (id: string, title: string) => {
    if (!confirm(`هل تريد حذف الوظيفة "${title}"؟`)) return;
    startTransition(async () => {
      await deletePosition(id);
      router.refresh();
    });
  };

  return (
    <div className="space-y-4" dir="rtl">
      <div className="flex flex-col md:flex-row gap-3 items-stretch md:items-center justify-between">
        <h1 className="text-2xl font-bold">إدارة الوظائف</h1>
        <Link href="/positions/new">
          <Button>
            <Plus className="ml-2 h-4 w-4" />
            وظيفة جديدة
          </Button>
        </Link>
      </div>

      <Card>
        <CardContent className="pt-6 grid grid-cols-1 md:grid-cols-3 gap-3">
          <div className="relative">
            <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="بحث بالعنوان..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pr-9"
            />
          </div>
          <Select value={phaseFilter} onValueChange={setPhaseFilter}>
            <SelectTrigger><SelectValue placeholder="المرحلة" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">كل المراحل</SelectItem>
              {phases.map((p) => (
                <SelectItem key={p} value={String(p)}>مرحلة {p}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger><SelectValue placeholder="الحالة" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">الكل</SelectItem>
              <SelectItem value="open">مفتوحة</SelectItem>
              <SelectItem value="closed">مغلقة</SelectItem>
            </SelectContent>
          </Select>
        </CardContent>
      </Card>

      <div className="text-sm text-muted-foreground">
        {filtered.length} من {positions.length} وظيفة
      </div>

      <div className="grid gap-3">
        {filtered.map((p) => (
          <Card key={p.id} className={!p.isOpen ? 'opacity-60' : ''}>
            <CardContent className="pt-6 flex flex-col md:flex-row md:items-center justify-between gap-3">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <h3 className="font-semibold">{p.title}</h3>
                  <span className="text-xs bg-muted px-2 py-0.5 rounded">مرحلة {p.phase}</span>
                  <span className="text-xs bg-muted px-2 py-0.5 rounded">{p.employmentType}</span>
                  <span className={`text-xs px-2 py-0.5 rounded ${p.isOpen ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-600'}`}>
                    {p.isOpen ? 'مفتوحة' : 'مغلقة'}
                  </span>
                </div>
                <p className="text-sm text-muted-foreground mt-1">
                  {p.titleEn} · {p.count} شاغر · {p.requirements.length} متطلب
                  {p.filledBy ? ` · يشغلها: ${p.filledBy}` : ''}
                </p>
              </div>
              <div className="flex gap-2 shrink-0">
                <Button size="sm" variant="outline" onClick={() => handleToggle(p.id)} disabled={pending} title={p.isOpen ? 'إغلاق' : 'فتح'}>
                  {p.isOpen ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </Button>
                <Link href={`/positions/${p.id}`}>
                  <Button size="sm" variant="outline"><Pencil className="h-4 w-4" /></Button>
                </Link>
                <Button size="sm" variant="outline" onClick={() => handleDelete(p.id, p.title)} disabled={pending} className="text-destructive">
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
        {filtered.length === 0 && (
          <Card><CardContent className="py-12 text-center text-muted-foreground">لا توجد وظائف مطابقة</CardContent></Card>
        )}
      </div>
    </div>
  );
}
