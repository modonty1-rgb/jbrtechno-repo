'use client';

import { use, useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@jbrtechno/ui';
import { Button } from '@jbrtechno/ui';
import { Input } from '@jbrtechno/ui';
import { Textarea } from '@jbrtechno/ui';
import { Checkbox } from '@jbrtechno/ui';
import { Label } from '@jbrtechno/ui';
import { Loader2, CheckCircle2, AlertCircle, ArrowRight, ArrowLeft, AlertTriangle, MessageCircle } from 'lucide-react';
import { submitInterviewResponse } from '@/actions/submitInterviewResponse';
import Link from 'next/link';
import { ZodError } from 'zod';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@jbrtechno/ui';
import { PublicShell } from '@/components/layout/PublicShell';

interface InterviewPageProps {
  params: Promise<{ locale: string; token: string }>;
}

type Application = {
  id: string;
  applicantName: string;
  position: string;
  email: string;
  interviewResponseSubmittedAt: Date | string | null;
  lastJobExitReason?: string | null;
  lastSalary?: string | null;
  expectedSalary?: string | null;
  canWorkHard?: boolean | null;
  noticePeriod?: string | null;
  preferredWorkLocation?: string | null;
  whyInterestedInPosition?: string | null;
  questionsAboutRole?: string | null;
  willingnessToRelocate?: boolean | null;
  bestInterviewTime?: string | null;
};

export default function InterviewPage({ params }: InterviewPageProps) {
  const resolvedParams = use(params);
  const { locale, token } = resolvedParams;
  
  const [application, setApplication] = useState<Application | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [success, setSuccess] = useState(false);
  const [showSubmittedData, setShowSubmittedData] = useState(false);

  const [formData, setFormData] = useState({
    lastJobExitReason: '',
    lastSalary: '',
    expectedSalary: '',
    canWorkHard: false,
    noticePeriod: '',
    preferredWorkLocation: '' as '' | 'OFFICE' | 'REMOTE' | 'HYBRID',
    whyInterestedInPosition: '',
    questionsAboutRole: '',
    willingnessToRelocate: false,
    bestInterviewTime: '',
  });

  const isArabic = locale === 'ar';

  useEffect(() => {
    const fetchApplication = async () => {
      try {
        const response = await fetch(`/api/applications/${token}`);
        if (!response.ok) {
          throw new Error('Application not found');
        }
        const data = await response.json();
        setApplication(data);
        
        if (data.interviewResponseSubmittedAt) {
          // Don't set error here - we'll show a better message in the UI
        }
      } catch (error) {
        console.error('Error fetching application:', error);
        setError(isArabic 
          ? 'لم يتم العثور على الطلب' 
          : 'Application not found');
      }
    };

    fetchApplication();
  }, [token, isArabic]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    setError(null);
    setFieldErrors({});

    if (!application) {
      setError(isArabic ? 'الطلب غير موجود' : 'Application not found');
      return;
    }

    if (application.interviewResponseSubmittedAt) {
      setError(isArabic 
        ? 'تم إرسال الاستجابة بالفعل' 
        : 'Response has already been submitted');
      return;
    }

    // Validate with Zod before submitting
    try {
      const { interviewResponseSchema } = await import('@jbrtechno/shared');
      
      const validationData = {
        applicationId: application.id,
        lastJobExitReason: formData.lastJobExitReason,
        lastSalary: formData.lastSalary,
        expectedSalary: formData.expectedSalary,
        canWorkHard: formData.canWorkHard,
        noticePeriod: formData.noticePeriod,
        preferredWorkLocation: formData.preferredWorkLocation as 'OFFICE' | 'REMOTE' | 'HYBRID',
        whyInterestedInPosition: formData.whyInterestedInPosition,
        questionsAboutRole: formData.questionsAboutRole || undefined,
        willingnessToRelocate: formData.willingnessToRelocate,
        bestInterviewTime: formData.bestInterviewTime,
      };

      // Validate with Zod
      interviewResponseSchema.parse(validationData);
    } catch (validationError: unknown) {
      // Handle Zod validation errors - show inline, don't redirect
      const errors: Record<string, string> = {};
      
      // Zod errors have an 'issues' property with an array of error objects
      if (validationError instanceof ZodError) {
        validationError.issues.forEach((issue) => {
          const field = issue.path && issue.path.length > 0 ? issue.path[0] : null;
          if (field && typeof field === 'string') {
            errors[field] = issue.message || 'Invalid value';
          }
        });
      }
      
      if (Object.keys(errors).length > 0) {
        setFieldErrors(errors);
        const errorCount = Object.keys(errors).length;
        setError(isArabic 
          ? `يرجى تصحيح ${errorCount} ${errorCount === 1 ? 'خطأ' : 'أخطاء'} في النموذج أدناه`
          : `Please fix ${errorCount} ${errorCount === 1 ? 'error' : 'errors'} in the form below`);
        
        // Scroll to error message first, then to first error field
        setTimeout(() => {
          const errorElement = document.querySelector('[data-error-summary]');
          if (errorElement) {
            errorElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
          }
          
          // Then scroll to first error field
          setTimeout(() => {
            const firstErrorField = Object.keys(errors)[0];
            if (firstErrorField) {
              const element = document.getElementById(firstErrorField);
              if (element) {
                element.scrollIntoView({ behavior: 'smooth', block: 'center' });
                element.focus();
              }
            }
          }, 300);
        }, 100);
      } else {
        // Fallback error message
        setError(isArabic 
          ? 'يرجى التحقق من جميع الحقول المطلوبة'
          : 'Please check all required fields');
      }
      
      // Stop here - don't submit, show errors inline
      return;
    }

    setSubmitting(true);

    const result = await submitInterviewResponse({
      applicationId: application.id,
      lastJobExitReason: formData.lastJobExitReason,
      lastSalary: formData.lastSalary,
      expectedSalary: formData.expectedSalary,
      canWorkHard: formData.canWorkHard,
      noticePeriod: formData.noticePeriod,
      preferredWorkLocation: formData.preferredWorkLocation as 'OFFICE' | 'REMOTE' | 'HYBRID',
      whyInterestedInPosition: formData.whyInterestedInPosition,
      questionsAboutRole: formData.questionsAboutRole || undefined,
      willingnessToRelocate: formData.willingnessToRelocate,
      bestInterviewTime: formData.bestInterviewTime || undefined,
    });

    if (result.success) {
      setSuccess(true);
      // No auto redirect - user can stay and read the message
    } else {
      setError(result.error || (isArabic ? 'حدث خطأ' : 'An error occurred'));
    }

    setSubmitting(false);
  };

  if (!application && !error) {
    return null; // Let loading.tsx handle the loading state
  }

  // Only show error page for application fetch errors (when application doesn't exist)
  // NOT for validation errors (which should be shown inline in the form)
  if (!application && error && Object.keys(fieldErrors).length === 0) {
    return (
      <PublicShell>
        <div className="container mx-auto px-4 py-12">
          <Card>
            <CardContent className="py-12 text-center">
              <AlertCircle className="h-12 w-12 text-destructive mx-auto mb-4" />
              <h2 className="text-xl font-semibold mb-2">
                {isArabic ? 'خطأ' : 'Error'}
              </h2>
              <p className="text-muted-foreground mb-6">
                {error || (isArabic ? 'لم يتم العثور على الطلب' : 'Application not found')}
              </p>
              <Link href={`/${locale}/careers`}>
                <Button>
                  {isArabic ? (
                    <>
                      <ArrowRight className="h-4 w-4 ml-2" />
                      العودة
                    </>
                  ) : (
                    <>
                      <ArrowLeft className="h-4 w-4 mr-2" />
                      Back
                    </>
                  )}
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </PublicShell>
    );
  }

  // If no application but we have validation errors, still show form (shouldn't happen, but safety check)
  if (!application) {
    return null;
  }

  // Show message if response already submitted
  if (application.interviewResponseSubmittedAt && !showSubmittedData) {
    const submittedDate = new Date(application.interviewResponseSubmittedAt);
    const formattedDate = submittedDate.toLocaleDateString(isArabic ? 'ar-SA' : 'en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });

    return (
      <PublicShell>
        <div className="container mx-auto px-4 py-12 max-w-3xl">
          <Card>
            <CardContent className="py-12">
              <div className="text-center mb-6">
                <CheckCircle2 className="h-16 w-16 text-green-600 mx-auto mb-4" />
                <h2 className="text-2xl font-semibold mb-2">
                  {isArabic ? '✅ تم إرسال الاستجابة بنجاح' : '✅ Response Already Submitted'}
                </h2>
                <p className="text-muted-foreground mb-4">
                  {isArabic
                    ? 'شكراً لك! لقد قمت بإرسال استجابتك مسبقاً.'
                    : 'Thank you! You have already submitted your response.'}
                </p>
                <div className="bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4 mb-6 inline-block">
                  <p className="text-sm text-blue-900 dark:text-blue-100">
                    <strong>{isArabic ? '📅 تاريخ الإرسال:' : '📅 Submitted on:'}</strong>{' '}
                    <span className="font-mono">{formattedDate}</span>
                  </p>
                </div>
              </div>

              <div className="bg-gradient-to-r from-green-50 via-emerald-50 to-teal-50 dark:from-green-950/30 dark:via-emerald-950/30 dark:to-teal-950/30 border-2 border-green-300 dark:border-green-700 rounded-xl p-6 mb-6 shadow-lg">
                <div className="flex items-center justify-center gap-3 mb-3">
                  <div className="p-3 bg-green-100 dark:bg-green-900/40 rounded-full">
                    <MessageCircle className="h-6 w-6 text-green-600 dark:text-green-400" />
                  </div>
                  <h3 className="text-lg font-bold text-green-900 dark:text-green-100">
                    {isArabic ? '📱 سيتم إرسال تاريخ المقابلة عبر WhatsApp' : '📱 Interview Date via WhatsApp'}
                  </h3>
                </div>
                <p className="text-sm text-green-800 dark:text-green-200 leading-relaxed mb-2">
                  {isArabic
                    ? 'سنقوم بإرسال تاريخ ووقت المقابلة المرئية عبر WhatsApp إلى رقم هاتفك المسجل قريباً.'
                    : 'We will send the video interview date and time via WhatsApp to your registered phone number soon.'}
                </p>
                <p className="text-xs text-green-700 dark:text-green-300 font-medium">
                  {isArabic
                    ? '✨ تأكد من تفعيل إشعارات WhatsApp لاستلام الرسالة فوراً'
                    : '✨ Make sure WhatsApp notifications are enabled to receive the message immediately'}
                </p>
              </div>

              <div className="bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4 mb-6">
                <p className="text-sm text-blue-900 dark:text-blue-100">
                  {isArabic
                    ? '💡 نصيحة: تأكد من أن رقم هاتفك المسجل في طلبك صحيح ومتاح على WhatsApp'
                    : '💡 Tip: Make sure your registered phone number is correct and available on WhatsApp'}
                </p>
              </div>

              <div className="text-center space-y-4">
                <Button
                  onClick={() => setShowSubmittedData(true)}
                  variant="outline"
                  className="w-full sm:w-auto"
                >
                  {isArabic ? '👁️ عرض البيانات المرسلة' : '👁️ View Submitted Data'}
                </Button>
                <div>
                  <Link href={`/${locale}/careers`}>
                    <Button variant="ghost" className="w-full sm:w-auto">
                      {isArabic ? '← العودة' : '← Back'}
                    </Button>
                  </Link>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </PublicShell>
    );
  }

  if (success) {
    return (
      <div className="container mx-auto px-4 py-12">
        <Card>
          <CardContent className="py-12 text-center">
            <CheckCircle2 className="h-16 w-16 text-green-600 mx-auto mb-4 animate-in fade-in zoom-in duration-500" />
            <h2 className="text-2xl font-bold mb-3">
              {isArabic ? '🎉 شكراً لك!' : '🎉 Thank You!'}
            </h2>
            <p className="text-base text-muted-foreground mb-6">
              {isArabic
                ? 'تم إرسال استجابتك بنجاح. نشكرك على الوقت الذي قضيته في ملء النموذج.'
                : 'Your response has been submitted successfully. Thank you for taking the time to fill out the form.'}
            </p>
            
            <div className="bg-gradient-to-r from-green-50 via-emerald-50 to-teal-50 dark:from-green-950/30 dark:via-emerald-950/30 dark:to-teal-950/30 border-2 border-green-300 dark:border-green-700 rounded-xl p-6 mb-6 shadow-lg">
              <div className="flex items-center justify-center gap-3 mb-3">
                <div className="p-3 bg-green-100 dark:bg-green-900/40 rounded-full">
                  <MessageCircle className="h-6 w-6 text-green-600 dark:text-green-400" />
                </div>
                <h3 className="text-lg font-bold text-green-900 dark:text-green-100">
                  {isArabic ? '📱 سيتم إرسال تاريخ المقابلة عبر WhatsApp' : '📱 Interview Date via WhatsApp'}
                </h3>
              </div>
              <p className="text-sm text-green-800 dark:text-green-200 leading-relaxed mb-2">
                {isArabic
                  ? 'سنقوم بإرسال تاريخ ووقت المقابلة المرئية عبر WhatsApp إلى رقم هاتفك المسجل قريباً.'
                  : 'We will send the video interview date and time via WhatsApp to your registered phone number soon.'}
              </p>
              <p className="text-xs text-green-700 dark:text-green-300 font-medium">
                {isArabic
                  ? '✨ تأكد من تفعيل إشعارات WhatsApp لاستلام الرسالة فوراً'
                  : '✨ Make sure WhatsApp notifications are enabled to receive the message immediately'}
              </p>
            </div>

            <div className="bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4 mb-6">
              <p className="text-sm text-blue-900 dark:text-blue-100">
                {isArabic
                  ? '💡 نصيحة: تأكد من أن رقم هاتفك المسجل في طلبك صحيح ومتاح على WhatsApp'
                  : '💡 Tip: Make sure your registered phone number is correct and available on WhatsApp'}
              </p>
            </div>

            <div className="mt-6">
              <Link href={`/${locale}/careers`}>
                <Button variant="outline" className="w-full sm:w-auto">
                  {isArabic ? '← العودة إلى الوظائف' : '← Back to Careers'}
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Show submitted data if user clicked the button
  if (application.interviewResponseSubmittedAt && showSubmittedData) {
    const submittedDate = new Date(application.interviewResponseSubmittedAt);
    const formattedDate = submittedDate.toLocaleDateString(isArabic ? 'ar-SA' : 'en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });

    const workLocationMap: Record<string, { ar: string; en: string }> = {
      OFFICE: { ar: 'في المكتب', en: 'Office' },
      REMOTE: { ar: 'عن بُعد', en: 'Remote' },
      HYBRID: { ar: 'مختلط (مكتب + عن بُعد)', en: 'Hybrid (Office + Remote)' },
    };

    return (
      <PublicShell>
        <div className="container mx-auto px-4 py-8 max-w-3xl">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-2xl">
                  {isArabic ? '📋 البيانات المرسلة' : '📋 Submitted Data'}
                </CardTitle>
                <Button
                  onClick={() => setShowSubmittedData(false)}
                  variant="ghost"
                  size="sm"
                >
                  {isArabic ? '← رجوع' : '← Back'}
                </Button>
              </div>
              <div className="mt-4 bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
                <p className="text-sm text-blue-900 dark:text-blue-100">
                  <strong>{isArabic ? '📅 تاريخ الإرسال:' : '📅 Submitted on:'}</strong>{' '}
                  <span className="font-mono">{formattedDate}</span>
                </p>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              {application.whyInterestedInPosition && (
                <div>
                  <Label className="text-sm font-semibold">
                    {isArabic ? 'لماذا أنت مهتم بهذه الوظيفة؟' : 'Why are you interested in this position?'}
                  </Label>
                  <p className="mt-1 text-sm text-muted-foreground whitespace-pre-wrap">
                    {application.whyInterestedInPosition}
                  </p>
                </div>
              )}

            {application.lastJobExitReason && (
              <div>
                <Label className="text-sm font-semibold">
                  {isArabic ? 'آخر وظيفة - لماذا تركتها؟' : 'Last Job - Why did you leave?'}
                </Label>
                <p className="mt-1 text-sm text-muted-foreground whitespace-pre-wrap">
                  {application.lastJobExitReason}
                </p>
              </div>
            )}

            {application.lastSalary && (
              <div>
                <Label className="text-sm font-semibold">
                  {isArabic ? 'آخر راتب حصلت عليه' : 'Last Salary Package'}
                </Label>
                <p className="mt-1 text-sm text-muted-foreground">{application.lastSalary}</p>
              </div>
            )}

            {application.expectedSalary && (
              <div>
                <Label className="text-sm font-semibold">
                  {isArabic ? 'ما تتوقع من راتب' : 'Expected Salary'}
                </Label>
                <p className="mt-1 text-sm text-muted-foreground">{application.expectedSalary}</p>
              </div>
            )}

            {application.preferredWorkLocation && (
              <div>
                <Label className="text-sm font-semibold">
                  {isArabic ? 'موقع العمل المفضل' : 'Preferred Work Location'}
                </Label>
                <p className="mt-1 text-sm text-muted-foreground">
                  {isArabic
                    ? workLocationMap[application.preferredWorkLocation]?.ar || application.preferredWorkLocation
                    : workLocationMap[application.preferredWorkLocation]?.en || application.preferredWorkLocation}
                </p>
              </div>
            )}

            {application.willingnessToRelocate !== null && (
              <div>
                <Label className="text-sm font-semibold">
                  {isArabic ? 'أنا مستعد للانتقال إذا لزم الأمر' : 'I am willing to relocate if necessary'}
                </Label>
                <p className="mt-1 text-sm text-muted-foreground">
                  {application.willingnessToRelocate
                    ? isArabic ? 'نعم' : 'Yes'
                    : isArabic ? 'لا' : 'No'}
                </p>
              </div>
            )}

            {application.noticePeriod && (
              <div>
                <Label className="text-sm font-semibold">
                  {isArabic ? 'متى تكون جاهزاً للبدء؟' : 'When are you ready to start?'}
                </Label>
                <p className="mt-1 text-sm text-muted-foreground">{application.noticePeriod}</p>
              </div>
            )}

            {application.canWorkHard !== null && (
              <div>
                <Label className="text-sm font-semibold">
                  {isArabic ? 'أؤكد أنني أستطيع العمل تحت ظروف عمل صعبة' : 'I confirm that I can work under hard work conditions'}
                </Label>
                <p className="mt-1 text-sm text-muted-foreground">
                  {application.canWorkHard
                    ? isArabic ? 'نعم' : 'Yes'
                    : isArabic ? 'لا' : 'No'}
                </p>
              </div>
            )}

            {application.bestInterviewTime && (
              <div>
                <Label className="text-sm font-semibold">
                  {isArabic ? 'ما هو أفضل وقت للمقابلة بالنسبة لك؟' : 'What is the best time for the interview for you?'}
                </Label>
                <p className="mt-1 text-sm text-muted-foreground whitespace-pre-wrap">
                  {application.bestInterviewTime}
                </p>
              </div>
            )}

              {application.questionsAboutRole && (
                <div>
                  <Label className="text-sm font-semibold">
                    {isArabic ? 'هل لديك أي أسئلة حول الوظيفة أو الشركة؟' : 'Do you have any questions about the role or company?'}
                  </Label>
                  <p className="mt-1 text-sm text-muted-foreground whitespace-pre-wrap">
                    {application.questionsAboutRole}
                  </p>
                </div>
              )}

              <div className="pt-4 border-t">
                <Link href={`/${locale}/careers`}>
                  <Button variant="outline" className="w-full">
                    {isArabic ? '← العودة إلى الوظائف' : '← Back to Careers'}
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>
      </PublicShell>
    );
  }

  return (
    <PublicShell>
      <div className="container mx-auto px-4 py-8 max-w-3xl">
        <Card>
          <CardHeader>
            <CardTitle className="text-2xl">
              {isArabic ? '🎯 خطوة أخيرة قبل المقابلة' : '🎯 Final Step Before Interview'}
            </CardTitle>
            <div className="text-base mt-4 space-y-3 text-muted-foreground">
            {isArabic ? (
              <>
                <div className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-950/20 dark:to-purple-950/20 border-l-4 border-blue-500 p-4 rounded-r-lg">
                  <p className="font-semibold text-blue-700 dark:text-blue-400 mb-2 flex items-center gap-2">
                    📹 المقابلة ستكون عبر مكالمة فيديو
                  </p>
                  <p className="text-sm text-blue-800 dark:text-blue-300 leading-relaxed">
                    سنقوم بإجراء المقابلة عبر مكالمة فيديو مباشرة. تأكد من وجود اتصال إنترنت جيد وبيئة هادئة ومناسبة للمقابلة.
                  </p>
                </div>
                <div className="bg-primary/10 border-l-4 border-primary p-4 rounded-r-lg">
                  <p className="font-semibold text-primary mb-2">
                    مرحباً <strong>{application.applicantName}</strong> 👋
                  </p>
                  <p className="text-sm leading-relaxed">
                    تهانينا! لقد قمنا بمراجعة سيرتك الذاتية بعناية ونحن متحمسون لإمكانية انضمامك لفريقنا. 
                    <br />
                    <br />
                    <strong>قبل جدولة المقابلة المرئية</strong>، نحتاج منك ملء المعلومات التالية بدقة وصدق. 
                    هذه المعلومات ستساعدنا في فهمك بشكل أفضل وتحديد ما إذا كانت هذه الوظيفة مناسبة لك.
                  </p>
                </div>
                <div className="bg-amber-50 dark:bg-amber-950/20 border-l-4 border-amber-500 p-4 rounded-r-lg">
                  <p className="font-semibold text-amber-700 dark:text-amber-400 mb-2 flex items-center gap-2">
                    ⚠️ تنبيه مهم
                  </p>
                  <p className="text-sm text-amber-800 dark:text-amber-300 leading-relaxed">
                    <strong>يرجى التأكد من صحة جميع المعلومات المقدمة.</strong> أي معلومات غير صحيحة أو مضللة ستؤدي إلى استبعاد طلبك فوراً. 
                    نقدّر الصدق والشفافية في جميع مراحل عملية التوظيف.
                  </p>
                </div>
              </>
            ) : (
              <>
                <div className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-950/20 dark:to-purple-950/20 border-l-4 border-blue-500 p-4 rounded-r-lg">
                  <p className="font-semibold text-blue-700 dark:text-blue-400 mb-2 flex items-center gap-2">
                    📹 Interview Will Be Via Video Call
                  </p>
                  <p className="text-sm text-blue-800 dark:text-blue-300 leading-relaxed">
                    We will conduct the interview via a live video call. Please ensure you have a good internet connection and a quiet, suitable environment for the interview.
                  </p>
                </div>
                <div className="bg-primary/10 border-l-4 border-primary p-4 rounded-r-lg">
                  <p className="font-semibold text-primary mb-2">
                    Hello <strong>{application.applicantName}</strong> 👋
                  </p>
                  <p className="text-sm leading-relaxed">
                    Congratulations! We&apos;ve carefully reviewed your CV and we&apos;re excited about the possibility of you joining our team.
                    <br />
                    <br />
                    <strong>Before scheduling the video interview</strong>, we need you to fill in the following information accurately and honestly. 
                    This information will help us understand you better and determine if this position is the right fit for you.
                  </p>
                </div>
                <div className="bg-amber-50 dark:bg-amber-950/20 border-l-4 border-amber-500 p-4 rounded-r-lg">
                  <p className="font-semibold text-amber-700 dark:text-amber-400 mb-2 flex items-center gap-2">
                    ⚠️ Important Notice
                  </p>
                  <p className="text-sm text-amber-800 dark:text-amber-300 leading-relaxed">
                    <strong>Please ensure all provided information is accurate.</strong> Any incorrect or misleading information will result in immediate rejection of your application. 
                    We value honesty and transparency throughout the hiring process.
                  </p>
                </div>
              </>
            )}
          </div>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6" noValidate>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label 
                  htmlFor="whyInterestedInPosition"
                  className={fieldErrors.whyInterestedInPosition ? 'text-destructive' : ''}
                >
                  {isArabic ? 'لماذا أنت مهتم بهذه الوظيفة؟' : 'Why are you interested in this position?'} <span className="text-destructive">*</span>
                  {fieldErrors.whyInterestedInPosition && (
                    <AlertTriangle className="inline-block h-4 w-4 ml-1 text-destructive" />
                  )}
                </Label>
                <span className={`text-xs ${formData.whyInterestedInPosition.length > 500 ? 'text-destructive' : formData.whyInterestedInPosition.length < 20 ? 'text-muted-foreground' : 'text-primary'}`}>
                  {formData.whyInterestedInPosition.length} / 500 {isArabic ? 'حرف' : 'chars'}
                  {formData.whyInterestedInPosition.length < 20 && (
                    <span className="ml-1">({isArabic ? 'الحد الأدنى: 20 حرف' : 'min: 20'})</span>
                  )}
                </span>
              </div>
              <Textarea
                id="whyInterestedInPosition"
                value={formData.whyInterestedInPosition}
                onChange={(e) => {
                  setFormData({ ...formData, whyInterestedInPosition: e.target.value });
                  if (fieldErrors.whyInterestedInPosition) {
                    setFieldErrors({ ...fieldErrors, whyInterestedInPosition: '' });
                  }
                }}
                rows={4}
                placeholder={isArabic ? 'يرجى توضيح سبب اهتمامك بهذه الوظيفة...' : 'Please explain why you are interested in this position...'}
                className={`resize-y transition-colors ${fieldErrors.whyInterestedInPosition ? 'border-destructive border-2 focus-visible:ring-destructive' : ''}`}
                maxLength={500}
              />
              {fieldErrors.whyInterestedInPosition && (
                <div className="flex items-start gap-2 p-2 rounded-md bg-destructive/10 border border-destructive/20">
                  <AlertTriangle className="h-4 w-4 text-destructive mt-0.5 flex-shrink-0" />
                  <p className="text-sm text-destructive font-medium">{fieldErrors.whyInterestedInPosition}</p>
                </div>
              )}
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label 
                  htmlFor="lastJobExitReason"
                  className={fieldErrors.lastJobExitReason ? 'text-destructive' : ''}
                >
                  {isArabic ? 'آخر وظيفة - لماذا تركتها؟' : 'Last Job - Why did you leave?'} <span className="text-destructive">*</span>
                  {fieldErrors.lastJobExitReason && (
                    <AlertTriangle className="inline-block h-4 w-4 ml-1 text-destructive" />
                  )}
                </Label>
                <span className={`text-xs ${formData.lastJobExitReason.length > 1000 ? 'text-destructive' : formData.lastJobExitReason.length < 10 ? 'text-muted-foreground' : 'text-primary'}`}>
                  {formData.lastJobExitReason.length} / 1000 {isArabic ? 'حرف' : 'chars'}
                  {formData.lastJobExitReason.length < 10 && (
                    <span className="ml-1">({isArabic ? 'الحد الأدنى: 10 أحرف' : 'min: 10'})</span>
                  )}
                </span>
              </div>
              <Textarea
                id="lastJobExitReason"
                value={formData.lastJobExitReason}
                onChange={(e) => {
                  setFormData({ ...formData, lastJobExitReason: e.target.value });
                  if (fieldErrors.lastJobExitReason) {
                    setFieldErrors({ ...fieldErrors, lastJobExitReason: '' });
                  }
                }}
                rows={4}
                placeholder={isArabic ? 'يرجى توضيح سبب ترك آخر وظيفة...' : 'Please explain why you left your last job...'}
                className={`resize-y transition-colors ${fieldErrors.lastJobExitReason ? 'border-destructive border-2 focus-visible:ring-destructive' : ''}`}
                maxLength={1000}
              />
              {fieldErrors.lastJobExitReason && (
                <div className="flex items-start gap-2 p-2 rounded-md bg-destructive/10 border border-destructive/20">
                  <AlertTriangle className="h-4 w-4 text-destructive mt-0.5 flex-shrink-0" />
                  <p className="text-sm text-destructive font-medium">{fieldErrors.lastJobExitReason}</p>
                </div>
              )}
            </div>

            <div className="space-y-2">
              <Label 
                htmlFor="lastSalary"
                className={fieldErrors.lastSalary ? 'text-destructive' : ''}
              >
                {isArabic ? 'آخر راتب حصلت عليه' : 'Last Salary Package'} <span className="text-destructive">*</span>
                {fieldErrors.lastSalary && (
                  <AlertTriangle className="inline-block h-4 w-4 ml-1 text-destructive" />
                )}
              </Label>
              <Input
                id="lastSalary"
                type="text"
                value={formData.lastSalary}
                onChange={(e) => {
                  setFormData({ ...formData, lastSalary: e.target.value });
                  if (fieldErrors.lastSalary) {
                    setFieldErrors({ ...fieldErrors, lastSalary: '' });
                  }
                }}
                placeholder={isArabic ? 'مثال: 5000 جنيه مصري' : 'Example: 5000 EGP'}
                className={`transition-colors ${fieldErrors.lastSalary ? 'border-destructive border-2 focus-visible:ring-destructive' : ''}`}
              />
              {fieldErrors.lastSalary && (
                <div className="flex items-start gap-2 p-2 rounded-md bg-destructive/10 border border-destructive/20">
                  <AlertTriangle className="h-4 w-4 text-destructive mt-0.5 flex-shrink-0" />
                  <p className="text-sm text-destructive font-medium">{fieldErrors.lastSalary}</p>
                </div>
              )}
            </div>

            <div className="space-y-2">
              <Label 
                htmlFor="expectedSalary"
                className={fieldErrors.expectedSalary ? 'text-destructive' : ''}
              >
                {isArabic ? 'ما تتوقع من راتب' : 'Expected Salary'} <span className="text-destructive">*</span>
                {fieldErrors.expectedSalary && (
                  <AlertTriangle className="inline-block h-4 w-4 ml-1 text-destructive" />
                )}
              </Label>
              <Input
                id="expectedSalary"
                type="text"
                value={formData.expectedSalary}
                onChange={(e) => {
                  setFormData({ ...formData, expectedSalary: e.target.value });
                  if (fieldErrors.expectedSalary) {
                    setFieldErrors({ ...fieldErrors, expectedSalary: '' });
                  }
                }}
                placeholder={isArabic ? 'مثال: 6000 جنيه مصري' : 'Example: 6000 EGP'}
                className={`transition-colors ${fieldErrors.expectedSalary ? 'border-destructive border-2 focus-visible:ring-destructive' : ''}`}
              />
              {fieldErrors.expectedSalary && (
                <div className="flex items-start gap-2 p-2 rounded-md bg-destructive/10 border border-destructive/20">
                  <AlertTriangle className="h-4 w-4 text-destructive mt-0.5 flex-shrink-0" />
                  <p className="text-sm text-destructive font-medium">{fieldErrors.expectedSalary}</p>
                </div>
              )}
            </div>

            <div className="space-y-2">
              <Label 
                htmlFor="preferredWorkLocation"
                className={fieldErrors.preferredWorkLocation ? 'text-destructive' : ''}
              >
                {isArabic ? 'موقع العمل المفضل' : 'Preferred Work Location'} <span className="text-destructive">*</span>
                {fieldErrors.preferredWorkLocation && (
                  <AlertTriangle className="inline-block h-4 w-4 ml-1 text-destructive" />
                )}
              </Label>
              <Select
                value={formData.preferredWorkLocation}
                onValueChange={(value) => {
                  setFormData({ ...formData, preferredWorkLocation: value as 'OFFICE' | 'REMOTE' | 'HYBRID' });
                  if (fieldErrors.preferredWorkLocation) {
                    setFieldErrors({ ...fieldErrors, preferredWorkLocation: '' });
                  }
                }}
              >
                <SelectTrigger 
                  id="preferredWorkLocation" 
                  className={`transition-colors ${fieldErrors.preferredWorkLocation ? 'border-destructive border-2 focus-visible:ring-destructive' : ''}`}
                >
                  <SelectValue placeholder={isArabic ? 'اختر موقع العمل المفضل' : 'Select preferred work location'} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="OFFICE">{isArabic ? 'مكتب' : 'Office'}</SelectItem>
                  <SelectItem value="REMOTE">{isArabic ? 'عن بُعد' : 'Remote'}</SelectItem>
                  <SelectItem value="HYBRID">{isArabic ? 'هجين' : 'Hybrid'}</SelectItem>
                </SelectContent>
              </Select>
              {fieldErrors.preferredWorkLocation && (
                <div className="flex items-start gap-2 p-2 rounded-md bg-destructive/10 border border-destructive/20">
                  <AlertTriangle className="h-4 w-4 text-destructive mt-0.5 flex-shrink-0" />
                  <p className="text-sm text-destructive font-medium">{fieldErrors.preferredWorkLocation}</p>
                </div>
              )}
            </div>

            <div className="space-y-2">
              <div className="flex items-start space-x-2 space-x-reverse">
                <Checkbox
                  id="willingnessToRelocate"
                  checked={formData.willingnessToRelocate}
                  onCheckedChange={(checked) => {
                    setFormData({ ...formData, willingnessToRelocate: checked === true });
                    if (fieldErrors.willingnessToRelocate) {
                      setFieldErrors({ ...fieldErrors, willingnessToRelocate: '' });
                    }
                  }}
                  className={`mt-1 ${fieldErrors.willingnessToRelocate ? 'border-destructive' : ''}`}
                />
                <Label
                  htmlFor="willingnessToRelocate"
                  className={`text-sm font-normal leading-relaxed cursor-pointer ${fieldErrors.willingnessToRelocate ? 'text-destructive' : ''}`}
                >
                  {isArabic
                    ? 'أنا مستعد للانتقال إذا لزم الأمر'
                    : 'I am willing to relocate if necessary'}
                  {fieldErrors.willingnessToRelocate && (
                    <AlertTriangle className="inline-block h-4 w-4 ml-1 text-destructive" />
                  )}
                </Label>
              </div>
              {fieldErrors.willingnessToRelocate && (
                <div className="flex items-start gap-2 p-2 rounded-md bg-destructive/10 border border-destructive/20">
                  <AlertTriangle className="h-4 w-4 text-destructive mt-0.5 flex-shrink-0" />
                  <p className="text-sm text-destructive font-medium">{fieldErrors.willingnessToRelocate}</p>
                </div>
              )}
            </div>

            <div className="space-y-2">
              <Label 
                htmlFor="noticePeriod"
                className={fieldErrors.noticePeriod ? 'text-destructive' : ''}
              >
                {isArabic ? 'متى تكون جاهزاً للبدء؟' : 'When are you ready to start?'} <span className="text-destructive">*</span>
                {fieldErrors.noticePeriod && (
                  <AlertTriangle className="inline-block h-4 w-4 ml-1 text-destructive" />
                )}
              </Label>
              <Input
                id="noticePeriod"
                type="text"
                value={formData.noticePeriod}
                onChange={(e) => {
                  setFormData({ ...formData, noticePeriod: e.target.value });
                  if (fieldErrors.noticePeriod) {
                    setFieldErrors({ ...fieldErrors, noticePeriod: '' });
                  }
                }}
                placeholder={isArabic ? 'مثال: بعد شهر واحد، بعد أسبوعين، فوري، بعد إتمام فترة الإشعار' : 'Example: After 1 month, After 2 weeks, Immediately, After notice period'}
                className={`transition-colors ${fieldErrors.noticePeriod ? 'border-destructive border-2 focus-visible:ring-destructive' : ''}`}
              />
              {fieldErrors.noticePeriod && (
                <div className="flex items-start gap-2 p-2 rounded-md bg-destructive/10 border border-destructive/20">
                  <AlertTriangle className="h-4 w-4 text-destructive mt-0.5 flex-shrink-0" />
                  <p className="text-sm text-destructive font-medium">{fieldErrors.noticePeriod}</p>
                </div>
              )}
            </div>

            <div className="space-y-2">
              <div className="flex items-start space-x-2 space-x-reverse">
                <Checkbox
                  id="canWorkHard"
                  checked={formData.canWorkHard}
                  onCheckedChange={(checked) => {
                    setFormData({ ...formData, canWorkHard: checked === true });
                    if (fieldErrors.canWorkHard) {
                      setFieldErrors({ ...fieldErrors, canWorkHard: '' });
                    }
                  }}
                  className={`mt-1 ${fieldErrors.canWorkHard ? 'border-destructive' : ''}`}
                />
                <Label
                  htmlFor="canWorkHard"
                  className={`text-sm font-normal leading-relaxed cursor-pointer ${fieldErrors.canWorkHard ? 'text-destructive' : ''}`}
                >
                  {isArabic
                    ? 'أؤكد أنني أستطيع العمل تحت ظروف عمل صعبة'
                    : 'I confirm that I can work under hard work conditions'}
                  {fieldErrors.canWorkHard && (
                    <AlertTriangle className="inline-block h-4 w-4 ml-1 text-destructive" />
                  )}
                </Label>
              </div>
              {fieldErrors.canWorkHard && (
                <div className="flex items-start gap-2 p-2 rounded-md bg-destructive/10 border border-destructive/20">
                  <AlertTriangle className="h-4 w-4 text-destructive mt-0.5 flex-shrink-0" />
                  <p className="text-sm text-destructive font-medium">{fieldErrors.canWorkHard}</p>
                </div>
              )}
            </div>

            <div className="space-y-2">
              <Label 
                htmlFor="bestInterviewTime"
                className={fieldErrors.bestInterviewTime ? 'text-destructive' : ''}
              >
                {isArabic ? 'ما هو أفضل وقت للمقابلة بالنسبة لك؟' : 'What is the best time for the interview for you?'} <span className="text-destructive">*</span>
                {fieldErrors.bestInterviewTime && (
                  <AlertTriangle className="inline-block h-4 w-4 ml-1 text-destructive" />
                )}
              </Label>
              <Textarea
                id="bestInterviewTime"
                value={formData.bestInterviewTime}
                onChange={(e) => {
                  setFormData({ ...formData, bestInterviewTime: e.target.value });
                  if (fieldErrors.bestInterviewTime) {
                    setFieldErrors({ ...fieldErrors, bestInterviewTime: '' });
                  }
                }}
                rows={3}
                placeholder={isArabic ? 'مثال: صباحاً من 9 صباحاً إلى 12 ظهراً، أو مساءً من 6 مساءً إلى 9 مساءً...' : 'Example: Morning from 9 AM to 12 PM, or evening from 6 PM to 9 PM...'}
                className={`resize-y transition-colors ${fieldErrors.bestInterviewTime ? 'border-destructive border-2 focus-visible:ring-destructive' : ''}`}
              />
              {fieldErrors.bestInterviewTime && (
                <div className="flex items-start gap-2 p-2 rounded-md bg-destructive/10 border border-destructive/20">
                  <AlertTriangle className="h-4 w-4 text-destructive mt-0.5 flex-shrink-0" />
                  <p className="text-sm text-destructive font-medium">{fieldErrors.bestInterviewTime}</p>
                </div>
              )}
              <p className="text-xs text-muted-foreground">
                {isArabic 
                  ? '💡 نصيحة: حدد الأوقات التي تكون فيها متاحاً ومستعداً للمقابلة المرئية'
                  : '💡 Tip: Specify times when you are available and ready for the video interview'}
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="questionsAboutRole">
                {isArabic ? 'هل لديك أي أسئلة حول الوظيفة أو الشركة؟' : 'Do you have any questions about the role or company?'}
              </Label>
              <Textarea
                id="questionsAboutRole"
                value={formData.questionsAboutRole}
                onChange={(e) => setFormData({ ...formData, questionsAboutRole: e.target.value })}
                rows={3}
                placeholder={isArabic ? 'أسئلتك (اختياري)...' : 'Your questions (optional)...'}
                className="resize-y"
              />
            </div>

            {error && (
              <div 
                data-error-summary
                className="p-5 rounded-lg bg-gradient-to-r from-destructive/15 to-destructive/5 border-2 border-destructive text-destructive shadow-lg animate-in fade-in slide-in-from-top-2"
              >
                <div className="flex items-start gap-3">
                  <div className="rounded-full bg-destructive/20 p-2 flex-shrink-0">
                    <AlertCircle className="h-5 w-5 text-destructive" />
                  </div>
                  <div className="flex-1">
                    <p className="font-bold text-lg mb-2 flex items-center gap-2">
                      {isArabic ? '⚠️ خطأ في التحقق من البيانات' : '⚠️ Validation Error'}
                    </p>
                    <p className="text-sm font-medium mb-4 bg-destructive/10 p-2 rounded border border-destructive/30">
                      {error}
                    </p>
                    {Object.keys(fieldErrors).length > 0 && (
                      <div className="mt-4 pt-4 border-t-2 border-destructive/30">
                        <p className="text-sm font-bold mb-3 flex items-center gap-2">
                          <AlertTriangle className="h-4 w-4" />
                          {isArabic ? 'تفاصيل الأخطاء:' : 'Error Details:'}
                          <span className="text-xs font-normal opacity-75">
                            ({Object.keys(fieldErrors).length} {isArabic ? 'حقل' : 'field'}{Object.keys(fieldErrors).length > 1 ? (isArabic ? 's' : 's') : ''})
                          </span>
                        </p>
                        <ul className="space-y-2.5">
                          {Object.entries(fieldErrors).map(([field, message]) => (
                            <li key={field} className="flex items-start gap-2.5 bg-destructive/5 p-2.5 rounded-md border border-destructive/20 hover:bg-destructive/10 transition-colors">
                              <AlertTriangle className="h-4 w-4 text-destructive mt-0.5 flex-shrink-0" />
                              <button
                                type="button"
                                onClick={() => {
                                  const element = document.getElementById(field);
                                  if (element) {
                                    element.scrollIntoView({ behavior: 'smooth', block: 'center' });
                                    setTimeout(() => element.focus(), 100);
                                  }
                                }}
                                className="text-sm text-left font-medium hover:underline focus:underline focus:outline-none focus:ring-2 focus:ring-destructive/50 rounded flex-1"
                              >
                                {message}
                              </button>
                            </li>
                          ))}
                        </ul>
                        <p className="text-xs mt-3 pt-3 border-t border-destructive/20 text-destructive/80 italic">
                          {isArabic 
                            ? '💡 انقر على أي خطأ للانتقال مباشرة إلى الحقل المطلوب'
                            : '💡 Click on any error to jump directly to the required field'}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            <Button type="submit" disabled={submitting} className="w-full">
              {submitting ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  {isArabic ? 'جاري الإرسال...' : 'Submitting...'}
                </>
              ) : (
                isArabic ? 'إرسال' : 'Submit'
              )}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
    </PublicShell>
  );
}

