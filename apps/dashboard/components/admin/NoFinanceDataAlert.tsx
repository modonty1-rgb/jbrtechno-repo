import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@jbrtechno/ui";
import { AlertTriangle } from "lucide-react";

export function NoFinanceDataAlert() {
  return (
    <div className="min-h-screen bg-muted flex items-center justify-center p-4" dir="rtl">
      <Card className="max-w-2xl w-full border-warning">
        <CardHeader>
          <div className="flex items-center gap-3">
            <AlertTriangle className="h-6 w-6 text-warning" />
            <CardTitle className="text-xl">لا توجد بيانات مالية</CardTitle>
          </div>
          <CardDescription>
            لم يتم العثور على بيانات مالية في قاعدة البيانات
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground">
            يرجى تشغيل سكربت الترحيل أولاً لنقل البيانات من ملف JSON إلى قاعدة البيانات.
          </p>
          <div className="bg-muted p-4 rounded-lg space-y-2">
            <p className="text-sm font-semibold">خطوات الترحيل:</p>
            <ol className="list-decimal list-inside space-y-1 text-sm text-muted-foreground pr-4">
              <li>تشغيل سكربت إنشاء التصنيفات:
                <code className="block mt-1 p-2 bg-background rounded text-xs">
                  npx ts-node --compiler-options {"{"}"module":"CommonJS"{"}"} scripts/seed-categories.ts
                </code>
              </li>
              <li>تشغيل سكربت ترحيل البيانات المالية:
                <code className="block mt-1 p-2 bg-background rounded text-xs">
                  npx ts-node --compiler-options {"{"}"module":"CommonJS"{"}"} scripts/migrate-finance-data.ts
                </code>
              </li>
            </ol>
          </div>
          <p className="text-xs text-muted-foreground pt-2">
            بعد تشغيل السكربتات، قم بتحديث هذه الصفحة.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}















