import { auth } from '@/lib/auth';
import { redirect, notFound } from 'next/navigation';
import { UserRole } from '@jbrtechno/database';
import { prisma } from '@jbrtechno/database';
import { getUserRoutePermissions } from '@/actions/userPermissions';
import { ASSIGNABLE_ROUTES, DEFAULT_ROUTES } from '@/lib/auth/adminRoutes';
import { UserPermissionsPageClient } from './UserPermissionsPageClient';

export default async function UserPermissionsPage({
  params,
}: {
  params: Promise<{ userId: string }>;
}) {
  const session = await auth();
  const { userId } = await params;

  // Only SUPER_ADMIN can access this page
  if (!session?.user || session.user.role !== UserRole.SUPER_ADMIN) {
    redirect('/');
  }

  // Fetch user data
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      email: true,
      name: true,
      role: true,
    },
  });

  // User not found
  if (!user) {
    notFound();
  }

  // SUPER_ADMIN cannot have permissions modified
  if (user.role === UserRole.SUPER_ADMIN) {
    redirect('/users');
  }

  // Fetch user's current route permissions
  let userRoutes: string[] = [];
  try {
    userRoutes = await getUserRoutePermissions(userId);
  } catch (error) {
    console.error('Error fetching user permissions:', error);
  }

  // Filter out default routes from initial routes (they're not assignable)
  const filteredInitialRoutes = userRoutes.filter(
    (route) => !DEFAULT_ROUTES.includes(route)
  );

  return (
    <UserPermissionsPageClient
      user={user}
      initialRoutes={filteredInitialRoutes}
      allRoutes={ASSIGNABLE_ROUTES}
      locale="ar"
    />
  );
}


