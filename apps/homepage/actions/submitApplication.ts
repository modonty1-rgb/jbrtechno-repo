'use server';

import { prisma } from '@jbrtechno/database';
import {
  applicationSchema,
  ApplicationFormData,
  ApplicationFormInput,
} from '@/lib/validations/application';
import { ZodError } from 'zod';
import { sendTelegramApplicationNotification } from './sendTelegramNotification';
import { sendApplicantConfirmationEmail } from './sendApplicantEmail';

export interface SubmitApplicationResult {
  success: boolean;
  error?: string;
  applicationId?: string;
}

export async function submitApplication(
  data: ApplicationFormInput
): Promise<SubmitApplicationResult> {
  try {
    // Validate data
    const validatedData = applicationSchema.parse(data);

    // Create application in database
    const application = await prisma.application.create({
      data: {
        applicantName: validatedData.applicantName,
        email: validatedData.email,
        phone: validatedData.phone,
        position: validatedData.position,
        yearsOfExperience: validatedData.yearsOfExperience,
        availabilityDate: validatedData.availabilityDate ?? null,
        currentLocation: validatedData.currentLocation,
        arabicProficiency: validatedData.arabicProficiency,
        englishProficiency: validatedData.englishProficiency,
        consentToDataUsage: validatedData.consentToDataUsage === true,
        portfolioUrl: validatedData.portfolioUrl || null,
        githubUrl: validatedData.githubUrl || null,
        linkedinUrl: validatedData.linkedinUrl || null,
        skills: validatedData.skills,
        coverLetter: validatedData.coverLetter,
        cvUrl: validatedData.cvUrl,
        cvPublicId: validatedData.cvPublicId,
        profileImageUrl: validatedData.profileImageUrl,
        profileImagePublicId: validatedData.profileImagePublicId,
        locale: validatedData.locale,
        status: 'PENDING',
        lastJobExitReason: validatedData.lastJobExitReason,
        lastSalary: validatedData.lastSalary,
        expectedSalary: validatedData.expectedSalary,
        canWorkHard: validatedData.canWorkHard ?? null,
        noticePeriod: validatedData.noticePeriod,
        preferredWorkLocation: validatedData.preferredWorkLocation,
        whyInterestedInPosition: validatedData.whyInterestedInPosition,
        questionsAboutRole: validatedData.questionsAboutRole || null,
        willingnessToRelocate: validatedData.willingnessToRelocate ?? null,
        bestInterviewTime: validatedData.bestInterviewTime,
        interviewResponseSubmittedAt: new Date(),
      },
    });


    // Fire both notifications in parallel — neither blocks the response.
    await Promise.allSettled([
      sendTelegramApplicationNotification({
        applicantName: validatedData.applicantName,
        phone: validatedData.phone,
        email: validatedData.email,
        position: validatedData.position,
        yearsOfExperience: validatedData.yearsOfExperience,
        availabilityDate: validatedData.availabilityDate,
        currentLocation: validatedData.currentLocation,
        arabicProficiency: validatedData.arabicProficiency,
        englishProficiency: validatedData.englishProficiency,
        skills: validatedData.skills,
        message: validatedData.coverLetter,
        lastSalary: validatedData.lastSalary,
        expectedSalary: validatedData.expectedSalary,
      }),
      sendApplicantConfirmationEmail({
        applicantName: validatedData.applicantName,
        email: validatedData.email,
        position: validatedData.position,
      }),
    ]);

    return {
      success: true,
      applicationId: application.id,
    };
  } catch (error) {
    if (error instanceof ZodError) {
      console.warn('Application validation error:', error.issues);
      const firstIssue = error.issues[0];
      const locale =
        typeof data === 'object' && data && 'locale' in data
          ? (data as { locale?: string }).locale ?? 'en'
          : 'en';

      let message =
        firstIssue?.message ?? (locale === 'ar'
          ? 'يرجى التحقق من بيانات الطلب.'
          : 'Please check the application details.');

      if (firstIssue?.path?.[0] === 'coverLetter') {
        message =
          locale === 'ar'
            ? 'يرجى كتابة خطاب تقديم من 50 حرفًا على الأقل.'
            : 'Please write at least 50 characters in your cover letter.';
      }

      return {
        success: false,
        error: message,
      };
    }

    console.error('Application submission error:', error);

    if (error instanceof Error) {
      return {
        success: false,
        error: error.message,
      };
    }

    return {
      success: false,
      error: 'Failed to submit application. Please try again.',
    };
  }
}

