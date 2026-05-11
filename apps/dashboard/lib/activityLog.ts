'use server';

import { prisma } from '@jbrtechno/database';
import type { ActivityType, ActivityLog, Prisma } from '@jbrtechno/database';

export interface ActivityLogEntry {
  userId: string;
  type: ActivityType;
  description: string;
  metadata?: Record<string, unknown>;
}

export async function logActivity(entry: ActivityLogEntry): Promise<void> {
  try {
    await prisma.activityLog.create({
      data: {
        userId: entry.userId,
        type: entry.type,
        description: entry.description,
        metadata: (entry.metadata ?? undefined) as Prisma.InputJsonValue | undefined,
      },
    });
  } catch (error) {
    // Don't throw — activity logging must not break the main flow
    console.error('Error logging activity:', error);
  }
}

export async function getUserActivityLogs(
  userId: string,
  limit: number = 50
): Promise<ActivityLog[]> {
  try {
    return await prisma.activityLog.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      take: limit,
    });
  } catch (error) {
    console.error('Error fetching activity logs:', error);
    return [];
  }
}
