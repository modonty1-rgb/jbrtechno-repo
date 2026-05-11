'use server';

const WHATSAPP_PHONE = '+966554113107';
const WHATSAPP_API_KEY = '3675221';
const WHATSAPP_API_URL = 'https://api.callmebot.com/whatsapp.php';

export interface InterviewResponseNotificationPayload {
  applicantName: string;
  phone: string;
  email: string;
  position: string;
  lastJobExitReason: string;
  lastSalary: string;
  expectedSalary: string;
  canWorkHard: boolean | undefined;
  noticePeriod: string;
  preferredWorkLocation: string;
  whyInterestedInPosition: string;
  questionsAboutRole?: string;
  willingnessToRelocate: boolean | undefined;
  bestInterviewTime?: string;
  applicationId: string;
}

const truncate = (text: string | undefined, limit = 300): string | undefined => {
  if (!text) return undefined;
  const normalized = text.trim();
  if (normalized.length <= limit) return normalized;
  return `${normalized.slice(0, limit).trim()}…`;
};

export async function sendInterviewResponseNotification(
  payload: InterviewResponseNotificationPayload
): Promise<void> {
  try {
    const lastJobReason = truncate(payload.lastJobExitReason, 300);
    const canWorkHardText = payload.canWorkHard === true ? 'نعم' : payload.canWorkHard === false ? 'لا' : 'لم يُحدد';
    const willingnessToRelocateText = payload.willingnessToRelocate === true ? 'نعم' : payload.willingnessToRelocate === false ? 'لا' : 'لم يُحدد';
    
    const workLocationMap: Record<string, string> = {
      'OFFICE': 'مكتب',
      'REMOTE': 'عن بُعد',
      'HYBRID': 'هجين',
    };
    const preferredLocationText = workLocationMap[payload.preferredWorkLocation] || payload.preferredWorkLocation;
    
    const whyInterested = truncate(payload.whyInterestedInPosition, 300);
    const questions = truncate(payload.questionsAboutRole, 200);

    const adminLink = `${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/applications/${payload.applicationId}`;

    const lines = [
      '📋 استجابة مقابلة جديدة',
      '',
      `الاسم: ${payload.applicantName}`,
      `الوظيفة: ${payload.position}`,
      '',
      '📝 معلومات المقابلة:',
      '',
      lastJobReason
        ? `سبب ترك آخر وظيفة:\n${lastJobReason}`
        : undefined,
      '',
      `آخر راتب: ${payload.lastSalary}`,
      `الراتب المتوقع: ${payload.expectedSalary}`,
      `القدرة على العمل تحت ظروف صعبة: ${canWorkHardText}`,
      '',
      '📅 معلومات التوفر:',
      `جاهز للبدء: ${payload.noticePeriod}`,
      `موقع العمل المفضل: ${preferredLocationText}`,
      `الاستعداد للانتقال: ${willingnessToRelocateText}`,
      payload.bestInterviewTime ? `أفضل وقت للمقابلة: ${payload.bestInterviewTime}` : undefined,
      '',
      whyInterested
        ? `لماذا مهتم بالوظيفة:\n${whyInterested}`
        : undefined,
      '',
      questions
        ? `أسئلة المرشح:\n${questions}`
        : undefined,
      questions ? '' : undefined,
      '📞 معلومات الاتصال:',
      `الجوال: ${payload.phone}`,
      `البريد: ${payload.email}`,
      '',
      `🔗 رابط الطلب:\n${adminLink}`,
      '',
      `⏰ أُرسل في: ${new Date().toLocaleString('ar-SA', {
        timeZone: 'Asia/Riyadh',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      })}`,
    ].filter((line): line is string => Boolean(line));

    const whatsappMessage = lines.join('\n');

    const whatsappUrl = `${WHATSAPP_API_URL}?phone=${WHATSAPP_PHONE}&text=${encodeURIComponent(
      whatsappMessage
    )}&apikey=${WHATSAPP_API_KEY}`;

    const response = await fetch(whatsappUrl);
    const result = await response.text();

    if (!result.includes('Message queued') && !result.includes('queued')) {
      console.error('WhatsApp API response:', result);
    } else {
      console.log('Interview response WhatsApp notification sent successfully');
    }
  } catch (error) {
    console.error('Error sending interview response WhatsApp notification:', error);
  }
}

