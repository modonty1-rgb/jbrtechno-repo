/**
 * Idempotent seed for the Position collection.
 *
 * Source of truth: prisma/positions-seed.json
 * Run: pnpm db:seed:positions
 *
 * Safe to re-run — upserts by `title` (unique). Existing records are updated,
 * new ones are created. No deletions.
 */
import { prisma } from '../src';
import fs from 'fs';
import path from 'path';

type PositionSeed = {
  title: string;
  titleEn: string;
  count: number;
  phase: number;
  employmentType: string;
  salaryMin: number;
  salaryMax: number;
  requirements: string[];
  requirementsEn: string[];
  filledBy: string | null;
  isOpen: boolean;
  order: number;
};

async function main() {
  const dbUrl = process.env.JBRTECHNO_DATABASE_URL ?? '';
  const dbHost = dbUrl.replace(/.*@/, '').split('/')[0] || 'unknown';
  const dbName = dbUrl.split('/').pop()?.split('?')[0] || 'unknown';
  console.log(`🔌 Target DB: ${dbName} @ ${dbHost}\n`);

  const file = path.join(process.cwd(), 'prisma', 'positions-seed.json');
  const positions: PositionSeed[] = JSON.parse(fs.readFileSync(file, 'utf8'));
  console.log(`📋 Seeding ${positions.length} positions from JSON...\n`);

  let created = 0;
  let updated = 0;
  for (const pos of positions) {
    const existing = await prisma.position.findUnique({ where: { title: pos.title } });
    await prisma.position.upsert({
      where: { title: pos.title },
      update: pos,
      create: pos,
    });
    if (existing) {
      updated++;
      console.log(`  ↻ ${pos.title}`);
    } else {
      created++;
      console.log(`  + ${pos.title}`);
    }
  }

  console.log(`\n✅ Done. ${created} created, ${updated} updated.`);
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
