import { getApplicationCountsByPosition, type ApplicationCounts } from '@/lib/applications';
import { getAccessibleRoutes } from '@/actions/auth';
import { AdminSidebarClient } from './AdminSidebarClient';

interface AdminSidebarProps {
  locale: string;
  userAvatarUrl?: string | null;
}

export async function AdminSidebar({ locale, userAvatarUrl }: AdminSidebarProps) {
  let applicationCounts: ApplicationCounts[] = [];
  let accessibleRoutes: string[] = [];

  try {
    applicationCounts = await getApplicationCountsByPosition();
    accessibleRoutes = await getAccessibleRoutes();
  } catch (error) {
    console.error('Error loading admin sidebar data:', error);
  }

  const totalApplications = applicationCounts.reduce((sum, c) => sum + c.total, 0);

  return (
    <AdminSidebarClient
      locale={locale}
      totalCount={totalApplications}
      accessibleRoutes={accessibleRoutes}
      userAvatarUrl={userAvatarUrl}
    />
  );
}
