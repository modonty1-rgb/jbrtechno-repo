import { auth } from '@/lib/auth';
import { redirect, notFound } from 'next/navigation';
import { UserRole } from '@jbrtechno/database';
import { getStaffById } from '@/actions/staff';
import { StaffDetailClient } from './StaffDetailClient';

export default async function StaffDetailPage({
  params,
}: {
  params: Promise<{ locale: string; id: string }>;
}) {
  const session = await auth();
  const { id } = await params;

  // Only SUPER_ADMIN can access this page
  if (
    !session?.user ||
    session.user.role !== UserRole.SUPER_ADMIN
  ) {
    redirect('/');
  }

  const result = await getStaffById(id);

  if (!result.success || !result.staff) {
    notFound();
  }

  return <StaffDetailClient staff={result.staff} />;
}









