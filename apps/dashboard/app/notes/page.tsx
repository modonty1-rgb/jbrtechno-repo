import { auth } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { UserRole } from '@jbrtechno/database';
import { getManagementNotes, getAllManagementNotes } from '@/actions/managementNotes';
import { prisma } from '@jbrtechno/database';
import { NotesPageClient } from './NotesPageClient';

export default async function AdministrativeNotesPage({
  params
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const session = await auth();

  if (!session?.user) {
    redirect('/login');
  }

  const userRole = session.user.role as UserRole;
  const userId = session.user.id;

  const [notesResult, users, staffRecords] = await Promise.all([
    userRole === UserRole.SUPER_ADMIN
      ? getAllManagementNotes()
      : getManagementNotes(userId, userRole),
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
    prisma.staff.findMany({
      select: {
        department: true,
      },
      distinct: ['department'],
    }),
  ]);

  const notes = notesResult.success ? notesResult.notes || [] : [];
  const departments = Array.from(
    new Set(staffRecords.map((s) => s.department).filter(Boolean) as string[])
  );

  console.log('NotesPage - Result success:', notesResult.success);
  console.log('NotesPage - Notes count:', notes.length);
  console.log('NotesPage - User role:', userRole);
  console.log('NotesPage - User ID:', userId);
  if (!notesResult.success) {
    console.error('NotesPage - Error:', notesResult.error);
  }

  return (
    <NotesPageClient
      notes={notes}
      users={users}
      departments={departments}
      currentUserId={userId}
      userRole={userRole}
      locale={locale}
    />
  );
}

