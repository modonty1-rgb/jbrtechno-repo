import { SessionProviderWrapper } from '@/components/layout/SessionProviderWrapper';
import { AdminSidebar } from '@/components/admin/AdminSidebar';
import { AdminMobileSidebar } from '@/components/admin/AdminMobileSidebar';

export const dynamic = 'force-dynamic';

interface DashboardLayoutProps {
  children: React.ReactNode;
}

export async function DashboardLayout({ children }: DashboardLayoutProps) {
  return (
    <SessionProviderWrapper>
      <div className="flex min-h-screen">
        <aside className="hidden md:block w-72 border-l border-border bg-muted/30">
          <AdminSidebar locale="ar" />
        </aside>
        <main className="flex-1">
          <AdminMobileSidebar>
            <AdminSidebar locale="ar" />
          </AdminMobileSidebar>
          {children}
        </main>
      </div>
    </SessionProviderWrapper>
  );
}

