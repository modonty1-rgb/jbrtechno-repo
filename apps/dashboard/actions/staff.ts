'use server';

import { auth } from '@/lib/auth';
import { prisma } from '@jbrtechno/database';
import { UserRole, StaffStatus, Application } from '@jbrtechno/database';
import { revalidatePath } from 'next/cache';
import {
  calculateTrialEndDate,
  validateTrialPeriod,
} from '@/helpers/trialPeriodCalculator';

export interface ApplicationData {
  id: string;
  applicantName: string;
  email: string;
  phone: string;
  position: string;
  yearsOfExperience: number;
  skills: string[];
  profileImageUrl: string;
  cvUrl: string;
}

export interface EmergencyContact {
  name: string;
  phone: string;
  relationship?: string;
}

export interface Staff {
  id: string;
  // Direct-registration identity fields (staff created from /staff/new)
  fullName: string | null;
  phone: string | null;
  personalEmail: string | null;
  nationalId: string | null;
  nationality: string | null;
  birthDate: Date | null;
  country: string | null;
  city: string | null;
  address: string | null;
  jobDuties: string | null;
  bankName: string | null;
  iban: string | null;
  instapay: string | null;
  vodafoneCash: string | null;
  photoUrl: string | null;
  idCardUrl: string | null;
  cvUrl: string | null;
  offerAcceptedDate: Date | null;
  terminationDate: Date | null;
  terminationReason: string | null;
  // HR fields
  employeeId: string | null;
  department: string | null;
  hireDate: Date;
  salary: number | null;
  status: StaffStatus;
  notes: string | null;
  // New HR fields
  username: string | null;
  officialEmail: string | null;
  trialStartDate: Date | null;
  trialEndDate: Date | null;
  trialMonths: number | null;
  trialSalary: number | null;
  salaryMode: 'AGREED' | 'EVALUATION' | null;
  ndaSignedDate: Date | null;
  contractSignedDate: Date | null;
  currency: string;
  emergencyContact1: EmergencyContact | null;
  emergencyContact2: EmergencyContact | null;
  // Clockify Integration
  clockifyUserId: string | null;
  // Relations
  applicationId: string | null;
  application: ApplicationData | null;
  userId: string | null;
  user: { email: string; password?: string } | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface GetAllStaffResult {
  success: boolean;
  staff?: Staff[];
  error?: string;
}

export async function getAllStaff(): Promise<GetAllStaffResult> {
  try {
    const session = await auth();

    if (
      !session?.user ||
      session.user.role !== UserRole.SUPER_ADMIN
    ) {
      return {
        success: false,
        error: 'Unauthorized',
      };
    }

    const staffRecords = await prisma.staff.findMany({
      include: {
        application: true,
        user: true,
      },
      orderBy: [
        { createdAt: 'desc' },
      ],
    });

    // Transform to Staff interface
    const staff: Staff[] = staffRecords.map((s) => ({
      id: s.id,
      fullName: s.fullName,
      phone: s.phone,
      personalEmail: s.personalEmail,
      nationalId: s.nationalId,
      nationality: s.nationality,
      birthDate: s.birthDate,
      country: s.country,
      city: s.city,
      address: s.address,
      jobDuties: s.jobDuties,
      bankName: s.bankName,
      iban: s.iban,
      instapay: s.instapay,
      vodafoneCash: s.vodafoneCash,
      photoUrl: s.photoUrl,
      idCardUrl: s.idCardUrl,
      cvUrl: s.cvUrl,
      offerAcceptedDate: s.offerAcceptedDate,
      terminationDate: s.terminationDate,
      terminationReason: s.terminationReason,
      employeeId: s.employeeId,
      department: s.department,
      hireDate: s.hireDate,
      salary: s.salary,
      status: s.status,
      notes: s.notes,
      username: s.username,
      officialEmail: s.officialEmail,
      trialStartDate: s.trialStartDate,
      trialEndDate: s.trialEndDate,
      trialMonths: s.trialMonths,
      trialSalary: s.trialSalary,
      salaryMode: s.salaryMode,
      ndaSignedDate: s.ndaSignedDate,
      contractSignedDate: s.contractSignedDate,
      currency: s.currency || 'SAR',
      emergencyContact1: s.emergencyContact1 as EmergencyContact | null,
      emergencyContact2: s.emergencyContact2 as EmergencyContact | null,
      clockifyUserId: s.clockifyUserId,
      applicationId: s.applicationId,
      application: s.application
        ? {
          id: s.application.id,
          applicantName: s.application.applicantName,
          email: s.application.email,
          phone: s.application.phone,
          position: s.application.position,
          yearsOfExperience: s.application.yearsOfExperience,
          skills: s.application.skills,
          profileImageUrl: s.application.profileImageUrl,
          cvUrl: s.application.cvUrl,
        }
        : null,
      userId: s.userId,
      user: s.user
        ? { email: s.user.email }
        : null,
      createdAt: s.createdAt,
      updatedAt: s.updatedAt,
    }));

    return {
      success: true,
      staff,
    };
  } catch (error) {
    console.error('getAllStaff error:', error);
    return {
      success: false,
      error: 'Failed to fetch staff',
      staff: [],
    };
  }
}

export interface GetStaffByIdResult {
  success: boolean;
  staff?: Staff;
  error?: string;
}

export async function getStaffById(id: string): Promise<GetStaffByIdResult> {
  try {
    const session = await auth();

    if (
      !session?.user ||
      session.user.role !== UserRole.SUPER_ADMIN
    ) {
      return {
        success: false,
        error: 'Unauthorized',
      };
    }

    const staffRecord = await prisma.staff.findUnique({
      where: { id },
      include: {
        application: true,
        user: true,
      },
    });

    if (!staffRecord) {
      return {
        success: false,
        error: 'Staff not found',
      };
    }

    // Transform to Staff interface
    const staff: Staff = {
      id: staffRecord.id,
      fullName: staffRecord.fullName,
      phone: staffRecord.phone,
      personalEmail: staffRecord.personalEmail,
      nationalId: staffRecord.nationalId,
      nationality: staffRecord.nationality,
      birthDate: staffRecord.birthDate,
      country: staffRecord.country,
      city: staffRecord.city,
      address: staffRecord.address,
      jobDuties: staffRecord.jobDuties,
      bankName: staffRecord.bankName,
      iban: staffRecord.iban,
      instapay: staffRecord.instapay,
      vodafoneCash: staffRecord.vodafoneCash,
      photoUrl: staffRecord.photoUrl,
      idCardUrl: staffRecord.idCardUrl,
      cvUrl: staffRecord.cvUrl,
      offerAcceptedDate: staffRecord.offerAcceptedDate,
      terminationDate: staffRecord.terminationDate,
      terminationReason: staffRecord.terminationReason,
      employeeId: staffRecord.employeeId,
      department: staffRecord.department,
      hireDate: staffRecord.hireDate,
      salary: staffRecord.salary,
      status: staffRecord.status,
      notes: staffRecord.notes,
      username: staffRecord.username,
      officialEmail: staffRecord.officialEmail,
      trialStartDate: staffRecord.trialStartDate,
      trialEndDate: staffRecord.trialEndDate,
      trialMonths: staffRecord.trialMonths,
      trialSalary: staffRecord.trialSalary,
      salaryMode: staffRecord.salaryMode,
      ndaSignedDate: staffRecord.ndaSignedDate,
      contractSignedDate: staffRecord.contractSignedDate,
      currency: staffRecord.currency || 'SAR',
      emergencyContact1: staffRecord.emergencyContact1 as EmergencyContact | null,
      emergencyContact2: staffRecord.emergencyContact2 as EmergencyContact | null,
      clockifyUserId: staffRecord.clockifyUserId,
      applicationId: staffRecord.applicationId,
      application: staffRecord.application
        ? {
          id: staffRecord.application.id,
          applicantName: staffRecord.application.applicantName,
          email: staffRecord.application.email,
          phone: staffRecord.application.phone,
          position: staffRecord.application.position,
          yearsOfExperience: staffRecord.application.yearsOfExperience,
          skills: staffRecord.application.skills,
          profileImageUrl: staffRecord.application.profileImageUrl,
          cvUrl: staffRecord.application.cvUrl,
        }
        : null,
      userId: staffRecord.userId,
      user: staffRecord.user
        ? { email: staffRecord.user.email, password: staffRecord.user.password }
        : null,
      createdAt: staffRecord.createdAt,
      updatedAt: staffRecord.updatedAt,
    };

    return {
      success: true,
      staff,
    };
  } catch (error) {
    console.error('getStaffById error:', error);
    return {
      success: false,
      error: 'Failed to fetch staff',
    };
  }
}

export interface UpdateStaffResult {
  success: boolean;
  error?: string;
}

export async function updateStaff(
  id: string,
  data: {
    employeeId?: string;
    department?: string;
    salary?: number;
    hireDate?: Date | string;
    status?: StaffStatus;
    notes?: string;
    username?: string;
    officialEmail?: string;
    trialStartDate?: Date | string | null;
    trialEndDate?: Date | string | null;
    trialMonths?: number | null;
    trialSalary?: number | null;
    ndaSignedDate?: Date | string | null;
    contractSignedDate?: Date | string | null;
    currency?: string;
    emergencyContact1?: EmergencyContact | null;
    emergencyContact2?: EmergencyContact | null;
  }
): Promise<UpdateStaffResult> {
  try {
    const session = await auth();

    if (
      !session?.user ||
      session.user.role !== UserRole.SUPER_ADMIN
    ) {
      return {
        success: false,
        error: 'Unauthorized',
      };
    }

    // Check if staff exists
    const existing = await prisma.staff.findUnique({
      where: { id },
    });

    if (!existing) {
      return {
        success: false,
        error: 'Staff not found',
      };
    }

    // Validate employeeId uniqueness if provided
    if (data.employeeId !== undefined && data.employeeId.trim()) {
      const existingEmployeeId = await prisma.staff.findFirst({
        where: {
          employeeId: data.employeeId.trim(),
          id: { not: id },
        },
      });

      if (existingEmployeeId) {
        return {
          success: false,
          error: 'Employee ID already exists',
        };
      }
    }

    // Validate salary if provided
    if (data.salary !== undefined && data.salary !== null) {
      if (data.salary < 0) {
        return {
          success: false,
          error: 'Salary must be a positive number',
        };
      }
    }

    // Parse hire date if provided
    const hireDate = data.hireDate
      ? typeof data.hireDate === 'string'
        ? new Date(data.hireDate)
        : data.hireDate
      : undefined;

    // Validate hire date is not in future
    if (hireDate && hireDate > new Date()) {
      return {
        success: false,
        error: 'Hire date cannot be in the future',
      };
    }

    // Validate username if provided
    if (data.username !== undefined && data.username !== null) {
      const trimmedUsername = data.username.trim();
      if (trimmedUsername) {
        // Username validation: alphanumeric + underscore + hyphen, 3-30 chars
        if (!/^[a-zA-Z0-9_-]{3,30}$/.test(trimmedUsername)) {
          return {
            success: false,
            error:
              'Username must be 3-30 characters and contain only letters, numbers, underscores, and hyphens',
          };
        }

        // Check uniqueness (case-insensitive)
        const existingUsername = await prisma.staff.findFirst({
          where: {
            username: { equals: trimmedUsername, mode: 'insensitive' },
            id: { not: id },
          },
        });

        if (existingUsername) {
          return {
            success: false,
            error: 'Username already exists',
          };
        }
      }
    }

    // Validate official email if provided
    if (data.officialEmail !== undefined && data.officialEmail !== null) {
      const trimmedEmail = data.officialEmail.trim();
      if (trimmedEmail) {
        // Email format validation
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(trimmedEmail)) {
          return {
            success: false,
            error: 'Invalid email format',
          };
        }

        // Check uniqueness
        const existingEmail = await prisma.staff.findFirst({
          where: {
            officialEmail: trimmedEmail,
            id: { not: id },
          },
        });

        if (existingEmail) {
          return {
            success: false,
            error: 'Official email already exists',
          };
        }
      }
    }

    // Validate trial period
    const trialStart =
      data.trialStartDate !== undefined && data.trialStartDate !== null
        ? typeof data.trialStartDate === 'string'
          ? new Date(data.trialStartDate)
          : data.trialStartDate
        : null;
    const trialEnd =
      data.trialEndDate !== undefined && data.trialEndDate !== null
        ? typeof data.trialEndDate === 'string'
          ? new Date(data.trialEndDate)
          : data.trialEndDate
        : null;

    const trialValidation = validateTrialPeriod(
      trialStart,
      trialEnd,
      data.trialMonths
    );
    if (!trialValidation.valid) {
      return {
        success: false,
        error: trialValidation.error || 'Invalid trial period',
      };
    }

    // Auto-calculate trial end date if start date and months are provided
    let finalTrialEnd = trialEnd;
    if (trialStart && data.trialMonths && !trialEnd) {
      finalTrialEnd = calculateTrialEndDate(trialStart, data.trialMonths);
    }

    // Validate trial months
    if (data.trialMonths !== undefined && data.trialMonths !== null) {
      if (data.trialMonths < 1 || data.trialMonths > 24) {
        return {
          success: false,
          error: 'Trial months must be between 1 and 24',
        };
      }
    }

    // Validate NDA and contract dates (cannot be in future)
    const ndaDate =
      data.ndaSignedDate !== undefined && data.ndaSignedDate !== null
        ? typeof data.ndaSignedDate === 'string'
          ? new Date(data.ndaSignedDate)
          : data.ndaSignedDate
        : null;
    const contractDate =
      data.contractSignedDate !== undefined &&
        data.contractSignedDate !== null
        ? typeof data.contractSignedDate === 'string'
          ? new Date(data.contractSignedDate)
          : data.contractSignedDate
        : null;

    if (ndaDate && ndaDate > new Date()) {
      return {
        success: false,
        error: 'NDA signed date cannot be in the future',
      };
    }

    if (contractDate && contractDate > new Date()) {
      return {
        success: false,
        error: 'Contract signed date cannot be in the future',
      };
    }

    // Validate emergency contacts
    if (data.emergencyContact1 !== undefined) {
      if (data.emergencyContact1 !== null) {
        if (
          !data.emergencyContact1.name ||
          data.emergencyContact1.name.trim().length < 2
        ) {
          return {
            success: false,
            error: 'Emergency contact 1 name is required (minimum 2 characters)',
          };
        }
        if (
          !data.emergencyContact1.phone ||
          data.emergencyContact1.phone.trim().length < 8
        ) {
          return {
            success: false,
            error: 'Emergency contact 1 phone is required (minimum 8 characters)',
          };
        }
      }
    }

    if (data.emergencyContact2 !== undefined) {
      if (data.emergencyContact2 !== null) {
        if (
          !data.emergencyContact2.name ||
          data.emergencyContact2.name.trim().length < 2
        ) {
          return {
            success: false,
            error: 'Emergency contact 2 name is required (minimum 2 characters)',
          };
        }
        if (
          !data.emergencyContact2.phone ||
          data.emergencyContact2.phone.trim().length < 8
        ) {
          return {
            success: false,
            error: 'Emergency contact 2 phone is required (minimum 8 characters)',
          };
        }
      }
    }

    // Build update data
    const updateData: {
      employeeId?: string | null;
      department?: string | null;
      salary?: number | null;
      hireDate?: Date;
      status?: StaffStatus;
      notes?: string | null;
      username?: string | null;
      officialEmail?: string | null;
      trialStartDate?: Date | null;
      trialEndDate?: Date | null;
      trialMonths?: number | null;
      ndaSignedDate?: Date | null;
      contractSignedDate?: Date | null;
      currency?: string;
      emergencyContact1?: any;
      emergencyContact2?: any;
    } = {};

    if (data.employeeId !== undefined) {
      updateData.employeeId = data.employeeId.trim() || null;
    }
    if (data.department !== undefined) {
      updateData.department = data.department.trim() || null;
    }
    if (data.salary !== undefined) {
      updateData.salary = data.salary || null;
    }
    if (hireDate) {
      updateData.hireDate = hireDate;
    }
    if (data.status !== undefined) {
      updateData.status = data.status;
    }
    if (data.notes !== undefined) {
      updateData.notes = data.notes.trim() || null;
    }
    if (data.username !== undefined) {
      updateData.username = data.username?.trim() || null;
    }
    if (data.officialEmail !== undefined) {
      updateData.officialEmail = data.officialEmail?.trim() || null;
    }
    if (trialStart !== null && trialStart !== undefined) {
      updateData.trialStartDate = trialStart;
    } else if (data.trialStartDate === null) {
      updateData.trialStartDate = null;
    }
    if (finalTrialEnd !== null && finalTrialEnd !== undefined) {
      updateData.trialEndDate = finalTrialEnd;
    } else if (data.trialEndDate === null) {
      updateData.trialEndDate = null;
    }
    if (data.trialMonths !== undefined) {
      updateData.trialMonths = data.trialMonths;
    }
    if (data.trialSalary !== undefined) {
      (updateData as any).trialSalary = data.trialSalary;
    }
    if (ndaDate !== null && ndaDate !== undefined) {
      updateData.ndaSignedDate = ndaDate;
    } else if (data.ndaSignedDate === null) {
      updateData.ndaSignedDate = null;
    }
    if (contractDate !== null && contractDate !== undefined) {
      updateData.contractSignedDate = contractDate;
    } else if (data.contractSignedDate === null) {
      updateData.contractSignedDate = null;
    }
    if (data.currency !== undefined) {
      updateData.currency = data.currency;
    }
    if (data.emergencyContact1 !== undefined) {
      updateData.emergencyContact1 = data.emergencyContact1;
    }
    if (data.emergencyContact2 !== undefined) {
      updateData.emergencyContact2 = data.emergencyContact2;
    }

    await prisma.staff.update({
      where: { id },
      data: updateData,
    });

    revalidatePath('/[locale]/admin/staff', 'page');
    revalidatePath('/[locale]/admin/staff/[id]', 'page');

    return {
      success: true,
    };
  } catch (error: unknown) {
    console.error('updateStaff error:', error);
    const errorMessage =
      error instanceof Error ? error.message : 'Failed to update staff';
    return {
      success: false,
      error: errorMessage,
    };
  }
}

