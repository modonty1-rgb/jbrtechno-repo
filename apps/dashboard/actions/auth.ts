'use server';

import { auth } from '@/lib/auth';
import { prisma } from '@jbrtechno/database';
import { UserRole } from '@jbrtechno/database';
import { ADMIN_ROUTES } from '@/lib/auth/adminRoutes';

/**
 * Get all routes that the current user has access to
 */
export async function getAccessibleRoutes(): Promise<string[]> {
  try {
    const session = await auth();

    if (!session?.user) {
      return [];
    }

    const userId = session.user.id;
    const userRole = session.user.role as UserRole;

    // SUPER_ADMIN has access to all configured admin routes
    if (userRole === UserRole.SUPER_ADMIN) {
      return ADMIN_ROUTES.map((route) => route.route);
    }

    // Query user's specific route permissions directly (optimized)
    const userPermissions = await prisma.userRoutePermission.findMany({
      where: { userId },
      select: { route: true },
    });

    // Return list of routes user has access to
    return userPermissions.map((perm) => perm.route);
  } catch (error) {
    console.error('Error getting accessible routes:', error);
    // Return empty array on error to prevent crashes
    return [];
  }
}


