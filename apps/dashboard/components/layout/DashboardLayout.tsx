import { prisma } from '@jbrtechno/database';
import { SessionProviderWrapper } from '@/components/layout/SessionProviderWrapper';
import { AdminSidebar } from '@/components/admin/AdminSidebar';
import { AdminMobileSidebar } from '@/components/admin/AdminMobileSidebar';
import { TopNavbar } from '@/components/layout/TopNavbar';
import { auth } from '@/lib/auth';
import { getUserAvatarUrl } from '@/helpers/getUserAvatarUrl';

export const dynamic = 'force-dynamic';

// Fetched once here and shared by TopNavbar + both AdminSidebar instances.
async function fetchUserAvatarUrl(): Promise<string | null> {
  try {
    const session = await auth();
    if (!session?.user?.id) return null;

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

    if (!user) return null;

    return getUserAvatarUrl({
      userAvatarUrl: user.avatarUrl,
      applicationProfileImageUrl: user.staff?.application?.profileImageUrl || null,
    });
  } catch (error) {
    console.error('Error loading user avatar:', error);
    return null;
  }
}

interface DashboardLayoutProps {
  children: React.ReactNode;
}

export async function DashboardLayout({ children }: DashboardLayoutProps) {
  const userAvatarUrl = await fetchUserAvatarUrl();

  return (
    <SessionProviderWrapper>
      <div className="flex min-h-screen">
        <aside className="hidden md:block w-72 border-l border-border bg-muted/30 overflow-hidden transition-[width] duration-300 [[data-sidebar-collapsed]_&]:w-0 [[data-sidebar-collapsed]_&]:border-l-0">
          {/* Fixed inner width so content doesn't reflow while the width animates */}
          <div className="w-72">
            <AdminSidebar locale="ar" userAvatarUrl={userAvatarUrl} />
          </div>
        </aside>
        <main className="flex-1">
          <AdminMobileSidebar>
            <AdminSidebar locale="ar" userAvatarUrl={userAvatarUrl} />
          </AdminMobileSidebar>
          <TopNavbar locale="ar" userAvatarUrl={userAvatarUrl} />
          {children}
        </main>
      </div>
    </SessionProviderWrapper>
  );
}
