'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@jbrtechno/shared';
import { Badge } from '@jbrtechno/ui';
import type { NavItem } from '@/helpers/sidebarRoutes';

interface SidebarNavItemProps {
  item: NavItem;
}

export function SidebarNavItem({ item }: SidebarNavItemProps) {
  const pathname = usePathname();
  const Icon = item.icon;
  const isActive = item.exact
    ? pathname === item.href
    : pathname?.startsWith(item.href);

  return (
    <Link
      href={item.href}
      className={cn(
        'flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors',
        'hover:bg-accent hover:text-accent-foreground',
        isActive && 'bg-accent text-accent-foreground font-medium'
      )}
    >
      <Icon className="h-4 w-4 flex-shrink-0" />
      <span className="truncate flex-1">{item.label}</span>
      {item.count !== undefined && item.count > 0 && (
        <Badge variant="secondary" className="text-[10px] h-4 px-1.5 ml-auto">
          {item.count}
        </Badge>
      )}
    </Link>
  );
}




