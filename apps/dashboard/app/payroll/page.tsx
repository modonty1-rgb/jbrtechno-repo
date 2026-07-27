import { getPayrollMonth } from '@/actions/staffHr';
import { PayrollPageClient } from './PayrollPageClient';

export const dynamic = 'force-dynamic';

export default async function PayrollPage() {
  const now = new Date();
  const month = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;

  let data;
  try {
    data = await getPayrollMonth(month);
  } catch (error) {
    console.error('Error loading payroll page:', error);
    data = {
      month,
      closed: false,
      closedAt: null,
      rows: [],
      totals: {
        SAR: { base: 0, bonuses: 0, deductions: 0, net: 0 },
        EGP: { base: 0, bonuses: 0, deductions: 0, net: 0 },
      },
    };
  }

  return <PayrollPageClient initialData={data} />;
}
