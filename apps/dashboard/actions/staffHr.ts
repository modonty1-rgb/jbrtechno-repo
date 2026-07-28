'use server';

import { auth } from '@/lib/auth';
import { prisma } from '@jbrtechno/database';
import { UserRole, StaffStatus, AdjustmentType, SalaryMode } from '@jbrtechno/database';
import { revalidatePath } from 'next/cache';
import { uploadStaffImage, uploadStaffDoc } from '@/lib/cloudinary';
import { baseSalaryForMonth, dayRate, netSalary, proratedBase, isCloseAllowed } from '@/helpers/payrollFormula';

async function requireSuperAdmin() {
  const session = await auth();
  if (!session?.user || session.user.role !== UserRole.SUPER_ADMIN) {
    throw new Error('Unauthorized');
  }
  return session;
}

// ---------------------------------------------------------------------------
// Staff registration (from /staff/new)
// ---------------------------------------------------------------------------

export interface CreateStaffResult {
  success: boolean;
  staffId?: string;
  error?: string;
}

// FormData because the form ships up to three files alongside the fields.
export async function createStaff(formData: FormData): Promise<CreateStaffResult> {
  try {
    await requireSuperAdmin();

    const str = (key: string) => (formData.get(key) as string | null)?.trim() || null;
    const fullName = str('fullName');
    const department = str('department');
    const nationalId = str('nationalId');
    const phone = str('phone');
    const hireDateStr = str('hireDate');
    const trialMonths = Number(str('trialMonths') || 3);
    const trialSalary = Number(str('trialSalary') || 0);
    const salaryMode = (str('salaryMode') === 'EVALUATION' ? 'EVALUATION' : 'AGREED') as SalaryMode;
    const postTrialSalary = Number(str('postTrialSalary') || 0);

    if (!fullName || !department || !nationalId || !phone || !hireDateStr || trialSalary <= 0) {
      return { success: false, error: 'حقول إلزامية ناقصة' };
    }
    if (salaryMode === 'AGREED' && postTrialSalary <= 0) {
      return { success: false, error: 'الراتب المتفق عليه بعد التثبيت مطلوب' };
    }

    const hireDate = new Date(hireDateStr);
    const trialEndDate = new Date(hireDate);
    trialEndDate.setMonth(trialEndDate.getMonth() + trialMonths);

    // Business rule: currency follows the employee's country.
    const country = str('country') || 'السعودية';
    const currency = country === 'مصر' ? 'EGP' : 'SAR';

    // Uploads (all optional at registration time)
    const uploads: {
      photoUrl?: string;
      photoPublicId?: string;
      idCardUrl?: string;
      idCardPublicId?: string;
      cvUrl?: string;
      cvPublicId?: string;
    } = {};
    const photoFile = formData.get('photoFile') as File | null;
    const idCardFile = formData.get('idCardFile') as File | null;
    const cvFile = formData.get('cvFile') as File | null;

    if (photoFile && photoFile.size > 0) {
      const r = await uploadStaffImage(Buffer.from(await photoFile.arrayBuffer()), photoFile.name, 'photo');
      uploads.photoUrl = r.url;
      uploads.photoPublicId = r.publicId;
    }
    if (idCardFile && idCardFile.size > 0) {
      const r = await uploadStaffImage(Buffer.from(await idCardFile.arrayBuffer()), idCardFile.name, 'id-card');
      uploads.idCardUrl = r.url;
      uploads.idCardPublicId = r.publicId;
    }
    if (cvFile && cvFile.size > 0) {
      const r = await uploadStaffDoc(Buffer.from(await cvFile.arrayBuffer()), cvFile.name);
      uploads.cvUrl = r.url;
      uploads.cvPublicId = r.publicId;
    }

    const emergencyName = str('emergencyName');
    const emergencyPhone = str('emergencyPhone');

    const staff = await prisma.staff.create({
      data: {
        fullName,
        department,
        jobDuties: str('jobDuties'),
        nationalId,
        nationality: str('nationality'),
        birthDate: str('birthDate') ? new Date(str('birthDate')!) : null,
        phone,
        officialEmail: str('officialEmail'),
        personalEmail: str('personalEmail'),
        country,
        city: str('city'),
        address: str('address'),
        hireDate,
        trialStartDate: hireDate,
        trialMonths,
        trialEndDate,
        trialSalary,
        salaryMode,
        salary: salaryMode === 'AGREED' ? postTrialSalary : null,
        currency,
        bankName: str('bankName'),
        iban: str('iban'),
        instapay: str('instapay'),
        vodafoneCash: str('vodafoneCash'),
        offerAcceptedDate: formData.get('offerAccepted') === 'true' ? new Date() : null,
        contractSignedDate: formData.get('contractSigned') === 'true' ? new Date() : null,
        ndaSignedDate: formData.get('ndaSigned') === 'true' ? new Date() : null,
        emergencyContact1:
          emergencyName || emergencyPhone ? { name: emergencyName || '', phone: emergencyPhone || '' } : undefined,
        notes: str('notes'),
        status: StaffStatus.ACTIVE,
        ...uploads,
      },
    });

    revalidatePath('/staff');
    return { success: true, staffId: staff.id };
  } catch (error) {
    console.error('createStaff error:', error);
    return { success: false, error: error instanceof Error ? error.message : 'فشل حفظ الموظف' };
  }
}

