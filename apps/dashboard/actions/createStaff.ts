'use server';

import { revalidatePath } from 'next/cache';
import { prisma } from '@jbrtechno/database';
import { auth } from '@/lib/auth';
import { UserRole } from '@jbrtechno/database';
import { generateSecurePassword } from '@/helpers/generatePassword';

export interface CreateStaffResult {
  success: boolean;
  error?: string;
  staffId?: string;
  userId?: string;
  email?: string;
  password?: string;
}

export async function createStaff(data: {
  phone: string;
  employeeId?: string;
  department?: string;
  salary?: number;
  hireDate?: Date | string;
  notes?: string;
  temporaryPassword?: string;
}): Promise<CreateStaffResult> {
  try {
    const session = await auth();
    if (!session?.user) {
      return { success: false, error: 'Unauthorized' };
    }

    // Find application by phone
    const application = await prisma.application.findFirst({
      where: {
        phone: data.phone.trim(),
        status: 'ACCEPTED',
        scheduledInterviewDate: { not: null },
      },
    });

    if (!application) {
      return {
        success: false,
        error: 'Application not found or not eligible for final hire',
      };
    }

    // Verify interview result is PASSED
    const interviewResult = await prisma.interviewResult.findUnique({
      where: {
        applicationId: application.id,
      },
    });

    if (!interviewResult || interviewResult.result !== 'PASSED') {
      return {
        success: false,
        error: 'Candidate has not passed the interview',
      };
    }

    // Check if staff already exists for this application
    const existingStaff = await prisma.staff.findFirst({
      where: {
        applicationId: application.id,
      },
    });

    if (existingStaff) {
      return {
        success: false,
        error: 'Staff member already exists for this application',
      };
    }

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email: application.email },
    });

    if (existingUser) {
      return {
        success: false,
        error: 'User account already exists with this email',
      };
    }

    // Check employeeId uniqueness if provided
    if (data.employeeId) {
      const existingEmployeeId = await prisma.staff.findFirst({
        where: { employeeId: data.employeeId.trim() },
      });

      if (existingEmployeeId) {
        return {
          success: false,
          error: 'Employee ID already exists',
        };
      }
    }

    // Generate password if not provided
    const password = data.temporaryPassword?.trim() || generateSecurePassword(10);

    // Validate password length
    if (password.length < 8) {
      return {
        success: false,
        error: 'Password must be at least 8 characters long',
      };
    }

    // Parse hire date
    const hireDate = data.hireDate
      ? typeof data.hireDate === 'string'
        ? new Date(data.hireDate)
        : data.hireDate
      : new Date();

    // Use transaction to create both Staff and User records atomically
    const result = await prisma.$transaction(async (tx) => {
      // Create User record
      const user = await tx.user.create({
        data: {
          email: application.email,
          password: password,
          role: UserRole.STAFF,
          name: application.applicantName,
          isActive: true,
        },
      });

      // Create Staff record (only HR-specific fields, use Application relation for personal data)
      const staff = await tx.staff.create({
        data: {
          // HR-specific fields
          employeeId: data.employeeId?.trim() || null,
          department: data.department?.trim() || null,
          hireDate: hireDate,
          salary: data.salary || null,
          status: 'ACTIVE',
          notes: data.notes?.trim() || null,
          // Relations
          applicationId: application.id,
          userId: user.id,
        },
      });

      return { user, staff };
    });

    // Revalidate applications page
    revalidatePath('/[locale]/admin/applications', 'page');

    return {
      success: true,
      staffId: result.staff.id,
      userId: result.user.id,
      email: result.user.email,
      password: password,
    };
  } catch (error: unknown) {
    console.error('Error creating staff:', error);
    const errorMessage =
      error instanceof Error ? error.message : 'Failed to create staff record';
    return {
      success: false,
      error: errorMessage,
    };
  }
}









