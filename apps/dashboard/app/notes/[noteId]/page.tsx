import { auth } from '@/lib/auth';
import { redirect, notFound } from 'next/navigation';
import { UserRole, TargetAudience } from '@jbrtechno/database';
import { getNoteThread } from '@/actions/managementNotes';
import { prisma } from '@jbrtechno/database';
import { NoteThreadClient } from './NoteThreadClient';

export default async function NoteThreadPage({
  params
}: {
  params: Promise<{ locale: string; noteId: string }>;
}) {
  const { locale, noteId } = await params;
  const session = await auth();

  if (!session?.user) {
    redirect('/login');
  }

  const userId = session.user.id;
  const userRole = session.user.role as UserRole;

  const [threadResult, users] = await Promise.all([
    getNoteThread(noteId),
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

  if (!threadResult.success || !threadResult.note) {
    notFound();
  }

  const note = threadResult.note;

  const targetUserId = note.targetUserId || note.targetUser?.id;

  if (note.targetAudience !== TargetAudience.SPECIFIC_USER || !targetUserId) {
    notFound();
  }

  const canView = userRole === UserRole.SUPER_ADMIN ||
    userId === targetUserId ||
    userId === note.createdBy?.id;

  if (!canView) {
    redirect('/notes');
  }

  return (
    <NoteThreadClient
      note={note}
      currentUserId={userId}
      userRole={userRole}
      locale={locale}
      users={users}
    />
  );
}








