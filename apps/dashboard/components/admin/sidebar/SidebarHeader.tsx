'use client';

import Image from 'next/image';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { signOut } from 'next-auth/react';
import { LogOut } from 'lucide-react';
import { cn } from '@jbrtechno/shared';
import { messages } from '@/helpers/messages';
import { quickNavLinks } from '@/helpers/quickNavLinks';
import { getRoleBadgeVariant } from '@/helpers/getRoleBadgeVariant';
import { buildLocalizedPath } from '@/lib/auth/utils';
import { UserRole } from '@jbrtechno/database';
import { Badge } from '@jbrtechno/ui';
import { UserAvatar } from '@jbrtechno/ui';

const logoUrl = 'https://res.cloudinary.com/dhjy2k0fu/image/upload/v1762694663/logo_e6nxja.png';

interface SidebarHeaderProps {
  locale: string;
  user: {
    name?: string | null;
    email?: string | null;
    role?: UserRole;
  } | null | undefined;
  userAvatarUrl?: string | null;
}

export function SidebarHeader({ locale, user, userAvatarUrl }: SidebarHeaderProps) {
  const pathname = usePathname();
  const profilePath = buildLocalizedPath('/settings/profile', locale);

  const handleLogout = async () => {
    await signOut({ callbackUrl: '/login' });
  };

  return (
    <div className="p-6 border-b space-y-4">
      <div className="flex items-center gap-3">
        <div className="relative w-10 h-10 flex-shrink-0">
          <Image
            src={logoUrl}
            alt="JbrTecno"
            fill
            className="object-contain"
            priority
          />
        </div>
        <div className="flex-1 min-w-0">
          <h2 className="text-lg font-semibold truncate">JbrTecno</h2>
          <p className="text-xs text-muted-foreground truncate">{messages.admin.adminPanel}</p>
        </div>
        {user && (
          <button
            onClick={handleLogout}
            className={cn(
              'flex md:hidden items-center justify-center w-10 h-10 rounded-lg transition-colors',
              'hover:bg-accent hover:text-accent-foreground'
            )}
            title="تسجيل الخروج"
          >
            <LogOut className="h-5 w-5" />
          </button>
        )}
      </div>

      {/* Profile + quick links live in TopNavbar on desktop — mobile drawer only here */}
      {user && (
        <Link
          href={profilePath}
          className={cn(
            'flex md:hidden items-center gap-2 p-2 rounded-lg transition-colors',
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
          <div className="text-sm font-medium truncate flex-1 min-w-0">
            {user.name || user.email}
          </div>
          {user.role && (
            <Badge variant={getRoleBadgeVariant(user.role)} className="text-xs">
              {user.role === 'SUPER_ADMIN' ? 'أدمن' : 'موظف'}
            </Badge>
          )}
        </Link>
      )}

      {user && (
        <div className="flex md:hidden items-center gap-2 flex-wrap">
          {quickNavLinks.map(({ route, title, icon: Icon, exact }) => {
            const href = buildLocalizedPath(route, locale);
            const isActive = exact
              ? pathname === href || pathname === '/'
              : pathname?.startsWith(href);
            return (
              <Link
                key={route}
                href={href}
                className={cn(
                  'flex items-center justify-center w-10 h-10 rounded-lg transition-colors',
                  'hover:bg-accent hover:text-accent-foreground',
                  isActive && 'bg-accent text-accent-foreground'
                )}
                title={title}
              >
                <Icon className="h-5 w-5" />
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
