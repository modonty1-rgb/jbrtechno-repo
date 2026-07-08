'use server';

const TG_BOT_TOKEN = process.env.JBRTECHNO_TELEGRAM_BOT_TOKEN;
const TG_CHAT_ID = process.env.JBRTECHNO_TELEGRAM_CHAT_ID;

async function postToTelegram(text: string): Promise<void> {
  if (!TG_BOT_TOKEN || !TG_CHAT_ID) {
    console.warn('Telegram credentials not configured — skipping notification');
    return;
  }
  try {
    const res = await fetch(
      `https://api.telegram.org/bot${TG_BOT_TOKEN}/sendMessage`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          chat_id: TG_CHAT_ID,
          text,
          parse_mode: 'HTML',
          disable_web_page_preview: true,
        }),
      },
    );
    if (!res.ok) {
      console.error('Telegram API error:', res.status, await res.text());
    }
  } catch (err) {
    console.error('Telegram send failed:', err);
  }
}

const escapeHtml = (str: string): string =>
  str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

// ─────────────────────────────────────────────────────────────
//  Notification A — visitor clicked "Visit Modonty"
// ─────────────────────────────────────────────────────────────

export interface TelegramVisitPayload {
  city?: string | null;
  country?: string | null;
}

const COUNTRY_AR: Record<string, string> = {
  SA: 'السعودية',
  AE: 'الإمارات',
  KW: 'الكويت',
  QA: 'قطر',
  BH: 'البحرين',
  OM: 'عُمان',
  EG: 'مصر',
  JO: 'الأردن',
  LB: 'لبنان',
  IQ: 'العراق',
  SY: 'سوريا',
  YE: 'اليمن',
  MA: 'المغرب',
  DZ: 'الجزائر',
  TN: 'تونس',
  LY: 'ليبيا',
  SD: 'السودان',
  PS: 'فلسطين',
};

export async function sendTelegramVisitNotification(
  payload: TelegramVisitPayload,
): Promise<void> {
  const now = new Date();
  const date = now.toLocaleDateString('en-GB', {
    timeZone: 'Asia/Riyadh',
  });
  const time = now.toLocaleTimeString('en-GB', {
    timeZone: 'Asia/Riyadh',
    hour: '2-digit',
    minute: '2-digit',
  });
  const city = payload.city ? decodeURIComponent(payload.city) : 'غير معروف';
  const countryCode = payload.country?.toUpperCase() ?? '';
  const country = COUNTRY_AR[countryCode] || countryCode || 'غير معروف';

  const text = [
    '🌐 <b>زائر تحوّل لمدونتي</b>',
    '',
    `📅 ${escapeHtml(date)} · ⏰ ${escapeHtml(time)} (Riyadh)`,
    `📍 ${escapeHtml(city)}، ${escapeHtml(country)}`,
  ].join('\n');

  await postToTelegram(text);
}

// ─────────────────────────────────────────────────────────────
//  Notification B — job application submitted
// ─────────────────────────────────────────────────────────────

export interface TelegramApplicationPayload {
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
  lastSalary?: string | null;
  expectedSalary?: string | null;
}

const formatDate = (value: Date | string | null | undefined): string | undefined => {
  if (!value) return undefined;
  if (typeof value === 'string') return value.trim() ? value : undefined;
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

export async function sendTelegramApplicationNotification(
  payload: TelegramApplicationPayload,
): Promise<void> {
  const availability = formatDate(payload.availabilityDate);
  const experience =
    typeof payload.yearsOfExperience === 'number'
      ? `${payload.yearsOfExperience} سنة`
      : undefined;
  const location = payload.currentLocation?.trim() || undefined;
  const arabic = formatLanguage(payload.arabicProficiency);
  const english = formatLanguage(payload.englishProficiency);
  const topSkills =
    payload.skills && payload.skills.length > 0
      ? payload.skills.slice(0, 3).join('، ')
      : undefined;
  const coverLetterSummary = truncate(payload.message, 200);
  const lastSalary = payload.lastSalary?.trim() || undefined;
  const expectedSalary = payload.expectedSalary?.trim() || undefined;
  const sentAt = new Date().toLocaleString('ar-SA', {
    timeZone: 'Asia/Riyadh',
  });

  const lines: (string | undefined)[] = [
    '🔔 <b>طلب توظيف جديد</b>',
    '',
    `<b>الاسم:</b> ${escapeHtml(payload.applicantName)}`,
    `<b>الوظيفة:</b> ${escapeHtml(payload.position)}`,
    experience ? `<b>سنوات الخبرة:</b> ${escapeHtml(experience)}` : undefined,
    availability ? `<b>جاهز للعمل من:</b> ${escapeHtml(availability)}` : undefined,
    location ? `<b>الموقع الحالي:</b> ${escapeHtml(location)}` : undefined,
    arabic || english
      ? `<b>اللغات:</b> العربية ${escapeHtml(arabic ?? 'غير محدد')} · الإنجليزية ${escapeHtml(english ?? 'غير محدد')}`
      : undefined,
    topSkills ? `<b>المهارات الرئيسية:</b> ${escapeHtml(topSkills)}` : undefined,
    lastSalary ? `<b>الراتب السابق:</b> ${escapeHtml(lastSalary)}` : undefined,
    expectedSalary ? `<b>الراتب المتوقع:</b> ${escapeHtml(expectedSalary)}` : undefined,
    '',
    coverLetterSummary
      ? `<b>القيمة التي سيضيفها المرشح:</b>\n${escapeHtml(coverLetterSummary)}`
      : undefined,
    '',
    `<b>الجوال:</b> <a href="https://wa.me/${escapeHtml(payload.phone.replace(/^\+/, ''))}">${escapeHtml(payload.phone)}</a> (افتح واتساب 💬)`,
    `<b>البريد:</b> ${escapeHtml(payload.email)}`,
    '',
    `<i>أُرسل في: ${escapeHtml(sentAt)}</i>`,
  ];

  const text = lines.filter((line): line is string => line !== undefined).join('\n');
  await postToTelegram(text);
}
