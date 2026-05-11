'use server';

import { prisma } from '@jbrtechno/database';
import { interviewResponseSchema } from '@jbrtechno/shared';

export interface SubmitInterviewResponseResult {
  success: boolean;
  error?: string;
}

export async function submitInterviewResponse(
  data: {
    applicationId: string;
    lastJobExitReason: string;
    lastSalary: string;
    expectedSalary: string;
    canWorkHard: boolean;
    noticePeriod: string;
    preferredWorkLocation: 'OFFICE' | 'REMOTE' | 'HYBRID';
    whyInterestedInPosition: string;
    questionsAboutRole?: string;
    willingnessToRelocate: boolean;
    bestInterviewTime?: string;
  }
): Promise<SubmitInterviewResponseResult> {
  try {
    const validatedData = interviewResponseSchema.parse(data);

    const application = await prisma.application.findUnique({
      where: { id: validatedData.applicationId },
    });

    if (!application) {
      return {
        success: false,
        error: 'Application not found',
      };
    }

    if (application.interviewResponseSubmittedAt) {
      return {
        success: false,
        error: 'Interview response has already been submitted',
      };
    }

    await prisma.application.update({
      where: { id: validatedData.applicationId },
      data: {
        lastJobExitReason: validatedData.lastJobExitReason,
        lastSalary: validatedData.lastSalary,
        expectedSalary: validatedData.expectedSalary,
        canWorkHard: validatedData.canWorkHard,
        noticePeriod: validatedData.noticePeriod,
        preferredWorkLocation: validatedData.preferredWorkLocation,
        whyInterestedInPosition: validatedData.whyInterestedInPosition,
        questionsAboutRole: validatedData.questionsAboutRole || null,
        willingnessToRelocate: validatedData.willingnessToRelocate,
        bestInterviewTime: validatedData.bestInterviewTime || null,
        interviewResponseSubmittedAt: new Date(),
      },
    });


    return { success: true };
  } catch (error) {
    console.error('Error submitting interview response:', error);
    
    if (error instanceof Error && error.name === 'ZodError') {
      return {
        success: false,
        error: 'Invalid form data. Please check all fields.',
      };
    }

    return {
      success: false,
      error: 'Failed to submit response. Please try again.',
    };
  }
}

