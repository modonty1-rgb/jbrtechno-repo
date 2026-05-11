'use server';

import { prisma } from '@jbrtechno/database';
import { getDepartmentFromPosition } from '@/helpers/getDepartmentFromPosition';

export interface CandidateSearchResult {
  id: string;
  applicantName: string;
  email: string;
  phone: string;
  position: string;
  department: string;
  yearsOfExperience: number;
  skills: string[];
  profileImageUrl: string;
  scheduledInterviewDate: Date | null;
  createdAt: Date;
}

export async function searchCandidateByPhone(
  phone: string
): Promise<{ success: boolean; candidate: CandidateSearchResult | null; error?: string }> {
  try {
    // Find application with matching phone, status=ACCEPTED, has scheduled interview
    const application = await prisma.application.findFirst({
      where: {
        phone: phone.trim(),
        status: 'ACCEPTED',
        scheduledInterviewDate: { not: null },
      },
      select: {
        id: true,
        applicantName: true,
        email: true,
        phone: true,
        position: true,
        yearsOfExperience: true,
        skills: true,
        profileImageUrl: true,
        scheduledInterviewDate: true,
        createdAt: true,
      },
    });

    if (!application) {
      return {
        success: false,
        candidate: null,
        error: 'Candidate not found or not eligible for final hire',
      };
    }

    // Check if interview result is PASSED
    const interviewResult = await prisma.interviewResult.findUnique({
      where: {
        applicationId: application.id,
      },
      select: {
        result: true,
      },
    });

    if (!interviewResult || interviewResult.result !== 'PASSED') {
      return {
        success: false,
        candidate: null,
        error: 'Candidate has not passed the interview',
      };
    }

    // Check if already hired (staff exists via application relation)
    const existingStaff = await prisma.staff.findFirst({
      where: {
        application: {
          OR: [{ email: application.email }, { phone: application.phone }],
        },
      },
    });

    if (existingStaff) {
      return {
        success: false,
        candidate: null,
        error: 'Candidate has already been hired',
      };
    }

    // Get department from position
    const department = getDepartmentFromPosition(application.position);

    return {
      success: true,
      candidate: {
        id: application.id,
        applicantName: application.applicantName,
        email: application.email,
        phone: application.phone,
        position: application.position,
        department: department,
        yearsOfExperience: application.yearsOfExperience,
        skills: application.skills,
        profileImageUrl: application.profileImageUrl,
        scheduledInterviewDate: application.scheduledInterviewDate,
        createdAt: application.createdAt,
      },
    };
  } catch (error) {
    console.error('Error searching candidate by phone:', error);
    return {
      success: false,
      candidate: null,
      error: 'Failed to search candidate',
    };
  }
}









