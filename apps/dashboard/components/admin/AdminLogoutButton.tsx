'use client';

import { signOut } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { Button } from '@jbrtechno/ui';
import { LogOut } from 'lucide-react';
import { messages } from '@/helpers/messages';

export function AdminLogoutButton() {
  const router = useRouter();

  const handleLogout = async () => {
    await signOut({ redirect: false });
    router.push('/login');
    router.refresh();
  };

  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={handleLogout}
      className="gap-2"
    >
      <LogOut className="h-4 w-4" />
      {messages.admin.logout}
    </Button>
  );
}
















