import Link from 'next/link';
import { Home, Search, Compass, Sparkles, Zap } from 'lucide-react';
import { Button } from '@jbrtechno/ui';
import { GoBackButton } from '@jbrtechno/ui';

export default async function NotFound({
  params,
}: {
  params?: Promise<{ locale: string }>;
}) {
  const resolvedParams = params ? await params : undefined;
  const locale = resolvedParams?.locale || 'ar';
  const isRTL = locale === 'ar';

  const quickLinks = [
    { href: `/${locale}`, label: locale === 'ar' ? 'الرئيسية' : 'Home', icon: Home },
    { href: `/${locale}/careers`, label: locale === 'ar' ? 'الوظائف' : 'Careers', icon: Compass },
    { href: `/${locale}/contact`, label: locale === 'ar' ? 'تواصل معنا' : 'Contact', icon: Search },
  ];

  return (
    <div
      className="min-h-screen flex items-center justify-center relative overflow-hidden bg-gradient-to-br from-slate-50 via-blue-50/30 to-purple-50/20 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950"
      dir={isRTL ? 'rtl' : 'ltr'}
    >
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-400/20 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-400/20 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-primary/5 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '2s' }} />
      </div>

      <div className="relative z-10 max-w-4xl w-full mx-auto px-4 py-16">
        <div className="text-center">
          {/* Main 404 Display */}
          <div className="relative mb-8">
            <h1
              className="text-[180px] md:text-[240px] font-black leading-none bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent select-none"
              style={{
                animation: 'scaleIn 0.8s cubic-bezier(0.34, 1.56, 0.64, 1)',
              }}
            >
              404
            </h1>
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-32 h-32 md:w-40 md:h-40 bg-gradient-to-r from-blue-500/20 to-purple-500/20 rounded-full blur-2xl -z-10 animate-pulse" />
          </div>

          {/* Icon with Animation */}
          <div
            className="inline-flex items-center justify-center w-24 h-24 md:w-28 md:h-28 rounded-2xl bg-gradient-to-br from-blue-500/10 to-purple-500/10 border-2 border-blue-500/20 mb-6 backdrop-blur-sm"
            style={{
              animation: 'rotateIn 0.8s cubic-bezier(0.34, 1.56, 0.64, 1) 0.3s both',
            }}
          >
            <Zap className="w-12 h-12 md:w-14 md:h-14 text-blue-600 dark:text-blue-400" />
          </div>

          {/* Title */}
          <h2
            className="text-4xl md:text-5xl lg:text-6xl font-bold text-foreground mb-4"
            style={{
              animation: 'slideUp 0.6s ease-out 0.7s both',
            }}
          >
            {locale === 'ar' ? 'عذراً، لم نجد هذه الصفحة' : "Oops! Page Not Found"}
          </h2>

          {/* Description */}
          <p
            className="text-lg md:text-xl text-muted-foreground mb-12 max-w-2xl mx-auto leading-relaxed"
            style={{
              animation: 'slideUp 0.6s ease-out 0.9s both',
            }}
          >
            {locale === 'ar'
              ? 'الصفحة التي تبحث عنها غير موجودة أو تم نقلها إلى مكان آخر. دعنا نساعدك في العثور على ما تبحث عنه.'
              : "The page you're looking for doesn't exist or has been moved. Let's help you find what you need."}
          </p>

          {/* Action Buttons */}
          <div
            className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-12"
            style={{
              animation: 'slideUp 0.6s ease-out 1.1s both',
            }}
          >
            <Button
              asChild
              size="lg"
              className="w-full sm:w-auto min-w-[220px] h-12 text-base font-semibold bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105"
            >
              <Link href={`/${locale}`} className="flex items-center justify-center gap-2">
                <Home className="w-5 h-5" />
                {locale === 'ar' ? 'العودة للرئيسية' : 'Back to Home'}
              </Link>
            </Button>
            <GoBackButton isRTL={isRTL} />
          </div>

          {/* Quick Links */}
          <div
            className="bg-white/50 dark:bg-slate-900/50 backdrop-blur-md rounded-2xl border border-slate-200/50 dark:border-slate-800/50 p-6 md:p-8 shadow-xl"
            style={{
              animation: 'slideUp 0.6s ease-out 1.3s both',
            }}
          >
            <div className="flex items-center justify-center gap-2 mb-6">
              <Sparkles className="w-5 h-5 text-primary" />
              <h3 className="text-lg font-semibold text-foreground">
                {locale === 'ar' ? 'ربما تبحث عن:' : 'Quick Links'}
              </h3>
            </div>
            <div className="flex flex-wrap gap-3 justify-center">
              {quickLinks.map((link) => {
                const Icon = link.icon;
                return (
                  <Button
                    key={link.href}
                    asChild
                    variant="ghost"
                    className="h-11 px-6 rounded-xl hover:bg-primary/10 hover:text-primary transition-all duration-300 group hover:scale-105"
                  >
                    <Link href={link.href} className="flex items-center gap-2">
                      <Icon className="w-4 h-4 group-hover:scale-110 transition-transform" />
                      <span className="font-medium">{link.label}</span>
                    </Link>
                  </Button>
                );
              })}
            </div>
          </div>

          {/* Help Text */}
          <div
            className="mt-8 text-sm text-muted-foreground"
            style={{
              animation: 'fadeIn 0.6s ease-out 1.6s both',
            }}
          >
            <p>
              {locale === 'ar'
                ? 'إذا كنت تعتقد أن هذا خطأ، يرجى التواصل معنا'
                : "If you believe this is an error, please contact us"}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
