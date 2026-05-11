import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@jbrtechno/database';
import { generateSecurePassword } from '@/helpers/generatePassword';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const token = searchParams.get('token');
    const email = searchParams.get('email');

    if (!token || !email) {
      return NextResponse.json(
        { success: false, error: 'Missing token or email' },
        { status: 400 }
      );
    }

    // Decode token (simple implementation - in production, use proper token validation)
    try {
      const decoded = Buffer.from(token, 'base64').toString('utf-8');
      const [userId, timestamp] = decoded.split(':');
      
      // Check if token is expired (24 hours)
      const tokenAge = Date.now() - parseInt(timestamp, 10);
      const twentyFourHours = 24 * 60 * 60 * 1000;
      
      if (tokenAge > twentyFourHours) {
        return NextResponse.json(
          { success: false, error: 'Token expired' },
          { status: 400 }
        );
      }

      // Verify user exists and email matches
      const user = await prisma.user.findUnique({
        where: { id: userId },
      });

      if (!user || user.email !== email) {
        return NextResponse.json(
          { success: false, error: 'Invalid token' },
          { status: 400 }
        );
      }

      // Generate new password
      const newPassword = generateSecurePassword(12);

      // Update user password
      await prisma.user.update({
        where: { id: userId },
        data: {
          password: newPassword,
        },
      });

      // Return success page with new password
      const html = `
        <!DOCTYPE html>
        <html dir="rtl" lang="ar">
          <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>تم إعادة تعيين كلمة المرور</title>
          </head>
          <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 50px auto; padding: 20px;">
            <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 20px; border-radius: 8px; margin-bottom: 20px;">
              <h1 style="color: white; margin: 0;">تم إعادة تعيين كلمة المرور بنجاح</h1>
            </div>
            
            <div style="background: #f9fafb; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
              <p>تم إعادة تعيين كلمة المرور لحسابك بنجاح.</p>
              <p><strong>كلمة المرور الجديدة:</strong></p>
              <div style="background: white; padding: 15px; border: 2px solid #667eea; border-radius: 6px; font-family: monospace; font-size: 18px; text-align: center; margin: 20px 0;">
                ${newPassword}
              </div>
              <p style="color: #dc2626; font-weight: bold;">⚠️ يرجى حفظ كلمة المرور هذه في مكان آمن. لن يتم إرسالها مرة أخرى.</p>
            </div>
            
            <div style="text-align: center; margin: 30px 0;">
              <a href="/login" style="background: #667eea; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">
                تسجيل الدخول
              </a>
            </div>
          </body>
        </html>
      `;

      return new NextResponse(html, {
        headers: {
          'Content-Type': 'text/html; charset=utf-8',
        },
      });
    } catch (decodeError) {
      return NextResponse.json(
        { success: false, error: 'Invalid token format' },
        { status: 400 }
      );
    }
  } catch (error) {
    console.error('Error processing password reset:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to reset password',
      },
      { status: 500 }
    );
  }
}





