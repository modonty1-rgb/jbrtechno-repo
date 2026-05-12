'use client';

import { useState, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { useParams } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@jbrtechno/ui';
import { Button } from '@jbrtechno/ui';
import { Checkbox } from '@jbrtechno/ui';
import { ArrowLeft, ArrowRight, CheckCircle2, Loader2, AlertCircle } from 'lucide-react';
import Link from 'next/link';
import type { Position } from '@jbrtechno/database';
import { CVUpload } from '@/components/forms/CVUpload';
import { ProfileImageUpload } from '@/components/forms/ProfileImageUpload';
import { SuccessDialog } from '@/components/common/SuccessDialog';
import { submitApplication } from '@/actions/submitApplication';
import { getPositionByTitle } from '@/actions/positions';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@jbrtechno/ui';
import PhoneInput, { isValidPhoneNumber } from 'react-phone-number-input';
import 'react-phone-number-input/style.css';

export default function ApplyPage() {
  const params = useParams();
  const t = useTranslations('applications');
  const locale = params.locale as string;
  const positionTitle = decodeURIComponent(params.position as string);

  // Fetch position from DB by title
  const [position, setPosition] = useState<Position | null>(null);
  const [positionLoading, setPositionLoading] = useState(true);
  useEffect(() => {
    (async () => {
      const found = await getPositionByTitle(positionTitle);
      setPosition(found);
      setPositionLoading(false);
    })();
  }, [positionTitle]);

  const [acknowledged, setAcknowledged] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [profileImageError, setProfileImageError] = useState<string | null>(null);
  const [showSuccessDialog, setShowSuccessDialog] = useState(false);

  const [formData, setFormData] = useState({
    applicantName: '',
    email: '',
    phone: '',
    yearsOfExperience: '',
    availabilityDate: '',
    currentLocation: '',
    arabicProficiency: '' as '' | 'excellent' | 'very_good' | 'good' | 'fair',
    englishProficiency: '' as '' | 'excellent' | 'very_good' | 'good' | 'fair',
    consentToDataUsage: false,
    portfolioUrl: '',
    githubUrl: '',
    linkedinUrl: '',
    skills: '',
    coverLetter: '',
    cvUrl: '',
    cvPublicId: '',
    profileImageUrl: '',
    profileImagePublicId: '',
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

  if (!position) {
    return (
      <div className="container mx-auto px-4 py-12">
        <Card>
          <CardContent className="py-12 text-center">
            <AlertCircle className="h-12 w-12 text-destructive mx-auto mb-4" />
            <h2 className="text-xl font-semibold mb-2">{t('positionNotFound')}</h2>
            <p className="text-muted-foreground mb-6">{t('positionNotFoundDesc')}</p>
            <Link href={`/${locale}/careers`}>
              <Button>
                {locale === 'ar' ? <ArrowRight className="h-4 w-4 ml-2" /> : <ArrowLeft className="h-4 w-4 mr-2" />}
                {t('backToCareers')}
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!position.isOpen) {
    return (
      <div className="container mx-auto px-4 py-12">
        <Card className="border-2 border-gray-300 bg-gray-50/50">
          <CardContent className="py-12 text-center">
            <CheckCircle2 className="h-12 w-12 text-gray-500 mx-auto mb-4" />
            <h2 className="text-xl font-semibold mb-2">
              {locale === 'ar' ? 'اكتمل الفريق لهذه الوظيفة' : 'Team is complete for this position'}
            </h2>
            <p className="text-muted-foreground mb-6">
              {locale === 'ar'
                ? `وظيفة "${position.title}" لم تعد متاحة للتقديم. شكراً لاهتمامك — تصفّح بقية الوظائف المتاحة.`
                : `The "${position.titleEn}" position is no longer accepting applications. Browse the remaining open positions.`}
            </p>
            <Link href={`/${locale}/careers`}>
              <Button>
                {locale === 'ar' ? <ArrowRight className="h-4 w-4 ml-2" /> : <ArrowLeft className="h-4 w-4 mr-2" />}
                {t('backToCareers')}
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  const requirements = locale === 'ar' ? position.requirements : position.requirementsEn;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!formData.cvUrl) {
      setError(locale === 'ar' ? 'يرجى تحميل السيرة الذاتية' : 'Please upload your CV');
      return;
    }

    if (!acknowledged) {
      setError(locale === 'ar' ? 'يرجى قراءة المتطلبات والموافقة عليها' : 'Please acknowledge the requirements');
      return;
    }

    if (!formData.phone || !isValidPhoneNumber(formData.phone)) {
      setError(
        locale === 'ar'
          ? 'يرجى إدخال رقم واتساب صحيح بصيغة دولية (اختر الدولة من القائمة)'
          : 'Please enter a valid WhatsApp number in international format (pick country from list)'
      );
      return;
    }

    if (!formData.yearsOfExperience) {
      setError(t('errorSelectExperience'));
      return;
    }

    if (!formData.availabilityDate) {
      setError(t('errorSelectAvailability'));
      return;
    }

    if (!formData.currentLocation.trim()) {
      setError(t('errorEnterLocation'));
      return;
    }

    if (!formData.arabicProficiency || !formData.englishProficiency) {
      setError(t('errorSelectLanguages'));
      return;
    }

    if (!formData.consentToDataUsage) {
      setError(t('errorConsentRequired'));
      return;
    }

    if (formData.coverLetter.trim().length < 50) {
      setError(t('errorCoverLetterLength'));
      return;
    }

    if (!formData.whyInterestedInPosition.trim() || formData.whyInterestedInPosition.trim().length < 20) {
      setError(t('errorWhyInterestedInPosition'));
      return;
    }

    if (!formData.lastJobExitReason.trim() || formData.lastJobExitReason.trim().length < 10) {
      setError(t('errorLastJobExitReason'));
      return;
    }

    if (!formData.lastSalary.trim()) {
      setError(t('errorLastSalary'));
      return;
    }

    if (!formData.expectedSalary.trim()) {
      setError(t('errorExpectedSalary'));
      return;
    }

    if (!formData.noticePeriod.trim() || formData.noticePeriod.trim().length < 3) {
      setError(t('errorNoticePeriod'));
      return;
    }

    if (!formData.preferredWorkLocation) {
      setError(t('errorPreferredWorkLocation'));
      return;
    }

    if (!formData.bestInterviewTime.trim() || formData.bestInterviewTime.trim().length < 3) {
      setError(t('errorBestInterviewTime'));
      return;
    }

    setSubmitting(true);

    try {
      const skillsArray = formData.skills.split(',').map((s) => s.trim()).filter((s) => s.length > 0);

      const result = await submitApplication({
        applicantName: formData.applicantName,
        email: formData.email,
        phone: formData.phone,
        position: positionTitle,
        yearsOfExperience: parseInt(formData.yearsOfExperience, 10),
        availabilityDate: formData.availabilityDate,
        currentLocation: formData.currentLocation,
        arabicProficiency: formData.arabicProficiency,
        englishProficiency: formData.englishProficiency,
        consentToDataUsage: formData.consentToDataUsage,
        portfolioUrl: formData.portfolioUrl || '',
        githubUrl: formData.githubUrl || '',
        linkedinUrl: formData.linkedinUrl || '',
        skills: skillsArray,
        coverLetter: formData.coverLetter,
        cvUrl: formData.cvUrl,
        cvPublicId: formData.cvPublicId,
        profileImageUrl: formData.profileImageUrl,
        profileImagePublicId: formData.profileImagePublicId,
        locale: locale === 'ar' ? 'ar' : 'en',
        lastJobExitReason: formData.lastJobExitReason,
        lastSalary: formData.lastSalary,
        expectedSalary: formData.expectedSalary,
        canWorkHard: formData.canWorkHard || undefined,
        noticePeriod: formData.noticePeriod,
        preferredWorkLocation: formData.preferredWorkLocation,
        whyInterestedInPosition: formData.whyInterestedInPosition,
        questionsAboutRole: formData.questionsAboutRole || '',
        willingnessToRelocate: formData.willingnessToRelocate || undefined,
        bestInterviewTime: formData.bestInterviewTime,
      });

      if (result.success) {
        setShowSuccessDialog(true);
      } else {
        setError(result.error || (locale === 'ar' ? 'فشل في إرسال الطلب' : 'Failed to submit application'));
      }
    } catch {
      setError(locale === 'ar' ? 'حدث خطأ غير متوقع' : 'An unexpected error occurred');
    } finally {
      setSubmitting(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const languageOptions = [
    {
      value: 'excellent' as const,
      label: locale === 'ar' ? 'ممتاز' : 'Excellent',
    },
    {
      value: 'very_good' as const,
      label: locale === 'ar' ? 'جيد جدًا' : 'Very Good',
    },
    {
      value: 'good' as const,
      label: locale === 'ar' ? 'جيد' : 'Good',
    },
    {
      value: 'fair' as const,
      label: locale === 'ar' ? 'مقبول' : 'Acceptable',
    },
  ] satisfies ReadonlyArray<{
    value: 'excellent' | 'very_good' | 'good' | 'fair';
    label: string;
  }>;

  const experienceOptions = Array.from({ length: 31 }, (_, index) => index.toString());

  return (
    <div className="container mx-auto px-4 py-12 max-w-4xl">
      <div className="mb-8">
        <Link href={`/${locale}/careers`}>
          <Button variant="ghost" size="sm">
            {locale === 'ar' ? <ArrowRight className="h-4 w-4 ml-2" /> : <ArrowLeft className="h-4 w-4 mr-2" />}
            {t('backToCareers')}
          </Button>
        </Link>
      </div>

      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-2">{t('applyForPosition')}</h1>
        <p className="text-xl text-muted-foreground">{positionTitle}</p>
      </div>

      {/* Requirements Section */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle>{t('requirements')}</CardTitle>
          <CardDescription>{t('requirementsDesc')}</CardDescription>
        </CardHeader>
        <CardContent>
          <ul className="space-y-2">
            {requirements.map((req, idx) => {
              const isBonus = req.startsWith('⭐');
              const isSection = req.startsWith('---');
              const isEmpty = req.trim() === '';
              const cleanReq = isBonus ? req.substring(2).trim() : req.replace(/^---\s*/, '').replace(/\s*---$/, '').trim();

              if (isEmpty) {
                return <li key={idx} className="h-2" />;
              }

              if (isSection) {
                return (
                  <li key={idx} className="pt-3 pb-1.5 first:pt-0">
                    <h4 className="text-sm font-bold uppercase tracking-wider text-primary/80">
                      {cleanReq}
                    </h4>
                  </li>
                );
              }

              return (
                <li key={idx} className="text-sm flex items-start gap-2.5 pl-1">
                  <CheckCircle2 className="h-4 w-4 text-primary/70 mt-0.5 flex-shrink-0" />
                  <span className="text-muted-foreground leading-relaxed">
                    {isBonus && '⭐ '}{cleanReq}
                  </span>
                </li>
              );
            })}
          </ul>

          <div className="mt-6 pt-6 border-t space-y-3">
            <label className="flex items-start gap-3 cursor-pointer group">
              <Checkbox
                checked={acknowledged}
                onCheckedChange={(checked) => setAcknowledged(checked === true)}
              />
              <span className="text-sm font-medium leading-relaxed group-hover:text-primary transition-colors">
                {t('acknowledgeRequirements')}
              </span>
            </label>
            {!acknowledged && (
              <div className="flex items-center gap-2 text-xs text-muted-foreground bg-muted/50 p-3 rounded-lg border border-dashed">
                <CheckCircle2 className="h-4 w-4 flex-shrink-0" />
                <span>
                  {locale === 'ar'
                    ? 'يرجى تحديد المربع أعلاه لإظهار نموذج التقديم'
                    : 'Please check the box above to show the application form'}
                </span>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Application Form - Only shows after acknowledgement */}
      {acknowledged && (
        <form onSubmit={handleSubmit} className="space-y-6 animate-in fade-in slide-in-from-top-4 duration-500">
          {error && (
            <div className="p-4 bg-destructive/10 text-destructive rounded-lg text-sm border border-destructive/20">
              {error}
            </div>
          )}

          {/* Personal Information */}
          <Card>
            <CardHeader>
              <CardTitle className="text-xl">{t('sectionPersonalInformation')}</CardTitle>
              <CardDescription>{t('sectionPersonalInformationDesc')}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label htmlFor="applicantName" className="text-sm font-medium">
                    {t('fullName')} <span className="text-destructive">*</span>
                  </label>
                  <input
                    id="applicantName"
                    name="applicantName"
                    type="text"
                    autoComplete="name"
                    required
                    value={formData.applicantName}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border rounded-md bg-background"
                    placeholder={t('fullNamePlaceholder')}
                  />
                </div>

                <div className="space-y-2">
                  <label htmlFor="email" className="text-sm font-medium">
                    {t('email')} <span className="text-destructive">*</span>
                  </label>
                  <input
                    id="email"
                    name="email"
                    type="email"
                    autoComplete="email"
                    required
                    value={formData.email}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border rounded-md bg-background"
                    placeholder={t('emailPlaceholder')}
                  />
                </div>

                <div className="space-y-2" dir="ltr">
                  <label htmlFor="phone" className="text-sm font-medium block" dir={locale === 'ar' ? 'rtl' : 'ltr'}>
                    {t('phone')} <span className="text-destructive">*</span>
                  </label>
                  <PhoneInput
                    id="phone"
                    international
                    defaultCountry="SA"
                    countries={['SA', 'EG']}
                    countryCallingCodeEditable={false}
                    value={formData.phone}
                    onChange={(value) => setFormData((prev) => ({ ...prev, phone: value ?? '' }))}
                    className="phone-input-jbr"
                    placeholder={locale === 'ar' ? 'اختر الدولة ثم أدخل رقمك' : 'Pick country, then enter your number'}
                  />
                  {formData.phone && !isValidPhoneNumber(formData.phone) && (
                    <p className="text-xs text-destructive" dir={locale === 'ar' ? 'rtl' : 'ltr'}>
                      {locale === 'ar' ? 'رقم غير صحيح للدولة المختارة' : 'Invalid number for the selected country'}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <label htmlFor="currentLocation" className="text-sm font-medium">
                    {t('currentLocation')} <span className="text-destructive">*</span>
                  </label>
                  <input
                    id="currentLocation"
                    name="currentLocation"
                    type="text"
                    autoComplete="address-level2"
                    required
                    value={formData.currentLocation}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border rounded-md bg-background"
                    placeholder={t('currentLocationPlaceholder')}
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Professional Profile */}
          <Card>
            <CardHeader>
              <CardTitle className="text-xl">{t('sectionProfessionalProfile')}</CardTitle>
              <CardDescription>{t('sectionProfessionalProfileDesc')}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label htmlFor="yearsOfExperience" className="text-sm font-medium">
                    {t('yearsOfExperience')} <span className="text-destructive">*</span>
                  </label>
                  <Select
                    value={formData.yearsOfExperience}
                    onValueChange={(value) =>
                      setFormData((prev) => ({ ...prev, yearsOfExperience: value }))
                    }
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder={t('yearsOfExperiencePlaceholder')} />
                    </SelectTrigger>
                    <SelectContent>
                      {experienceOptions.map((option) => (
                        <SelectItem key={option} value={option}>
                          {locale === 'ar'
                            ? `${option} ${Number(option) === 1 ? 'سنة' : 'سنوات'}`
                            : `${option} ${Number(option) === 1 ? 'year' : 'years'}`}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <label htmlFor="skills" className="text-sm font-medium">
                    {t('skills')} <span className="text-destructive">*</span>
                  </label>
                  <input
                    id="skills"
                    name="skills"
                    type="text"
                    autoComplete="off"
                    required
                    value={formData.skills}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border rounded-md bg-background"
                    placeholder={t('skillsPlaceholder')}
                  />
                  <p className="text-xs text-muted-foreground">{t('skillsHelp')}</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-sm font-medium">
                    {t('arabicProficiency')} <span className="text-destructive">*</span>
                  </label>
                  <Select
                    value={formData.arabicProficiency}
                    onValueChange={(value: 'excellent' | 'very_good' | 'good' | 'fair') =>
                      setFormData((prev) => ({ ...prev, arabicProficiency: value }))
                    }
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder={t('languageLevelPlaceholder')} />
                    </SelectTrigger>
                    <SelectContent>
                      {languageOptions.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">
                    {t('englishProficiency')} <span className="text-destructive">*</span>
                  </label>
                  <Select
                    value={formData.englishProficiency}
                    onValueChange={(value: 'excellent' | 'very_good' | 'good' | 'fair') =>
                      setFormData((prev) => ({ ...prev, englishProficiency: value }))
                    }
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder={t('languageLevelPlaceholder')} />
                    </SelectTrigger>
                    <SelectContent>
                      {languageOptions.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Portfolio & Links */}
          <Card>
            <CardHeader>
              <CardTitle className="text-xl">{t('sectionPortfolioLinks')}</CardTitle>
              <CardDescription>{t('sectionPortfolioLinksDesc')}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label htmlFor="portfolioUrl" className="text-sm font-medium">
                    {t('portfolioUrl')}
                  </label>
                  <input
                    id="portfolioUrl"
                    name="portfolioUrl"
                    type="url"
                    autoComplete="url"
                    value={formData.portfolioUrl}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border rounded-md bg-background"
                    placeholder="https://"
                  />
                </div>

                <div className="space-y-2">
                  <label htmlFor="githubUrl" className="text-sm font-medium">
                    {t('githubUrl')}
                  </label>
                  <input
                    id="githubUrl"
                    name="githubUrl"
                    type="url"
                    autoComplete="url"
                    value={formData.githubUrl}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border rounded-md bg-background"
                    placeholder="https://github.com/"
                  />
                </div>

                <div className="space-y-2 md:col-span-2">
                  <label htmlFor="linkedinUrl" className="text-sm font-medium">
                    {t('linkedinUrl')}
                  </label>
                  <input
                    id="linkedinUrl"
                    name="linkedinUrl"
                    type="url"
                    autoComplete="url"
                    value={formData.linkedinUrl}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border rounded-md bg-background"
                    placeholder="https://linkedin.com/in/"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Documents */}
          <Card>
            <CardHeader>
              <CardTitle className="text-xl">{t('sectionDocuments')}</CardTitle>
              <CardDescription>{t('sectionDocumentsDesc')}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <label className="text-sm font-medium">
                  {t('profileImage')} <span className="text-destructive">*</span>
                </label>
                <ProfileImageUpload
                  onUploadSuccess={(url, publicId) => {
                    setFormData((prev) => ({ ...prev, profileImageUrl: url, profileImagePublicId: publicId }));
                    setProfileImageError(null);
                  }}
                  onUploadError={(err) => setProfileImageError(err)}
                  disabled={submitting}
                />
                {profileImageError && (
                  <p className="text-sm text-destructive">{profileImageError}</p>
                )}
                <p className="text-xs text-muted-foreground">{t('profileImageHelp')}</p>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">
                  {t('cvUpload')} <span className="text-destructive">*</span>
                </label>
                <CVUpload
                  onUploadSuccess={(url, publicId) => {
                    setFormData((prev) => ({ ...prev, cvUrl: url, cvPublicId: publicId }));
                    setUploadError(null);
                  }}
                  onUploadError={(err) => setUploadError(err)}
                  disabled={submitting}
                />
                {uploadError && (
                  <p className="text-sm text-destructive">{uploadError}</p>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Motivation & Application */}
          <Card>
            <CardHeader>
              <CardTitle className="text-xl">{t('sectionMotivation')}</CardTitle>
              <CardDescription>{t('sectionMotivationDesc')}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <label htmlFor="coverLetter" className="text-sm font-medium">
                  {t('coverLetter')} <span className="text-destructive">*</span>
                </label>
                <textarea
                  id="coverLetter"
                  name="coverLetter"
                  required
                  rows={6}
                  value={formData.coverLetter}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border rounded-md bg-background resize-y"
                  placeholder={t('coverLetterPlaceholder')}
                  minLength={50}
                  maxLength={2000}
                  autoComplete="off"
                />
                <p className="text-xs text-muted-foreground">
                  {formData.coverLetter.length}/2000 {t('characters')}
                </p>
              </div>

              <div className="space-y-2">
                <label htmlFor="whyInterestedInPosition" className="text-sm font-medium">
                  {t('whyInterestedInPosition')} <span className="text-destructive">*</span>
                </label>
                <textarea
                  id="whyInterestedInPosition"
                  name="whyInterestedInPosition"
                  required
                  rows={4}
                  value={formData.whyInterestedInPosition}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border rounded-md bg-background resize-y"
                  placeholder={t('whyInterestedInPositionPlaceholder')}
                  maxLength={500}
                  autoComplete="off"
                />
                <p className="text-xs text-muted-foreground">
                  {formData.whyInterestedInPosition.length}/500 {t('characters')} {formData.whyInterestedInPosition.length < 20 && `(${t('minimum')}: 20)`}
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Employment History */}
          <Card>
            <CardHeader>
              <CardTitle className="text-xl">{t('sectionEmploymentHistory')}</CardTitle>
              <CardDescription>{t('sectionEmploymentHistoryDesc')}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <label htmlFor="lastJobExitReason" className="text-sm font-medium">
                  {t('lastJobExitReason')} <span className="text-destructive">*</span>
                </label>
                <textarea
                  id="lastJobExitReason"
                  name="lastJobExitReason"
                  required
                  rows={4}
                  value={formData.lastJobExitReason}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border rounded-md bg-background resize-y"
                  placeholder={t('lastJobExitReasonPlaceholder')}
                  maxLength={1000}
                  autoComplete="off"
                />
                <p className="text-xs text-muted-foreground">
                  {formData.lastJobExitReason.length}/1000 {t('characters')} {formData.lastJobExitReason.length < 10 && `(${t('minimum')}: 10)`}
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label htmlFor="lastSalary" className="text-sm font-medium">
                    {t('lastSalary')} <span className="text-destructive">*</span>
                  </label>
                  <input
                    id="lastSalary"
                    name="lastSalary"
                    type="text"
                    required
                    value={formData.lastSalary}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border rounded-md bg-background"
                    placeholder={t('lastSalaryPlaceholder')}
                  />
                </div>

                <div className="space-y-2">
                  <label htmlFor="expectedSalary" className="text-sm font-medium">
                    {t('expectedSalary')} <span className="text-destructive">*</span>
                  </label>
                  <input
                    id="expectedSalary"
                    name="expectedSalary"
                    type="text"
                    required
                    value={formData.expectedSalary}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border rounded-md bg-background"
                    placeholder={t('expectedSalaryPlaceholder')}
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Work Preferences */}
          <Card>
            <CardHeader>
              <CardTitle className="text-xl">{t('sectionWorkPreferences')}</CardTitle>
              <CardDescription>{t('sectionWorkPreferencesDesc')}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label htmlFor="availabilityDate" className="text-sm font-medium">
                    {t('availabilityDate')} <span className="text-destructive">*</span>
                  </label>
                  <input
                    id="availabilityDate"
                    name="availabilityDate"
                    type="date"
                    autoComplete="off"
                    required
                    value={formData.availabilityDate}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border rounded-md bg-background"
                    placeholder={t('availabilityDatePlaceholder')}
                  />
                </div>

                <div className="space-y-2">
                  <label htmlFor="noticePeriod" className="text-sm font-medium">
                    {t('noticePeriod')} <span className="text-destructive">*</span>
                  </label>
                  <input
                    id="noticePeriod"
                    name="noticePeriod"
                    type="text"
                    required
                    value={formData.noticePeriod}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border rounded-md bg-background"
                    placeholder={t('noticePeriodPlaceholder')}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">
                  {t('preferredWorkLocation')} <span className="text-destructive">*</span>
                </label>
                <Select
                  value={formData.preferredWorkLocation}
                  onValueChange={(value: 'OFFICE' | 'REMOTE' | 'HYBRID') =>
                    setFormData((prev) => ({ ...prev, preferredWorkLocation: value }))
                  }
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder={t('preferredWorkLocationPlaceholder')} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="OFFICE">{t('workLocationOffice')}</SelectItem>
                    <SelectItem value="REMOTE">{t('workLocationRemote')}</SelectItem>
                    <SelectItem value="HYBRID">{t('workLocationHybrid')}</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-3 pt-2">
                <label className="flex items-start gap-3 cursor-pointer">
                  <Checkbox
                    checked={formData.willingnessToRelocate}
                    onCheckedChange={(checked) =>
                      setFormData((prev) => ({
                        ...prev,
                        willingnessToRelocate: checked === true,
                      }))
                    }
                  />
                  <span className="text-sm leading-relaxed text-muted-foreground">
                    {t('willingnessToRelocate')}
                  </span>
                </label>

                <label className="flex items-start gap-3 cursor-pointer">
                  <Checkbox
                    checked={formData.canWorkHard}
                    onCheckedChange={(checked) =>
                      setFormData((prev) => ({
                        ...prev,
                        canWorkHard: checked === true,
                      }))
                    }
                  />
                  <span className="text-sm leading-relaxed text-muted-foreground">
                    {t('canWorkHard')}
                  </span>
                </label>
              </div>
            </CardContent>
          </Card>

          {/* Interview Details */}
          <Card>
            <CardHeader>
              <CardTitle className="text-xl">{t('sectionInterviewDetails')}</CardTitle>
              <CardDescription>{t('sectionInterviewDetailsDesc')}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <label htmlFor="bestInterviewTime" className="text-sm font-medium">
                  {t('bestInterviewTime')} <span className="text-destructive">*</span>
                </label>
                <input
                  id="bestInterviewTime"
                  name="bestInterviewTime"
                  type="text"
                  required
                  value={formData.bestInterviewTime}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border rounded-md bg-background"
                  placeholder={t('bestInterviewTimePlaceholder')}
                  maxLength={200}
                />
                <p className="text-xs text-muted-foreground">
                  {formData.bestInterviewTime.length}/200 {t('characters')}
                </p>
              </div>

              <div className="space-y-2">
                <label htmlFor="questionsAboutRole" className="text-sm font-medium">
                  {t('questionsAboutRole')}
                </label>
                <textarea
                  id="questionsAboutRole"
                  name="questionsAboutRole"
                  rows={3}
                  value={formData.questionsAboutRole}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border rounded-md bg-background resize-y"
                  placeholder={t('questionsAboutRolePlaceholder')}
                  maxLength={500}
                  autoComplete="off"
                />
                <p className="text-xs text-muted-foreground">
                  {formData.questionsAboutRole.length}/500 {t('characters')}
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Consent & Submission */}
          <Card>
            <CardContent className="pt-6">
              <div className="space-y-6">
                <div>
                  <label className="flex items-start gap-3 cursor-pointer">
                    <Checkbox
                      checked={formData.consentToDataUsage}
                      onCheckedChange={(checked) =>
                        setFormData((prev) => ({
                          ...prev,
                          consentToDataUsage: checked === true,
                        }))
                      }
                    />
                    <span className="text-sm leading-relaxed text-muted-foreground">
                      {t('consentCopy')}
                    </span>
                  </label>
                </div>

                <div className="pt-2">
                  <Button
                    type="submit"
                    size="lg"
                    className="w-full"
                    disabled={
                      submitting ||
                      !acknowledged ||
                      !formData.cvUrl ||
                      !formData.profileImageUrl ||
                      !formData.consentToDataUsage
                    }
                  >
                    {submitting ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        {t('submitting')}
                      </>
                    ) : (
                      t('submitApplication')
                    )}
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </form>
      )}

      {/* Success Dialog */}
      <SuccessDialog
        open={showSuccessDialog}
        onClose={() => setShowSuccessDialog(false)}
        applicantName={formData.applicantName}
        position={positionTitle}
        locale={locale}
      />
    </div>
  );
}

