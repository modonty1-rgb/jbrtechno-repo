'use client';

import { useState, useTransition } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@jbrtechno/ui';
import { Button } from '@jbrtechno/ui';
import { testClockifyIntegration } from '@/actions/clockify';

interface AppSettingsClientProps {
  locale: string;
}

export function AppSettingsClient({ locale }: AppSettingsClientProps) {
  const isArabic = true;
  const [isPending, startTransition] = useTransition();
  const [testMessage, setTestMessage] = useState<string | null>(null);
  const [testError, setTestError] = useState<string | null>(null);

  const handleTestClockify = () => {
    setTestMessage(null);
    setTestError(null);

    startTransition(async () => {
      try {
        const result = await testClockifyIntegration();
        if (result.success) {
          setTestMessage(result.message);
        } else {
          setTestError(result.message);
        }
      } catch (error) {
        console.error('Clockify test error:', error);
        setTestError(
          isArabic
            ? 'حدث خطأ أثناء اختبار تكامل Clockify'
            : 'An error occurred while testing Clockify integration',
        );
      }
    });
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">
          {isArabic ? 'إعدادات التطبيق' : 'App Settings'}
        </h1>
        <p className="text-muted-foreground mt-1">
          {isArabic
            ? 'إدارة إعدادات التطبيق العامة والتكاملات التقنية.'
            : 'Manage general application settings and technical integrations.'}
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>
              {isArabic ? 'معلومات التطبيق' : 'Application Information'}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <p className="text-sm text-muted-foreground">
              {isArabic
                ? 'إعدادات عامة للتطبيق يمكن توسيعها لاحقاً.'
                : 'General application settings. This section can be expanded later.'}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>
              {isArabic ? 'تكاملات النظام' : 'System Integrations'}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <p className="text-sm text-muted-foreground">
                {isArabic
                  ? 'اختبار تكامل Clockify للتأكد من أن التتبع الزمني يعمل بشكل صحيح.'
                  : 'Test the Clockify integration to ensure time tracking works correctly.'}
              </p>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleTestClockify}
                disabled={isPending}
              >
                {isPending
                  ? isArabic
                    ? 'جاري الاختبار...'
                    : 'Testing...'
                  : isArabic
                    ? 'اختبار تكامل Clockify'
                    : 'Test Clockify Integration'}
              </Button>
              {testMessage && (
                <p className="text-xs text-green-600 dark:text-green-400">
                  {testMessage}
                </p>
              )}
              {testError && (
                <p className="text-xs text-red-600 dark:text-red-400">
                  {testError}
                </p>
              )}
            </div>

            <div className="space-y-2 border-t pt-4">
              <p className="text-sm font-medium">
                {isArabic ? 'تكامل ClickUp' : 'ClickUp Integration'}
              </p>
              <p className="text-sm text-muted-foreground">
                {isArabic
                  ? 'سيتم إضافة تكامل ClickUp لإدارة المهام والمشاريع من داخل لوحة التحكم لاحقاً.'
                  : 'ClickUp integration will be added later to manage tasks and projects directly from the dashboard.'}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
