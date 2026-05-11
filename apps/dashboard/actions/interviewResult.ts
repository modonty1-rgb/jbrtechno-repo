'use server';

import { prisma } from '@jbrtechno/database';
import { interviewResultSchema, InterviewResultInput } from '@/lib/validations/interviewResult';
import { revalidatePath } from 'next/cache';

export interface CreateOrUpdateInterviewResultResult {
  success: boolean;
  error?: string;
  interviewResultId?: string;
}

export interface GetInterviewResultResult {
  success: boolean;
  error?: string;
  interviewResult?: {
    id: string;
    applicationId: string;
    interviewDate: Date;
    result: 'PASSED' | 'FAILED' | 'PENDING';
    rating: number | null;
    interviewerName: string | null;
    strengths: string[];
    weaknesses: string[];
    notes: string | null;
    recommendation: string | null;
    createdAt: Date;
    updatedAt: Date;
  } | null;
}

export async function createOrUpdateInterviewResult(
  data: InterviewResultInput
): Promise<CreateOrUpdateInterviewResultResult> {
  try {
    const validatedData = interviewResultSchema.parse(data);

    // Check if application exists
    const application = await prisma.application.findUnique({
      where: { id: validatedData.applicationId },
    });

    if (!application) {
      return {
        success: false,
        error: 'Application not found',
      };
    }

    // Create or update interview result
    const interviewResult = await prisma.interviewResult.upsert({
      where: {
        applicationId: validatedData.applicationId,
      },
      create: {
        applicationId: validatedData.applicationId,
        interviewDate: validatedData.interviewDate,
        result: validatedData.result,
        rating: validatedData.rating ?? null,
        interviewerName: validatedData.interviewerName ?? null,
        strengths: validatedData.strengths ?? [],
        weaknesses: validatedData.weaknesses ?? [],
        notes: validatedData.notes ?? null,
        recommendation: validatedData.recommendation ?? null,
      },
      update: {
        interviewDate: validatedData.interviewDate,
        result: validatedData.result,
        rating: validatedData.rating ?? null,
        interviewerName: validatedData.interviewerName ?? null,
        strengths: validatedData.strengths ?? [],
        weaknesses: validatedData.weaknesses ?? [],
        notes: validatedData.notes ?? null,
        recommendation: validatedData.recommendation ?? null,
      },
    });

    revalidatePath('/[locale]/admin/applications', 'page');
    revalidatePath('/[locale]/admin/applications/interview-result/[applicationId]', 'page');

    return {
      success: true,
      interviewResultId: interviewResult.id,
    };
  } catch (error) {
    console.error('Error creating/updating interview result:', error);
    
    if (error instanceof Error) {
      return {
        success: false,
        error: error.message,
      };
    }

    return {
      success: false,
      error: 'Failed to save interview result. Please try again.',
    };
  }
}

export async function getInterviewResult(
  applicationId: string
): Promise<GetInterviewResultResult> {
  try {
    const interviewResult = await prisma.interviewResult.findUnique({
      where: { applicationId },
    });

    if (!interviewResult) {
      return {
        success: true,
        interviewResult: null,
      };
    }

    return {
      success: true,
      interviewResult: {
        id: interviewResult.id,
        applicationId: interviewResult.applicationId,
        interviewDate: interviewResult.interviewDate,
        result: interviewResult.result,
        rating: interviewResult.rating,
        interviewerName: interviewResult.interviewerName,
        strengths: interviewResult.strengths,
        weaknesses: interviewResult.weaknesses,
        notes: interviewResult.notes,
        recommendation: interviewResult.recommendation,
        createdAt: interviewResult.createdAt,
        updatedAt: interviewResult.updatedAt,
      },
    };
  } catch (error) {
    console.error('Error fetching interview result:', error);
    
    return {
      success: false,
      error: 'Failed to fetch interview result. Please try again.',
      interviewResult: null,
    };
  }
}






