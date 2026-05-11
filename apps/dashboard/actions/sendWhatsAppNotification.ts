'use server';

const WHATSAPP_PHONE = '+966554113107';
const WHATSAPP_API_KEY = '3675221';
const WHATSAPP_API_URL = 'https://api.callmebot.com/whatsapp.php';

export interface WhatsAppNotificationPayload {
  applicantName: string;
  phone: string;
  email: string;
  position: string;
  yearsOfExperience?: number;
  availabilityDate?: Date | string | null;
  currentLocation?: string | null;
  arabicProficiency?: string | null;
  englishProficiency?: string | null;
  skills?: string[];
  message?: string;
}

const formatDate = (value: Date | string | null | undefined): string | undefined => {
  if (!value) return undefined;
  if (typeof value === 'string') {
    return value.trim() ? value : undefined;
  }
  return value.toISOString().split('T')[0];
};

const formatLanguage = (value: string | null | undefined): string | undefined => {
  if (!value) return undefined;
  const map: Record<string, string> = {
    excellent: 'ممتاز',
    very_good: 'جيد جدًا',
    good: 'جيد',
    fair: 'مقبول',
  };
  return map[value] ?? value;
};

const truncate = (text: string | undefined, limit = 200): string | undefined => {
  if (!text) return undefined;
  const normalized = text.trim();
  if (normalized.length <= limit) return normalized;
  return `${normalized.slice(0, limit).trim()}…`;
};

export async function sendWhatsAppNotification(
  payload: WhatsAppNotificationPayload
): Promise<void> {
  try {
    const availability = formatDate(payload.availabilityDate);
    const experience =
      typeof payload.yearsOfExperience === 'number'
        ? `${payload.yearsOfExperience} سنة`
        : undefined;
    const location = payload.currentLocation?.trim()
      ? payload.currentLocation.trim()
      : undefined;

    const arabic = formatLanguage(payload.arabicProficiency);
    const english = formatLanguage(payload.englishProficiency);

    const topSkills =
      payload.skills && payload.skills.length > 0
        ? payload.skills.slice(0, 3).join(', ')
        : undefined;

    const coverLetterSummary = truncate(payload.message, 200);

    const lines = [
      '🔔 طلب توظيف جديد',
      '',
      `الاسم: ${payload.applicantName}`,
      `الوظيفة: ${payload.position}`,
      experience ? `سنوات الخبرة: ${experience}` : undefined,
      availability ? `جاهز للعمل من: ${availability}` : undefined,
      location ? `الموقع الحالي: ${location}` : undefined,
      arabic || english
        ? `العربية: ${arabic ?? 'غير محدد'} | الإنجليزية: ${english ?? 'غير محدد'
        }`
        : undefined,
      topSkills ? `المهارات الرئيسية: ${topSkills}` : undefined,
      '',
      coverLetterSummary
        ? `القيمة التي سيضيفها المرشح:\n${coverLetterSummary}`
        : undefined,
      '',
      `الجوال: ${payload.phone}`,
      `البريد: ${payload.email}`,
      '',
      `أُرسل في: ${new Date().toLocaleString('en-US', {
        timeZone: 'Asia/Riyadh',
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
      console.log('WhatsApp notification sent successfully');
    }
  } catch (error) {
    console.error('Error sending WhatsApp notification:', error);
  }
}

