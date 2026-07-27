'use server';

import { auth } from '@/lib/auth';
import { prisma } from '@jbrtechno/database';
import { UserRole } from '@jbrtechno/database';
import { revalidatePath } from 'next/cache';
import { logActivity } from '@/lib/activityLog';

export async function getAllUsers() {
  const session = await auth();

  if (!session?.user || session.user.role !== UserRole.SUPER_ADMIN) {
    throw new Error('Unauthorized');
  }

  let users;
  try {
    users = await prisma.user.findMany({
      where: {
        role: {
          in: [UserRole.SUPER_ADMIN, UserRole.STAFF],
        },
      },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        isActive: true,
        lastLogin: true,
        createdAt: true,
        updatedAt: true,
        staff: {
          select: {
            id: true,
            clockifyUserId: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
  } catch (error: any) {
    // If error is due to invalid enum values in database, log and suggest migration
    if (error.message?.includes('not found in enum') || error.message?.includes('ADMIN')) {
      console.error('Database contains users with invalid role values. Please run: npx tsx scripts/migrate-user-roles.ts');
      throw new Error('Database contains invalid user roles. Please run the migration script: npx tsx scripts/migrate-user-roles.ts');
    }
    throw error;
  }

  return users;
}

export async function createUser(
  email: string,
  password: string | undefined,
  role: UserRole,
  name?: string
) {
  const session = await auth();

  if (!session?.user || session.user.role !== UserRole.SUPER_ADMIN) {
    throw new Error('Unauthorized');
  }

  // Cannot create SUPER_ADMIN via UI
  if (role === UserRole.SUPER_ADMIN) {
    throw new Error('Cannot create SUPER_ADMIN user');
  }

  // Check if email already exists
  const existingUser = await prisma.user.findUnique({
    where: { email },
  });

  if (existingUser) {
    throw new Error('User with this email already exists');
  }

  // Generate password if not provided
  let finalPassword: string;
  if (password && password.trim()) {
    finalPassword = password;
  } else {
    const { generateSecurePassword } = await import('@/helpers/generatePassword');
    finalPassword = generateSecurePassword(12);
  }

  await prisma.user.create({
    data: {
      email,
      password: finalPassword, // Plain text
      role,
      name: name || null,
      isActive: true,
    },
  });

  await logActivity({
    userId: session.user.id,
    type: 'USER_CREATED',
    description: `Created user: ${email} with role ${role}`,
  });

  revalidatePath('/users');
}

export async function updateUserClockifyId(
  userId: string,
  clockifyUserId: string | null
) {
  const session = await auth();

  if (!session?.user || session.user.role !== UserRole.SUPER_ADMIN) {
    throw new Error('Unauthorized');
  }

  // Find staff record linked to this user
  const staff = await prisma.staff.findFirst({
    where: { userId },
    select: { id: true },
  });

  if (!staff) {
    throw new Error('No staff record linked to this user');
  }

  await prisma.staff.update({
    where: { id: staff.id },
    data: {
      clockifyUserId: clockifyUserId && clockifyUserId.trim()
        ? clockifyUserId.trim()
        : null,
    },
  });

  revalidatePath('/admin/users');
}

export async function updateUser(
  id: string,
  data: {
    name?: string;
    role?: UserRole;
    isActive?: boolean;
  }
) {
  const session = await auth();

  if (!session?.user || session.user.role !== UserRole.SUPER_ADMIN) {
    throw new Error('Unauthorized');
  }

  // Check if user exists
  const user = await prisma.user.findUnique({
    where: { id },
  });

  if (!user) {
    throw new Error('User not found');
  }

  // Cannot change SUPER_ADMIN role
  if (user.role === UserRole.SUPER_ADMIN && data.role && data.role !== UserRole.SUPER_ADMIN) {
    throw new Error('Cannot change SUPER_ADMIN role');
  }

  // Cannot create another SUPER_ADMIN
  if (data.role === UserRole.SUPER_ADMIN && user.role !== UserRole.SUPER_ADMIN) {
    throw new Error('Cannot assign SUPER_ADMIN role');
  }

  await prisma.user.update({
    where: { id },
    data,
  });

  await logActivity({
    userId: session.user.id,
    type: 'USER_UPDATED',
    description: `Updated user: ${user.email}`,
    metadata: { updatedFields: Object.keys(data) },
  });

  revalidatePath('/admin/users');
}

export async function deleteUser(id: string) {
  const session = await auth();

  if (!session?.user || session.user.role !== UserRole.SUPER_ADMIN) {
    throw new Error('Unauthorized');
  }

  // Cannot delete self
  if (session.user.id === id) {
    throw new Error('Cannot delete your own account');
  }

  // Check if user exists
  const user = await prisma.user.findUnique({
    where: { id },
  });

  if (!user) {
    throw new Error('User not found');
  }

  await prisma.user.delete({
    where: { id },
  });

  await logActivity({
    userId: session.user.id,
    type: 'USER_DELETED',
    description: `Deleted user: ${user.email}`,
  });

  revalidatePath('/admin/users');
}

export async function resetPassword(id: string, newPassword: string) {
  const session = await auth();

  if (!session?.user || session.user.role !== UserRole.SUPER_ADMIN) {
    throw new Error('Unauthorized');
  }

  // Check if user exists
  const user = await prisma.user.findUnique({
    where: { id },
  });

  if (!user) {
    throw new Error('User not found');
  }

  await prisma.user.update({
    where: { id },
    data: {
      password: newPassword, // Plain text
    },
  });

  revalidatePath('/admin/users');
}

export interface UpdateUserProfileResult {
  success: boolean;
  error?: string;
}

export async function updateUserProfile(data: {
  name?: string;
  profileImageUrl?: string;
  profileImagePublicId?: string;
}): Promise<UpdateUserProfileResult> {
  try {
    const session = await auth();

    if (!session?.user || !session.user.id) {
      return {
        success: false,
        error: 'Unauthorized',
      };
    }

    const userId = session.user.id;

    // Check if user exists
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        staff: {
          select: {
            id: true,
            application: {
              select: {
                id: true,
                profileImageUrl: true,
                profileImagePublicId: true,
              },
            },
          },
        },
      },
    });

    if (!user) {
      return {
        success: false,
        error: 'User not found',
      };
    }

    // Update user name if provided
    const userUpdates: {
      name?: string | null;
      avatarUrl?: string | null;
      avatarPublicId?: string | null;
    } = {};

    if (data.name !== undefined) {
      userUpdates.name = data.name.trim() || null;
    }

    // Update user-level avatar if provided
    if (data.profileImageUrl !== undefined && data.profileImagePublicId !== undefined) {
      // Delete old user avatar from Cloudinary if exists
      if (user.avatarPublicId) {
        try {
          const { deleteImageFromCloudinary } = await import('@/lib/cloudinary');
          await deleteImageFromCloudinary(user.avatarPublicId);
        } catch (error) {
          console.error('Error deleting old user avatar from Cloudinary:', error);
          // Continue even if deletion fails
        }
      }

      userUpdates.avatarUrl = data.profileImageUrl;
      userUpdates.avatarPublicId = data.profileImagePublicId;
    }

    if (Object.keys(userUpdates).length > 0) {
      await prisma.user.update({
        where: { id: userId },
        data: userUpdates,
      });
    }

    // Update staff/application profile image if user has Staff relation
    const staffApplication = user.staff[0]?.application;
    if (data.profileImageUrl !== undefined && data.profileImagePublicId !== undefined) {
      if (staffApplication) {
        // Delete old image from Cloudinary if exists
        if (staffApplication.profileImagePublicId) {
          try {
            const { deleteImageFromCloudinary } = await import('@/lib/cloudinary');
            await deleteImageFromCloudinary(staffApplication.profileImagePublicId);
          } catch (error) {
            console.error('Error deleting old image from Cloudinary:', error);
            // Continue even if deletion fails
          }
        }

        // Update Application with new image
        await prisma.application.update({
          where: { id: staffApplication.id },
          data: {
            profileImageUrl: data.profileImageUrl,
            profileImagePublicId: data.profileImagePublicId,
          },
        });
      } else {
        // User doesn't have Staff relation or Application - cannot update profile image
        // This is acceptable - they'll use fallback (Gravatar/initials)
      }
    }

    revalidatePath('/settings');
    revalidatePath('/');

    return {
      success: true,
    };
  } catch (error: unknown) {
    console.error('updateUserProfile error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Failed to update profile';
    return {
      success: false,
      error: errorMessage,
    };
  }
}

export interface UpdateUserPasswordResult {
  success: boolean;
  error?: string;
}

export async function updateUserPassword(data: {
  newPassword: string;
}): Promise<UpdateUserPasswordResult> {
  try {
    const session = await auth();

    if (!session?.user || !session.user.id) {
      return {
        success: false,
        error: 'Unauthorized',
      };
    }

    const userId = session.user.id;

    // Check if user exists (user is already authenticated via session)
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
      },
    });

    if (!user) {
      return {
        success: false,
        error: 'User not found',
      };
    }

    // Validate new password
    if (!data.newPassword || data.newPassword.trim().length < 6) {
      return {
        success: false,
        error: 'New password must be at least 6 characters long',
      };
    }

    // Update password
    await prisma.user.update({
      where: { id: userId },
      data: {
        password: data.newPassword.trim(), // Plain text
      },
    });

    revalidatePath('/admin/settings');

    return {
      success: true,
    };
  } catch (error: unknown) {
    console.error('updateUserPassword error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Failed to update password';
    return {
      success: false,
      error: errorMessage,
    };
  }
}

