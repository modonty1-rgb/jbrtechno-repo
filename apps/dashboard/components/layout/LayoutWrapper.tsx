'use client';

import { usePathname } from 'next/navigation';
import { SessionProviderWrapper } from '@/components/layout/SessionProviderWrapper';
import { Suspense } from 'react';

interface LayoutWrapperProps {
  dashboardLayout: React.ReactNode;
  minimalLayout: React.ReactNode;
}

export function LayoutWrapper({ dashboardLayout, minimalLayout }: LayoutWrapperProps) {
  const pathname = usePathname();
  const isLoginPage = pathname === '/login';
  const isNoPermissionsPage = pathname === '/no-permissions';
  const showDashboardUI = !isLoginPage && !isNoPermissionsPage;

  // Render minimal layout for login and no-permissions pages
  if (!showDashboardUI) {
    return <>{minimalLayout}</>;
  }

  // Render full dashboard layout for authenticated routes
  // dashboardLayout is passed as a server component from the parent
  return <Suspense fallback={minimalLayout}>{dashboardLayout}</Suspense>;
}
