'use server';

import { prisma } from '@jbrtechno/database';
import { ApplicationStatus } from '@jbrtechno/database';
import { revalidatePath } from 'next/cache';

export interface UpdateApplicationResult {
  success: boolean;
  error?: string;
}

export async function updateApplicationStatus(
  applicationId: string,
  status: ApplicationStatus
): Promise<UpdateApplicationResult> {
  try {
    await prisma.application.update({
      where: { id: applicationId },
      data: { status },
    });

    revalidatePath('/[locale]/admin/applications');
    revalidatePath(`/[locale]/admin/applications/${applicationId}`);

    return { success: true };
  } catch (error) {
    console.error('Error updating application status:', error);
    return {
      success: false,
      error: 'Failed to update status. Please try again.',
    };
  }
}

export async function updateApplicationNotes(
  applicationId: string,
  notes: string
): Promise<UpdateApplicationResult> {
  try {
    await prisma.application.update({
      where: { id: applicationId },
      data: { adminNotes: notes },
    });

    revalidatePath(`/[locale]/admin/applications/${applicationId}`);

    return { success: true };
  } catch (error) {
    console.error('Error updating application notes:', error);
    return {
      success: false,
      error: 'Failed to update notes. Please try again.',
    };
  }
}

export async function updateApplicationPhone(
  applicationId: string,
  phone: string
): Promise<UpdateApplicationResult> {
  try {
    await prisma.application.update({
      where: { id: applicationId },
      data: { phone },
    });

    revalidatePath(`/[locale]/admin/applications/${applicationId}`);

    return { success: true };
  } catch (error) {
    console.error('Error updating application phone:', error);
    return {
      success: false,
      error: 'Failed to update phone number. Please try again.',
    };
  }
}

export async function updateScheduledInterviewDate(
  applicationId: string,
  scheduledDate: Date | null
): Promise<UpdateApplicationResult> {
  try {
    await prisma.application.update({
      where: { id: applicationId },
      data: { scheduledInterviewDate: scheduledDate },
    });

    revalidatePath(`/[locale]/admin/applications/${applicationId}`);

    return { success: true };
  } catch (error) {
    console.error('Error updating scheduled interview date:', error);
    return {
      success: false,
      error: 'Failed to update scheduled interview date. Please try again.',
    };
  }
}

export async function updateAppointmentConfirmed(
  applicationId: string,
  confirmed: boolean
): Promise<UpdateApplicationResult> {
  try {
    await prisma.application.update({
      where: { id: applicationId },
      data: { appointmentConfirmed: confirmed },
    });

    revalidatePath('/[locale]/admin/applications/interviews');
    revalidatePath(`/[locale]/admin/applications/${applicationId}`);

    return { success: true };
  } catch (error) {
    console.error('Error updating appointment confirmation:', error);
    return {
      success: false,
      error: 'Failed to update appointment confirmation. Please try again.',
    };
  }
}

