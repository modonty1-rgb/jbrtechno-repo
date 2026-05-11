'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@jbrtechno/ui';
import { Button } from '@jbrtechno/ui';
import { Input } from '@jbrtechno/ui';
import { Label } from '@jbrtechno/ui';
import { Textarea } from '@jbrtechno/ui';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@jbrtechno/ui';
import { Badge } from '@jbrtechno/ui';
import { Alert, AlertDescription } from '@jbrtechno/ui';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@jbrtechno/ui';
import {
  ArrowLeft,
  Save,
  Loader2,
  User,
  Mail,
  Phone,
  Briefcase,
  Calendar,
  FileText,
  Key,
  AlertTriangle,
  Image as ImageIcon,
  ChevronDown,
  CircleDollarSign,
} from 'lucide-react';
import { updateStaff, type Staff, type EmergencyContact } from '@/actions/staff';
import { syncClockifyUser } from '@/actions/clockify';
import { StaffStatus } from '@jbrtechno/database';
import { PasswordResetDialog } from '@/components/applications/PasswordResetDialog';
import { EmergencyContactForm } from '@/components/applications/EmergencyContactForm';
import { calculateTrialMonths, calculateTrialEndDate } from '@/helpers/trialPeriodCalculator';

interface StaffDetailClientProps {
  staff: Staff;
  locale: string;
  hasApplication: boolean;
}

