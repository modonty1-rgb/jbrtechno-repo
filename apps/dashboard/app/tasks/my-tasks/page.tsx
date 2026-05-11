import { auth } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { UserRole } from '@jbrtechno/database';
import { getUserTasks } from '@/actions/tasks';
import { MyTasksPageClient } from './MyTasksPageClient';

export default async function MyTasksPage({
  params
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const session = await auth();

  if (!session?.user) {
    redirect('/login');
  }

  const tasksResult = await getUserTasks(session.user.id);
  const tasks = tasksResult.success ? tasksResult.tasks || [] : [];

  return (
    <MyTasksPageClient
      tasks={tasks}
      currentUserId={session.user.id}
      locale={locale}
    />
  );
}








