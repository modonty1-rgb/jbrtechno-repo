'use server';

import { prisma } from '@jbrtechno/database';

export async function getAllPositions() {
  return prisma.position.findMany({
    orderBy: [{ phase: 'asc' }, { order: 'asc' }],
  });
}

export async function getPositionByTitle(title: string) {
  return prisma.position.findUnique({
    where: { title },
  });
}