// Same field parsing as createStaff, applied as an update. New files replace
// the old Cloudinary assets (old ones are destroyed).
export async function updateStaffHr(staffId: string, formData: FormData): Promise<CreateStaffResult> {
  try {
    await requireSuperAdmin();
    const existing = await prisma.staff.findUnique({ where: { id: staffId } });
    if (!existing) return { success: false, error: 'الموظف غير موجود' };

    const str = (key: string) => (formData.get(key) as string | null)?.trim() || null;
    const fullName = str('fullName');
    const department = str('department');
    const nationalId = str('nationalId');
    const phone = str('phone');
    const hireDateStr = str('hireDate');
    const trialMonths = Number(str('trialMonths') || 3);
    const trialSalary = Number(str('trialSalary') || 0);
    const salaryMode = (str('salaryMode') === 'EVALUATION' ? 'EVALUATION' : 'AGREED') as SalaryMode;
    const postTrialSalary = Number(str('postTrialSalary') || 0);

    if (!fullName || !department || !nationalId || !phone || !hireDateStr || trialSalary <= 0) {
      return { success: false, error: 'حقول إلزامية ناقصة' };
    }
    if (salaryMode === 'AGREED' && postTrialSalary <= 0) {
      return { success: false, error: 'الراتب المتفق عليه بعد التثبيت مطلوب' };
    }

    const hireDate = new Date(hireDateStr);
    const trialEndDate = new Date(hireDate);
    trialEndDate.setMonth(trialEndDate.getMonth() + trialMonths);

    const country = str('country') || 'السعودية';
    const currency = country === 'مصر' ? 'EGP' : 'SAR';

    const uploads: Record<string, string> = {};
    const { deleteImageFromCloudinary, deleteCVFromCloudinary } = await import('@/lib/cloudinary');
    const photoFile = formData.get('photoFile') as File | null;
    const idCardFile = formData.get('idCardFile') as File | null;
    const cvFile = formData.get('cvFile') as File | null;

    if (photoFile && photoFile.size > 0) {
      const r = await uploadStaffImage(Buffer.from(await photoFile.arrayBuffer()), photoFile.name, 'photo');
      if (existing.photoPublicId) await deleteImageFromCloudinary(existing.photoPublicId).catch(() => {});
      uploads.photoUrl = r.url;
      uploads.photoPublicId = r.publicId;
    }
    if (idCardFile && idCardFile.size > 0) {
      const r = await uploadStaffImage(Buffer.from(await idCardFile.arrayBuffer()), idCardFile.name, 'id-card');
      if (existing.idCardPublicId) await deleteImageFromCloudinary(existing.idCardPublicId).catch(() => {});
      uploads.idCardUrl = r.url;
      uploads.idCardPublicId = r.publicId;
    }
    if (cvFile && cvFile.size > 0) {
      const r = await uploadStaffDoc(Buffer.from(await cvFile.arrayBuffer()), cvFile.name);
      if (existing.cvPublicId) await deleteCVFromCloudinary(existing.cvPublicId).catch(() => {});
      uploads.cvUrl = r.url;
      uploads.cvPublicId = r.publicId;
    }

    const emergencyName = str('emergencyName');
    const emergencyPhone = str('emergencyPhone');

    // Status is editable in edit mode. Reactivating a terminated employee
    // clears the termination record so payroll and the profile are consistent.
    const statusStr = str('status');
    const status =
      statusStr === 'INACTIVE' ? StaffStatus.INACTIVE : statusStr === 'ON_LEAVE' ? StaffStatus.ON_LEAVE : StaffStatus.ACTIVE;
    const reactivating = existing.status !== StaffStatus.ACTIVE && status === StaffStatus.ACTIVE;

    await prisma.staff.update({
      where: { id: staffId },
      data: {
        status,
        ...(reactivating && existing.terminationDate
          ? { terminationDate: null, terminationReason: null, clearance: undefined }
          : {}),
        fullName,
        department,
        jobDuties: str('jobDuties'),
        nationalId,
        nationality: str('nationality'),
        birthDate: str('birthDate') ? new Date(str('birthDate')!) : null,
        phone,
        officialEmail: str('officialEmail'),
        personalEmail: str('personalEmail'),
        country,
        city: str('city'),
        address: str('address'),
        hireDate,
        trialStartDate: hireDate,
        trialMonths,
        trialEndDate,
        trialSalary,
        salaryMode,
        salary: salaryMode === 'AGREED' ? postTrialSalary : null,
        currency,
        bankName: str('bankName'),
        iban: str('iban'),
        instapay: str('instapay'),
        vodafoneCash: str('vodafoneCash'),
        offerAcceptedDate: formData.get('offerAccepted') === 'true' ? existing.offerAcceptedDate ?? new Date() : null,
        contractSignedDate: formData.get('contractSigned') === 'true' ? existing.contractSignedDate ?? new Date() : null,
        ndaSignedDate: formData.get('ndaSigned') === 'true' ? existing.ndaSignedDate ?? new Date() : null,
        emergencyContact1:
          emergencyName || emergencyPhone ? { name: emergencyName || '', phone: emergencyPhone || '' } : undefined,
        notes: str('notes'),
        ...uploads,
      },
    });

    revalidatePath('/staff');
    revalidatePath(`/staff/${staffId}`);
    return { success: true, staffId };
  } catch (error) {
    console.error('updateStaffHr error:', error);
    return { success: false, error: error instanceof Error ? error.message : 'فشل تحديث الموظف' };
  }
}

