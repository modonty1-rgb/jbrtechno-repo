'use server';

interface EmailOptions {
  to: string | string[];
  subject: string;
  html: string;
  text?: string;
}

export async function sendEmail(options: EmailOptions): Promise<{ success: boolean; error?: string }> {
  try {
    // Check if Resend API key is configured
    const resendApiKey = process.env.RESEND_API_KEY;
    const fromEmail = process.env.RESEND_FROM_EMAIL;

    if (!resendApiKey) {
      console.warn('Resend API key not configured. Set RESEND_API_KEY environment variable.');
      return { success: false, error: 'Email service not configured' };
    }

    if (!fromEmail) {
      console.warn('Resend from email not configured. Set RESEND_FROM_EMAIL environment variable (e.g., [email protected] or Your Name <[email protected]>).');
      return { success: false, error: 'From email not configured' };
    }

    try {
      const { Resend } = await import('resend');
      
      const resend = new Resend(resendApiKey);

      const recipients = Array.isArray(options.to) ? options.to : [options.to];

      const result = await resend.emails.send({
        from: fromEmail,
        to: recipients,
        subject: options.subject,
        html: options.html,
        text: options.text || options.html.replace(/<[^>]*>/g, ''),
      });

      if (result.error) {
        console.error('Resend API error:', result.error);
        return {
          success: false,
          error: result.error.message || 'Failed to send email via Resend',
        };
      }

      return { success: true };
    } catch (importError) {
      console.error('resend not installed. Run: npm install resend');
      return { success: false, error: 'Resend library not installed' };
    }
  } catch (error) {
    console.error('Error sending email:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to send email',
    };
  }
}
