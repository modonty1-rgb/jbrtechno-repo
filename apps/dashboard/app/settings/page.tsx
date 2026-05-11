import { auth } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { UserRole } from '@jbrtechno/database';
import { AppSettingsClient } from './AppSettingsClient';

export default async function AppSettingsPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const session = await auth();

  if (
    !session?.user ||
    session.user.role !== UserRole.SUPER_ADMIN
  ) {
    redirect('/');
  }

  return <AppSettingsClient locale={locale} />;
}