export interface UpdateStaffPasswordResult {
  success: boolean;
  password?: string;
  error?: string;
}

export async function updateStaffPassword(
  id: string,
  newPassword?: string
): Promise<UpdateStaffPasswordResult> {
  try {
    const session = await auth();

    if (
      !session?.user ||
      session.user.role !== UserRole.SUPER_ADMIN
    ) {
      return {
        success: false,
        error: 'Unauthorized',
      };
    }

    // Check if staff exists and has userId
    const staff = await prisma.staff.findUnique({
      where: { id },
      include: {
        user: true,
      },
    });

    if (!staff) {
      return {
        success: false,
        error: 'Staff not found',
      };
    }

    if (!staff.userId || !staff.user) {
      return {
        success: false,
        error: 'Staff does not have an associated user account',
      };
    }

    // Generate secure password if not provided
    let password: string;
    if (newPassword) {
      // Validate password strength
      if (newPassword.length < 6) {
        return {
          success: false,
          error: 'Password must be at least 6 characters long',
        };
      }

      password = newPassword;
    } else {
      // Generate secure password
      const { generateSecurePassword } = await import(
        '@/helpers/generatePassword'
      );
      password = generateSecurePassword(12);
    }

    // Update user password
    await prisma.user.update({
      where: { id: staff.userId },
      data: { password },
    });

    revalidatePath('/[locale]/admin/staff/[id]', 'page');

    return {
      success: true,
      password,
    };
  } catch (error: unknown) {
    console.error('updateStaffPassword error:', error);
    const errorMessage =
      error instanceof Error
        ? error.message
        : 'Failed to update staff password';
    return {
      success: false,
      error: errorMessage,
    };
  }
}

export interface DeleteStaffResult {
  success: boolean;
  error?: string;
}

export async function deleteStaff(id: string): Promise<DeleteStaffResult> {
  try {
    const session = await auth();

    if (
      !session?.user ||
      session.user.role !== UserRole.SUPER_ADMIN
    ) {
      return {
        success: false,
        error: 'Unauthorized',
      };
    }

    // Check if staff exists
    const existing = await prisma.staff.findUnique({
      where: { id },
    });

    if (!existing) {
      return {
        success: false,
        error: 'Staff not found',
      };
    }

    // Delete staff (cascade will handle related records if configured)
    await prisma.staff.delete({
      where: { id },
    });

    revalidatePath('/[locale]/admin/staff', 'page');

    return {
      success: true,
    };
  } catch (error: unknown) {
    console.error('deleteStaff error:', error);
    const errorMessage =
      error instanceof Error ? error.message : 'Failed to delete staff';
    return {
      success: false,
      error: errorMessage,
    };
  }
}









