// Single source of truth for the payroll formula — used by the payroll page,
// the month-close snapshot, and day-based adjustment pricing.

export interface StaffSalaryFields {
  trialSalary: number | null;
  salary: number | null; // post-trial salary (AGREED mode)
  salaryMode: 'AGREED' | 'EVALUATION' | null;
  trialEndDate: Date | null;
}

// Base salary for a payroll month (YYYY-MM):
// - months before the trial-end month → trial salary
// - from the trial-end month on → post-trial salary if agreed, otherwise the
//   trial salary stays until an evaluation sets the new one.
export function baseSalaryForMonth(staff: StaffSalaryFields, month: string): number {
  const trial = staff.trialSalary ?? staff.salary ?? 0;
  if (!staff.trialEndDate) return trial;

  const trialEndMonth = `${staff.trialEndDate.getFullYear()}-${String(staff.trialEndDate.getMonth() + 1).padStart(2, '0')}`;
  if (month < trialEndMonth) return trial;

  if (staff.salaryMode === 'AGREED' && staff.salary) return staff.salary;
  return trial;
}

// A "day of salary" is priced at base / 30 (standard labor-practice rate).
export function dayRate(baseSalary: number): number {
  return baseSalary / 30;
}

export function netSalary(base: number, bonuses: number, deductions: number): number {
  return base + bonuses - deductions;
}

// Closing window: a month can only be closed from its 28th day onward
// (or any time after it has ended). Future months can never be closed.
export function isCloseAllowed(month: string, now = new Date()): { allowed: boolean; reason?: string } {
  const currentMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
  if (month > currentMonth) return { allowed: false, reason: 'لا يمكن إقفال شهر لم يبدأ بعد' };
  if (month === currentMonth && now.getDate() < 28) {
    return { allowed: false, reason: 'إقفال الشهر يتاح من يوم 28 حتى نهايته' };
  }
  return { allowed: true };
}
