'use server';

import { auth } from '@/lib/auth';
import { prisma } from '@jbrtechno/database';
import { UserRole } from '@jbrtechno/database';
import { revalidatePath } from 'next/cache';
import {
  getUserTimeEntries,
  calculateTimeSummary,
  getClockifyUsers,
  type TimeEntry,
  type TimeSummary,
} from '@/lib/clockify';

export interface GetStaffTimeEntriesResult {
  success: boolean;
  summary?: TimeSummary;
  error?: string;
}

export interface GetAllStaffTimeSummaryResult {
  success: boolean;
  summaries?: Array<{
    staffId: string;
    staffName: string;
    clockifyUserId: string | null;
    totalHours: number;
    error?: string;
  }>;
  error?: string;
}

export interface SyncClockifyUserResult {
  success: boolean;
  error?: string;
}

export interface TestClockifyIntegrationResult {
  success: boolean;
  message: string;
}

/**
 * Get time entries for a specific staff member
 */
export async function getStaffTimeEntries(
  staffId: string,
  startDate?: Date,
  endDate?: Date
): Promise<GetStaffTimeEntriesResult> {
  try {
    const session = await auth();

    if (
      !session?.user ||
      (session.user.role !== UserRole.SUPER_ADMIN && session.user.role !== UserRole.STAFF)
    ) {
      return {
        success: false,
        error: 'Unauthorized',
      };
    }

    // If STAFF role, only allow access to their own data
    if (session.user.role === UserRole.STAFF) {
      const staff = await prisma.staff.findFirst({
        where: { userId: session.user.id },
      });
      if (!staff || staff.id !== staffId) {
        return {
          success: false,
          error: 'Unauthorized - can only access your own time entries',
        };
      }
    }

    // Get staff record with Clockify user ID
    const staff = await prisma.staff.findUnique({
      where: { id: staffId },
      select: {
        id: true,
        clockifyUserId: true,
        application: {
          select: {
            applicantName: true,
          },
        },
      },
    });

    if (!staff) {
      return {
        success: false,
        error: 'Staff member not found',
      };
    }

    if (!staff.clockifyUserId) {
      return {
        success: false,
        error: 'Clockify user ID not linked for this staff member',
      };
    }

    // Default to current month if dates not provided
    const now = new Date();
    const start = startDate || new Date(now.getFullYear(), now.getMonth(), 1);
    const end = endDate || new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59);

    // Fetch time entries from Clockify
    const timeEntries = await getUserTimeEntries(staff.clockifyUserId, start, end);

    // Calculate summary
    const summary = calculateTimeSummary(timeEntries, start, end);

    return {
      success: true,
      summary,
    };
  } catch (error) {
    console.error('Error getting staff time entries:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to get time entries',
    };
  }
}

/**
 * Simple health check for Clockify integration.
 * - Verifies env vars
 * - Tries to fetch workspace users
 * - Logs detailed info on the server
 */
export async function testClockifyIntegration(): Promise<TestClockifyIntegrationResult> {
  try {
    const session = await auth();

    if (
      !session?.user ||
      session.user.role !== UserRole.SUPER_ADMIN
    ) {
      return {
        success: false,
        message: 'Unauthorized (super admin only)',
      };
    }

    const apiKeySet = !!process.env.CLOCKIFY_API_KEY;
    const workspaceId = process.env.CLOCKIFY_WORKSPACE_ID;

    if (!apiKeySet || !workspaceId) {
      return {
        success: false,
        message: 'CLOCKIFY_API_KEY or CLOCKIFY_WORKSPACE_ID is not set in .env',
      };
    }

    console.log('Clockify test: using workspace', workspaceId);

    const users = await getClockifyUsers();

    console.log('Clockify test: fetched users count =', users.length);

    return {
      success: true,
      message: `OK. Workspace ${workspaceId}, users found: ${users.length}`,
    };
  } catch (error) {
    console.error('Clockify test failed:', error);
    return {
      success: false,
      message: error instanceof Error ? error.message : 'Unknown Clockify error',
    };
  }
}

/**
 * Get time summary for all staff members
 */
