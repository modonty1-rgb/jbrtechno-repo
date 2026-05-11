import { prisma } from '@jbrtechno/database';
import { UserRole } from '@jbrtechno/database';

/**
 * Check if a user has permission to access a route
 * @param route - The route to check (e.g., "/applications")
 * @param userId - The user ID to check permissions for
 * @returns true if user has access, false otherwise
 */
export async function hasRoutePermission(
  route: string,
  userId: string
): Promise<boolean> {
  try {
    // Get user to check if SUPER_ADMIN
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { role: true, isActive: true },
    });

    // User must exist and be active
    if (!user || !user.isActive) {
      return false;
    }

    // SUPER_ADMIN always has access to all routes
    if (user.role === UserRole.SUPER_ADMIN) {
      return true;
    }

    // Default routes accessible to all authenticated users
    const defaultRoutes = [
      '/',
      '/settings/profile',
      '/tasks/my-tasks',
      '/my-time',
      '/notes',
      '/organizational-structure',
    ];

    // Check exact match for default routes
    if (defaultRoutes.includes(route)) {
      return true;
    }

    // Check all ancestor routes for default access
    // e.g., /notes/[noteId] should check /notes, /applications/position/[position] should check /applications/position and /applications
    const routeParts = route.split('/').filter(Boolean);
    for (let i = routeParts.length; i > 0; i--) {
      const ancestorRoute = '/' + routeParts.slice(0, i).join('/');
      if (defaultRoutes.includes(ancestorRoute)) {
        return true;
      }
    }

    // Check user-specific route permissions (exact match first)
    let userPermission = await prisma.userRoutePermission.findUnique({
      where: {
        userId_route: {
          userId,
          route,
        },
      },
    });

    // If exact match found, return true
    if (userPermission) {
      return true;
    }

    // For nested routes, check ALL ancestor routes for user permissions
    // e.g., /applications/position/[position] should check /applications/position AND /applications
    for (let i = routeParts.length; i > 0; i--) {
      const ancestorRoute = '/' + routeParts.slice(0, i).join('/');

      userPermission = await prisma.userRoutePermission.findUnique({
        where: {
          userId_route: {
            userId,
            route: ancestorRoute,
          },
        },
      });

      if (userPermission) {
        return true;
      }
    }

    // No permission found
    return false;
  } catch (error) {
    console.error('Error checking route permission:', error);
    // On error, deny access for security
    return false;
  }
}

