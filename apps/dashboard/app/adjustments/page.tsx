import { getAdjustments, getStaffOptions } from '@/actions/staffHr';
import { AdjustmentsPageClient } from './AdjustmentsPageClient';

export const dynamic = 'force-dynamic';

export default async function AdjustmentsPage() {
  const now = new Date();
  const month = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;

  let staffOptions: Awaited<ReturnType<typeof getStaffOptions>> = [];
  let rows: Awaited<ReturnType<typeof getAdjustments>> = [];
  try {
    [staffOptions, rows] = await Promise.all([getStaffOptions(), getAdjustments(month)]);
  } catch (error) {
    console.error('Error loading adjustments page:', error);
  }

  return <AdjustmentsPageClient initialMonth={month} initialRows={rows} staffOptions={staffOptions} />;
}
