import { auth } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { UserRole } from '@jbrtechno/database';
import { prisma } from '@jbrtechno/database';
import { getAccessibleRoutes } from '@/actions/auth';
import { NoPermissionsClient } from './NoPermissionsClient';

export default async function NoPermissionsPage() {
  const session = await auth();

  // If not authenticated, redirect to login
  if (!session?.user) {
    redirect('/login');
  }

  // SUPER_ADMIN should never see this page
  if (session.user.role === UserRole.SUPER_ADMIN) {
    redirect('/');
  }

  // Get user's accessible routes
  const accessibleRoutes = await getAccessibleRoutes();

  // If user has routes, redirect them to the first accessible route
  if (accessibleRoutes.length > 0) {
    const firstRoute = accessibleRoutes[0];
    redirect(firstRoute);
  }

  // Get user info
  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: {
      email: true,
      name: true,
      role: true,
    },
  });

  return (
    <NoPermissionsClient
      user={user}
      accessibleRoutes={accessibleRoutes}
      locale="ar"
    />
  );
}



