// Archive = move out of the active list (status INACTIVE); record stays
// queryable via the status filter.
export async function archiveStaff(staffId: string): Promise<{ success: boolean; error?: string }> {
  try {
    await requireSuperAdmin();
    await prisma.staff.update({ where: { id: staffId }, data: { status: StaffStatus.INACTIVE } });
    revalidatePath('/staff');
    return { success: true };
  } catch (error) {
    console.error('archiveStaff error:', error);
    return { success: false, error: 'فشلت الأرشفة' };
  }
}

// Restore an archived/terminated employee back to ACTIVE; any termination
// record is cleared so payroll and the profile stay consistent.
export async function restoreStaff(staffId: string): Promise<{ success: boolean; error?: string }> {
  try {
    await requireSuperAdmin();
    await prisma.staff.update({
      where: { id: staffId },
      data: { status: StaffStatus.ACTIVE, terminationDate: null, terminationReason: null, clearance: undefined },
    });
    revalidatePath('/staff');
    return { success: true };
  } catch (error) {
    console.error('restoreStaff error:', error);
    return { success: false, error: 'فشلت الاستعادة' };
  }
}

// ---------------------------------------------------------------------------
// Shared: active-staff options for pickers (adjustments / offboard / payroll)
// ---------------------------------------------------------------------------

export interface StaffOption {
  id: string;
  name: string;
  currency: 'SAR' | 'EGP';
  baseSalary: number; // base for the current month — used to price day-based movements
}

export async function getStaffOptions(): Promise<StaffOption[]> {
  await requireSuperAdmin();
  const now = new Date();
  const month = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
  const records = await prisma.staff.findMany({
    where: { status: StaffStatus.ACTIVE },
    include: { application: true },
    orderBy: { createdAt: 'asc' },
  });
  return records.map((s) => ({
    id: s.id,
    name: s.fullName || s.application?.applicantName || s.officialEmail || 'بدون اسم',
    currency: (s.currency === 'EGP' ? 'EGP' : 'SAR') as 'SAR' | 'EGP',
    baseSalary: baseSalaryForMonth(
      { trialSalary: s.trialSalary, salary: s.salary, salaryMode: s.salaryMode, trialEndDate: s.trialEndDate },
      month
    ),
  }));
}

