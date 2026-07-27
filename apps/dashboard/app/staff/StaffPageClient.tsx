'use client';

import { useMemo, useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
  Button,
  Badge,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@jbrtechno/ui';
import Link from 'next/link';
import { Users, UserPlus, Eye, Pencil, Archive } from 'lucide-react';
import { StaffStatus } from '@jbrtechno/database';
import type { Staff } from '@/actions/staff';
import { archiveStaff } from '@/actions/staffHr';
import { baseSalaryForMonth } from '@/helpers/payrollFormula';

interface StaffPageClientProps {
  staff: Staff[];
  locale: string;
}

function formatDate(date: Date | string | null) {
  if (!date) return '—';
  return new Intl.DateTimeFormat('ar-SA-u-nu-latn-ca-gregory', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  }).format(new Date(date));
}

// Tenure from hire date until today (or until termination for offboarded staff)
function tenureLabel(hireDate: Date | string, until?: Date | string | null) {
  const start = new Date(hireDate);
  const end = until ? new Date(until) : new Date();
  if (start > end) return 'لم يباشر بعد';

  let years = end.getFullYear() - start.getFullYear();
  let months = end.getMonth() - start.getMonth();
  let days = end.getDate() - start.getDate();
  if (days < 0) {
    months--;
    days += new Date(end.getFullYear(), end.getMonth(), 0).getDate();
  }
  if (months < 0) {
    years--;
    months += 12;
  }

  const y = years === 1 ? 'سنة' : years === 2 ? 'سنتان' : `${years} سنوات`;
  const m = months === 1 ? 'شهر' : months === 2 ? 'شهران' : `${months} أشهر`;
  const d = days === 1 ? 'يوم واحد' : days === 2 ? 'يومان' : `${days} أيام`;

  if (years > 0) return months > 0 ? `${y} و${m}` : y;
  if (months > 0) return days > 0 ? `${m} و${d}` : m;
  if (days > 0) return d;
  return 'أول يوم';
}

