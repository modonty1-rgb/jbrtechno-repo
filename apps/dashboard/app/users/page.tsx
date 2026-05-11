import { auth } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { UserRole } from '@jbrtechno/database';
import { getAllUsers } from '@/actions/users';
import { UsersPageClient } from './UsersPageClient';

export default async function UsersPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const session = await auth();
  const { locale } = await params;

  // Only SUPER_ADMIN can access this page
  if (!session?.user || session.user.role !== UserRole.SUPER_ADMIN) {
    redirect('/');
  }

  const users = await getAllUsers();

  return <UsersPageClient users={users} locale={locale} currentUserId={session.user.id} />;
}




















