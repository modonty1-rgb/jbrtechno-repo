'use server';

import { auth } from '@/lib/auth';
import { prisma } from '@jbrtechno/database';
import { UserRole, TargetAudience } from '@jbrtechno/database';
import { sendEmail } from '@/lib/email';

interface SendNotificationEmailOptions {
  noteId: string;
  title: string;
  content: string;
  targetAudience: TargetAudience;
  targetUserId?: string | null;
  department?: string | null;
}

export async function sendNotificationEmails(
  options: SendNotificationEmailOptions
): Promise<{ success: boolean; error?: string }> {
  try {
    const session = await auth();

    if (!session?.user) {
      return { success: false, error: 'Unauthorized' };
    }

    // Get target users based on audience
    let targetUsers: Array<{ email: string; name: string | null }> = [];

    if (options.targetAudience === TargetAudience.ALL) {
      let allUsers;
      try {
        allUsers = await prisma.user.findMany({
          where: {
            isActive: true,
            role: {
              in: [UserRole.SUPER_ADMIN, UserRole.STAFF],
            },
          },
          select: { email: true, name: true },
        });
      } catch (error: any) {
        if (error.message?.includes('not found in enum') || error.message?.includes('ADMIN')) {
          console.error('Database contains users with invalid role values. Please run: npx tsx scripts/migrate-user-roles.ts');
          return { success: false, error: 'Database contains invalid user roles. Please run the migration script.' };
        }
        throw error;
      }
      targetUsers = allUsers;
    } else if (options.targetAudience === TargetAudience.ADMIN) {
      const adminUsers = await prisma.user.findMany({
        where: {
          isActive: true,
          role: UserRole.SUPER_ADMIN,
        },
        select: { email: true, name: true },
      });
      targetUsers = adminUsers;
    } else if (options.targetAudience === TargetAudience.STAFF) {
      const staffUsers = await prisma.user.findMany({
        where: {
          isActive: true,
          role: UserRole.STAFF,
        },
        select: { email: true, name: true },
      });
      targetUsers = staffUsers;
    } else if (options.targetAudience === TargetAudience.SPECIFIC_USER && options.targetUserId) {
      const user = await prisma.user.findUnique({
        where: { id: options.targetUserId },
        select: { email: true, name: true },
      });
      if (user) {
        targetUsers = [user];
      }
    } else if (options.targetAudience === TargetAudience.SPECIFIC_DEPARTMENT && options.department) {
      const staffInDept = await prisma.staff.findMany({
        where: {
          department: options.department,
          status: 'ACTIVE',
          user: { isActive: true },
        },
        include: {
          user: {
            select: { email: true, name: true },
          },
        },
      });
      targetUsers = staffInDept
        .filter((s) => s.user)
        .map((s) => s.user!);
    }

    if (targetUsers.length === 0) {
      return { success: true };
    }

    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';
    const noteUrl = `${siteUrl}/notes/${options.noteId}`;

    const emailHtml = `
      <!DOCTYPE html>
      <html dir="rtl" lang="ar">
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
        </head>
        <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 20px; border-radius: 8px; margin-bottom: 20px;">
            <h1 style="color: white; margin: 0;">إشعار جديد</h1>
          </div>
          
          <div style="background: #f9fafb; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
            <h2 style="margin-top: 0; color: #1f2937;">${options.title}</h2>
            <div style="white-space: pre-wrap;">${options.content}</div>
          </div>
          
          <div style="text-align: center; margin: 30px 0;">
            <a href="${noteUrl}" style="background: #667eea; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">
              عرض التفاصيل
            </a>
          </div>
          
          <div style="border-top: 1px solid #e5e7eb; padding-top: 20px; margin-top: 30px; font-size: 12px; color: #6b7280; text-align: center;">
            <p>تم إرسال هذا الإشعار من نظام إدارة الفريق</p>
            <p>إذا لم تطلب هذا الإشعار، يمكنك تجاهله.</p>
          </div>
        </body>
      </html>
    `;

    const emailText = `
إشعار جديد

${options.title}

${options.content}

عرض التفاصيل: ${noteUrl}

---
تم إرسال هذا الإشعار من نظام إدارة الفريق
    `.trim();

    const emails = targetUsers.map((u) => u.email);
    const result = await sendEmail({
      to: emails,
      subject: `إشعار جديد: ${options.title}`,
      html: emailHtml,
      text: emailText,
    });

    return result;
  } catch (error) {
    console.error('Error sending notification emails:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to send notification emails',
    };
  }
}

