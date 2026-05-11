'use server';

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
      error:
        locale === 'ar'
          ? 'تعذّر إرسال الرسالة. يرجى المحاولة مرة أخرى خلال لحظات.'
          : 'Unable to submit your message right now. Please try again shortly.',
    };
  }
}

function getLocalizedValidationMessage(issue: ZodIssue | undefined, locale: string) {
  const isArabic = locale === 'ar';

  if (!issue) {
    return isArabic
      ? 'يرجى التحقق من البيانات المدخلة وإعادة المحاولة.'
      : 'Please review the details and try again.';
  }

  const field = issue.path?.[0];

  if (field === 'message') {
    return isArabic
      ? 'أضف بعض التفاصيل الإضافية في الرسالة حتى نتمكن من مساعدتك (20 حرفًا على الأقل).'
      : 'Please add a bit more detail in your message so we can help (minimum 20 characters).';
  }

  if (field === 'fullName') {
    return isArabic
      ? 'الرجاء كتابة اسمك الكامل كما تود أن نخاطبك.'
      : 'Please share your full name so we know how to address you.';
  }

  if (field === 'email') {
    return isArabic
      ? 'تأكد من كتابة بريد إلكتروني صالح لنتواصل معك عليه.'
      : 'Please enter a valid email address so we can reach you.';
  }

  if (field === 'phone') {
    return isArabic
      ? 'يرجى كتابة رقم واتساب بصيغة صحيحة (مثال: ‎+966XXXXXXXXX).'
      : 'Please enter a WhatsApp number in the correct format (e.g. +966XXXXXXXXX).';
  }

  if (field === 'subject') {
    return isArabic
      ? 'اختر الموضوع الأقرب لسؤالك حتى نوجّه رسالتك للفريق المناسب.'
      : 'Please choose the topic that best matches your question.';
  }

  return isArabic
    ? 'يرجى التحقق من البيانات المدخلة وإعادة المحاولة.'
    : 'Please review the details and try again.';
}