export function StaffDetailClient({
  staff,
  locale,
  hasApplication,
}: StaffDetailClientProps) {
  const router = useRouter();
  const isArabic = true;

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isPasswordDialogOpen, setIsPasswordDialogOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isAccountManagementOpen, setIsAccountManagementOpen] = useState(false);
  const [isLegalDocumentsOpen, setIsLegalDocumentsOpen] = useState(false);
  const [isCompensationOpen, setIsCompensationOpen] = useState(false);
  const [isEmergencyContactsOpen, setIsEmergencyContactsOpen] = useState(false);
  const [clockifyUserId, setClockifyUserId] = useState(staff.clockifyUserId || '');
  const [isLinkingClockify, setIsLinkingClockify] = useState(false);

  // Get display data from Application relation
  const displayName = staff.application?.applicantName || 'N/A';
  const displayEmail = staff.application?.email || 'N/A';
  const displayPhone = staff.application?.phone || 'N/A';
  const displayPosition = staff.application?.position || 'N/A';
  const displayYearsOfExperience = staff.application?.yearsOfExperience ?? null;
  const displaySkills = staff.application?.skills || [];
  const displayProfileImage = staff.application?.profileImageUrl;

  const [formData, setFormData] = useState({
    employeeId: staff.employeeId || '',
    salary: staff.salary?.toString() || '',
    hireDate: staff.hireDate
      ? new Date(staff.hireDate).toISOString().split('T')[0]
      : new Date().toISOString().split('T')[0],
    status: staff.status,
    notes: staff.notes || '',
    username: staff.username || '',
    officialEmail: staff.officialEmail || '',
    clockifyUserId: staff.clockifyUserId || '',
    trialStartDate:
      staff.trialStartDate
        ? new Date(staff.trialStartDate).toISOString().split('T')[0]
        : '',
    trialEndDate: staff.trialEndDate
      ? new Date(staff.trialEndDate).toISOString().split('T')[0]
      : '',
    trialMonths: staff.trialMonths?.toString() || '3',
    trialSalary: staff.trialSalary?.toString() || '',
    ndaSignedDate: staff.ndaSignedDate
      ? new Date(staff.ndaSignedDate).toISOString().split('T')[0]
      : '',
    contractSignedDate: staff.contractSignedDate
      ? new Date(staff.contractSignedDate).toISOString().split('T')[0]
      : '',
    currency: staff.currency || 'SAR',
    emergencyContact1: staff.emergencyContact1,
    emergencyContact2: staff.emergencyContact2,
  });

  // Auto-set hire date and calculate trial end date from contract signed date
  useEffect(() => {
    if (formData.contractSignedDate) {
      const contractDate = new Date(formData.contractSignedDate + 'T00:00:00');
      const endDate = calculateTrialEndDate(contractDate, 3);
      // Format date in local timezone to avoid year skipping
      const year = endDate.getFullYear();
      const month = String(endDate.getMonth() + 1).padStart(2, '0');
      const day = String(endDate.getDate()).padStart(2, '0');
      const formattedEndDate = `${year}-${month}-${day}`;

      setFormData((prev) => ({
        ...prev,
        hireDate: prev.contractSignedDate,
        trialEndDate: formattedEndDate,
        trialMonths: '3',
      }));
    }
  }, [formData.contractSignedDate]);

  // Auto-calculate trial months from contract signed date to trial end date
  useEffect(() => {
    if (formData.contractSignedDate && formData.trialEndDate) {
      // HTML date inputs return YYYY-MM-DD format, use directly
      const contractDate = new Date(formData.contractSignedDate + 'T00:00:00');
      const endDate = new Date(formData.trialEndDate + 'T00:00:00');

      // Validate dates are valid
      if (!isNaN(contractDate.getTime()) && !isNaN(endDate.getTime())) {
        const months = calculateTrialMonths(contractDate, endDate);
        if (months > 0) {
          setFormData((prev) => ({
            ...prev,
            trialMonths: months.toString(),
          }));
        }
      }
    }
  }, [formData.contractSignedDate, formData.trialEndDate]);

  const getStatusLabel = (status: StaffStatus) => {
    const labels: Record<StaffStatus, { ar: string; en: string }> = {
      ACTIVE: { ar: 'نشط', en: 'Active' },
      INACTIVE: { ar: 'غير نشط', en: 'Inactive' },
      ON_LEAVE: { ar: 'في إجازة', en: 'On Leave' },
    };
    return isArabic ? labels[status].ar : labels[status].en;
  };

  const getCurrencyName = (currency: string): string => {
    const currencies: Record<string, { ar: string; en: string }> = {
      SAR: { ar: 'ريال سعودي', en: 'SAR' },
      USD: { ar: 'دولار', en: 'USD' },
      EGP: { ar: 'جنيه مصري', en: 'EGP' },
    };
    return isArabic ? currencies[currency]?.ar || currency : currencies[currency]?.en || currency;
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

  const formatDate = (date: Date | string | null) => {
    if (!date) return '-';
    return new Intl.DateTimeFormat(isArabic ? 'ar-SA' : 'en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    }).format(new Date(date));
  };

  const handleSave = async () => {
    setError('');
    setSuccess('');

    if (!formData.contractSignedDate) {
      setError(isArabic ? 'تاريخ توقيع العقد مطلوب' : 'Contract signed date is required');
      return;
    }

    setIsSubmitting(true);

    try {
      // Parse dates with time component to avoid timezone shifts
      const parseDate = (dateStr: string) => {
        if (!dateStr) return undefined;
        return new Date(dateStr + 'T00:00:00');
      };

      const result = await updateStaff(staff.id, {
        employeeId: formData.employeeId.trim() || undefined,
        salary: formData.salary ? parseFloat(formData.salary) : undefined,
        hireDate: formData.hireDate ? parseDate(formData.hireDate) : undefined,
        status: formData.status,
        notes: formData.notes.trim() || undefined,
        username: (() => {
          const trimmed = formData.username.trim();
          // Don't send if empty or if it's an email address (contains @)
          // Email addresses are not valid usernames
          if (!trimmed || trimmed.includes('@')) {
            return undefined;
          }
          return trimmed;
        })(),
        officialEmail: formData.officialEmail.trim() || undefined,
        trialStartDate: formData.contractSignedDate && formData.trialEndDate
          ? parseDate(formData.contractSignedDate)
          : null,
        trialEndDate: formData.trialEndDate
          ? parseDate(formData.trialEndDate)
          : null,
        trialMonths: formData.trialMonths
          ? parseInt(formData.trialMonths)
          : null,
        trialSalary: formData.trialSalary
          ? parseFloat(formData.trialSalary)
          : null,
        ndaSignedDate: formData.ndaSignedDate
          ? parseDate(formData.ndaSignedDate)
          : null,
        contractSignedDate: parseDate(formData.contractSignedDate),
        currency: formData.currency,
        emergencyContact1: formData.emergencyContact1,
        emergencyContact2: formData.emergencyContact2,
      });

      if (result.success) {
        setSuccess(isArabic ? 'تم الحفظ بنجاح' : 'Saved successfully');
        router.refresh();
        setTimeout(() => setSuccess(''), 3000);
      } else {
        setError(
          result.error || (isArabic ? 'فشل في الحفظ' : 'Failed to save')
        );
      }
    } catch (err: unknown) {
      const errorMessage =
        err instanceof Error
          ? err.message
          : isArabic
            ? 'فشل في الحفظ'
            : 'Failed to save';
      setError(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleLinkClockify = async () => {
    setIsLinkingClockify(true);
    setError('');
    setSuccess('');

    try {
      const result = await syncClockifyUser(staff.id, clockifyUserId);
      if (result.success) {
        setSuccess(isArabic ? 'تم ربط معرف Clockify بنجاح' : 'Clockify User ID linked successfully');
        router.refresh();
        setTimeout(() => setSuccess(''), 3000);
      } else {
        setError(result.error || (isArabic ? 'فشل في ربط معرف Clockify' : 'Failed to link Clockify User ID'));
      }
    } catch (err: unknown) {
      const errorMessage =
        err instanceof Error
          ? err.message
          : isArabic
            ? 'فشل في ربط معرف Clockify'
            : 'Failed to link Clockify User ID';
      setError(errorMessage);
    } finally {
      setIsLinkingClockify(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      <div className="mb-6">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => router.push('/staff')}
          className={isArabic ? 'flex-row-reverse' : ''}
        >
          <ArrowLeft className={`h-4 w-4 ${isArabic ? 'ml-2' : 'mr-2'}`} />
          {isArabic ? 'العودة إلى قائمة الموظفين' : 'Back to Staff List'}
        </Button>
      </div>

      <div className="mb-8">
        <div className="flex items-center gap-3 mb-3">
          {displayProfileImage ? (
            <img
              src={displayProfileImage}
              alt={displayName}
              className="w-16 h-16 rounded-full object-cover border-2 border-primary/20"
            />
          ) : (
            <div className="p-3 rounded-xl bg-gradient-to-br from-primary/20 to-primary/5">
              <User className="h-7 w-7 text-primary" />
            </div>
          )}
          <div className="flex-1">
            <div className="flex items-center gap-3 flex-wrap">
              <h1 className="text-4xl font-bold">{displayName}</h1>
              <Select
                value={formData.status}
                onValueChange={(value) =>
                  setFormData({
                    ...formData,
                    status: value as StaffStatus,
                  })
                }
                disabled={isSubmitting}
              >
                <SelectTrigger className="w-[140px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ACTIVE">
                    {getStatusLabel('ACTIVE')}
                  </SelectItem>
                  <SelectItem value="INACTIVE">
                    {getStatusLabel('INACTIVE')}
                  </SelectItem>
                  <SelectItem value="ON_LEAVE">
                    {getStatusLabel('ON_LEAVE')}
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
            <p className="text-muted-foreground text-base mt-1">
              {isArabic ? 'تفاصيل الموظف' : 'Staff Details'}
            </p>
          </div>
        </div>
      </div>

      {!hasApplication && (
        <Alert className="mb-6 border-yellow-500 bg-yellow-50 dark:bg-yellow-950/20">
          <AlertTriangle className="h-4 w-4 text-yellow-600" />
          <AlertDescription className="text-yellow-800 dark:text-yellow-200">
            {isArabic
              ? 'هذا السجل لا يحتوي على بيانات الطلب المرتبطة. يرجى ربطه بطلب توظيف.'
              : 'This staff record is missing application data. Please link it to an application.'}
          </AlertDescription>
        </Alert>
      )}

      <div className="space-y-6">
        {/* Profile Section - Read-only from Application */}
        <Card>
          <Collapsible open={isProfileOpen} onOpenChange={setIsProfileOpen}>
            <CollapsibleTrigger asChild>
              <CardHeader className="cursor-pointer hover:bg-muted/50 transition-colors">
                <CardTitle className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <User className="h-5 w-5" />
                    {isArabic ? 'الملف الشخصي' : 'Profile'}
                  </div>
                  <ChevronDown
                    className={`h-5 w-5 transition-transform ${isProfileOpen ? 'rotate-180' : ''
                      }`}
                  />
                </CardTitle>
              </CardHeader>
            </CollapsibleTrigger>
            <CollapsibleContent>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="text-muted-foreground flex items-center gap-2">
                      <Mail className="h-4 w-4" />
                      {isArabic ? 'البريد الإلكتروني الشخصي' : 'Personal Email'}
                    </Label>
                    <Input value={displayEmail} readOnly className="bg-muted" />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-muted-foreground flex items-center gap-2">
                      <Phone className="h-4 w-4" />
                      {isArabic ? 'الهاتف' : 'Phone'}
                    </Label>
                    <Input value={displayPhone} readOnly className="bg-muted" />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-muted-foreground flex items-center gap-2">
                      <Briefcase className="h-4 w-4" />
                      {isArabic ? 'الوظيفة' : 'Position'}
                    </Label>
                    <Input value={displayPosition} readOnly className="bg-muted" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="employeeId">
                      {isArabic ? 'رقم الموظف' : 'Employee ID'}{' '}
                      ({isArabic ? 'اختياري' : 'Optional'})
                    </Label>
                    <Input
                      id="employeeId"
                      value={formData.employeeId}
                      onChange={(e) =>
                        setFormData({ ...formData, employeeId: e.target.value })
                      }
                      placeholder={isArabic ? 'EMP-001' : 'EMP-001'}
                      disabled={isSubmitting}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-muted-foreground">
                      {isArabic ? 'القسم' : 'Department'}
                    </Label>
                    <Input
                      value={staff.department || '-'}
                      readOnly
                      className="bg-muted"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-muted-foreground">
                      {isArabic ? 'سنوات الخبرة' : 'Years of Experience'}
                    </Label>
                    <Input
                      value={displayYearsOfExperience ?? '-'}
                      readOnly
                      className="bg-muted"
                    />
                  </div>
                </div>

                {displaySkills.length > 0 && (
                  <div className="space-y-2">
                    <Label className="text-muted-foreground">
                      {isArabic ? 'المهارات' : 'Skills'}
                    </Label>
                    <div className="flex flex-wrap gap-2">
                      {displaySkills.map((skill, index) => (
                        <Badge key={index} variant="secondary">
                          {skill}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </CollapsibleContent>
          </Collapsible>
        </Card>

        {/* Account Management Section */}
        <Card>
          <Collapsible open={isAccountManagementOpen} onOpenChange={setIsAccountManagementOpen}>
            <CollapsibleTrigger asChild>
              <CardHeader className="cursor-pointer hover:bg-muted/50 transition-colors">
                <CardTitle className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Key className="h-5 w-5" />
                    {isArabic ? 'إدارة الحساب' : 'Account Management'}
                  </div>
                  <ChevronDown
                    className={`h-5 w-5 transition-transform ${isAccountManagementOpen ? 'rotate-180' : ''
                      }`}
                  />
                </CardTitle>
              </CardHeader>
            </CollapsibleTrigger>
            <CollapsibleContent>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="username">
                    {isArabic ? 'اسم المستخدم' : 'Username'}{' '}
                    ({isArabic ? 'اختياري' : 'Optional'})
                  </Label>
                  <Input
                    id="username"
                    value={formData.username}
                    onChange={(e) =>
                      setFormData({ ...formData, username: e.target.value })
                    }
                    placeholder={isArabic ? 'username123' : 'username123'}
                    disabled={isSubmitting}
                  />
                  <p className="text-xs text-muted-foreground">
                    {isArabic
                      ? '3-30 حرف، أحرف وأرقام وشرطة سفلية وشرطة فقط'
                      : '3-30 characters, letters, numbers, underscores, and hyphens only'}
                  </p>
                </div>

                <div className="space-y-2">
                  <Label>
                    {isArabic ? 'كلمة المرور' : 'Password'}
                  </Label>
                  <div className="flex gap-2">
                    <Input
                      type="text"
                      value={staff.user?.password || ''}
                      readOnly
                      className="bg-muted flex-1"
                    />
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setIsPasswordDialogOpen(true)}
                      disabled={isSubmitting || !staff.userId}
                    >
                      <Key className={`h-4 w-4 ${isArabic ? 'ml-2' : 'mr-2'}`} />
                      {isArabic ? 'إعادة تعيين' : 'Reset'}
                    </Button>
                  </div>
                  {!staff.userId && (
                    <p className="text-xs text-muted-foreground">
                      {isArabic
                        ? 'لا يوجد حساب مستخدم مرتبط'
                        : 'No user account linked'}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="officialEmail">
                    {isArabic ? 'البريد الإلكتروني الرسمي' : 'Official Email'}{' '}
                    ({isArabic ? 'اختياري' : 'Optional'})
                  </Label>
                  <Input
                    id="officialEmail"
                    type="email"
                    value={formData.officialEmail}
                    onChange={(e) =>
                      setFormData({ ...formData, officialEmail: e.target.value })
                    }
                    placeholder={isArabic ? 'employee@company.com' : 'employee@company.com'}
                    disabled={isSubmitting}
                  />
                  <p className="text-xs text-muted-foreground">
                    {isArabic
                      ? 'البريد الإلكتروني الرسمي للشركة (مختلف عن البريد الشخصي)'
                      : 'Company official email (different from personal email)'}
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="clockifyUserId">
                    {isArabic ? 'معرف مستخدم Clockify' : 'Clockify User ID'}{' '}
                    ({isArabic ? 'لتتبع الوقت' : 'For time tracking'})
                  </Label>
                  <div className="flex gap-2">
                    <Input
                      id="clockifyUserId"
                      value={clockifyUserId}
                      onChange={(e) => setClockifyUserId(e.target.value)}
                      placeholder={isArabic ? 'أدخل معرف Clockify' : 'Enter Clockify User ID'}
                      disabled={isLinkingClockify}
                    />
                    <Button
                      type="button"
                      onClick={handleLinkClockify}
                      disabled={isLinkingClockify || !clockifyUserId.trim()}
                    >
                      {isLinkingClockify ? (
                        <>
                          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                          {isArabic ? 'جاري الربط...' : 'Linking...'}
                        </>
                      ) : (
                        <>
                          <Key className="h-4 w-4 mr-2" />
                          {isArabic ? 'ربط' : 'Link'}
                        </>
                      )}
                    </Button>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {isArabic
                      ? 'معرف المستخدم من Clockify لربط حساب تتبع الوقت'
                      : 'Clockify user ID to link time tracking account'}
                  </p>
                </div>
              </CardContent>
            </CollapsibleContent>
          </Collapsible>
        </Card>

        {/* Legal Documents & Trial Period Section */}
        <Card>
          <Collapsible open={isLegalDocumentsOpen} onOpenChange={setIsLegalDocumentsOpen}>
            <CollapsibleTrigger asChild>
              <CardHeader className="cursor-pointer hover:bg-muted/50 transition-colors">
                <CardTitle className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <FileText className="h-5 w-5" />
                    {isArabic ? 'المستندات والتجربة' : 'Documents & Trial'}
                  </div>
                  <ChevronDown
                    className={`h-5 w-5 transition-transform ${isLegalDocumentsOpen ? 'rotate-180' : ''
                      }`}
                  />
                </CardTitle>
              </CardHeader>
            </CollapsibleTrigger>
            <CollapsibleContent>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="ndaSignedDate" className="text-sm">
                      {isArabic ? 'تاريخ توقيع اتفاقية السرية' : 'NDA Signed Date'}{' '}
                      ({isArabic ? 'اختياري' : 'Optional'})
                    </Label>
                    <Input
                      id="ndaSignedDate"
                      type="date"
                      value={formData.ndaSignedDate}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          ndaSignedDate: e.target.value,
                        })
                      }
                      disabled={isSubmitting}
                      className="text-sm"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="contractSignedDate" className="text-sm">
                      {isArabic ? 'تاريخ توقيع العقد' : 'Contract Signed Date'}
                    </Label>
                    <Input
                      id="contractSignedDate"
                      type="date"
                      value={formData.contractSignedDate}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          contractSignedDate: e.target.value,
                        })
                      }
                      required
                      disabled={isSubmitting}
                      className="text-sm"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="trialEndDate" className="text-sm">
                      {isArabic ? 'تاريخ انتهاء فترة التجربة' : 'Trial Period End Date'}{' '}
                      ({isArabic ? 'اختياري' : 'Optional'})
                    </Label>
                    <Input
                      id="trialEndDate"
                      type="date"
                      value={formData.trialEndDate}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          trialEndDate: e.target.value,
                        })
                      }
                      placeholder="mm/dd/yyyy"
                      disabled={isSubmitting}
                      className="text-sm"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="trialMonths" className="text-sm">
                      {isArabic ? 'عدد الأشهر' : 'Months'}{' '}
                      ({isArabic ? 'اختياري' : 'Optional'})
                    </Label>
                    <Input
                      id="trialMonths"
                      type="number"
                      min="1"
                      max="24"
                      value={formData.trialMonths}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          trialMonths: e.target.value,
                        })
                      }
                      placeholder="3"
                      readOnly
                      className="bg-muted text-sm"
                      disabled={isSubmitting}
                    />
                  </div>
                </div>
              </CardContent>
            </CollapsibleContent>
          </Collapsible>
        </Card>

        {/* Compensation Section */}
        <Card>
          <Collapsible open={isCompensationOpen} onOpenChange={setIsCompensationOpen}>
            <CollapsibleTrigger asChild>
              <CardHeader className="cursor-pointer hover:bg-muted/50 transition-colors">
                <CardTitle className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <CircleDollarSign className="h-5 w-5" />
                    {isArabic ? 'المالية' : 'Compensation'}
                  </div>
                  <ChevronDown
                    className={`h-5 w-5 transition-transform ${isCompensationOpen ? 'rotate-180' : ''
                      }`}
                  />
                </CardTitle>
              </CardHeader>
            </CollapsibleTrigger>
            <CollapsibleContent>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="currency">
                      {isArabic ? 'العملة' : 'Currency'}
                    </Label>
                    <Select
                      value={formData.currency}
                      onValueChange={(value) =>
                        setFormData({ ...formData, currency: value })
                      }
                      disabled={isSubmitting}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="SAR">
                          {isArabic ? 'ريال سعودي (SAR)' : 'SAR (Saudi Riyal)'}
                        </SelectItem>
                        <SelectItem value="USD">
                          {isArabic ? 'دولار (USD)' : 'USD (US Dollar)'}
                        </SelectItem>
                        <SelectItem value="EGP">
                          {isArabic ? 'جنيه مصري (EGP)' : 'EGP (Egyptian Pound)'}
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="salary">
                      {isArabic ? 'الراتب الأساسي' : 'Base Salary'}
                    </Label>
                    <Input
                      id="salary"
                      type="number"
                      step="0.01"
                      min="0"
                      value={formData.salary}
                      onChange={(e) =>
                        setFormData({ ...formData, salary: e.target.value })
                      }
                      placeholder="0.00"
                      disabled={isSubmitting}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="trialSalary">
                      {isArabic ? 'الراتب خلال فترة التجربة' : 'Trial Salary'}
                    </Label>
                    <Input
                      id="trialSalary"
                      type="number"
                      step="0.01"
                      min="0"
                      value={formData.trialSalary}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          trialSalary: e.target.value,
                        })
                      }
                      placeholder="0.00"
                      disabled={isSubmitting}
                    />
                    <p className="text-xs text-muted-foreground mt-1">
                      {isArabic
                        ? 'راتب مختلف عن الراتب الأساسي'
                        : 'Different from base salary'}
                    </p>
                  </div>
                </div>
              </CardContent>
            </CollapsibleContent>
          </Collapsible>
        </Card>

        {/* Emergency Contacts Section */}
        <Card>
          <Collapsible open={isEmergencyContactsOpen} onOpenChange={setIsEmergencyContactsOpen}>
            <CollapsibleTrigger asChild>
              <CardHeader className="cursor-pointer hover:bg-muted/50 transition-colors">
                <CardTitle className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Phone className="h-5 w-5" />
                    {isArabic ? 'جهات الاتصال في حالات الطوارئ' : 'Emergency Contacts'}
                  </div>
                  <ChevronDown
                    className={`h-5 w-5 transition-transform ${isEmergencyContactsOpen ? 'rotate-180' : ''
                      }`}
                  />
                </CardTitle>
              </CardHeader>
            </CollapsibleTrigger>
            <CollapsibleContent>
              <CardContent className="space-y-4">
                <EmergencyContactForm
                  contact={formData.emergencyContact1}
                  onChange={(contact) =>
                    setFormData({ ...formData, emergencyContact1: contact })
                  }
                  locale={locale}
                  label={isArabic ? 'جهة الاتصال الأولى' : 'Emergency Contact 1'}
                  disabled={isSubmitting}
                />
                <EmergencyContactForm
                  contact={formData.emergencyContact2}
                  onChange={(contact) =>
                    setFormData({ ...formData, emergencyContact2: contact })
                  }
                  locale={locale}
                  label={isArabic ? 'جهة الاتصال الثانية' : 'Emergency Contact 2'}
                  disabled={isSubmitting}
                />
              </CardContent>
            </CollapsibleContent>
          </Collapsible>
        </Card>

        {/* Notes Section */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              {isArabic ? 'ملاحظات' : 'Notes'}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <Label htmlFor="notes">
                {isArabic ? 'ملاحظات عامة' : 'General Notes'}{' '}
                ({isArabic ? 'اختياري' : 'Optional'})
              </Label>
              <Textarea
                id="notes"
                value={formData.notes}
                onChange={(e) =>
                  setFormData({ ...formData, notes: e.target.value })
                }
                placeholder={
                  isArabic
                    ? 'ملاحظات إضافية...'
                    : 'Additional notes...'
                }
                disabled={isSubmitting}
                className="min-h-[100px]"
                dir={isArabic ? 'rtl' : 'ltr'}
              />
            </div>
          </CardContent>
        </Card>

        {/* Validation Messages */}
        {(error || success) && (
          <div className="mb-4">
            {error && (
              <Card className="border-destructive">
                <CardContent className="p-4">
                  <p className="text-sm text-destructive">{error}</p>
                </CardContent>
              </Card>
            )}
            {success && (
              <Card className="border-green-500">
                <CardContent className="p-4">
                  <p className="text-sm text-green-600">{success}</p>
                </CardContent>
              </Card>
            )}
          </div>
        )}

        {/* Save Button */}
        <div className="flex justify-end">
          <Button
            onClick={handleSave}
            disabled={isSubmitting}
            size="lg"
            className="min-w-[200px]"
          >
            {isSubmitting ? (
              <>
                <Loader2
                  className={`h-4 w-4 animate-spin ${isArabic ? 'ml-2' : 'mr-2'}`}
                />
                {isArabic ? 'جاري الحفظ...' : 'Saving...'}
              </>
            ) : (
              <>
                <Save className={`h-4 w-4 ${isArabic ? 'ml-2' : 'mr-2'}`} />
                {isArabic ? 'حفظ جميع التغييرات' : 'Save All Changes'}
              </>
            )}
          </Button>
        </div>
      </div>

      {/* Password Reset Dialog */}
      <PasswordResetDialog
        open={isPasswordDialogOpen}
        onOpenChange={setIsPasswordDialogOpen}
        staffId={staff.id}
        locale={locale}
        onSuccess={(password) => {
          setSuccess(
            isArabic
              ? 'تم إعادة تعيين كلمة المرور بنجاح'
              : 'Password reset successfully'
          );
          setTimeout(() => setSuccess(''), 5000);
        }}
      />
    </div >
  );
}









