'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@jbrtechno/ui';
import { Input } from '@jbrtechno/ui';
import { Label } from '@jbrtechno/ui';
import { Button } from '@jbrtechno/ui';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@jbrtechno/ui';
import { Search, Loader2, CheckCircle2, Copy } from 'lucide-react';
import { searchCandidateByPhone, type CandidateSearchResult } from '@/actions/searchCandidateByPhone';
import { createStaff } from '@/actions/createStaff';
import { generateSecurePassword } from '@/helpers/generatePassword';

interface FinalHireSectionProps {
  locale: string;
}

export function FinalHireSection({ locale }: FinalHireSectionProps) {
  const router = useRouter();
  const isArabic = true;

  const [phone, setPhone] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [candidate, setCandidate] = useState<CandidateSearchResult | null>(null);
  const [searchError, setSearchError] = useState('');
  const [isConfirmDialogOpen, setIsConfirmDialogOpen] = useState(false);
  const [isSuccessDialogOpen, setIsSuccessDialogOpen] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [createError, setCreateError] = useState('');

  // Form state - will be used in other page later

  const [credentials, setCredentials] = useState<{ email: string; password: string } | null>(null);

  const handleSearch = async () => {
    if (!phone.trim()) {
      setSearchError(isArabic ? 'يرجى إدخال رقم الهاتف' : 'Please enter phone number');
      return;
    }

    setIsSearching(true);
    setSearchError('');
    setCandidate(null);

    try {
      const result = await searchCandidateByPhone(phone.trim());
      if (result.success && result.candidate) {
        setCandidate(result.candidate);
        setIsConfirmDialogOpen(true);
      } else {
        setSearchError(result.error || (isArabic ? 'لم يتم العثور على المرشح' : 'Candidate not found'));
      }
    } catch (error) {
      setSearchError(isArabic ? 'حدث خطأ أثناء البحث' : 'An error occurred while searching');
    } finally {
      setIsSearching(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  const handleConfirm = async () => {
    if (!candidate) return;

    setIsCreating(true);
    setCreateError('');

    try {
      // Generate password automatically
      const temporaryPassword = generateSecurePassword(10);

      const result = await createStaff({
        phone: candidate.phone,
        department: candidate.department, // Use department from application
        temporaryPassword: temporaryPassword,
      });

      if (result.success && result.email && result.password) {
        setCredentials({
          email: result.email,
          password: result.password,
        });
        setIsConfirmDialogOpen(false);
        setIsSuccessDialogOpen(true);
        // Reset
        setPhone('');
        setCandidate(null);
        router.refresh();
      } else {
        setCreateError(result.error || (isArabic ? 'فشل إنشاء سجل الموظف' : 'Failed to create staff record'));
      }
    } catch (error) {
      setCreateError(isArabic ? 'حدث خطأ أثناء الإنشاء' : 'An error occurred while creating');
    } finally {
      setIsCreating(false);
    }
  };

  const handleCopyCredentials = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
    } catch (error) {
      console.error('Failed to copy:', error);
    }
  };

  return (
    <>
      <Card className="mt-8">
        <CardHeader>
          <CardTitle className="text-2xl">
            {isArabic ? 'التوظيف النهائي' : 'Final Hire'}
          </CardTitle>
          <p className="text-sm text-muted-foreground mt-2">
            {isArabic
              ? 'أدخل رقم الهاتف للبحث عن مرشح مقبول وإنشاء سجل موظف'
              : 'Enter phone number to search for accepted candidate and create staff record'}
          </p>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4">
            <div className="flex-1">
              <Label htmlFor="phone-search">
                {isArabic ? 'رقم الهاتف' : 'Phone Number'}
              </Label>
              <Input
                id="phone-search"
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder={isArabic ? '+966 XX XXX XXXX' : '+966 XX XXX XXXX'}
                disabled={isSearching}
                className={isArabic ? 'text-right' : 'text-left'}
              />
              {searchError && (
                <p className="text-sm text-destructive mt-2">{searchError}</p>
              )}
            </div>
            <div className="flex items-end">
              <Button
                onClick={handleSearch}
                disabled={isSearching || !phone.trim()}
                className={isArabic ? 'flex-row-reverse' : ''}
              >
                {isSearching ? (
                  <>
                    <Loader2 className={`h-4 w-4 animate-spin ${isArabic ? 'ml-2' : 'mr-2'}`} />
                    {isArabic ? 'جاري البحث...' : 'Searching...'}
                  </>
                ) : (
                  <>
                    <Search className={`h-4 w-4 ${isArabic ? 'ml-2' : 'mr-2'}`} />
                    {isArabic ? 'بحث' : 'Search'}
                  </>
                )}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Confirmation Dialog */}
      <AlertDialog open={isConfirmDialogOpen} onOpenChange={setIsConfirmDialogOpen}>
        <AlertDialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <AlertDialogHeader>
            <AlertDialogTitle>
              {isArabic ? 'تأكيد التوظيف' : 'Confirm Final Hire'}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {isArabic
                ? 'يرجى مراجعة بيانات المرشح والتأكيد'
                : 'Please review candidate information and confirm'}
            </AlertDialogDescription>
          </AlertDialogHeader>

          {candidate && (
            <div className="space-y-6">
              {/* Candidate Info */}
              <div className="p-4 bg-muted rounded-lg space-y-2">
                <h4 className="font-semibold mb-3">
                  {isArabic ? 'معلومات المرشح' : 'Candidate Information'}
                </h4>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-muted-foreground">
                      {isArabic ? 'الاسم:' : 'Name:'}
                    </span>
                    <span className="ml-2 font-medium">{candidate.applicantName}</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">
                      {isArabic ? 'البريد الإلكتروني:' : 'Email:'}
                    </span>
                    <span className="ml-2 font-medium">{candidate.email}</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">
                      {isArabic ? 'الوظيفة:' : 'Position:'}
                    </span>
                    <span className="ml-2 font-medium">{candidate.position}</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">
                      {isArabic ? 'القسم:' : 'Department:'}
                    </span>
                    <span className="ml-2 font-medium">{candidate.department}</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">
                      {isArabic ? 'سنوات الخبرة:' : 'Years of Experience:'}
                    </span>
                    <span className="ml-2 font-medium">{candidate.yearsOfExperience}</span>
                  </div>
                </div>
              </div>


              {createError && (
                <div className="p-3 bg-destructive/10 border border-destructive/20 rounded-md">
                  <p className="text-sm text-destructive">{createError}</p>
                </div>
              )}
            </div>
          )}

          <AlertDialogFooter className={isArabic ? 'flex-row-reverse' : ''}>
            <AlertDialogCancel disabled={isCreating}>
              {isArabic ? 'إلغاء' : 'Cancel'}
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleConfirm}
              disabled={isCreating}
              className={isArabic ? 'flex-row-reverse' : ''}
            >
              {isCreating ? (
                <>
                  <Loader2 className={`h-4 w-4 animate-spin ${isArabic ? 'ml-2' : 'mr-2'}`} />
                  {isArabic ? 'جاري الإنشاء...' : 'Creating...'}
                </>
              ) : (
                <>
                  <CheckCircle2 className={`h-4 w-4 ${isArabic ? 'ml-2' : 'mr-2'}`} />
                  {isArabic ? 'تأكيد التوظيف' : 'Confirm Hire'}
                </>
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Success Dialog with Credentials */}
      <AlertDialog open={isSuccessDialogOpen} onOpenChange={setIsSuccessDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <CheckCircle2 className="h-5 w-5 text-green-600" />
              {isArabic ? 'تم التوظيف بنجاح' : 'Hire Successful'}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {isArabic
                ? 'تم إنشاء سجل الموظف وحساب المستخدم بنجاح. يرجى مشاركة بيانات الاعتماد مع الموظف الجديد.'
                : 'Staff record and user account created successfully. Please share the credentials with the new employee.'}
            </AlertDialogDescription>
          </AlertDialogHeader>

          {credentials && (
            <div className="space-y-4">
              <div className="p-4 bg-muted rounded-lg space-y-3">
                <div>
                  <Label className="text-xs text-muted-foreground">
                    {isArabic ? 'البريد الإلكتروني' : 'Email'}
                  </Label>
                  <div className="flex items-center gap-2 mt-1">
                    <Input
                      value={credentials.email}
                      readOnly
                      className="font-mono text-sm"
                    />
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => handleCopyCredentials(credentials.email)}
                      className={isArabic ? 'flex-row-reverse' : ''}
                    >
                      <Copy className={`h-3 w-3 ${isArabic ? 'ml-1' : 'mr-1'}`} />
                      {isArabic ? 'نسخ' : 'Copy'}
                    </Button>
                  </div>
                </div>
                <div>
                  <Label className="text-xs text-muted-foreground">
                    {isArabic ? 'كلمة المرور المؤقتة' : 'Temporary Password'}
                  </Label>
                  <div className="flex items-center gap-2 mt-1">
                    <Input
                      value={credentials.password}
                      readOnly
                      type="text"
                      className="font-mono text-sm"
                    />
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => handleCopyCredentials(credentials.password)}
                      className={isArabic ? 'flex-row-reverse' : ''}
                    >
                      <Copy className={`h-3 w-3 ${isArabic ? 'ml-1' : 'mr-1'}`} />
                      {isArabic ? 'نسخ' : 'Copy'}
                    </Button>
                  </div>
                </div>
              </div>
              <p className="text-xs text-muted-foreground">
                {isArabic
                  ? '⚠️ يرجى نسخ وحفظ هذه المعلومات. لن يتم عرضها مرة أخرى.'
                  : '⚠️ Please copy and save this information. It will not be shown again.'}
              </p>
            </div>
          )}

          <AlertDialogFooter>
            <AlertDialogAction onClick={() => setIsSuccessDialogOpen(false)}>
              {isArabic ? 'تم' : 'Done'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}









