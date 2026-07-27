'use server';

import { prisma } from '@jbrtechno/database';
import { positionSlug } from '@/helpers/positionSlug';

export async function getAllPositions() {
  return prisma.position.findMany({
    orderBy: [{ phase: 'asc' }, { order: 'asc' }],
  });
}

// Apply URLs use the ad-friendly slug (e.g. "video-editor"); older shared
// links may still carry the raw Arabic/English title — match those too.
export async function getPositionByTitle(slugOrTitle: string) {
  const direct = await prisma.position.findFirst({
    where: { OR: [{ titleEn: slugOrTitle }, { title: slugOrTitle }] },
  });
  if (direct) return direct;

  const all = await prisma.position.findMany();
  return all.find((p) => positionSlug(p.titleEn) === slugOrTitle) ?? null;
}
