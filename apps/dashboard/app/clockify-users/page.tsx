import { auth } from '@/lib/auth';
import { UserRole } from '@jbrtechno/database';
import { redirect } from 'next/navigation';
import { getClockifyUsers } from '@/lib/clockify';
import { ClockifyUsersTable } from '@/components/admin/ClockifyUsersTable';

export default async function ClockifyUsersPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const isArabic = true;

  const session = await auth();
  const role = session?.user?.role as UserRole | undefined;

  if (!session?.user || role !== UserRole.SUPER_ADMIN) {
    redirect('/');
  }

  let users: Awaited<ReturnType<typeof getClockifyUsers>> = [];
  let error: string | null = null;

  try {
    users = await getClockifyUsers();
  } catch (e) {
    error =
      e instanceof Error
        ? e.message
        : isArabic
          ? 'فشل في جلب مستخدمي Clockify'
          : 'Failed to load Clockify users';
  }

  return (
    <div className="container mx-auto px-4 py-6 max-w-5xl space-y-6">
      {error ? (
        <p className="text-sm text-red-600" dir={isArabic ? 'rtl' : 'ltr'}>
          {error}
        </p>
      ) : (
        <ClockifyUsersTable users={users} isArabic={isArabic} />
      )}
    </div>
  );
}


