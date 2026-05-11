'use client';

import { usePathname } from 'next/navigation';
import { SessionProvider } from 'next-auth/react';
import { AdminAuth } from '@/components/admin/AdminAuth';

interface AdminLayoutWrapperProps {
  children: React.ReactNode;
  showAdminUI: boolean;
}

export function AdminLayoutWrapper({ children, showAdminUI }: AdminLayoutWrapperProps) {
  const pathname = usePathname();
  const isLoginPage = pathname.includes('/admin/login');

  // If on login page, render children directly without AdminAuth wrapper
  // AdminAuth would cause redirect loops
  if (isLoginPage) {
    return <>{children}</>;
  }

  // For other admin pages, wrap with SessionProvider and AdminAuth for client-side session checks
  if (showAdminUI) {
    return (
      <SessionProvider>
        <AdminAuth>{children}</AdminAuth>
      </SessionProvider>
    );
  }

  // Fallback: render children directly
  return <>{children}</>;
}
















