'use server';

import { prisma } from '@jbrtechno/database';
import { revalidatePath } from 'next/cache';

export interface DeleteInterviewResponseResult {
  success: boolean;
  error?: string;
}

export async function deleteInterviewResponse(
  applicationId: string
): Promise<DeleteInterviewResponseResult> {
  try {
    const application = await prisma.application.findUnique({
      where: { id: applicationId },
    });

    if (!application) {
      return {
        success: false,
        error: 'Application not found',
      };
    }

    if (!application.interviewResponseSubmittedAt) {
      return {
        success: false,
        error: 'No interview response found to delete',
      };
    }

    await prisma.application.update({
      where: { id: applicationId },
      data: {
        lastJobExitReason: null,
        lastSalary: null,
        expectedSalary: null,
        canWorkHard: null,
        noticePeriod: null,
        preferredWorkLocation: null,
        whyInterestedInPosition: null,
        questionsAboutRole: null,
        willingnessToRelocate: null,
        bestInterviewTime: null,
        interviewResponseSubmittedAt: null,
      },
    });

    revalidatePath('/[locale]/admin/applications');
    revalidatePath(`/[locale]/admin/applications/${applicationId}`);

    return { success: true };
  } catch (error) {
    console.error('Error deleting interview response:', error);
    return {
      success: false,
      error: 'Failed to delete interview response. Please try again.',
    };
  }
}














