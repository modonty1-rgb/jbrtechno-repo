import { prisma } from '@jbrtechno/database';
import { NewStaffForm } from './NewStaffForm';

export const dynamic = 'force-dynamic';

export default async function NewStaffPage() {
  // Job titles come from the company's positions table — no free text.
  let positionTitles: string[] = [];
  try {
    const positions = await prisma.position.findMany({
      select: { title: true },
      orderBy: [{ phase: 'asc' }, { order: 'asc' }],
    });
    positionTitles = positions.map((p) => p.title);
  } catch (error) {
    console.error('Error loading positions for staff form:', error);
  }

  return <NewStaffForm positionTitles={positionTitles} />;
}
