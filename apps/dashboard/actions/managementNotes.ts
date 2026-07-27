'use server';

import { auth } from '@/lib/auth';
import { prisma } from '@jbrtechno/database';
import { UserRole, NoteType, TargetAudience } from '@jbrtechno/database';
import { revalidatePath } from 'next/cache';

export interface GetManagementNotesResult {
  success: boolean;
  notes?: any[];
  error?: string;
}

export interface CreateManagementNoteResult {
  success: boolean;
  noteId?: string;
  error?: string;
}

export interface MarkNoteAsReadResult {
  success: boolean;
  error?: string;
}

export interface UpdateManagementNoteResult {
  success: boolean;
  error?: string;
}

export interface CreateNoteReplyResult {
  success: boolean;
  replyId?: string;
  error?: string;
}

export interface GetNoteThreadResult {
  success: boolean;
  note?: any;
  error?: string;
}

export async function getManagementNotes(
  userId: string,
  role: UserRole
): Promise<GetManagementNotesResult> {
  try {
    const session = await auth();

    if (!session?.user) {
      return { success: false, error: 'Unauthorized' };
    }

    const now = new Date();

    // Get staff department if applicable
    const staffDepartment = session.user.role === UserRole.STAFF
      ? (await prisma.staff.findFirst({ where: { userId }, select: { department: true } }))?.department
      : undefined;

    // Build audience conditions
    const audienceConditions: any[] = [
      { targetAudience: TargetAudience.ALL },
    ];

    if (role === UserRole.STAFF) {
      audienceConditions.push({ targetAudience: TargetAudience.STAFF });
    }

    if (role === UserRole.SUPER_ADMIN) {
      audienceConditions.push({ targetAudience: TargetAudience.ADMIN });
    }

    audienceConditions.push({ targetAudience: TargetAudience.SPECIFIC_USER, targetUserId: userId });

    if (staffDepartment) {
      audienceConditions.push({
        targetAudience: TargetAudience.SPECIFIC_DEPARTMENT,
        department: staffDepartment,
      });
    }

    // Filter to only include valid NoteType enum values to prevent Prisma errors
    const validNoteTypes = [NoteType.ANNOUNCEMENT, NoteType.TASK, NoteType.REWARD, NoteType.GENERAL];

    const notes = await prisma.managementNote.findMany({
      where: {
        AND: [
          {
            OR: audienceConditions,
          },
          {
            parentNoteId: null,
          },
          {
            type: {
              in: validNoteTypes,
            },
          },
        ],
      },
      orderBy: {
        createdAt: 'desc',
      },
    }) as any;

    return {
      success: true,
      notes,
    };
  } catch (error) {
    console.error('Error getting management notes:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to get management notes',
    };
  }
}

export async function getNewManagementNotes(
  userId: string,
  role: UserRole
): Promise<GetManagementNotesResult> {
  try {
    const session = await auth();

    if (!session?.user) {
      return { success: false, error: 'Unauthorized' };
    }

    const result = await getManagementNotes(userId, role);

    if (!result.success || !result.notes) {
      return result;
    }

    const unreadNotes = result.notes.filter((note) => !note.readBy.includes(userId));

    return {
      success: true,
      notes: unreadNotes.slice(0, 10),
    };
  } catch (error) {
    console.error('Error getting new management notes:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to get new management notes',
    };
  }
}

export async function getNotesByType(
  userId: string,
  type: NoteType
): Promise<GetManagementNotesResult> {
  try {
    const session = await auth();

    if (!session?.user) {
      return { success: false, error: 'Unauthorized' };
    }

    const userRole = session.user.role as UserRole;
    const result = await getManagementNotes(userId, userRole);

    if (!result.success || !result.notes) {
      return result;
    }

    const filteredNotes = result.notes.filter((note) => note.type === type);

    return {
      success: true,
      notes: filteredNotes,
    };
  } catch (error) {
    console.error('Error getting notes by type:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to get notes by type',
    };
  }
}

export async function createManagementNote(data: {
  title: string;
  content: string;
  type: string;
  targetAudience: string;
  targetUserId?: string;
  department?: string;
  isImportant?: boolean;
  rewardAmount?: number;
  rewardCurrency?: string;
  expiresAt?: Date | string;
}): Promise<CreateManagementNoteResult> {
  try {
    const session = await auth();

    if (!session?.user) {
      return { success: false, error: 'Unauthorized' };
    }

    const userRole = session.user.role as UserRole;

    if (userRole !== UserRole.SUPER_ADMIN) {
      return { success: false, error: 'Only super admins can create management notes' };
    }

    const note = await prisma.managementNote.create({
      data: {
        title: data.title,
        content: data.content,
        type: data.type as NoteType,
        targetAudience: data.targetAudience as TargetAudience,
        targetUserId: data.targetUserId || null,
        department: data.department || null,
        isImportant: data.isImportant || false,
        rewardAmount: data.rewardAmount || null,
        rewardCurrency: data.rewardCurrency || 'SAR',
        createdByUserId: session.user.id,
        parentNoteId: null,
        readBy: [],
      },
    });

    revalidatePath('/[locale]/admin/notes', 'page');

    // Send email notifications
    try {
      const { sendNotificationEmails } = await import('@/actions/notifications');
      await sendNotificationEmails({
        noteId: note.id,
        title: data.title,
        content: data.content,
        targetAudience: data.targetAudience as TargetAudience,
        targetUserId: data.targetUserId || null,
        department: data.department || null,
      });
    } catch (emailError) {
      // Don't fail note creation if email fails
      console.error('Error sending notification emails:', emailError);
    }

    return {
      success: true,
      noteId: note.id,
    };
  } catch (error) {
    console.error('Error creating management note:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to create management note',
    };
  }
}

