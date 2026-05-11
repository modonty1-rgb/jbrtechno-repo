import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@jbrtechno/ui';
import { Badge } from '@jbrtechno/ui';
import { FileSignature, Users, FileText, Shield, Clock } from 'lucide-react';

export default async function ContractsPage({
  params
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;

  const features = [
    {
      icon: FileText,
      title: locale === 'ar' ? 'عقود العمل' : 'Employment Contracts',
      description: locale === 'ar'
        ? 'حفظ وتنظيم عقود الموظفين بشكل رقمي'
        : 'Store and organize employee contracts digitally'
    },
    {
      icon: Users,
      title: locale === 'ar' ? 'عقود العملاء' : 'Client Contracts',
      description: locale === 'ar'
        ? 'إدارة عقود الخدمات مع العملاء'
        : 'Manage service agreements with clients'
    },
    {
      icon: Shield,
      title: locale === 'ar' ? 'اتفاقيات السرية' : 'NDA Agreements',
      description: locale === 'ar'
        ? 'تخزين اتفاقيات عدم الإفصاح والسرية'
        : 'Store non-disclosure and confidentiality agreements'
    },
    {
      icon: Clock,
      title: locale === 'ar' ? 'تتبع تواريخ الانتهاء' : 'Expiry Tracking',
      description: locale === 'ar'
        ? 'تنبيهات لتجديد العقود قبل انتهائها'
        : 'Alerts for contract renewals before expiry'
    },
  ];

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center gap-4">
          <div className="p-4 rounded-xl bg-gradient-to-br from-blue-500/20 to-blue-500/5">
            <FileSignature className="h-8 w-8 text-blue-600 dark:text-blue-400" />
          </div>
          <div>
            <h1 className="text-3xl font-bold">
              {locale === 'ar' ? 'العقود والاتفاقيات' : 'Contracts & Agreements'}
            </h1>
            <p className="text-muted-foreground mt-1">
              {locale === 'ar'
                ? 'نظام بسيط لإدارة وحفظ جميع العقود - ينمو مع احتياجات جبرسيو'
                : 'Simple system to manage and store all contracts - grows with JBRtechno needs'}
            </p>
          </div>
        </div>
      </div>

      {/* Coming Soon Badge - More Prominent */}
      <div className="mb-8 flex justify-center">
        <div className="relative">
          <Badge
            variant="outline"
            className="text-base px-6 py-3 bg-gradient-to-r from-blue-500/10 via-purple-500/10 to-blue-500/10 border-blue-500/30 text-blue-600 dark:text-blue-400 font-bold shadow-lg animate-pulse"
          >
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-blue-500 animate-ping absolute -left-1" />
              <Clock className="h-5 w-5" />
              <span>{locale === 'ar' ? 'قريباً' : 'Coming Soon'}</span>
            </div>
          </Badge>
        </div>
      </div>

      {/* Subtitle */}
      <Card className="mb-8 border-blue-500/20 bg-gradient-to-br from-blue-500/5 to-transparent">
        <CardContent className="pt-6">
          <p className="text-center text-muted-foreground leading-relaxed">
            {locale === 'ar'
              ? 'نبني هذا النظام داخلياً لدعم جبرسيو في المرحلة الأولى'
              : 'We are building this system internally to support JBRtechno in Phase 1'}
          </p>
        </CardContent>
      </Card>

      {/* Core Features */}
      <div className="mb-10">
        <h2 className="text-2xl font-bold mb-6">
          {locale === 'ar' ? 'الميزات الأساسية' : 'Core Features'}
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {features.map((feature, idx) => {
            const Icon = feature.icon;
            return (
              <Card key={idx} className="hover:shadow-md transition-shadow">
                <CardHeader>
                  <div className="flex items-start gap-3">
                    <div className="p-2 rounded-lg bg-primary/10">
                      <Icon className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <CardTitle className="text-base">{feature.title}</CardTitle>
                      <CardDescription className="mt-1">{feature.description}</CardDescription>
                    </div>
                  </div>
                </CardHeader>
              </Card>
            );
          })}
        </div>
      </div>

      {/* Overview */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle>{locale === 'ar' ? 'نظرة عامة' : 'Overview'}</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground leading-relaxed">
            {locale === 'ar'
              ? 'نظام بسيط لحفظ وإدارة جميع العقود في مكان واحد آمن. يشمل عقود العمل، عقود العملاء، واتفاقيات السرية. سيساعدنا على تنظيم الوثائق القانونية المهمة وتتبع تواريخ التجديد.'
              : 'A simple system to store and manage all contracts in one secure place. Includes employment contracts, client agreements, and NDAs. Will help us organize important legal documents and track renewal dates.'}
          </p>
        </CardContent>
      </Card>

      {/* Starting Simple */}
      <Card className="mb-8 border-emerald-500/20">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <span>{locale === 'ar' ? 'البداية بسيطة' : 'Starting Simple'}</span>
            <Badge variant="secondary" className="bg-emerald-500/10 text-emerald-600 border-emerald-500/20">
              {locale === 'ar' ? 'المرحلة 1' : 'Phase 1'}
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="space-y-2 text-muted-foreground">
            <li className="flex items-start gap-2">
              <span className="text-emerald-600 mt-1">✓</span>
              <span>{locale === 'ar' ? 'رفع ملفات العقود (PDF)' : 'Upload contract files (PDF)'}</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-emerald-600 mt-1">✓</span>
              <span>{locale === 'ar' ? 'تصنيف بسيط (عمل، عميل، NDA)' : 'Simple categories (employment, client, NDA)'}</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-emerald-600 mt-1">✓</span>
              <span>{locale === 'ar' ? 'معلومات أساسية (الطرف، التاريخ، المدة)' : 'Basic info (party, date, duration)'}</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-emerald-600 mt-1">✓</span>
              <span>{locale === 'ar' ? 'حفظ آمن ومشفر' : 'Secure encrypted storage'}</span>
            </li>
          </ul>
        </CardContent>
      </Card>

      {/* Future Features */}
      <Card>
        <CardHeader>
          <CardTitle>{locale === 'ar' ? 'النمو المستقبلي' : 'Future Growth'}</CardTitle>
          <CardDescription>
            {locale === 'ar'
              ? 'ميزات نضيفها لاحقاً حسب احتياجنا'
              : 'Features we will add later as needed'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ul className="space-y-2 text-sm text-muted-foreground">
            <li className="flex items-start gap-2">
              <span className="text-muted-foreground/50 mt-1">○</span>
              <span>{locale === 'ar' ? 'إشعارات تلقائية لتجديد العقود' : 'Automatic renewal notifications'}</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-muted-foreground/50 mt-1">○</span>
              <span>{locale === 'ar' ? 'توقيع إلكتروني للعقود' : 'Electronic contract signing'}</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-muted-foreground/50 mt-1">○</span>
              <span>{locale === 'ar' ? 'قوالب جاهزة للعقود الشائعة' : 'Ready templates for common contracts'}</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-muted-foreground/50 mt-1">○</span>
              <span>{locale === 'ar' ? 'بحث متقدم في محتوى العقود' : 'Advanced search in contract content'}</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-muted-foreground/50 mt-1">○</span>
              <span>{locale === 'ar' ? 'سجل للتعديلات والإصدارات' : 'Version history and amendments'}</span>
            </li>
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}

