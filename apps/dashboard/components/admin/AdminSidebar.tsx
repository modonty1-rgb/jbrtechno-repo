import { prisma } from '@jbrtechno/database';
import { getApplicationCountsByPosition, type ApplicationCounts } from '@/lib/applications';
import { getAccessibleRoutes } from '@/actions/auth';
import { AdminSidebarClient } from './AdminSidebarClient';
import { auth } from '@/lib/auth';
import { getUserAvatarUrl } from '@/helpers/getUserAvatarUrl';

interface AdminSidebarProps {
  locale: string;
}

export async function AdminSidebar({ locale }: AdminSidebarProps) {
  let applicationCounts: ApplicationCounts[] = [];
  let contactMessageCount = 0;
  let accessibleRoutes: string[] = [];
  let userAvatarUrl: string | null = null;

  try {
    applicationCounts = await getApplicationCountsByPosition();
    contactMessageCount = await prisma.contactMessage.count();
    accessibleRoutes = await getAccessibleRoutes();

    // Fetch user avatar data
    const session = await auth();
    if (session?.user?.id) {
      const user = await prisma.user.findUnique({
        where: { id: session.user.id },
        select: {
          avatarUrl: true,
          staff: {
            select: {
              application: {
                select: {
                  profileImageUrl: true,
                },
              },
            },
          },
        },
      });

      if (user) {
        userAvatarUrl = getUserAvatarUrl({
          userAvatarUrl: user.avatarUrl,
          applicationProfileImageUrl: user.staff?.application?.profileImageUrl || null,
        });
      }
    }
  } catch (error) {
    console.error('Error loading admin sidebar data:', error);
  }

  const totalApplications = applicationCounts.reduce((sum, c) => sum + c.total, 0);

  return (
    <AdminSidebarClient
      locale={locale}
      totalCount={totalApplications}
      contactMessageCount={contactMessageCount}
      accessibleRoutes={accessibleRoutes}
      userAvatarUrl={userAvatarUrl}
    />
  );
}
















