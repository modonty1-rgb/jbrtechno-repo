'use server';

import { revalidatePath } from 'next/cache';
import { prisma } from '@jbrtechno/database';
import {
  contactMessageSchema,
  ContactMessageInput,
} from '@jbrtechno/shared';
import { ZodError, type ZodIssue } from 'zod';

export interface SubmitContactMessageResult {
  success: boolean;
  error?: string;
}

export async function submitContactMessage(
  input: ContactMessageInput
): Promise<SubmitContactMessageResult> {
  const locale =
    typeof input === 'object' && input && 'locale' in input && input.locale
      ? input.locale
      : 'en';

  try {
    const validated = contactMessageSchema.parse({
      ...input,
      phone: input.phone?.trim().length ? input.phone.trim() : undefined,
    });

    await prisma.contactMessage.create({
      data: {
        fullName: validated.fullName,
        email: validated.email,
        phone: validated.phone ?? null,
        subject: validated.subject,
        message: validated.message,
        locale: validated.locale,
      },
    });

    revalidatePath(`/${validated.locale}/admin/contact-messages`, 'page');

    return {
      success: true,
    };
  } catch (error) {
    if (error instanceof ZodError) {
      const firstIssue = error.issues[0];
      return {
        success: false,
        error: getLocalizedValidationMessage(firstIssue, locale),
      };
    }

    console.error('submitContactMessage error:', error);

    return {
      success: false,
      error: 'تعذّر إرسال الرسالة. يرجى المحاولة مرة أخرى خلال لحظات.',
    };
  }
}

function getLocalizedValidationMessage(issue: ZodIssue | undefined, locale: string) {
  if (!issue) {
    return 'يرجى التحقق من البيانات المدخلة وإعادة المحاولة.';
  }

  const field = issue.path?.[0];

  if (field === 'message') {
    return 'أضف بعض التفاصيل الإضافية في الرسالة حتى نتمكن من مساعدتك (20 حرفًا على الأقل).';
  }

  if (field === 'fullName') {
    return 'الرجاء كتابة اسمك الكامل كما تود أن نخاطبك.';
  }

  if (field === 'email') {
    return 'تأكد من كتابة بريد إلكتروني صالح لنتواصل معك عليه.';
  }

  if (field === 'phone') {
    return 'يرجى كتابة رقم واتساب بصيغة صحيحة (مثال: ‎+966XXXXXXXXX).';
  }

  if (field === 'subject') {
    return 'اختر الموضوع الأقرب لسؤالك حتى نوجّه رسالتك للفريق المناسب.';
  }

  return 'يرجى التحقق من البيانات المدخلة وإعادة المحاولة.';
}

