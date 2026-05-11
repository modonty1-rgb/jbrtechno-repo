'use client';

import { useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@jbrtechno/ui';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@jbrtechno/ui';
import { Button } from '@jbrtechno/ui';
import { Badge } from '@jbrtechno/ui';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@jbrtechno/ui';
import { Users, Eye } from 'lucide-react';
import { StaffStatus } from '@jbrtechno/database';
import type { Staff } from '@/actions/staff';

interface StaffPageClientProps {
  staff: Staff[];
  locale: string;
}

export function StaffPageClient({ staff, locale }: StaffPageClientProps) {
  const router = useRouter();
  const isArabic = true;

  const [statusFilter, setStatusFilter] = useState<StaffStatus | 'ALL'>('ALL');

  const filteredStaff = useMemo(() => {
    let filtered = staff;

    // Apply status filter
    if (statusFilter !== 'ALL') {
      filtered = filtered.filter((s) => s.status === statusFilter);
    }

    return filtered;
  }, [staff, statusFilter]);

  const formatDate = (date: Date | string) => {
    return new Intl.DateTimeFormat(isArabic ? 'ar-SA' : 'en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    }).format(new Date(date));
  };

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
    const labels: Record<StaffStatus, { ar: string; en: string }> = {
      ACTIVE: { ar: 'نشط', en: 'Active' },
      INACTIVE: { ar: 'غير نشط', en: 'Inactive' },
      ON_LEAVE: { ar: 'في إجازة', en: 'On Leave' },
    };
    return isArabic ? labels[status].ar : labels[status].en;
  };

  const handleRowClick = (staffId: string) => {
    router.push(`/staff/${staffId}`);
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-3">
          <div className="p-3 rounded-xl bg-gradient-to-br from-primary/20 to-primary/5">
            <Users className="h-7 w-7 text-primary" />
          </div>
          <div>
            <h1 className="text-4xl font-bold">
              {isArabic ? 'الموظفون' : 'Staff Management'}
            </h1>
          </div>
        </div>
        <p className="text-muted-foreground text-base">
          {isArabic
            ? 'إدارة جميع بيانات الموظفين'
            : 'Manage all staff member data'}
        </p>
      </div>

      {/* Filters */}
      <Card className="mb-6">
        <CardContent className="pt-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="sm:w-48">
              <Select
                value={statusFilter}
                onValueChange={(value) => setStatusFilter(value as StaffStatus | 'ALL')}
              >
                <SelectTrigger>
                  <SelectValue>
                    {statusFilter === 'ALL'
                      ? isArabic
                        ? 'جميع الحالات'
                        : 'All Status'
                      : getStatusLabel(statusFilter as StaffStatus)}
                  </SelectValue>
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ALL">{isArabic ? 'جميع الحالات' : 'All Status'}</SelectItem>
                  <SelectItem value="ACTIVE">{getStatusLabel('ACTIVE')}</SelectItem>
                  <SelectItem value="INACTIVE">{getStatusLabel('INACTIVE')}</SelectItem>
                  <SelectItem value="ON_LEAVE">{getStatusLabel('ON_LEAVE')}</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Staff Table */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>
              {isArabic ? 'قائمة الموظفين' : 'Staff List'}
            </CardTitle>
            <Badge variant="secondary">
              {filteredStaff.length} {isArabic ? 'موظف' : 'staff'}
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className={isArabic ? 'text-right' : 'text-left'}>
                    {isArabic ? 'الاسم' : 'Name'}
                  </TableHead>
                  <TableHead className={isArabic ? 'text-right' : 'text-left'}>
                    {isArabic ? 'البريد الإلكتروني' : 'Email'}
                  </TableHead>
                  <TableHead className={isArabic ? 'text-right' : 'text-left'}>
                    {isArabic ? 'الهاتف' : 'Phone'}
                  </TableHead>
                  <TableHead className={isArabic ? 'text-right' : 'text-left'}>
                    {isArabic ? 'الوظيفة' : 'Position'}
                  </TableHead>
                  <TableHead className={isArabic ? 'text-right' : 'text-left'}>
                    {isArabic ? 'القسم' : 'Department'}
                  </TableHead>
                  <TableHead className={isArabic ? 'text-right' : 'text-left'}>
                    {isArabic ? 'رقم الموظف' : 'Employee ID'}
                  </TableHead>
                  <TableHead className={isArabic ? 'text-right' : 'text-left'}>
                    {isArabic ? 'الحالة' : 'Status'}
                  </TableHead>
                  <TableHead className={isArabic ? 'text-right' : 'text-left'}>
                    {isArabic ? 'تاريخ التوظيف' : 'Hire Date'}
                  </TableHead>
                  <TableHead className={isArabic ? 'text-right' : 'text-left'}>
                    {isArabic ? 'الإجراءات' : 'Actions'}
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredStaff.length === 0 ? (
                  <TableRow>
                    <TableCell
                      colSpan={9}
                      className="text-center text-muted-foreground py-8"
                    >
                      {isArabic ? 'لا يوجد موظفون' : 'No staff members found'}
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredStaff.map((member) => {
                    const displayName = member.application?.applicantName || 'N/A';
                    return (
                      <TableRow
                        key={member.id}
                        className="cursor-pointer hover:bg-muted/50"
                        onClick={() => handleRowClick(member.id)}
                      >
                        <TableCell className="font-medium">{displayName}</TableCell>
                        <TableCell>{member.application?.email || '-'}</TableCell>
                        <TableCell>{member.application?.phone || '-'}</TableCell>
                        <TableCell>{member.application?.position || '-'}</TableCell>
                        <TableCell>{member.department || '-'}</TableCell>
                        <TableCell>{member.employeeId || '-'}</TableCell>
                        <TableCell>
                          <Badge variant={getStatusBadgeVariant(member.status)}>
                            {getStatusLabel(member.status)}
                          </Badge>
                        </TableCell>
                        <TableCell>{formatDate(member.hireDate)}</TableCell>
                        <TableCell onClick={(e) => e.stopPropagation()}>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleRowClick(member.id)}
                            className={isArabic ? 'flex-row-reverse' : ''}
                          >
                            <Eye className={`h-4 w-4 ${isArabic ? 'ml-2' : 'mr-2'}`} />
                            {isArabic ? 'عرض' : 'View'}
                          </Button>
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