export async function markNoteAsRead(
  noteId: string,
  userId: string
): Promise<MarkNoteAsReadResult> {
  try {
    const session = await auth();

    if (!session?.user) {
      return { success: false, error: 'Unauthorized' };
    }

    const note = await prisma.managementNote.findUnique({
      where: { id: noteId },
    });

    if (!note) {
      return { success: false, error: 'Note not found' };
    }

    if (note.readBy.includes(userId)) {
      return { success: true };
    }

    const currentReadBy = note.readBy || [];
    if (!currentReadBy.includes(userId)) {
      await prisma.managementNote.update({
        where: { id: noteId },
        data: {
          readBy: [...currentReadBy, userId],
        },
      });
    }

    revalidatePath('/[locale]/admin', 'page');

    return {
      success: true,
    };
  } catch (error) {
    console.error('Error marking note as read:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to mark note as read',
    };
  }
}

export async function getAllManagementNotes(): Promise<GetManagementNotesResult> {
  try {
    const session = await auth();

    if (!session?.user) {
      return { success: false, error: 'Unauthorized' };
    }

    const userRole = session.user.role as UserRole;

    if (userRole !== UserRole.SUPER_ADMIN) {
      return { success: false, error: 'Only super admins can view all management notes' };
    }

    // Filter to only include valid NoteType enum values to prevent Prisma errors
    const validNoteTypes = [NoteType.ANNOUNCEMENT, NoteType.TASK, NoteType.REWARD, NoteType.GENERAL];

    const notes = await prisma.managementNote.findMany({
      where: {
        AND: [
          {
            parentNoteId: null,
          },
          {
            type: {
              in: validNoteTypes,
            },
          },
        ],
      },
      orderBy: {
        createdAt: 'desc',
      },
    }) as any;

    return {
      success: true,
      notes,
    };
  } catch (error) {
    console.error('Error getting all management notes:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to get all management notes',
    };
  }
}

export async function updateManagementNote(
  noteId: string,
  data: {
    title?: string;
    content?: string;
    type?: string;
    targetAudience?: string;
    targetUserId?: string | null;
    department?: string | null;
    isImportant?: boolean;
    rewardAmount?: number | null;
    rewardCurrency?: string;
    expiresAt?: Date | string | null;
  }
): Promise<UpdateManagementNoteResult> {
  try {
    const session = await auth();

    if (!session?.user) {
      return { success: false, error: 'Unauthorized' };
    }

    const userRole = session.user.role as UserRole;

    if (userRole !== UserRole.SUPER_ADMIN) {
      return { success: false, error: 'Only super admins can update management notes' };
    }

    const note = await prisma.managementNote.findUnique({
      where: { id: noteId },
    });

    if (!note) {
      return { success: false, error: 'Note not found' };
    }

    const updateData: any = {};

    if (data.title !== undefined) updateData.title = data.title;
    if (data.content !== undefined) updateData.content = data.content;
    if (data.type !== undefined) updateData.type = data.type as NoteType;
    if (data.targetAudience !== undefined) updateData.targetAudience = data.targetAudience as TargetAudience;
    if (data.targetUserId !== undefined) updateData.targetUserId = data.targetUserId;
    if (data.department !== undefined) updateData.department = data.department;
    if (data.isImportant !== undefined) updateData.isImportant = data.isImportant;
    if (data.rewardAmount !== undefined) updateData.rewardAmount = data.rewardAmount;
    if (data.rewardCurrency !== undefined) updateData.rewardCurrency = data.rewardCurrency;
    if (data.expiresAt !== undefined) {
      updateData.expiresAt = data.expiresAt ? new Date(data.expiresAt) : null;
    }

    await prisma.managementNote.update({
      where: { id: noteId },
      data: updateData,
    });

    revalidatePath('/[locale]/admin/notes', 'page');

    return {
      success: true,
    };
  } catch (error) {
    console.error('Error updating management note:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to update management note',
    };
  }
}

