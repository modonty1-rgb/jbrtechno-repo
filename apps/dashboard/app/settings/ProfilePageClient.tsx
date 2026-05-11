'use client';



import { useState, useTransition } from 'react';

import { useSession } from 'next-auth/react';

import { Card, CardContent, CardHeader, CardTitle } from '@jbrtechno/ui';

import { Input } from '@jbrtechno/ui';

import { Label } from '@jbrtechno/ui';

import { Button } from '@jbrtechno/ui';

import { User } from 'lucide-react';

import { UserAvatar } from '@jbrtechno/ui';

import { ProfileImageUpload } from '@/components/forms/ProfileImageUpload';

import { updateUserProfile, updateUserPassword } from '@/actions/users';

import { getUserAvatarUrl } from '@/helpers/getUserAvatarUrl';



interface ProfilePageClientProps {

  user: {

    id: string;

    email: string;

    name: string | null;

    avatarUrl?: string | null;

    role: string;

    isActive: boolean;

    lastLogin: Date | null;

    createdAt: Date;

  };

  staff: {

    department: string | null;

    employeeId: string | null;

    status: string;

    officialEmail: string | null;

    application: {

      profileImageUrl: string;

      profileImagePublicId: string;

      position: string;

    } | null;

  } | null;

  stats: {

    tasksAssigned: number;

    tasksCreated: number;

    notesCreated: number;

  };

  locale: string;

}



