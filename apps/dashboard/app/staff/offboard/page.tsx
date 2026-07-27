import { getStaffOptions } from '@/actions/staffHr';
import { OffboardForm } from './OffboardForm';

export const dynamic = 'force-dynamic';

export default async function OffboardPage() {
  let staffOptions: Awaited<ReturnType<typeof getStaffOptions>> = [];
  try {
    staffOptions = await getStaffOptions();
  } catch (error) {
    console.error('Error loading offboard page:', error);
  }
  return <OffboardForm staffOptions={staffOptions} />;
}
