'use client';

import { useSession } from 'next-auth/react';
import { getSidebarSections } from '@/helpers/sidebarRoutes';
import { SidebarHeader } from './sidebar/SidebarHeader';
import { SidebarContent } from './sidebar/SidebarContent';

interface AdminSidebarClientProps {
  locale: string;
  totalCount: number;
  contactMessageCount: number;
  accessibleRoutes: string[];
  userAvatarUrl?: string | null;
}

export function AdminSidebarClient({
  locale,
  totalCount,
  contactMessageCount,
  accessibleRoutes,
  userAvatarUrl,
}: AdminSidebarClientProps) {
  const { data: session } = useSession();

  const sections = getSidebarSections(
    accessibleRoutes,
    locale,
    {
      totalApplications: totalCount,
      contactMessages: contactMessageCount,
    },
    session?.user?.role
  );

  return (
    <div className="h-full bg-muted/30 overflow-hidden flex flex-col">
      <SidebarHeader 
        locale={locale}
        user={session?.user}
        userAvatarUrl={userAvatarUrl}
      />
      <SidebarContent sections={sections} />
    </div>
  );
}
