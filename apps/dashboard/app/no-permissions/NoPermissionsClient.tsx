'use client';

import { useRouter } from 'next/navigation';
import { Button } from '@jbrtechno/ui';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@jbrtechno/ui';
import { AlertCircle, LogOut, ArrowLeft } from 'lucide-react';
import { signOut } from 'next-auth/react';

interface User {
  email: string;
  name: string | null;
  role: string;
}

interface NoPermissionsClientProps {
  user: User | null;
  accessibleRoutes: string[];
  locale: string;
}

export function NoPermissionsClient({
  user,
  accessibleRoutes,
  locale,
}: NoPermissionsClientProps) {
  const router = useRouter();
  const isRTL = true;

  const handleLogout = async () => {
    await signOut({ callbackUrl: '/login' });
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4" dir={isRTL ? 'rtl' : 'ltr'}>
      <Card className="w-full max-w-md">
        <CardHeader>
          <div className={`flex items-center gap-3 ${isRTL ? 'flex-row-reverse' : ''}`}>
            <AlertCircle className="h-8 w-8 text-destructive" />
            <div>
              <CardTitle>لا توجد صلاحيات الوصول</CardTitle>
              <CardDescription>
                ليس لديك صلاحية للوصول إلى هذه المنطقة
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {user && (
            <div className="space-y-2">
              <p className="text-sm text-muted-foreground">
                <strong>المستخدم:</strong> {user.email}
              </p>
              <p className="text-sm text-muted-foreground">
                <strong>الدور:</strong> {user.role === 'SUPER_ADMIN' ? 'أدمن' : 'موظف'}
              </p>
            </div>
          )}

          {accessibleRoutes.length === 0 ? (
            <div className="bg-muted/50 p-4 rounded-lg">
              <p className="text-sm text-muted-foreground">
                لم يتم تعيين أي مسارات لحسابك. يرجى الاتصال بالمسؤول لمنحك الوصول.
              </p>
            </div>
          ) : (
            <div className="bg-muted/50 p-4 rounded-lg">
              <p className="text-sm font-medium mb-2">
                المسارات المتاحة لك:
              </p>
              <ul className="text-sm text-muted-foreground space-y-1">
                {accessibleRoutes.map((route) => (
                  <li key={route}>• {route}</li>
                ))}
              </ul>
            </div>
          )}

          <div className={`flex gap-2 ${isRTL ? 'flex-row-reverse' : ''}`}>
            <Button variant="outline" onClick={handleLogout} className="flex-1">
              <LogOut className={`h-4 w-4 ${isRTL ? 'ml-2' : 'mr-2'}`} />
              تسجيل الخروج
            </Button>
            <Button
              variant="outline"
              onClick={() => router.push(`/${locale}`)}
              className="flex-1"
            >
              <ArrowLeft className={`h-4 w-4 ${isRTL ? 'ml-2 rotate-180' : 'mr-2'}`} />
              العودة إلى الموقع
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}



