// ---------------------------------------------------------------------------
// Adjustments (bonus / deduction) — /adjustments
// ---------------------------------------------------------------------------

export interface AdjustmentRow {
  id: string;
  staffId: string;
  staffName: string;
  currency: 'SAR' | 'EGP';
  type: 'BONUS' | 'DEDUCTION';
  amount: number;
  days: number | null;
  month: string;
  note: string | null;
}

export async function getAdjustments(month: string): Promise<AdjustmentRow[]> {
  await requireSuperAdmin();
  const rows = await prisma.staffAdjustment.findMany({
    where: { month },
    include: { staff: { include: { application: true } } },
    orderBy: { createdAt: 'desc' },
  });
  return rows.map((r) => ({
    id: r.id,
    staffId: r.staffId,
    staffName: r.staff.fullName || r.staff.application?.applicantName || 'بدون اسم',
    currency: (r.staff.currency === 'EGP' ? 'EGP' : 'SAR') as 'SAR' | 'EGP',
    type: r.type,
    amount: r.amount,
    days: r.days,
    month: r.month,
    note: r.note,
  }));
}

export async function createAdjustment(input: {
  staffId: string;
  type: 'BONUS' | 'DEDUCTION';
  month: string;
  note: string;
  amount?: number; // fixed-amount mode
  days?: number; // days-of-salary mode — priced server-side from the base salary
}): Promise<{ success: boolean; error?: string }> {
  try {
    await requireSuperAdmin();
    const staff = await prisma.staff.findUnique({ where: { id: input.staffId } });
    if (!staff) return { success: false, error: 'الموظف غير موجود' };

    let amount = input.amount ?? 0;
    if (input.days && input.days > 0) {
      const base = baseSalaryForMonth(
        { trialSalary: staff.trialSalary, salary: staff.salary, salaryMode: staff.salaryMode, trialEndDate: staff.trialEndDate },
        input.month
      );
      amount = Math.round(dayRate(base) * input.days);
    }
    if (amount <= 0) return { success: false, error: 'قيمة غير صالحة' };

    await prisma.staffAdjustment.create({
      data: {
        staffId: input.staffId,
        type: input.type as AdjustmentType,
        amount,
        days: input.days || null,
        month: input.month,
        note: input.note.trim() || null,
      },
    });
    revalidatePath('/adjustments');
    return { success: true };
  } catch (error) {
    console.error('createAdjustment error:', error);
    return { success: false, error: 'فشل حفظ الحركة' };
  }
}

export async function deleteAdjustment(id: string): Promise<{ success: boolean; error?: string }> {
  try {
    await requireSuperAdmin();
    await prisma.staffAdjustment.delete({ where: { id } });
    revalidatePath('/adjustments');
    return { success: true };
  } catch (error) {
    console.error('deleteAdjustment error:', error);
    return { success: false, error: 'فشل حذف الحركة' };
  }
}

// ---------------------------------------------------------------------------
// Offboarding (termination only) — /staff/offboard
// ---------------------------------------------------------------------------

export async function terminateStaff(input: {
  staffId: string;
  effectiveDate: string; // YYYY-MM-DD
  reason: string;
  clearance: { finalPay: boolean; assets: boolean; access: boolean; release: boolean };
  notes?: string;
}): Promise<{ success: boolean; error?: string }> {
  try {
    await requireSuperAdmin();
    const staff = await prisma.staff.findUnique({ where: { id: input.staffId } });
    if (!staff) return { success: false, error: 'الموظف غير موجود' };

    await prisma.staff.update({
      where: { id: input.staffId },
      data: {
        status: StaffStatus.INACTIVE,
        terminationDate: new Date(input.effectiveDate),
        terminationReason: input.reason.trim(),
        clearance: input.clearance,
        notes: input.notes?.trim()
          ? `${staff.notes ? staff.notes + '\n' : ''}[إنهاء خدمات] ${input.notes.trim()}`
          : staff.notes,
      },
    });
    revalidatePath('/staff');
    revalidatePath('/staff/offboard');
    return { success: true };
  } catch (error) {
    console.error('terminateStaff error:', error);
    return { success: false, error: 'فشل تنفيذ الإجراء' };
  }
}

