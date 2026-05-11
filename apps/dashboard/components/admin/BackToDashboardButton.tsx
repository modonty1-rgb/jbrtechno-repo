'use client';

import { usePathname, useRouter } from 'next/navigation';
import { LayoutDashboard } from 'lucide-react';
import { Button } from '@jbrtechno/ui';
import { messages } from '@/helpers/messages';

interface BackToDashboardButtonProps {
  userRole?: string;
}

export function BackToDashboardButton({ userRole }: BackToDashboardButtonProps) {
  const pathname = usePathname();
  const router = useRouter();

  // Only show for STAFF users and when not on dashboard route
  if (userRole !== 'STAFF' && userRole !== 'Staff') return null;

  const isOnDashboard = pathname === '/' || pathname === '';

  if (isOnDashboard) return null;

  const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    e.stopPropagation();
    router.push('/');
  };

  return (
    <Button variant="ghost" size="sm" type="button" onClick={handleClick}>
      <LayoutDashboard className="h-4 w-4 mr-2" />
      {messages.admin.backToDashboard}
    </Button>
  );
}