export function StaffPageClient({ staff }: StaffPageClientProps) {
  const router = useRouter();
  const [, startTransition] = useTransition();
  const [statusFilter, setStatusFilter] = useState<StaffStatus | 'ALL'>('ALL');
  const [confirmArchiveId, setConfirmArchiveId] = useState<string | null>(null);

  const handleArchive = (id: string) => {
    if (confirmArchiveId !== id) {
      setConfirmArchiveId(id);
      setTimeout(() => setConfirmArchiveId((c) => (c === id ? null : c)), 4000);
      return;
    }
    setConfirmArchiveId(null);
    startTransition(async () => {
      await archiveStaff(id);
      router.refresh();
    });
  };

  const filteredStaff = useMemo(() => {
    if (statusFilter === 'ALL') return staff;
    return staff.filter((s) => s.status === statusFilter);
  }, [staff, statusFilter]);

  const getStatusBadgeVariant = (status: StaffStatus) => {
    switch (status) {
      case 'ACTIVE':
        return 'default';
      case 'INACTIVE':
        return 'secondary';
      case 'ON_LEAVE':
        return 'outline';
      default:
        return 'secondary';
    }
  };

  const getStatusLabel = (status: StaffStatus) => {
    const labels: Record<StaffStatus, string> = {
      ACTIVE: 'نشط',
      INACTIVE: 'غير نشط',
      ON_LEAVE: 'في إجازة',
    };
    return labels[status];
  };

  // Current base salary (trial vs post-trial) — same formula as payroll
  const now = new Date();
  const currentMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;

  const isInTrial = (member: Staff) => {
    if (!member.trialEndDate) return false;
    const end = new Date(member.trialEndDate);
    const trialEndMonth = `${end.getFullYear()}-${String(end.getMonth() + 1).padStart(2, '0')}`;
    return currentMonth < trialEndMonth;
  };

  const currentSalary = (member: Staff) =>
    baseSalaryForMonth(
      {
        trialSalary: member.trialSalary,
        salary: member.salary,
        salaryMode: member.salaryMode,
        trialEndDate: member.trialEndDate ? new Date(member.trialEndDate) : null,
      },
      currentMonth
    );

  const currencySuffix = (member: Staff) => (member.currency === 'EGP' ? 'جنيه' : 'ريال');

  const displayName = (member: Staff) => member.fullName || member.application?.applicantName || '—';

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      <div className="mb-8">
        <div className="flex items-center justify-between gap-3 mb-3 flex-wrap">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-xl bg-gradient-to-br from-primary/20 to-primary/5">
              <Users className="h-7 w-7 text-primary" />
            </div>
            <div>
              <h1 className="text-4xl font-bold">الموظفون</h1>
            </div>
          </div>
          <Link href="/staff/new">
            <Button size="lg">
              <UserPlus className="h-5 w-5 me-2" />
              تسجيل موظف
            </Button>
          </Link>
        </div>
        <p className="text-muted-foreground text-base">إدارة جميع بيانات الموظفين</p>
      </div>

      {/* Staff Table */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between gap-3 flex-wrap">
            <div className="flex items-center gap-3">
              <CardTitle>قائمة الموظفين</CardTitle>
              <Badge variant="secondary">{filteredStaff.length} موظف</Badge>
            </div>
            <div className="w-40">
              <Select
                value={statusFilter}
                onValueChange={(value) => setStatusFilter(value as StaffStatus | 'ALL')}
              >
                <SelectTrigger className="h-9">
                  <SelectValue>
                    {statusFilter === 'ALL' ? 'جميع الحالات' : getStatusLabel(statusFilter as StaffStatus)}
                  </SelectValue>
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ALL">جميع الحالات</SelectItem>
                  <SelectItem value="ACTIVE">{getStatusLabel('ACTIVE')}</SelectItem>
                  <SelectItem value="INACTIVE">{getStatusLabel('INACTIVE')}</SelectItem>
                  <SelectItem value="ON_LEAVE">{getStatusLabel('ON_LEAVE')}</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="text-right">الموظف</TableHead>
                  <TableHead className="text-right">المسمى الوظيفي</TableHead>
                  <TableHead className="text-right">الراتب الحالي</TableHead>
                  <TableHead className="text-right">الحالة</TableHead>
                  <TableHead className="text-right">مدة العمل</TableHead>
                  <TableHead className="text-right w-40">الإجراءات</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredStaff.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center text-muted-foreground py-8">
                      لا يوجد موظفون
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredStaff.map((member) => {
                    const salary = currentSalary(member);
                    const inTrial = isInTrial(member);
                    return (
                      <TableRow
                        key={member.id}
                        className="cursor-pointer hover:bg-muted/50"
                        onClick={() => router.push(`/staff/${member.id}`)}
                      >
                        <TableCell className="font-medium">{displayName(member)}</TableCell>
                        <TableCell className="text-muted-foreground">
                          {member.department || member.application?.position || '—'}
                        </TableCell>
                        <TableCell>
                          {salary > 0 ? (
                            <span className="font-bold whitespace-nowrap">
                              {salary.toLocaleString('en')} {currencySuffix(member)}
                              {inTrial && (
                                <Badge variant="outline" className="ms-2 text-[10px] text-warning border-warning/40">
                                  تجربة
                                </Badge>
                              )}
                            </span>
                          ) : (
                            '—'
                          )}
                        </TableCell>
                        <TableCell>
                          <Badge variant={getStatusBadgeVariant(member.status)}>
                            {getStatusLabel(member.status)}
                          </Badge>
                        </TableCell>
                        <TableCell className="whitespace-nowrap">
                          <div className="font-medium">{tenureLabel(member.hireDate, member.terminationDate)}</div>
                          <div className="text-[11px] text-muted-foreground">منذ {formatDate(member.hireDate)}</div>
                        </TableCell>
                        <TableCell onClick={(e) => e.stopPropagation()}>
                          <div className="flex items-center gap-1">
                            <Link href={`/staff/${member.id}`}>
                              <Button variant="outline" size="sm" className="h-8 px-2" aria-label="عرض">
                                <Eye className="h-3.5 w-3.5" />
                              </Button>
                            </Link>
                            <Link href={`/staff/${member.id}/edit`}>
                              <Button variant="outline" size="sm" className="h-8 px-2" aria-label="تعديل">
                                <Pencil className="h-3.5 w-3.5" />
                              </Button>
                            </Link>
                            {member.status === 'ACTIVE' && (
                              <Button
                                variant={confirmArchiveId === member.id ? 'destructive' : 'outline'}
                                size="sm"
                                className="h-8 px-2"
                                aria-label="أرشفة"
                                onClick={() => handleArchive(member.id)}
                              >
                                <Archive className="h-3.5 w-3.5" />
                                {confirmArchiveId === member.id && <span className="ms-1 text-[11px]">متأكد؟</span>}
                              </Button>
                            )}
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