// ---------------------------------------------------------------------------
// Payroll — /payroll
// ---------------------------------------------------------------------------

export interface PayrollRowData {
  staffId: string;
  name: string;
  currency: 'SAR' | 'EGP';
  base: number;
  bonuses: number;
  deductions: number;
  net: number;
  // Employment days inside this payroll month (partial for mid-month
  // hires/terminations) out of the month's total days
  workedDays?: number;
  monthDays?: number;
  // Hired during this payroll month (didn't work it in full)
  isNewHire?: boolean;
  // Payout details for executing the transfer from the sheet
  bankName?: string | null;
  iban?: string | null;
  instapay?: string | null;
  vodafoneCash?: string | null;
}

export interface PayrollTotals {
  SAR: { base: number; bonuses: number; deductions: number; net: number };
  EGP: { base: number; bonuses: number; deductions: number; net: number };
  // Set at close time when there are EGP salaries: the SAR amount actually
  // paid for Egypt transfers + the exchange rate used as reference.
  meta?: { egpInSar?: number; egpRate?: number };
}

export interface PayrollMonthData {
  month: string;
  closed: boolean;
  closedAt: string | null;
  rows: PayrollRowData[];
  totals: PayrollTotals;
}

function computeTotals(rows: PayrollRowData[]): PayrollTotals {
  const totals: PayrollTotals = {
    SAR: { base: 0, bonuses: 0, deductions: 0, net: 0 },
    EGP: { base: 0, bonuses: 0, deductions: 0, net: 0 },
  };
  for (const row of rows) {
    const t = totals[row.currency];
    t.base += row.base;
    t.bonuses += row.bonuses;
    t.deductions += row.deductions;
    t.net += row.net;
  }
  return totals;
}

async function computePayrollRows(month: string): Promise<PayrollRowData[]> {
  const monthStart = new Date(`${month}-01T00:00:00Z`);
  const staff = await prisma.staff.findMany({
    where: {
      OR: [
        { status: StaffStatus.ACTIVE },
        // Terminated employees still appear in the month they left
        { terminationDate: { gte: monthStart } },
      ],
    },
    include: { application: true, adjustments: { where: { month } } },
    orderBy: { createdAt: 'asc' },
  });

  return staff
    .filter((s) => {
      // Skip employees hired after this payroll month
      const hireMonth = `${s.hireDate.getFullYear()}-${String(s.hireDate.getMonth() + 1).padStart(2, '0')}`;
      return hireMonth <= month;
    })
    .map((s) => {
      const fullBase = baseSalaryForMonth(
        { trialSalary: s.trialSalary, salary: s.salary, salaryMode: s.salaryMode, trialEndDate: s.trialEndDate },
        month
      );
      const bonuses = s.adjustments.filter((a) => a.type === 'BONUS').reduce((sum, a) => sum + a.amount, 0);
      const deductions = s.adjustments.filter((a) => a.type === 'DEDUCTION').reduce((sum, a) => sum + a.amount, 0);

      // Employment days within this month (UTC, inclusive)
      const [year, monthNum] = month.split('-').map(Number);
      const monthDays = new Date(Date.UTC(year, monthNum, 0)).getUTCDate();
      const rangeStart = Date.UTC(year, monthNum - 1, 1);
      const rangeEnd = Date.UTC(year, monthNum - 1, monthDays);
      const from = Math.max(s.hireDate.getTime(), rangeStart);
      const to = s.terminationDate ? Math.min(s.terminationDate.getTime(), rangeEnd) : rangeEnd;
      const workedDays = Math.max(0, Math.min(monthDays, Math.floor((to - from) / 86_400_000) + 1));

      // Partial months are paid pro-rata (base / 30 per day)
      const base = proratedBase(fullBase, workedDays, monthDays);

      const hireMonth = `${s.hireDate.getFullYear()}-${String(s.hireDate.getMonth() + 1).padStart(2, '0')}`;

      return {
        workedDays,
        monthDays,
        isNewHire: hireMonth === month,
        staffId: s.id,
        name: s.fullName || s.application?.applicantName || 'بدون اسم',
        currency: (s.currency === 'EGP' ? 'EGP' : 'SAR') as 'SAR' | 'EGP',
        base,
        bonuses,
        deductions,
        net: netSalary(base, bonuses, deductions),
        bankName: s.bankName,
        iban: s.iban,
        instapay: s.instapay,
        vodafoneCash: s.vodafoneCash,
      };
    });
}

