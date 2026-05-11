import { auth } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { UserRole } from '@jbrtechno/database';
import { getAllTasks } from '@/actions/tasks';
import { prisma } from '@jbrtechno/database';
import { TasksPageClient } from './TasksPageClient';

export default async function TasksPage({
  params
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const session = await auth();

  if (!session?.user || session.user.role !== UserRole.SUPER_ADMIN) {
    redirect('/');
  }

  const [tasksResult, users] = await Promise.all([
    getAllTasks(),
    (async () => {
      try {
        return await prisma.user.findMany({
          where: {
            isActive: true,
            role: {
              in: [UserRole.SUPER_ADMIN, UserRole.STAFF],
            },
          },
          select: {
            id: true,
            name: true,
            email: true,
          },
          orderBy: {
            name: 'asc',
          },
        });
      } catch (error: any) {
        if (error.message?.includes('not found in enum') || error.message?.includes('ADMIN')) {
          console.error('Database contains users with invalid role values. Please run: npx tsx scripts/migrate-user-roles.ts');
          return [];
        }
        throw error;
      }
    })(),
  ]);

  const tasks = tasksResult.success ? tasksResult.tasks || [] : [];

  return (
    <TasksPageClient
      tasks={tasks}
      users={users}
      currentUserId={session.user.id}
      locale={locale}
    />
  );
}