export async function deleteManagementNote(
  noteId: string
): Promise<MarkNoteAsReadResult> {
  try {
    const session = await auth();

    if (!session?.user) {
      return { success: false, error: 'Unauthorized' };
    }

    const userRole = session.user.role as UserRole;

    if (userRole !== UserRole.SUPER_ADMIN) {
      return { success: false, error: 'Only super admins can delete management notes' };
    }

    await prisma.managementNote.delete({
      where: { id: noteId },
    });

    revalidatePath('/[locale]/admin/notes', 'page');

    return {
      success: true,
    };
  } catch (error) {
    console.error('Error deleting management note:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to delete management note',
    };
  }
}

export async function createNoteReply(
  parentNoteId: string,
  content: string
): Promise<CreateNoteReplyResult> {
  try {
    const session = await auth();

    if (!session?.user) {
      return { success: false, error: 'Unauthorized' };
    }

    const parentNote = await prisma.managementNote.findUnique({
      where: { id: parentNoteId },
      select: {
        id: true,
        parentNoteId: true,
        targetAudience: true,
        targetUserId: true,
        createdByUserId: true,
      },
    });

    if (!parentNote) {
      return { success: false, error: 'Note not found' };
    }

    // Find the root note by traversing up the parent chain
    let rootNote: any = parentNote;
    let currentNote = parentNote;
    while (currentNote.parentNoteId) {
      const parent = await prisma.managementNote.findUnique({
        where: { id: currentNote.parentNoteId },
        select: {
          id: true,
          parentNoteId: true,
          targetAudience: true,
          targetUserId: true,
          createdByUserId: true,
        },
      });
      if (!parent) break;
      rootNote = parent;
      currentNote = parent;
    }

    if (rootNote.targetAudience !== TargetAudience.SPECIFIC_USER) {
      return { success: false, error: 'Replies are only allowed for notes sent to specific users' };
    }

    if (!rootNote.targetUserId) {
      return { success: false, error: 'Invalid note configuration' };
    }

    const userId = session.user.id;
    // Allow reply if user is:
    // 1. The target user of the root note
    // 2. The creator of the root note
    // 3. The creator of the parent note being replied to (allows replying to your own messages and nested replies)
    const canReply =
      userId === rootNote.targetUserId ||
      userId === rootNote.createdByUserId ||
      userId === parentNote.createdByUserId;

    if (!canReply) {
      return { success: false, error: 'You do not have permission to reply to this note' };
    }

    const reply = await prisma.managementNote.create({
      data: {
        title: `Re: ${rootNote.title}`,
        content: content.trim(),
        type: rootNote.type,
        targetAudience: TargetAudience.SPECIFIC_USER,
        targetUserId: rootNote.targetUserId,
        isImportant: false,
        createdByUserId: userId,
        parentNoteId: parentNoteId,
        readBy: [],
      },
    });

    revalidatePath('/[locale]/admin/notes', 'page');
    revalidatePath(`/[locale]/admin/notes/${parentNoteId}`, 'page');
    revalidatePath(`/[locale]/admin/notes/${rootNote.id}`, 'page');

    return {
      success: true,
      replyId: reply.id,
    };
  } catch (error) {
    console.error('Error creating note reply:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to create reply',
    };
  }
}

export async function getNoteThread(noteId: string): Promise<GetNoteThreadResult> {
  try {
    const session = await auth();

    if (!session?.user) {
      return { success: false, error: 'Unauthorized' };
    }

    const note = await prisma.managementNote.findUnique({
      where: { id: noteId },
    }) as any;

    if (!note) {
      return { success: false, error: 'Note not found' };
    }

    const rootNoteId = note.parentNoteId || note.id;

    let rootNote = note;
    if (note.parentNoteId) {
      rootNote = await prisma.managementNote.findUnique({
        where: { id: rootNoteId },
      }) as any;

      if (!rootNote) {
        return { success: false, error: 'Root note not found' };
      }
    }

    const allReplies: any[] = [];
    const processedIds = new Set<string>();
    let currentLevel = [rootNoteId];

    // Filter to only include valid NoteType enum values to prevent Prisma errors
    const validNoteTypes = [NoteType.ANNOUNCEMENT, NoteType.TASK, NoteType.REWARD, NoteType.GENERAL];

    while (currentLevel.length > 0) {
      const replies = await prisma.managementNote.findMany({
        where: {
          AND: [
            {
              parentNoteId: { in: currentLevel },
            },
            {
              type: {
                in: validNoteTypes,
              },
            },
          ],
        },
      }) as any;

      const newIds = replies
        .filter((r: any) => !processedIds.has(r.id))
        .map((r: any) => r.id);

      allReplies.push(...replies);
      newIds.forEach((id: string) => processedIds.add(id));
      currentLevel = newIds;
    }

    const sortedReplies = allReplies.sort(
      (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
    );

    return {
      success: true,
      note: {
        ...rootNote,
        replies: sortedReplies,
      },
    };
  } catch (error) {
    console.error('Error getting note thread:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to get note thread',
    };
  }
}