export function ProfilePageClient({

  user,

  staff,

  stats,

  locale,

}: ProfilePageClientProps) {

  const isArabic = true;

  const { update } = useSession();

  const [name, setName] = useState(user.name ?? '');

  const [nameStatus, setNameStatus] = useState<string | null>(null);

  const [nameError, setNameError] = useState<string | null>(null);

  const [profileMessage, setProfileMessage] = useState<string | null>(null);

  const [profileError, setProfileError] = useState<string | null>(null);

  const [password, setPassword] = useState('');

  const [confirmPassword, setConfirmPassword] = useState('');

  const [passwordMessage, setPasswordMessage] = useState<string | null>(null);

  const [passwordError, setPasswordError] = useState<string | null>(null);

  const [isUpdatingProfile, startUpdateProfile] = useTransition();

  const [isUpdatingPassword, startUpdatePassword] = useTransition();



  const currentProfileImageUrl =

    getUserAvatarUrl({

      userAvatarUrl: user.avatarUrl,

      applicationProfileImageUrl: staff?.application?.profileImageUrl,

      staffProfileImageUrl: null,

    }) ?? null;



  const handleUpdateName = () => {

    setNameStatus(null);

    setNameError(null);



    startUpdateProfile(async () => {

      try {

        const result = await updateUserProfile({ name });

        if (result.success) {

          // Refresh NextAuth session with the new name so other parts of the app see it

          try {

            await update({ name });

          } catch (updateError) {

            console.error('session update error:', updateError);

          }



          setNameStatus(

            isArabic ? 'تم تحديث الاسم بنجاح.' : 'Name updated successfully.',

          );

        } else {

          setNameError(

            result.error ?? (isArabic ? 'تعذر تحديث الاسم.' : 'Failed to update name.'),

          );

        }

      } catch (error) {

        console.error('updateUserProfile name error:', error);

        setNameError(isArabic ? 'حدث خطأ غير متوقع.' : 'An unexpected error occurred.');

      }

    });

  };



  const handlePhotoUploadSuccess = (url: string, publicId: string) => {

    setProfileMessage(null);

    setProfileError(null);



    startUpdateProfile(async () => {

      try {

        const result = await updateUserProfile({

          profileImageUrl: url,

          profileImagePublicId: publicId,

        });

        if (result.success) {

          setProfileMessage(

            isArabic ? 'تم تحديث الصورة الشخصية بنجاح.' : 'Profile photo updated successfully.',

          );

        } else {

          setProfileError(

            result.error ??

            (isArabic ? 'تعذر تحديث الصورة الشخصية.' : 'Failed to update profile photo.'),

          );

        }

      } catch (error) {

        console.error('updateUserProfile image error:', error);

        setProfileError(isArabic ? 'حدث خطأ غير متوقع.' : 'An unexpected error occurred.');

      }

    });

  };



  const handlePhotoUploadError = (error: string) => {

    setProfileMessage(null);

    setProfileError(error);

  };



  const handleUpdatePassword = () => {

    setPasswordMessage(null);

    setPasswordError(null);



    if (!password || password.trim().length < 6) {

      setPasswordError(

        isArabic

          ? 'يجب أن تكون كلمة المرور مكونة من 6 أحرف على الأقل.'

          : 'Password must be at least 6 characters long.',

      );

      return;

    }



    if (password !== confirmPassword) {

      setPasswordError(

        isArabic ? 'كلمتا المرور غير متطابقتين.' : 'Passwords do not match.',

      );

      return;

    }



    startUpdatePassword(async () => {

      try {

        const result = await updateUserPassword({ newPassword: password });

        if (result.success) {

          setPasswordMessage(

            isArabic ? 'تم تحديث كلمة المرور بنجاح.' : 'Password updated successfully.',

          );

          setPassword('');

          setConfirmPassword('');

        } else {

          setPasswordError(

            result.error ?? (isArabic ? 'تعذر تحديث كلمة المرور.' : 'Failed to update password.'),

          );

        }

      } catch (error) {

        console.error('updateUserPassword error:', error);

        setPasswordError(isArabic ? 'حدث خطأ غير متوقع.' : 'An unexpected error occurred.');

      }

    });

  };



  return (

    <div className="container mx-auto px-4 py-8 max-w-7xl space-y-6">

      <div>

        <h1 className="text-3xl font-bold tracking-tight">

          {isArabic ? 'الملف الشخصي' : 'Profile'}

        </h1>

        <p className="text-muted-foreground mt-1">

          {isArabic

            ? 'إدارة معلومات حسابك وصورتك الشخصية وكلمة المرور.'

            : 'Manage your account information, profile photo, and password.'}

        </p>

      </div>



      <div className="space-y-6">

        <Card>

          <CardHeader>

            <CardTitle className="flex items-center gap-2">

              <User className="h-5 w-5" />

              {isArabic ? 'معلومات المستخدم' : 'User Information'}

            </CardTitle>

          </CardHeader>

          <CardContent className="space-y-4">

            <div className="flex items-center gap-4">

              <UserAvatar

                name={user.name}

                email={user.email}

                imageUrl={currentProfileImageUrl}

                size="lg"

              />

              <div>

                <p className="text-sm font-medium text-muted-foreground">

                  {isArabic ? 'الحساب' : 'Account'}

                </p>

                <p className="text-base font-semibold">{user.email}</p>

                <p className="text-xs text-muted-foreground">

                  {isArabic ? 'دور المستخدم:' : 'Role:'}{' '}

                  <span className="font-medium">{user.role}</span>

                </p>

              </div>

            </div>



            <div className="space-y-2 pt-2">

              <Label htmlFor="name">

                {isArabic ? 'الاسم المعروض' : 'Display name'}

              </Label>

              <div className="flex flex-col sm:flex-row sm:items-center gap-2">

                <Input

                  id="name"

                  value={name}

                  onChange={(event) => setName(event.target.value)}

                  disabled={isUpdatingProfile}

                />

                <Button

                  type="button"

                  variant="outline"

                  className="sm:w-auto w-full"

                  onClick={handleUpdateName}

                  disabled={isUpdatingProfile}

                >

                  {isUpdatingProfile

                    ? isArabic

                      ? 'جاري الحفظ...'

                      : 'Saving...'

                    : isArabic

                      ? 'حفظ'

                      : 'Save'}

                </Button>

              </div>

              {nameStatus && (

                <p className="text-xs text-green-600 dark:text-green-400">

                  {nameStatus}

                </p>

              )}

              {nameError && (

                <p className="text-xs text-red-600 dark:text-red-400">

                  {nameError}

                </p>

              )}

            </div>



            <div className="space-y-1">

              <Label className="text-sm font-medium text-muted-foreground">

                {isArabic ? 'الحالة' : 'Status'}

              </Label>

              <p className="text-base">

                {user.isActive

                  ? isArabic

                    ? 'نشط'

                    : 'Active'

                  : isArabic

                    ? 'غير نشط'

                    : 'Inactive'}

              </p>

            </div>

          </CardContent>

        </Card>



        <Card>

          <CardHeader>

            <CardTitle>

              {isArabic ? 'الصورة الشخصية' : 'Profile Photo'}

            </CardTitle>

          </CardHeader>

          <CardContent className="space-y-4">

            <p className="text-sm text-muted-foreground">

              {isArabic

                ? 'قم برفع صورة احترافية لتمثيل حسابك في النظام.'

                : 'Upload a professional photo to represent your account in the system.'}

            </p>

            <ProfileImageUpload

              onUploadSuccess={handlePhotoUploadSuccess}

              onUploadError={handlePhotoUploadError}

              disabled={isUpdatingProfile}

            />

            {profileMessage && (

              <p className="text-xs text-green-600 dark:text-green-400">

                {profileMessage}

              </p>

            )}

            {profileError && (

              <p className="text-xs text-red-600 dark:text-red-400">

                {profileError}

              </p>

            )}

          </CardContent>

        </Card>



        <Card>

          <CardHeader>

            <CardTitle>

              {isArabic ? 'تغيير كلمة المرور' : 'Change Password'}

            </CardTitle>

          </CardHeader>

          <CardContent className="space-y-4">

            <div className="space-y-2">

              <Label htmlFor="new-password">

                {isArabic ? 'كلمة المرور الجديدة' : 'New password'}

              </Label>

              <Input

                id="new-password"

                type="password"

                value={password}

                onChange={(event) => setPassword(event.target.value)}

                disabled={isUpdatingPassword}

              />

            </div>

            <div className="space-y-2">

              <Label htmlFor="confirm-password">

                {isArabic ? 'تأكيد كلمة المرور' : 'Confirm password'}

              </Label>

              <Input

                id="confirm-password"

                type="password"

                value={confirmPassword}

                onChange={(event) => setConfirmPassword(event.target.value)}

                disabled={isUpdatingPassword}

              />

            </div>

            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">

              <p className="text-xs text-muted-foreground">

                {isArabic

                  ? 'يجب أن تحتوي كلمة المرور على 6 أحرف على الأقل.'

                  : 'Password must be at least 6 characters long.'}

              </p>

              <Button

                type="button"

                onClick={handleUpdatePassword}

                disabled={isUpdatingPassword}

                className="sm:w-auto w-full"

              >

                {isUpdatingPassword

                  ? isArabic

                    ? 'جاري التحديث...'

                    : 'Updating...'

                  : isArabic

                    ? 'تحديث كلمة المرور'

                    : 'Update Password'}

              </Button>

            </div>

            {passwordMessage && (

              <p className="text-xs text-green-600 dark:text-green-400">

                {passwordMessage}

              </p>

            )}

            {passwordError && (

              <p className="text-xs text-red-600 dark:text-red-400">

                {passwordError}

              </p>

            )}

          </CardContent>

        </Card>

        {staff && (
          <Card>
            <CardHeader>
              <CardTitle>
                {isArabic ? 'معلومات الموظف' : 'Staff Information'}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {staff.department && (
                <div>
                  <Label className="text-sm font-medium text-muted-foreground">
                    {isArabic ? 'القسم' : 'Department'}
                  </Label>
                  <p className="text-base">{staff.department}</p>
                </div>
              )}
              {staff.employeeId && (
                <div>
                  <Label className="text-sm font-medium text-muted-foreground">
                    {isArabic ? 'رقم الموظف' : 'Employee ID'}
                  </Label>
                  <p className="text-base">{staff.employeeId}</p>
                </div>
              )}
              {staff.application?.position && (
                <div>
                  <Label className="text-sm font-medium text-muted-foreground">
                    {isArabic ? 'المنصب' : 'Position'}
                  </Label>
                  <p className="text-base">{staff.application.position}</p>
                </div>
              )}
            </CardContent>
          </Card>
        )}

      </div>

    </div>

  );

}







































