import { getTranslations } from 'next-intl/server';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@jbrtechno/ui';
import { Badge } from '@jbrtechno/ui';
import { Button } from '@jbrtechno/ui';
import { Lightbulb, TrendingUp, Users, Rocket, Briefcase, ArrowRight, Sparkles, Code, Zap, ExternalLink } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import { PublicShell } from '@/components/layout/PublicShell';

export default async function HomePage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const t = await getTranslations('home');

  return (
    <PublicShell>
      <div className="min-h-screen">
      {/* Hero Section with Gradient Background */}
      <section className="relative overflow-hidden bg-gradient-to-b from-primary/5 via-background to-background">
        {/* Decorative Elements */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-40 -right-40 w-80 h-80 bg-primary/10 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-primary/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }}></div>
        </div>

        <div className="container mx-auto px-4 py-20 md:py-32 relative z-10">
          <div className="text-center max-w-5xl mx-auto">
            {/* Modonty Logo — first launched product */}
            <div className="mb-6 animate-fade-in-up">
              <Image
                src="https://res.cloudinary.com/dfegnpgwx/image/upload/f_auto,q_auto/v1769683590/modontyLogo_ftf4yf.png"
                alt="Modonty"
                width={240}
                height={130}
                priority
                className="mx-auto h-24 md:h-28 w-auto object-contain drop-shadow-lg"
              />
            </div>

            {/* Launched Badge */}
            <div className="inline-flex items-center gap-2 mb-6 animate-fade-in">
              <Badge variant="secondary" className="text-sm px-4 py-1.5 shadow-lg backdrop-blur-sm bg-green-500/10 border-green-500/30 text-green-700 dark:text-green-400">
                <Rocket className="h-3.5 w-3.5 mr-1.5 inline" />
                🚀 {t('launchedBadge')}
              </Badge>
            </div>

            {/* Main Title with Gradient */}
            <h1 className="text-5xl md:text-7xl lg:text-8xl font-black mb-8 animate-fade-in-up leading-tight">
              <span className="bg-gradient-to-r from-foreground via-primary to-foreground bg-clip-text text-transparent">
                {t('title')}
              </span>
            </h1>

            {/* Subtitle */}
            <p className="text-xl md:text-3xl font-semibold mb-6 text-foreground/90 animate-fade-in-up" style={{ animationDelay: '0.1s' }}>
              {t('subtitle')}
            </p>

            {/* Description */}
            <p className="text-base md:text-lg text-muted-foreground mb-10 max-w-3xl mx-auto leading-relaxed animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
              {t('description')}
            </p>

            {/* CTA Buttons — Visit Modonty + Join Us */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center animate-fade-in-up" style={{ animationDelay: '0.3s' }}>
              <a href="https://modonty.com" target="_blank" rel="noopener noreferrer">
                <Button size="lg" className="gap-2 px-8 py-6 text-lg shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-105 group">
                  🌐 {t('visitModonty')}
                  <ExternalLink className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
                </Button>
              </a>
              <Link href={`/${locale}/careers`}>
                <Button size="lg" variant="outline" className="gap-2 px-8 py-6 text-lg shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-105 group">
                  {t('joinUs')}
                  <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
                </Button>
              </Link>
            </div>

            {/* Stats or Features Badges */}
            <div className="flex flex-wrap justify-center gap-6 mt-12 animate-fade-in-up" style={{ animationDelay: '0.4s' }}>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
                <span className="font-medium">{locale === 'ar' ? 'فرص حقيقية' : 'Real Opportunities'}</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Code className="h-4 w-4 text-primary" />
                <span className="font-medium">{locale === 'ar' ? 'تقنيات متقدمة' : 'Advanced Tech'}</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Zap className="h-4 w-4 text-primary" />
                <span className="font-medium">{locale === 'ar' ? 'نمو سريع' : 'Fast Growth'}</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* About Section */}
      <section className="container mx-auto px-4 py-16">
        <Card className="border-2 hover:border-primary/50 transition-all duration-300 shadow-lg hover:shadow-xl backdrop-blur-sm bg-card/50">
          <CardHeader className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-primary/10">
                <Briefcase className="h-6 w-6 text-primary" />
              </div>
              <CardTitle className="text-3xl font-bold">{t('aboutProject')}</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            <p className="text-base leading-relaxed text-muted-foreground">
              {t('aboutText')}
            </p>
            <div className="relative overflow-hidden rounded-xl bg-gradient-to-br from-primary/10 via-primary/5 to-transparent p-6 border border-primary/20">
              <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full blur-2xl"></div>
              <p className="text-sm font-medium relative z-10 flex items-start gap-3">
                <Sparkles className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                <span>{t('confidential')}</span>
              </p>
            </div>
          </CardContent>
        </Card>
      </section>

      {/* Why Join Us */}
      <section className="container mx-auto px-4 py-16 bg-gradient-to-b from-background via-primary/5 to-background">
        <div className="text-center mb-12">
          <h2 className="text-4xl md:text-5xl font-black mb-4">
            {t('whyJoin')}
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            {locale === 'ar'
              ? 'انضم إلى فريق طموح يسعى لإحداث فرق حقيقي'
              : 'Join an ambitious team making a real difference'}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-7xl mx-auto">
          {/* Innovative Project Card */}
          <Card className="group relative overflow-hidden border-2 hover:border-primary/50 transition-all duration-500 hover:shadow-2xl hover:-translate-y-2 bg-gradient-to-br from-card to-card/50 backdrop-blur">
            <div className="absolute inset-0 bg-gradient-to-br from-primary/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
            <CardHeader className="relative z-10">
              <div className="rounded-2xl bg-gradient-to-br from-yellow-400/20 to-yellow-600/20 w-16 h-16 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-500 shadow-lg">
                <Lightbulb className="h-8 w-8 text-yellow-600 dark:text-yellow-400 group-hover:rotate-12 transition-transform duration-500" />
              </div>
              <CardTitle className="text-xl font-bold">{t('benefits.innovative')}</CardTitle>
            </CardHeader>
            <CardContent className="relative z-10">
              <CardDescription className="text-base leading-relaxed">{t('benefits.innovativeDesc')}</CardDescription>
            </CardContent>
          </Card>

          {/* Competitive Salary Card */}
          <Card className="group relative overflow-hidden border-2 hover:border-primary/50 transition-all duration-500 hover:shadow-2xl hover:-translate-y-2 bg-gradient-to-br from-card to-card/50 backdrop-blur">
            <div className="absolute inset-0 bg-gradient-to-br from-primary/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
            <CardHeader className="relative z-10">
              <div className="rounded-2xl bg-gradient-to-br from-green-400/20 to-green-600/20 w-16 h-16 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-500 shadow-lg">
                <TrendingUp className="h-8 w-8 text-green-600 dark:text-green-400 group-hover:translate-y-[-4px] transition-transform duration-500" />
              </div>
              <CardTitle className="text-xl font-bold">{t('benefits.competitive')}</CardTitle>
            </CardHeader>
            <CardContent className="relative z-10">
              <CardDescription className="text-base leading-relaxed">{t('benefits.competitiveDesc')}</CardDescription>
            </CardContent>
          </Card>

          {/* Growth Card */}
          <Card className="group relative overflow-hidden border-2 hover:border-primary/50 transition-all duration-500 hover:shadow-2xl hover:-translate-y-2 bg-gradient-to-br from-card to-card/50 backdrop-blur">
            <div className="absolute inset-0 bg-gradient-to-br from-primary/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
            <CardHeader className="relative z-10">
              <div className="rounded-2xl bg-gradient-to-br from-blue-400/20 to-blue-600/20 w-16 h-16 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-500 shadow-lg">
                <Users className="h-8 w-8 text-blue-600 dark:text-blue-400 group-hover:scale-110 transition-transform duration-500" />
              </div>
              <CardTitle className="text-xl font-bold">{t('benefits.growth')}</CardTitle>
            </CardHeader>
            <CardContent className="relative z-10">
              <CardDescription className="text-base leading-relaxed">{t('benefits.growthDesc')}</CardDescription>
            </CardContent>
          </Card>

          {/* Startup Culture Card */}
          <Card className="group relative overflow-hidden border-2 hover:border-primary/50 transition-all duration-500 hover:shadow-2xl hover:-translate-y-2 bg-gradient-to-br from-card to-card/50 backdrop-blur">
            <div className="absolute inset-0 bg-gradient-to-br from-primary/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
            <CardHeader className="relative z-10">
              <div className="rounded-2xl bg-gradient-to-br from-purple-400/20 to-purple-600/20 w-16 h-16 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-500 shadow-lg">
                <Rocket className="h-8 w-8 text-purple-600 dark:text-purple-400 group-hover:translate-y-[-4px] transition-transform duration-500" />
              </div>
              <CardTitle className="text-xl font-bold">{t('benefits.startup')}</CardTitle>
            </CardHeader>
            <CardContent className="relative z-10">
              <CardDescription className="text-base leading-relaxed">{t('benefits.startupDesc')}</CardDescription>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Join Us CTA */}
      <section className="container mx-auto px-4 py-20">
        <Card className="relative overflow-hidden border-2 border-primary/20 shadow-2xl bg-gradient-to-br from-primary/10 via-primary/5 to-background">
          {/* Animated Background Elements */}
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            <div className="absolute top-0 left-1/4 w-64 h-64 bg-primary/10 rounded-full blur-3xl animate-pulse"></div>
            <div className="absolute bottom-0 right-1/4 w-64 h-64 bg-primary/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }}></div>
          </div>

          <CardHeader className="text-center relative z-10 py-12">
            <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-gradient-to-br from-primary/20 to-primary/10 mx-auto mb-6 shadow-lg animate-bounce">
              <Briefcase className="h-10 w-10 text-primary" />
            </div>
            <CardTitle className="text-4xl md:text-5xl font-black mb-4 bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text">
              {t('careersTitle')}
            </CardTitle>
            <CardDescription className="text-lg md:text-xl max-w-2xl mx-auto leading-relaxed">
              {t('careersDescription')}
            </CardDescription>
          </CardHeader>

          <CardContent className="text-center pb-12 relative z-10">
            <Link href={`/${locale}/careers`}>
              <Button size="lg" className="gap-3 px-10 py-7 text-lg shadow-2xl hover:shadow-3xl transition-all duration-300 hover:scale-110 group bg-primary hover:bg-primary/90">
                <Sparkles className="h-5 w-5 group-hover:rotate-180 transition-transform duration-500" />
                {t('viewAllPositions')}
                <ArrowRight className="h-5 w-5 group-hover:translate-x-2 transition-transform duration-300" />
              </Button>
            </Link>

            {/* Additional Info */}
            <p className="mt-8 text-sm text-muted-foreground">
              {locale === 'ar'
                ? '🚀 ابدأ رحلتك معنا اليوم'
                : '🚀 Start your journey with us today'}
            </p>
          </CardContent>
        </Card>
      </section>
      </div>
    </PublicShell>
  );
}
