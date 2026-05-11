'use client';

import { useSession } from 'next-auth/react';
import { useRouter, usePathname } from 'next/navigation';
import { useEffect } from 'react';

interface AdminAuthProps {
  children: React.ReactNode;
}

export function AdminAuth({ children }: AdminAuthProps) {
  const { data: session, status } = useSession();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    // Only redirect if we're sure the session is unauthenticated
    // Avoid redirect loops by checking pathname first
    if (status === 'unauthenticated' && pathname !== '/login') {
      router.push(`/login?callbackUrl=${encodeURIComponent(pathname)}`);
    }
  }, [status, pathname, router]);

  if (status === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-muted-foreground">Loading...</div>
      </div>
    );
  }

  if (!session) {
    return null; // Redirect will happen via useEffect
  }

  return <>{children}</>;
}
















