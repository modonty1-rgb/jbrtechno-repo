import { auth } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { UserRole } from '@jbrtechno/database';
import { getAllStaff } from '@/actions/staff';
import { StaffPageClient } from './StaffPageClient';

export default async function StaffPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const session = await auth();
  const { locale } = await params;

  // Only SUPER_ADMIN can access this page
  if (
    !session?.user ||
    session.user.role !== UserRole.SUPER_ADMIN
  ) {
    redirect('/');
  }

  const result = await getAllStaff();
  const staff = result.success ? result.staff || [] : [];

  return <StaffPageClient staff={staff} locale={locale} />;
}









