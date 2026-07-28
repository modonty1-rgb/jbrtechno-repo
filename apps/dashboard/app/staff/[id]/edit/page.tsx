import { prisma } from '@jbrtechno/database';
import { notFound } from 'next/navigation';
import { getStaffById } from '@/actions/staff';
import { NewStaffForm } from '../../new/NewStaffForm';

export const dynamic = 'force-dynamic';

const toDateInput = (d: Date | null) => (d ? new Date(d).toISOString().slice(0, 10) : '');

export default async function EditStaffPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  const [result, positions] = await Promise.all([
    getStaffById(id),
    prisma.position.findMany({ select: { title: true }, orderBy: [{ phase: 'asc' }, { order: 'asc' }] }).catch(() => []),
  ]);

  if (!result.success || !result.staff) notFound();
  const s = result.staff;

  return (
    <NewStaffForm
      positionTitles={positions.map((p) => p.title)}
      staffId={s.id}
      initialValues={{
        fullName: s.fullName ?? '',
        department: s.department ?? '',
        status: s.status,
        jobDuties: s.jobDuties ?? '',
        nationalId: s.nationalId ?? '',
        nationality: s.nationality ?? '',
        birthDate: toDateInput(s.birthDate),
        phone: s.phone ?? '',
        officialEmail: s.officialEmail ?? '',
        personalEmail: s.personalEmail ?? '',
        country: s.country ?? 'السعودية',
        city: s.city ?? '',
        address: s.address ?? '',
        hireDate: toDateInput(s.hireDate),
        bankName: s.bankName ?? '',
        iban: s.iban ?? '',
        instapay: s.instapay ?? '',
        vodafoneCash: s.vodafoneCash ?? '',
        trialMonths: s.trialMonths ?? 3,
        trialSalary: s.trialSalary ? String(s.trialSalary) : '',
        salaryMode: s.salaryMode ?? 'AGREED',
        postTrialSalary: s.salary ? String(s.salary) : '',
        offerAccepted: !!s.offerAcceptedDate,
        contractSigned: !!s.contractSignedDate,
        ndaSigned: !!s.ndaSignedDate,
        emergencyName: s.emergencyContact1?.name ?? '',
        emergencyPhone: s.emergencyContact1?.phone ?? '',
        notes: s.notes ?? '',
      }}
      existingFiles={{ photoUrl: s.photoUrl, idCardUrl: s.idCardUrl, cvUrl: s.cvUrl || s.application?.cvUrl }}
    />
  );
}
