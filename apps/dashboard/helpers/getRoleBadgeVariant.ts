import { UserRole } from '@jbrtechno/database';

export function getRoleBadgeVariant(role: UserRole | undefined) {
  switch (role) {
    case UserRole.SUPER_ADMIN:
      return 'default' as const;
    case UserRole.STAFF:
      return 'outline' as const;
    default:
      return 'outline' as const;
  }
}