export async function getAllStaffTimeSummary(
  startDate?: Date,
  endDate?: Date
): Promise<GetAllStaffTimeSummaryResult> {
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

    // Check if Clockify is configured
    const apiKey = process.env.CLOCKIFY_API_KEY;
    const workspaceId = process.env.CLOCKIFY_WORKSPACE_ID;
    
    if (!apiKey || !workspaceId) {
      // Clockify not configured - return empty result instead of error
      return {
        success: true,
        summaries: [],
      };
    }

    // Test API key validity by making a simple request
    // If authentication fails, skip all Clockify calls to avoid repeated errors
    try {
      const { getClockifyUsers } = await import('@/lib/clockify');
      await getClockifyUsers();
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : '';
      // If authentication fails, return empty result silently (don't log or throw)
      if (errorMessage.includes('authentication failed') || 
          errorMessage.includes('API key') ||
          errorMessage.includes('401')) {
        // Clockify API key is invalid - skip all calls
        return {
          success: true,
          summaries: [],
        };
      }
      // For other errors (network, rate limit, etc.), still try to fetch individual staff
      // These might be temporary issues
    }

    // Default to current month if dates not provided
    const now = new Date();
    const start = startDate || new Date(now.getFullYear(), now.getMonth(), 1);
    const end = endDate || new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59);

    // Get all staff with Clockify user IDs
    const allStaff = await prisma.staff.findMany({
      where: {
        clockifyUserId: { not: null },
        status: 'ACTIVE',
      },
      select: {
        id: true,
        clockifyUserId: true,
        application: {
          select: {
            applicantName: true,
          },
        },
      },
    });

    // Fetch time entries for each staff member
    // Use Promise.allSettled to ensure all promises complete even if some fail
    const summaryPromises = allStaff.map(async (staff) => {
      try {
        if (!staff.clockifyUserId) {
        return {
          staffId: staff.id,
          staffName: staff.application?.applicantName || 'Unknown',
          clockifyUserId: null,
          totalHours: 0,
          error: 'Clockify user ID not set',
        };
      }

      const timeEntries = await getUserTimeEntries(staff.clockifyUserId, start, end);
      const totalHours = timeEntries.reduce((sum, entry) => sum + entry.duration, 0) / (1000 * 60 * 60);

      return {
        staffId: staff.id,
        staffName: staff.application?.applicantName || 'Unknown',
        clockifyUserId: staff.clockifyUserId,
        totalHours,
      };
    } catch (error) {
      // Silently handle authentication errors - don't log as errors if API key is invalid
      const errorMessage = error instanceof Error ? error.message : 'Failed to fetch';
      const isAuthError = errorMessage.includes('authentication failed') || errorMessage.includes('API key');
      
      if (!isAuthError) {
        console.error(`Error fetching time entries for staff ${staff.id}:`, error);
      }
      
      return {
        staffId: staff.id,
        staffName: staff.application?.applicantName || 'Unknown',
        clockifyUserId: staff.clockifyUserId,
        totalHours: 0,
        error: errorMessage,
      };
      }
    });

    const summaryResults = await Promise.allSettled(summaryPromises);
    const summaries = summaryResults.map((result) => 
      result.status === 'fulfilled' 
        ? result.value 
        : {
            staffId: 'unknown',
            staffName: 'Unknown',
            clockifyUserId: null,
            totalHours: 0,
            error: result.reason instanceof Error ? result.reason.message : 'Failed to fetch',
          }
    );

    return {
      success: true,
      summaries,
    };
  } catch (error) {
    console.error('Error getting all staff time summary:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to get time summaries',
    };
  }
}

/**
 * Link Clockify user ID to staff member
 */
export async function syncClockifyUser(
  staffId: string,
  clockifyUserId: string
): Promise<SyncClockifyUserResult> {
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

    // Validate staff exists
    const staff = await prisma.staff.findUnique({
      where: { id: staffId },
    });

    if (!staff) {
      return {
        success: false,
        error: 'Staff member not found',
      };
    }

    // Update staff with Clockify user ID
    await prisma.staff.update({
      where: { id: staffId },
      data: {
        clockifyUserId: clockifyUserId.trim() || null,
      },
    });

    revalidatePath('/[locale]/admin/staff', 'page');
    revalidatePath(`/[locale]/admin/staff/${staffId}`, 'page');
    revalidatePath('/[locale]/admin', 'page');

    return {
      success: true,
    };
  } catch (error) {
    console.error('Error syncing Clockify user:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to sync Clockify user',
    };
  }
}




