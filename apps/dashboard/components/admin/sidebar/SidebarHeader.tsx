'use client';

import Image from 'next/image';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { signOut } from 'next-auth/react';
import { Network, LayoutDashboard, LogOut, ListTodo, Clock, StickyNote } from 'lucide-react';
import { cn } from '@jbrtechno/shared';
import { messages } from '@/helpers/messages';
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

function getRoleBadgeVariant(role: UserRole | undefined) {
  switch (role) {
    case UserRole.SUPER_ADMIN:
      return 'default' as const;
    case UserRole.STAFF:
      return 'outline' as const;
    default:
      return 'outline' as const;
  }
}

export function SidebarHeader({ locale, user, userAvatarUrl }: SidebarHeaderProps) {
  const pathname = usePathname();
  const dashboardPath = buildLocalizedPath('/', locale);
  const orgStructurePath = buildLocalizedPath('/organizational-structure', locale);
  const profilePath = buildLocalizedPath('/settings/profile', locale);
  const myTasksPath = buildLocalizedPath('/tasks/my-tasks', locale);
  const myTimePath = buildLocalizedPath('/my-time', locale);
  const notesPath = buildLocalizedPath('/notes', locale);
  
  const isDashboardActive = pathname === dashboardPath || pathname === '/';
  const isOrgStructureActive = pathname?.startsWith(orgStructurePath);
  const isMyTasksActive = pathname?.startsWith(myTasksPath);
  const isMyTimeActive = pathname?.startsWith(myTimePath);
  const isNotesActive = pathname?.startsWith(notesPath);

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
              'flex items-center justify-center w-10 h-10 rounded-lg transition-colors',
              'hover:bg-accent hover:text-accent-foreground'
            )}
            title="تسجيل الخروج"
          >
            <LogOut className="h-5 w-5" />
          </button>
        )}
      </div>

      {user && (
        <Link
          href={profilePath}
          className={cn(
            'flex items-center gap-2 p-2 rounded-lg transition-colors',
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
              {user.role}
            </Badge>
          )}
        </Link>
      )}

      {user && (
        <div className="flex items-center gap-2 flex-wrap">
          <Link
            href={dashboardPath}
            className={cn(
              'flex items-center justify-center w-10 h-10 rounded-lg transition-colors',
              'hover:bg-accent hover:text-accent-foreground',
              isDashboardActive && 'bg-accent text-accent-foreground'
            )}
            title={messages.admin.dashboard}
          >
            <LayoutDashboard className="h-5 w-5" />
          </Link>
          <Link
            href={orgStructurePath}
            className={cn(
              'flex items-center justify-center w-10 h-10 rounded-lg transition-colors',
              'hover:bg-accent hover:text-accent-foreground',
              isOrgStructureActive && 'bg-accent text-accent-foreground'
            )}
            title={messages.admin.organizationalStructure}
          >
            <Network className="h-5 w-5" />
          </Link>
          <Link
            href={myTasksPath}
            className={cn(
              'flex items-center justify-center w-10 h-10 rounded-lg transition-colors',
              'hover:bg-accent hover:text-accent-foreground',
              isMyTasksActive && 'bg-accent text-accent-foreground'
            )}
            title="مهامي"
          >
            <ListTodo className="h-5 w-5" />
          </Link>
          <Link
            href={myTimePath}
            className={cn(
              'flex items-center justify-center w-10 h-10 rounded-lg transition-colors',
              'hover:bg-accent hover:text-accent-foreground',
              isMyTimeActive && 'bg-accent text-accent-foreground'
            )}
            title="سجل الوقت"
          >
            <Clock className="h-5 w-5" />
          </Link>
          <Link
            href={notesPath}
            className={cn(
              'flex items-center justify-center w-10 h-10 rounded-lg transition-colors',
              'hover:bg-accent hover:text-accent-foreground',
              isNotesActive && 'bg-accent text-accent-foreground'
            )}
            title={messages.admin.administrativeNotes}
          >
            <StickyNote className="h-5 w-5" />
          </Link>
        </div>
      )}
    </div>
  );
}