export async function getPayrollMonth(month: string): Promise<PayrollMonthData> {
  await requireSuperAdmin();

  // A closed month reads from its frozen snapshot — never recomputed.
  const run = await prisma.payrollRun.findUnique({ where: { month } });
  if (run) {
    return {
      month,
      closed: true,
      closedAt: run.createdAt.toISOString(),
      rows: run.rows as unknown as PayrollRowData[],
      totals: run.totals as unknown as PayrollTotals,
    };
  }

  const rows = await computePayrollRows(month);
  return { month, closed: false, closedAt: null, rows, totals: computeTotals(rows) };
}

// Free daily FX rates, no key required — fetched once per close, not per view.
export async function getEgpRate(): Promise<{ rate: number | null }> {
  try {
    const res = await fetch('https://open.er-api.com/v6/latest/SAR', { next: { revalidate: 3600 } });
    const json = await res.json();
    const rate = typeof json?.rates?.EGP === 'number' ? json.rates.EGP : null;
    return { rate };
  } catch (error) {
    console.error('getEgpRate error:', error);
    return { rate: null };
  }
}

function monthLabelAr(month: string) {
  const [y, m] = month.split('-').map(Number);
  return new Date(y, m - 1, 1).toLocaleDateString('ar-SA-u-nu-latn-ca-gregory', { month: 'long', year: 'numeric' });
}

// Closing posts the payroll into the financial ledger automatically:
// one EXPENSE for Saudi salaries (SAR) and one for Egypt salaries converted
// to the SAR amount actually paid (user-confirmed at close time).
export async function closePayrollMonth(
  month: string,
  opts?: { egpInSar?: number; egpRate?: number }
): Promise<{ success: boolean; error?: string }> {
  try {
    const session = await requireSuperAdmin();

    const window = isCloseAllowed(month);
    if (!window.allowed) return { success: false, error: window.reason };

    const existing = await prisma.payrollRun.findUnique({ where: { month } });
    if (existing) return { success: false, error: 'هذا الشهر مقفل مسبقاً' };

    const rows = await computePayrollRows(month);
    if (rows.length === 0) return { success: false, error: 'لا يوجد موظفون في هذا الشهر' };

    const totals = computeTotals(rows);
    if (totals.EGP.net > 0 && (!opts?.egpInSar || opts.egpInSar <= 0)) {
      return { success: false, error: 'أدخل المبلغ المدفوع بالريال لرواتب مصر قبل الإقفال' };
    }
    if (totals.EGP.net > 0) {
      totals.meta = { egpInSar: opts!.egpInSar, egpRate: opts?.egpRate };
    }

    await prisma.payrollRun.create({
      data: {
        month,
        closedBy: session.user?.email || null,
        rows: rows as unknown as object[],
        totals: totals as unknown as object,
      },
    });

    // Post to the ledger under the «الرواتب» expense category (created once)
    let category = await prisma.category.findFirst({
      where: { label: 'الرواتب', type: 'EXPENSE' },
    });
    if (!category) {
      category = await prisma.category.create({
        data: { label: 'الرواتب', type: 'EXPENSE', order: 999 },
      });
    }

    const label = monthLabelAr(month);
    const entries: { amount: number; description: string }[] = [];
    if (totals.SAR.net > 0) {
      entries.push({ amount: totals.SAR.net, description: `رواتب ${label} — السعودية` });
    }
    if (totals.EGP.net > 0 && opts?.egpInSar) {
      entries.push({
        amount: opts.egpInSar,
        description: `رواتب ${label} — مصر (${totals.EGP.net.toLocaleString('en')} جنيه محوّلة بالريال)`,
      });
    }
    for (const entry of entries) {
      await prisma.transaction.create({
        data: {
          type: 'EXPENSE',
          amount: entry.amount,
          description: entry.description,
          categoryId: category.id,
          date: new Date(),
        },
      });
    }

    revalidatePath('/payroll');
    revalidatePath('/accounting');
    return { success: true };
  } catch (error) {
    console.error('closePayrollMonth error:', error);
    return { success: false, error: 'فشل إقفال الشهر' };
  }
}
