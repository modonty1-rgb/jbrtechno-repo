'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useSession, signOut } from 'next-auth/react';
import { LogOut } from 'lucide-react';
import { cn } from '@jbrtechno/shared';
import { Badge, UserAvatar } from '@jbrtechno/ui';
import { buildLocalizedPath } from '@/lib/auth/utils';
import { quickNavLinks } from '@/helpers/quickNavLinks';
import { getRoleBadgeVariant } from '@/helpers/getRoleBadgeVariant';
import { SidebarToggleButton } from '@/components/layout/SidebarToggle';

interface TopNavbarProps {
  locale: string;
  userAvatarUrl?: string | null;
  contactMessageCount?: number;
}

export function TopNavbar({ locale, userAvatarUrl, contactMessageCount = 0 }: TopNavbarProps) {
  const pathname = usePathname();
  const { data: session } = useSession();
  const user = session?.user;
  const profilePath = buildLocalizedPath('/settings/profile', locale);

  const handleLogout = async () => {
    await signOut({ callbackUrl: '/login' });
  };

  return (
    <header className="hidden md:flex sticky top-0 z-30 items-center gap-1 px-4 py-2 border-b bg-background/95 backdrop-blur">
      <SidebarToggleButton />
      <div className="w-px h-6 bg-border mx-2" />

      {quickNavLinks.map(({ route, title, icon: Icon, exact }) => {
        const href = buildLocalizedPath(route, locale);
        const isActive = exact
          ? pathname === href || pathname === '/'
          : pathname?.startsWith(href);
        const badge = route === '/contact-messages' && contactMessageCount > 0;
        return (
          <Link
            key={route}
            href={href}
            className={cn(
              'relative flex items-center justify-center w-9 h-9 rounded-lg transition-colors',
              'hover:bg-accent hover:text-accent-foreground',
              isActive && 'bg-accent text-accent-foreground'
            )}
            title={title}
          >
            <Icon className="h-5 w-5" />
            {badge && (
              <span className="absolute -top-1 -end-1 min-w-4 h-4 px-1 rounded-full bg-primary text-primary-foreground text-[10px] font-bold flex items-center justify-center">
                {contactMessageCount}
              </span>
            )}
          </Link>
        );
      })}

      <div className="flex-1" />

      {user && (
        <>
          <Link
            href={profilePath}
            className={cn(
              'flex items-center gap-2 px-2 py-1 rounded-lg transition-colors',
              'hover:bg-accent hover:text-accent-foreground',
              pathname?.startsWith(profilePath) && 'bg-accent text-accent-foreground'
            )}
          >
            <UserAvatar
              name={user.name}
              email={user.email || undefined}
              imageUrl={userAvatarUrl || undefined}
              size="sm"
            />
            <span className="text-sm font-medium max-w-40 truncate">
              {user.name || user.email}
            </span>
            {user.role && (
              <Badge variant={getRoleBadgeVariant(user.role)} className="text-xs">
                {user.role === 'SUPER_ADMIN' ? 'أدمن' : 'موظف'}
              </Badge>
            )}
          </Link>
          <button
            onClick={handleLogout}
            className={cn(
              'flex items-center justify-center w-9 h-9 rounded-lg transition-colors',
              'hover:bg-accent hover:text-accent-foreground'
            )}
            title="تسجيل الخروج"
          >
            <LogOut className="h-5 w-5" />
          </button>
        </>
      )}
    </header>
  );
}