export interface BulkUpdateUsersResult {
  success: boolean;
  updated: number;
  errors: string[];
}

export async function bulkUpdateUsers(
  userIds: string[],
  updates: {
    isActive?: boolean;
    role?: UserRole;
  }
): Promise<BulkUpdateUsersResult> {
  const session = await auth();

  if (!session?.user || session.user.role !== UserRole.SUPER_ADMIN) {
    throw new Error('Unauthorized');
  }

  const errors: string[] = [];
  let updated = 0;

  for (const userId of userIds) {
    try {
      // Cannot modify self
      if (session.user.id === userId && updates.role) {
        errors.push(`Cannot change role for your own account (${userId})`);
        continue;
      }

      // Check if user exists
      const user = await prisma.user.findUnique({
        where: { id: userId },
      });

      if (!user) {
        errors.push(`User not found: ${userId}`);
        continue;
      }

      // Cannot change SUPER_ADMIN role
      if (user.role === UserRole.SUPER_ADMIN && updates.role && updates.role !== UserRole.SUPER_ADMIN) {
        errors.push(`Cannot change SUPER_ADMIN role for user: ${user.email}`);
        continue;
      }

      // Cannot create another SUPER_ADMIN
      if (updates.role === UserRole.SUPER_ADMIN && user.role !== UserRole.SUPER_ADMIN) {
        errors.push(`Cannot assign SUPER_ADMIN role to user: ${user.email}`);
        continue;
      }

      await prisma.user.update({
        where: { id: userId },
        data: updates,
      });

      updated++;
    } catch (error) {
      errors.push(`Failed to update user ${userId}: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  revalidatePath('/admin/users');

  return {
    success: errors.length === 0,
    updated,
    errors,
  };
}

export interface SendPasswordResetEmailResult {
  success: boolean;
  error?: string;
}

export async function sendPasswordResetEmail(
  email: string
): Promise<SendPasswordResetEmailResult> {
  try {
    const user = await prisma.user.findUnique({
      where: { email: email.trim().toLowerCase() },
    });

    if (!user) {
      // Don't reveal if user exists for security
      return { success: true };
    }

    // Generate reset token (simple implementation - in production, use crypto.randomBytes)
    const resetToken = Buffer.from(`${user.id}:${Date.now()}`).toString('base64');

    // Store reset token (in production, use a separate ResetToken model with expiration)
    // For now, we'll use a simple approach with environment variable for token storage
    // In production, create a PasswordResetToken model in Prisma

    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';
    const resetUrl = `${siteUrl}/api/auth/reset-password?token=${resetToken}&email=${encodeURIComponent(email)}`;

    const { sendEmail } = await import('@/lib/email');

    const emailHtml = `
      <!DOCTYPE html>
      <html dir="rtl" lang="ar">
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
        </head>
        <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 20px; border-radius: 8px; margin-bottom: 20px;">
            <h1 style="color: white; margin: 0;">إعادة تعيين كلمة المرور</h1>
          </div>
          
          <div style="background: #f9fafb; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
            <p>مرحباً ${user.name || user.email},</p>
            <p>لقد طلبت إعادة تعيين كلمة المرور لحسابك.</p>
            <p>انقر على الزر أدناه لإعادة تعيين كلمة المرور:</p>
          </div>
          
          <div style="text-align: center; margin: 30px 0;">
            <a href="${resetUrl}" style="background: #667eea; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">
              إعادة تعيين كلمة المرور
            </a>
          </div>
          
          <div style="border-top: 1px solid #e5e7eb; padding-top: 20px; margin-top: 30px; font-size: 12px; color: #6b7280;">
            <p>إذا لم تطلب إعادة تعيين كلمة المرور، يمكنك تجاهل هذا البريد الإلكتروني.</p>
            <p>الرابط صالح لمدة 24 ساعة فقط.</p>
          </div>
        </body>
      </html>
    `;

    const emailText = `
إعادة تعيين كلمة المرور

مرحباً ${user.name || user.email},

لقد طلبت إعادة تعيين كلمة المرور لحسابك.

انقر على الرابط التالي لإعادة تعيين كلمة المرور:
${resetUrl}

إذا لم تطلب إعادة تعيين كلمة المرور، يمكنك تجاهل هذا البريد الإلكتروني.
الرابط صالح لمدة 24 ساعة فقط.
    `.trim();

    const result = await sendEmail({
      to: user.email,
      subject: 'إعادة تعيين كلمة المرور',
      html: emailHtml,
      text: emailText,
    });

    return result;
  } catch (error) {
    console.error('Error sending password reset email:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to send password reset email',
    };
  }
}




















