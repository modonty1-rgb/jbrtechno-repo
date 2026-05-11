'use server';

import { revalidatePath } from 'next/cache';
import { z } from 'zod';
import { prisma, UserRole, type Prisma } from '@jbrtechno/database';
import { auth } from '@/lib/auth';
import { logActivity } from '@/lib/activityLog';

const positionSchema = z.object({
  title: z.string().trim().min(2, 'Title is required').max(200),
  titleEn: z.string().trim().min(2, 'English title is required').max(200),
  count: z.coerce.number().int().min(1).max(100).default(1),
  phase: z.coerce.number().int().min(0).max(10).default(0),
  employmentType: z.string().trim().min(1).max(50).default('full-time'),
  salaryMin: z.coerce.number().int().min(0).default(0),
  salaryMax: z.coerce.number().int().min(0).default(0),
  requirements: z.array(z.string()).default([]),
  requirementsEn: z.array(z.string()).default([]),
  filledBy: z.string().nullable().optional(),
  isOpen: z.boolean().default(true),
  order: z.coerce.number().int().default(0),
});

export type PositionInput = z.infer<typeof positionSchema>;

async function requireSuperAdmin() {
  const session = await auth();
  if (!session?.user || session.user.role !== UserRole.SUPER_ADMIN) {
    throw new Error('Unauthorized');
  }
  return session.user;
}

export async function getPositions(filters?: { isOpen?: boolean; phase?: number; search?: string }) {
  const where: Prisma.PositionWhereInput = {};
  if (filters?.isOpen !== undefined) where.isOpen = filters.isOpen;
  if (filters?.phase !== undefined) where.phase = filters.phase;
  if (filters?.search) {
    where.OR = [
      { title: { contains: filters.search, mode: 'insensitive' } },
      { titleEn: { contains: filters.search, mode: 'insensitive' } },
    ];
  }
  return prisma.position.findMany({
    where,
    orderBy: [{ phase: 'asc' }, { order: 'asc' }, { title: 'asc' }],
  });
}

export async function getPositionById(id: string) {
  return prisma.position.findUnique({ where: { id } });
}

export async function createPosition(input: PositionInput) {
  const user = await requireSuperAdmin();
  const data = positionSchema.parse(input);
  const created = await prisma.position.create({ data });
  await logActivity({
    userId: String(user.id),
    type: 'POSITION_CREATED',
    description: `Created position: ${created.title}`,
  });
  revalidatePath('/positions');
  return created;
}

export async function updatePosition(id: string, input: PositionInput) {
  const user = await requireSuperAdmin();
  const data = positionSchema.parse(input);
  const updated = await prisma.position.update({ where: { id }, data });
  await logActivity({
    userId: String(user.id),
    type: 'POSITION_UPDATED',
    description: `Updated position: ${updated.title}`,
  });
  revalidatePath('/positions');
  revalidatePath(`/positions/${id}`);
  return updated;
}

export async function deletePosition(id: string) {
  const user = await requireSuperAdmin();
  const pos = await prisma.position.findUnique({ where: { id } });
  if (!pos) throw new Error('Position not found');
  await prisma.position.delete({ where: { id } });
  await logActivity({
    userId: String(user.id),
    type: 'POSITION_DELETED',
    description: `Deleted position: ${pos.title}`,
  });
  revalidatePath('/positions');
  return { success: true };
}

export async function togglePositionOpen(id: string) {
  const user = await requireSuperAdmin();
  const pos = await prisma.position.findUnique({ where: { id } });
  if (!pos) throw new Error('Position not found');
  const updated = await prisma.position.update({
    where: { id },
    data: { isOpen: !pos.isOpen },
  });
  await logActivity({
    userId: String(user.id),
    type: 'POSITION_TOGGLED',
    description: `Position "${updated.title}" → ${updated.isOpen ? 'OPEN' : 'CLOSED'}`,
  });
  revalidatePath('/positions');
  return updated;
}
