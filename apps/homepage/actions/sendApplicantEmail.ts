'use server';

const RESEND_API_KEY = process.env.JBRTECHNO_RESEND_API_KEY;
const RESEND_FROM = process.env.JBRTECHNO_RESEND_FROM_EMAIL;

export interface ApplicantEmailPayload {
  applicantName: string;
  email: string;
  position: string;
}

const escapeHtml = (str: string): string =>
  str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

export async function sendApplicantConfirmationEmail(
  payload: ApplicantEmailPayload,
): Promise<void> {
  if (!RESEND_API_KEY || !RESEND_FROM) {
    console.warn('Resend credentials not configured — skipping applicant email');
    return;
  }

  const name = escapeHtml(payload.applicantName);
  const position = escapeHtml(payload.position);

  const subject = `✅ استلمنا طلبك — JBRTECHNO`;

  const html = `<!DOCTYPE html>
<html dir="rtl" lang="ar">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <style>
    body { margin: 0; padding: 0; background: #f4f4f5; font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Tahoma, Arial, sans-serif; line-height: 1.7; color: #18181b; }
    .container { max-width: 560px; margin: 32px auto; background: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 1px 3px rgba(0,0,0,0.08); }
    .header { background: linear-gradient(135deg, #1e3a8a, #3b82f6); color: white; padding: 32px 24px; text-align: center; }
    .header h1 { margin: 0; font-size: 22px; font-weight: 700; }
    .body { padding: 28px 24px; font-size: 15px; }
    .body p { margin: 0 0 14px; }
    .footer { padding: 20px 24px; background: #fafafa; border-top: 1px solid #e4e4e7; font-size: 12px; color: #71717a; text-align: center; }
    .brand { color: #3b82f6; font-weight: 600; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>✅ استلمنا طلبك</h1>
    </div>
    <div class="body" dir="rtl">
      <p>أهلاً ${name} 👋</p>
      <p>استلمنا طلبك للتقديم على وظيفة <strong>${position}</strong> في <span class="brand">JBRTECHNO</span>.</p>
      <p>في حال تأهلك للمقابلة، سيتم التواصل معك لتحديد موعدها عبر واتساب على الرقم المسجّل في الطلب.</p>
      <p>شكراً لوقتك واهتمامك بالعمل معنا 🙏</p>
    </div>
    <div class="footer">
      <strong>JBRTECHNO Careers</strong><br />
      هذا إيميل أوتوماتيك — لا ترد عليه
    </div>
  </div>
</body>
</html>`;

  const text = [
    `أهلاً ${payload.applicantName}،`,
    '',
    `استلمنا طلبك للتقديم على وظيفة ${payload.position} في JBRTECHNO.`,
    '',
    'في حال تأهلك للمقابلة، سيتم التواصل معك لتحديد موعدها عبر واتساب على الرقم المسجّل في الطلب.',
    '',
    'شكراً لوقتك واهتمامك بالعمل معنا.',
    '',
    '---',
    'JBRTECHNO Careers',
    'هذا إيميل أوتوماتيك — لا ترد عليه',
  ].join('\n');

  try {
    const { Resend } = await import('resend');
    const resend = new Resend(RESEND_API_KEY);
    const result = await resend.emails.send({
      from: RESEND_FROM,
      to: [payload.email],
      subject,
      html,
      text,
    });
    if (result.error) {
      console.error('Resend send error:', result.error);
    }
  } catch (err) {
    console.error('Applicant email failed:', err);
  }
}
