import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@jbrtechno/ui';
import { Badge } from '@jbrtechno/ui';
import { BarChart3, TrendingUp, PieChart, LineChart, Download } from 'lucide-react';

export default async function ReportsPage({
  params
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;

  const features = [
    {
      icon: BarChart3,
      title: 'التقارير المالية',
      description: 'ملخص الإيرادات والمصروفات'
    },
    {
      icon: PieChart,
      title: 'رسوم بيانية بسيطة',
      description: 'تمثيل بصري للبيانات الأساسية'
    },
    {
      icon: LineChart,
      title: 'تحليل المبيعات',
      description: 'تتبع أداء المبيعات الشهري'
    },
    {
      icon: Download,
      title: 'تصدير البيانات',
      description: 'تصدير التقارير بصيغة PDF أو Excel'
    },
  ];

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center gap-4">
          <div className="p-4 rounded-xl bg-gradient-to-br from-indigo-500/20 to-indigo-500/5">
            <BarChart3 className="h-10 w-10 text-indigo-600 dark:text-indigo-400" />
          </div>
          <div>
            <h1 className="text-4xl font-bold mb-2">
              التقارير
            </h1>
            <p className="text-muted-foreground text-lg">
              نظام بسيط لإنشاء التقارير والتحليلات - ينمو مع احتياجات جبرسيو
            </p>
          </div>
        </div>
      </div>

      {/* Coming Soon Hero Section */}
      <div className="mb-8 relative overflow-hidden">
        <Card className="border-2 border-indigo-200 dark:border-indigo-800 bg-gradient-to-br from-indigo-50 via-blue-50 to-violet-50 dark:from-indigo-950/50 dark:via-blue-950/30 dark:to-violet-950/20 shadow-lg">
          <CardContent className="py-12 px-6 text-center relative">
            {/* Animated background circles */}
            <div className="absolute top-0 left-1/4 w-64 h-64 bg-indigo-300/20 rounded-full blur-3xl animate-pulse"></div>
            <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-blue-300/20 rounded-full blur-3xl animate-pulse delay-700"></div>

            <div className="relative z-10 flex flex-col items-center gap-6">
              {/* Large animated icon */}
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-r from-indigo-400 to-blue-400 rounded-2xl blur-xl opacity-50 animate-pulse"></div>
                <div className="relative p-6 bg-gradient-to-br from-indigo-500 to-blue-500 rounded-2xl shadow-2xl transform hover:scale-110 transition-transform duration-300">
                  <BarChart3 className="h-16 w-16 text-white" />
                </div>
              </div>

              {/* Large Coming Soon Badge */}
              <div className="flex flex-col items-center gap-4">
                <div className="relative inline-flex">
                  <div className="absolute inset-0 bg-gradient-to-r from-indigo-500 via-blue-500 to-violet-500 rounded-full blur-md opacity-75 animate-pulse"></div>
                  <Badge className="relative text-2xl md:text-3xl px-8 py-3 font-bold bg-gradient-to-r from-indigo-500 via-blue-500 to-violet-500 text-white border-0 shadow-2xl transform hover:scale-105 transition-all duration-300">
                    <span className="flex items-center gap-3">
                      <span className="animate-bounce">✨</span>
                      قريباً
                      <span className="animate-bounce-delay-100">✨</span>
                    </span>
                  </Badge>
                </div>

                {/* Subtitle */}
                <p className="text-lg md:text-xl font-semibold text-indigo-900 dark:text-indigo-100 max-w-2xl">
                  🚀 نبني هذا النظام داخلياً لدعم جبرسيو في المرحلة الأولى
                </p>

                {/* Progress indicator */}
                <div className="flex items-center gap-2 text-sm text-indigo-700 dark:text-indigo-300">
                  <div className="flex gap-1">
                    <div className="w-2 h-2 bg-indigo-500 rounded-full animate-bounce"></div>
                    <div className="w-2 h-2 bg-indigo-500 rounded-full animate-bounce-delay-100"></div>
                    <div className="w-2 h-2 bg-indigo-500 rounded-full animate-bounce-delay-200"></div>
                  </div>
                  <span className="font-medium">
                    جاري التطوير
                  </span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Description Card */}
      <Card className="mb-8 border-indigo-200 dark:border-indigo-900/30 bg-gradient-to-br from-indigo-50/50 to-transparent dark:from-indigo-950/20">
        <CardHeader>
          <CardTitle className="text-2xl">
            نظرة عامة
          </CardTitle>
          <CardDescription className="text-base">
            نبدأ بنظام بسيط لإنشاء تقارير مالية ومبيعات أساسية. مع نمو نظام جبرسيو، سنضيف ميزات متقدمة مثل التحليلات التفاعلية ولوحات التحكم.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-start gap-3 p-4 rounded-lg bg-white/50 dark:bg-gray-800/50 border border-indigo-200 dark:border-indigo-900/30">
            <div className="p-2 rounded-lg bg-indigo-100 dark:bg-indigo-900/30">
              <TrendingUp className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
            </div>
            <div>
              <h4 className="font-semibold mb-1">
                البداية البسيطة
              </h4>
              <p className="text-sm text-muted-foreground">
                نبدأ بتقارير مالية بسيطة وملخصات شهرية. مع الوقت، سنضيف ميزات مثل التحليلات المتقدمة، الرسوم البيانية التفاعلية، والتنبؤات. النظام ينمو مع احتياجات نظام جبرسيو.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Features Grid */}
      <div className="mb-6">
        <h2 className="text-2xl font-bold mb-4">
          نبدأ بالأساسيات
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {features.map((feature, index) => {
            const Icon = feature.icon;
            return (
              <Card key={index} className="hover:shadow-md transition-all duration-200 hover:border-indigo-200 dark:hover:border-indigo-900/50">
                <CardContent className="p-6">
                  <div className="flex items-start gap-3">
                    <div className="p-2 rounded-lg bg-indigo-100 dark:bg-indigo-900/30">
                      <Icon className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold mb-1 text-sm">{feature.title}</h3>
                      <p className="text-xs text-muted-foreground">{feature.description}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>

      {/* Future Growth */}
      <Card className="border-dashed">
        <CardHeader>
          <CardTitle className="text-lg">
            مع نمو نظام جبرسيو سنضيف
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm text-muted-foreground">
            <li className="flex items-center gap-2">
              <span className="h-1.5 w-1.5 rounded-full bg-indigo-500"></span>
              لوحات تحكم تفاعلية
            </li>
            <li className="flex items-center gap-2">
              <span className="h-1.5 w-1.5 rounded-full bg-indigo-500"></span>
              تحليلات متقدمة بالذكاء الاصطناعي
            </li>
            <li className="flex items-center gap-2">
              <span className="h-1.5 w-1.5 rounded-full bg-indigo-500"></span>
              تقارير مخصصة
            </li>
            <li className="flex items-center gap-2">
              <span className="h-1.5 w-1.5 rounded-full bg-indigo-500"></span>
              التنبؤ بالمبيعات
            </li>
            <li className="flex items-center gap-2">
              <span className="h-1.5 w-1.5 rounded-full bg-indigo-500"></span>
              مقارنة الأداء السنوي
            </li>
            <li className="flex items-center gap-2">
              <span className="h-1.5 w-1.5 rounded-full bg-indigo-500"></span>
              تقارير تلقائية مجدولة
            </li>
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}

