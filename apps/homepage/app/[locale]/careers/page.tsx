import { getTranslations } from 'next-intl/server';
import { Card, CardContent, CardHeader, CardTitle } from '@jbrtechno/ui';
import { Badge } from '@jbrtechno/ui';
import { Button } from '@jbrtechno/ui';
import { CheckCircle2, Briefcase, Send, Users, Target, Sparkles, TrendingUp, Code, PenTool, BarChart3, ShoppingCart, Award, ArrowRight, Clock } from 'lucide-react';
import Link from 'next/link';
import { getAllPositions } from '@/actions/positions';
import { positionSlug } from '@/helpers/positionSlug';
import { PublicShell } from '@/components/layout/PublicShell';

// Always read fresh from DB — dashboard toggles (isOpen) must reflect instantly.
export const dynamic = 'force-dynamic';
export const revalidate = 0;

export default async function CareersPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const t = await getTranslations('careers');
  const positions = await getAllPositions();

  const leadershipPositions = positions.filter(p => p.phase === 0);
  const technicalPositions = positions.filter(p => p.phase === 1);
  const contentPositions = positions.filter(p => p.phase === 2);
  const operationsPositions = positions.filter(p => p.phase === 3);
  const salesPositions = positions.filter(p => p.phase === 4);

  // Vacant = open AND no one filling it (only these get apply links)
  const vacantPositions = positions.filter(p => !p.filledBy && p.isOpen);
  // Filled = has a named filler OR closed by admin (both shown as "complete")
  const filledCount = positions.filter(p => p.filledBy || !p.isOpen).length;
  const totalCount = positions.length;
  // Quick-overview ordering: open vacant first, then complete/filled positions
  const overviewPositions = [...positions].sort((a, b) => {
    const aOpen = a.isOpen && !a.filledBy ? 0 : 1;
    const bOpen = b.isOpen && !b.filledBy ? 0 : 1;
    return aOpen - bOpen;
  });

  // Get phase icon
  const getPhaseIcon = (phase: number) => {
    switch (phase) {
      case 0: return Target;
      case 1: return Code;
      case 2: return PenTool;
      case 3: return BarChart3;
      case 4: return ShoppingCart;
      default: return Briefcase;
    }
  };

  return (
    <PublicShell>
      <div className="min-h-screen bg-gradient-to-b from-background via-primary/[0.02] to-background">
        {/* Enhanced Hero Section */}
      <div className="relative overflow-hidden">
        {/* Background Pattern */}
        <div className="absolute inset-0 bg-grid-slate-100 [mask-image:linear-gradient(0deg,white,rgba(255,255,255,0.6))] dark:bg-grid-slate-700/25" />

        <div className="container mx-auto px-4 py-16 md:py-24 relative">
          <div className="text-center max-w-4xl mx-auto">
            {/* Icon with animation */}
            <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-gradient-to-br from-primary/20 to-primary/5 mb-6 shadow-lg shadow-primary/10 backdrop-blur-sm animate-fade-in-up">
              <Briefcase className="h-10 w-10 text-primary" />
            </div>

            {/* Title */}
            <h1 className="text-5xl md:text-6xl font-extrabold mb-6 bg-gradient-to-r from-foreground via-foreground to-foreground/70 bg-clip-text text-transparent animate-fade-in-up" style={{ animationDelay: '0.1s' }}>
              {t('title')}
            </h1>

            {/* Subtitle */}
            <p className="text-xl md:text-2xl text-muted-foreground mb-8 leading-relaxed animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
              {t('subtitle')}
            </p>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 max-w-2xl mx-auto mb-8 animate-fade-in-up" style={{ animationDelay: '0.3s' }}>
              <Card className="border-2 bg-card/50 backdrop-blur-sm">
                <CardContent className="p-4 text-center">
                  <div className="text-3xl font-bold text-primary mb-1">{totalCount}</div>
                  <div className="text-sm text-muted-foreground">{locale === 'ar' ? 'إجمالي الوظائف' : 'Total Positions'}</div>
                </CardContent>
              </Card>

              <Card className="border-2 border-green-500/30 bg-green-500/5 backdrop-blur-sm">
                <CardContent className="p-4 text-center">
                  <div className="text-3xl font-bold text-green-600 dark:text-green-400 mb-1">{vacantPositions.length}</div>
                  <div className="text-sm text-muted-foreground">{locale === 'ar' ? 'وظائف شاغرة' : 'Open Positions'}</div>
                </CardContent>
              </Card>

              <Card className="border-2 bg-card/50 backdrop-blur-sm">
                <CardContent className="p-4 text-center">
                  <div className="text-3xl font-bold text-orange-600 dark:text-orange-400 mb-1">{filledCount}</div>
                  <div className="text-sm text-muted-foreground">{locale === 'ar' ? 'وظائف مشغولة' : 'Filled Positions'}</div>
                </CardContent>
              </Card>
            </div>

            {/* Confidentiality Note */}
            <div className="bg-gradient-to-r from-muted/50 via-muted/70 to-muted/50 p-6 rounded-xl border-l-4 border-primary inline-block backdrop-blur-sm shadow-sm animate-fade-in-up" style={{ animationDelay: '0.4s' }}>
              <div className="flex items-start gap-3">
                <Award className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                <p className="text-sm text-muted-foreground text-left">
                  {t('confidentialityNote')}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 pb-12">
        {/* All Positions Quick Overview — closed/filled shown as disabled */}
        {positions.length > 0 && (
          <div className="mb-16 -mt-8">
            <Card className="border-2 border-primary/30 bg-gradient-to-br from-primary/10 via-primary/5 to-background shadow-xl shadow-primary/5">
              <CardHeader className="pb-4">
                <div className="flex items-center justify-center gap-4 flex-wrap">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-primary/10">
                      <Sparkles className="h-5 w-5 text-primary" />
                    </div>
                    <CardTitle className="text-2xl md:text-3xl">
                      {locale === 'ar' ? '🎯 جميع الوظائف' : '🎯 All Positions'}
                    </CardTitle>
                  </div>
                  <Badge variant="default" className="text-lg px-4 py-1.5 shadow-md">
                    {vacantPositions.length} {locale === 'ar' ? 'شاغرة' : 'open'} / {positions.length} {locale === 'ar' ? 'إجمالي' : 'total'}
                  </Badge>
                </div>
                <p className="text-center text-muted-foreground mt-2 text-sm">
                  {locale === 'ar' ? 'الوظائف المفتوحة قابلة للضغط — الباقي مكتمل' : 'Open positions are clickable — others are complete'}
                </p>
              </CardHeader>
              <CardContent className="pt-2">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                  {overviewPositions.map((position, index) => {
                    const positionId = (locale === 'ar' ? position.title : position.titleEn).toLowerCase().replace(/\s+/g, '-');
                    const PhaseIcon = getPhaseIcon(position.phase);
                    const isOpenVacant = position.isOpen && !position.filledBy;
                    const cardChildren = (
                      <>
                        {/* Top row: icon + title (full width, no truncate, wraps if needed) */}
                        <div className="flex items-start gap-2.5">
                          <div className={`p-2 rounded-lg shrink-0 ${isOpenVacant ? 'bg-primary/10 group-hover:bg-primary/20' : 'bg-muted'} transition-colors`}>
                            <PhaseIcon className={`h-4 w-4 ${isOpenVacant ? 'text-primary' : 'text-muted-foreground'}`} />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className={`font-semibold text-sm leading-snug ${isOpenVacant ? 'group-hover:text-primary transition-colors' : 'text-muted-foreground'}`}>
                              {locale === 'ar' ? position.title : position.titleEn}
                            </div>
                            {position.employmentType && (
                              <div className="text-[11px] text-muted-foreground mt-0.5">
                                {position.employmentType === 'full-time' ? t('positions.fullTime') : t('positions.projectBased')}
                              </div>
                            )}
                          </div>
                          {position.count > 1 && (
                            <Badge variant="secondary" className="text-[10px] shrink-0 px-1.5 py-0">
                              ×{position.count}
                            </Badge>
                          )}
                        </div>

                        {/* Bottom row: status badge + arrow (open only) */}
                        <div className="flex items-center justify-between gap-2 pt-1">
                          {isOpenVacant ? (
                            <>
                              <Badge className="bg-gradient-to-r from-green-500 via-emerald-500 to-green-500 text-white font-bold text-[11px] px-3 py-1 shadow-md border border-white/40">
                                <Sparkles className="h-3 w-3 mr-1" />
                                {locale === 'ar' ? 'التقديم مفتوح' : 'Apply Open'}
                              </Badge>
                              <ArrowRight className="h-4 w-4 text-muted-foreground group-hover:text-primary group-hover:translate-x-1 transition-all" />
                            </>
                          ) : (
                            <Badge className="bg-gray-200 text-gray-700 dark:bg-gray-700 dark:text-gray-300 border-gray-400 font-medium text-[11px] px-3 py-1">
                              <CheckCircle2 className="h-3 w-3 mr-1" />
                              {locale === 'ar' ? 'مكتملة' : 'Complete'}
                            </Badge>
                          )}
                        </div>
                      </>
                    );
                    return isOpenVacant ? (
                      <a
                        key={index}
                        href={`#${positionId}`}
                        className="group relative flex flex-col gap-2 p-4 rounded-xl border-2 border-primary/40 bg-card hover:border-primary/70 hover:bg-primary/5 transition-all duration-300 hover:shadow-lg hover:-translate-y-1"
                      >
                        {cardChildren}
                      </a>
                    ) : (
                      <div
                        key={index}
                        aria-disabled="true"
                        className="relative flex flex-col gap-2 p-4 rounded-xl border-2 border-gray-300 bg-gray-50/50 dark:bg-gray-900/30 opacity-70 cursor-not-allowed select-none"
                      >
                        {cardChildren}
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Available Positions */}
        <div id="positions" className="space-y-16">
          {/* Section Title */}
          <div className="text-center">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 mb-4">
              <Users className="h-4 w-4 text-primary" />
              <span className="text-sm font-medium text-primary">{locale === 'ar' ? 'تصفح الفرص' : 'Browse Opportunities'}</span>
            </div>
            <h2 className="text-4xl font-bold mb-3">
              {t('positions.title')}
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              {locale === 'ar'
                ? 'اكتشف الفرص المتاحة وكن جزءاً من فريقنا المتميز'
                : 'Discover available opportunities and be part of our exceptional team'}
            </p>
          </div>

          {/* Leadership & Executive Positions */}
          {leadershipPositions.length > 0 && (
            <section className="space-y-6">
              <div className="flex items-center gap-3 pb-4 border-b-2">
                <div className="p-3 rounded-xl bg-gradient-to-br from-purple-500/20 to-purple-500/5">
                  <Target className="h-6 w-6 text-purple-600 dark:text-purple-400" />
                </div>
                <div>
                  <h3 className="text-3xl font-bold">{t('positions.leadership')}</h3>
                  <p className="text-sm text-muted-foreground">{leadershipPositions.length} {locale === 'ar' ? 'وظيفة' : 'positions'}</p>
                </div>
              </div>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {leadershipPositions.map((position, index) => {
                  const isClosed = !position.isOpen;
                const isFilled = !!position.filledBy || isClosed;
                  const requirements = locale === 'ar' ? position.requirements : position.requirementsEn;
                  const positionId = (locale === 'ar' ? position.title : position.titleEn).toLowerCase().replace(/\s+/g, '-');
                  return (
                    <Card
                      key={index}
                      id={positionId}
                      className={`
                        scroll-mt-24 transition-all duration-300 hover:shadow-xl group
                        ${isFilled
                          ? 'border-2 border-green-500/30 bg-gradient-to-br from-green-500/5 to-background'
                          : 'border-2 border-primary/20 hover:border-primary/40 bg-card hover:-translate-y-1'
                        }
                      `}
                    >
                      <CardHeader className="space-y-4">
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex-1">
                            <CardTitle className="text-xl mb-3 flex items-center gap-2">
                              {locale === 'ar' ? position.title : position.titleEn}
                              {!isFilled && <Sparkles className="h-4 w-4 text-primary animate-pulse" />}
                            </CardTitle>
                            <div className="flex gap-2 flex-wrap">
                              {position.employmentType && (
                                <Badge variant="outline" className="text-xs">
                                  <Clock className="h-3 w-3 mr-1" />
                                  {position.employmentType === 'full-time' ? t('positions.fullTime') : t('positions.projectBased')}
                                </Badge>
                              )}
                              {isFilled ? (
                                <>
                                  <Badge className={isClosed ? "bg-gray-200 text-gray-700 dark:bg-gray-700 dark:text-gray-300 border-gray-400" : "bg-green-500/20 text-green-700 dark:text-green-300 border-green-500/30 hover:bg-green-500/30"}>
                                    <CheckCircle2 className="h-3 w-3 mr-1" />
                                    {isClosed ? (locale === 'ar' ? 'اكتمل الفريق' : 'Team Complete') : t('positions.filled')}
                                  </Badge>
                                  {position.filledBy && (
                                    <Badge variant="outline" className="bg-orange-500/10 text-orange-700 dark:text-orange-400 border-orange-500/30">
                                      {position.filledBy}
                                    </Badge>
                                  )}
                                </>
                              ) : (
                                <>
                                  <Badge variant="default" className="shadow-sm">
                                    {position.count} {locale === 'ar' ? 'وظيفة' : 'position(s)'}
                                  </Badge>
                                  <Badge className="bg-blue-500/20 text-blue-700 dark:text-blue-300 border-blue-500/30">
                                    {t('positions.vacant')}
                                  </Badge>
                                </>
                              )}
                            </div>
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="space-y-2 max-h-64 overflow-y-auto pr-2 custom-scrollbar">
                          <ul className="space-y-2">
                            {requirements.map((req, idx) => {
                              const isBonus = req.startsWith('⭐');
                              const isSection = req.startsWith('---');
                              const isEmpty = req.trim() === '';
                              const cleanReq = isBonus ? req.substring(2).trim() : req.replace(/^---\s*/, '').replace(/\s*---$/, '').trim();

                              if (isEmpty) {
                                return <li key={idx} className="h-2" />;
                              }

                              if (isSection) {
                                return (
                                  <li key={idx} className="pt-3 pb-1.5 first:pt-0">
                                    <h4 className="text-xs font-bold uppercase tracking-wider text-primary/90 flex items-center gap-2">
                                      <div className="h-px flex-1 bg-primary/20" />
                                      {cleanReq}
                                      <div className="h-px flex-1 bg-primary/20" />
                                    </h4>
                                  </li>
                                );
                              }

                              return (
                                <li key={idx} className="text-sm flex items-start gap-2.5 pl-1 group/item">
                                  <CheckCircle2 className="h-3.5 w-3.5 text-primary/70 mt-0.5 flex-shrink-0 group-hover/item:text-primary transition-colors" />
                                  <span className="text-muted-foreground leading-relaxed">
                                    {isBonus && <span className="text-yellow-600 dark:text-yellow-400">⭐ </span>}
                                    {cleanReq}
                                  </span>
                                </li>
                              );
                            })}
                          </ul>
                        </div>
                        {!isFilled && (
                          <div className="pt-4 border-t">
                            <Link href={`/${locale}/careers/apply/${positionSlug(position.titleEn)}`}>
                              <Button className="w-full group/btn relative overflow-hidden" size="lg">
                                <span className="relative z-10 flex items-center justify-center gap-2">
                                  <Send className="h-4 w-4 group-hover/btn:translate-x-1 transition-transform" />
                                  {t('positions.applyNow')}
                                  <TrendingUp className="h-4 w-4 group-hover/btn:translate-y-[-2px] transition-transform" />
                                </span>
                                <div className="absolute inset-0 bg-gradient-to-r from-primary/0 via-primary-foreground/10 to-primary/0 translate-x-[-100%] group-hover/btn:translate-x-[100%] transition-transform duration-700" />
                              </Button>
                            </Link>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            </section>
          )}

          {/* Technical Team */}
          <section className="space-y-6">
            <div className="flex items-center gap-3 pb-4 border-b-2">
              <div className="p-3 rounded-xl bg-gradient-to-br from-blue-500/20 to-blue-500/5">
                <Code className="h-6 w-6 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <h3 className="text-3xl font-bold">{t('positions.technical')}</h3>
                <p className="text-sm text-muted-foreground">{technicalPositions.length} {locale === 'ar' ? 'وظيفة' : 'positions'}</p>
              </div>
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {technicalPositions.map((position, index) => {
                const isClosed = !position.isOpen;
                const isFilled = !!position.filledBy || isClosed;
                const requirements = locale === 'ar' ? position.requirements : position.requirementsEn;
                const positionId = (locale === 'ar' ? position.title : position.titleEn).toLowerCase().replace(/\s+/g, '-');
                return (
                  <Card
                    key={index}
                    id={positionId}
                    className={`
                      scroll-mt-24 transition-all duration-300 hover:shadow-xl group
                      ${isFilled
                        ? 'border-2 border-green-500/30 bg-gradient-to-br from-green-500/5 to-background'
                        : 'border-2 border-border hover:border-primary/40 bg-card hover:-translate-y-1'
                      }
                    `}
                  >
                    <CardHeader className="space-y-4">
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1">
                          <CardTitle className="text-xl mb-3 flex items-center gap-2">
                            {locale === 'ar' ? position.title : position.titleEn}
                            {!isFilled && <Sparkles className="h-4 w-4 text-primary animate-pulse" />}
                          </CardTitle>
                          <div className="flex gap-2 flex-wrap">
                            {position.employmentType && (
                              <Badge variant="outline" className="text-xs">
                                <Clock className="h-3 w-3 mr-1" />
                                {position.employmentType === 'full-time' ? t('positions.fullTime') : t('positions.projectBased')}
                              </Badge>
                            )}
                            {isFilled ? (
                              <>
                                <Badge className={isClosed ? "bg-gray-200 text-gray-700 dark:bg-gray-700 dark:text-gray-300 border-gray-400" : "bg-green-500/20 text-green-700 dark:text-green-300 border-green-500/30 hover:bg-green-500/30"}>
                                  <CheckCircle2 className="h-3 w-3 mr-1" />
                                  {isClosed ? (locale === 'ar' ? 'اكتمل الفريق' : 'Team Complete') : t('positions.filled')}
                                </Badge>
                                {position.filledBy && (
                                  <Badge variant="outline" className="bg-orange-500/10 text-orange-700 dark:text-orange-400 border-orange-500/30">
                                    {position.filledBy}
                                  </Badge>
                                )}
                              </>
                            ) : (
                              <>
                                <Badge variant="default" className="shadow-sm">
                                  {position.count} {locale === 'ar' ? 'وظيفة' : 'position(s)'}
                                </Badge>
                                <Badge className="bg-blue-500/20 text-blue-700 dark:text-blue-300 border-blue-500/30">
                                  {t('positions.vacant')}
                                </Badge>
                              </>
                            )}
                          </div>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="space-y-2 max-h-64 overflow-y-auto pr-2 custom-scrollbar">
                        <ul className="space-y-2">
                          {requirements.map((req, idx) => {
                            const isBonus = req.startsWith('⭐');
                            const isSection = req.startsWith('---');
                            const isEmpty = req.trim() === '';
                            const cleanReq = isBonus ? req.substring(2).trim() : req.replace(/^---\s*/, '').replace(/\s*---$/, '').trim();

                            if (isEmpty) {
                              return <li key={idx} className="h-2" />;
                            }

                            if (isSection) {
                              return (
                                <li key={idx} className="pt-3 pb-1.5 first:pt-0">
                                  <h4 className="text-xs font-bold uppercase tracking-wider text-primary/90 flex items-center gap-2">
                                    <div className="h-px flex-1 bg-primary/20" />
                                    {cleanReq}
                                    <div className="h-px flex-1 bg-primary/20" />
                                  </h4>
                                </li>
                              );
                            }

                            return (
                              <li key={idx} className="text-sm flex items-start gap-2.5 pl-1 group/item">
                                <CheckCircle2 className="h-3.5 w-3.5 text-primary/70 mt-0.5 flex-shrink-0 group-hover/item:text-primary transition-colors" />
                                <span className="text-muted-foreground leading-relaxed">
                                  {isBonus && <span className="text-yellow-600 dark:text-yellow-400">⭐ </span>}
                                  {cleanReq}
                                </span>
                              </li>
                            );
                          })}
                        </ul>
                      </div>
                      {!isFilled && (
                        <div className="pt-4 border-t">
                          <Link href={`/${locale}/careers/apply/${positionSlug(position.titleEn)}`}>
                            <Button className="w-full group/btn relative overflow-hidden" size="lg">
                              <span className="relative z-10 flex items-center justify-center gap-2">
                                <Send className="h-4 w-4 group-hover/btn:translate-x-1 transition-transform" />
                                {t('positions.applyNow')}
                                <TrendingUp className="h-4 w-4 group-hover/btn:translate-y-[-2px] transition-transform" />
                              </span>
                              <div className="absolute inset-0 bg-gradient-to-r from-primary/0 via-primary-foreground/10 to-primary/0 translate-x-[-100%] group-hover/btn:translate-x-[100%] transition-transform duration-700" />
                            </Button>
                          </Link>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </section>

          {/* Content Team */}
          {contentPositions.length > 0 && (
            <section className="space-y-6">
              <div className="flex items-center gap-3 pb-4 border-b-2">
                <div className="p-3 rounded-xl bg-gradient-to-br from-pink-500/20 to-pink-500/5">
                  <PenTool className="h-6 w-6 text-pink-600 dark:text-pink-400" />
                </div>
                <div>
                  <h3 className="text-3xl font-bold">{t('positions.content')}</h3>
                  <p className="text-sm text-muted-foreground">{contentPositions.length} {locale === 'ar' ? 'وظيفة' : 'positions'}</p>
                </div>
              </div>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {contentPositions.map((position, index) => {
                  const requirements = locale === 'ar' ? position.requirements : position.requirementsEn;
                  const positionId = (locale === 'ar' ? position.title : position.titleEn).toLowerCase().replace(/\s+/g, '-');
                  const isClosed = !position.isOpen;
                  const isFilled = !!position.filledBy || isClosed;
                  return (
                    <Card
                      key={index}
                      id={positionId}
                      className={`scroll-mt-24 border-2 transition-all duration-300 group hover:-translate-y-1 ${
                        isFilled
                          ? 'border-gray-300 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-900/30'
                          : 'border-border hover:border-primary/40 bg-card hover:shadow-xl'
                      }`}
                    >
                      <CardHeader className="space-y-4">
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex-1">
                            <CardTitle className="text-xl mb-3 flex items-center gap-2">
                              {locale === 'ar' ? position.title : position.titleEn}
                              {!isFilled && <Sparkles className="h-4 w-4 text-primary animate-pulse" />}
                            </CardTitle>
                            <div className="flex gap-2 flex-wrap">
                              {position.employmentType && (
                                <Badge variant="outline" className="text-xs">
                                  <Clock className="h-3 w-3 mr-1" />
                                  {position.employmentType === 'full-time' ? t('positions.fullTime') : t('positions.projectBased')}
                                </Badge>
                              )}
                              <Badge variant="default" className="shadow-sm">
                                {position.count} {locale === 'ar' ? 'وظيفة' : 'position(s)'}
                              </Badge>
                              {isFilled ? (
                                <Badge className={isClosed ? 'bg-gray-200 text-gray-700 dark:bg-gray-700 dark:text-gray-300 border-gray-400' : 'bg-green-500/20 text-green-700 dark:text-green-300 border-green-500/30'}>
                                  <CheckCircle2 className="h-3 w-3 mr-1" />
                                  {isClosed ? (locale === 'ar' ? 'اكتمل الفريق' : 'Team Complete') : t('positions.filled')}
                                </Badge>
                              ) : (
                                <Badge className="bg-blue-500/20 text-blue-700 dark:text-blue-300 border-blue-500/30">
                                  {t('positions.vacant')}
                                </Badge>
                              )}
                            </div>
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="space-y-2 max-h-64 overflow-y-auto pr-2 custom-scrollbar">
                          <ul className="space-y-2">
                            {requirements.map((req, idx) => {
                              const isBonus = req.startsWith('⭐');
                              const isSection = req.startsWith('---');
                              const isEmpty = req.trim() === '';
                              const cleanReq = isBonus ? req.substring(2).trim() : req.replace(/^---\s*/, '').replace(/\s*---$/, '').trim();

                              if (isEmpty) {
                                return <li key={idx} className="h-2" />;
                              }

                              if (isSection) {
                                return (
                                  <li key={idx} className="pt-3 pb-1.5 first:pt-0">
                                    <h4 className="text-xs font-bold uppercase tracking-wider text-primary/90 flex items-center gap-2">
                                      <div className="h-px flex-1 bg-primary/20" />
                                      {cleanReq}
                                      <div className="h-px flex-1 bg-primary/20" />
                                    </h4>
                                  </li>
                                );
                              }

                              return (
                                <li key={idx} className="text-sm flex items-start gap-2.5 pl-1 group/item">
                                  <CheckCircle2 className="h-3.5 w-3.5 text-primary/70 mt-0.5 flex-shrink-0 group-hover/item:text-primary transition-colors" />
                                  <span className="text-muted-foreground leading-relaxed">
                                    {isBonus && <span className="text-yellow-600 dark:text-yellow-400">⭐ </span>}
                                    {cleanReq}
                                  </span>
                                </li>
                              );
                            })}
                          </ul>
                        </div>
                        {!isFilled && (
                          <div className="pt-4 border-t">
                            <Link href={`/${locale}/careers/apply/${positionSlug(position.titleEn)}`}>
                              <Button className="w-full group/btn relative overflow-hidden" size="lg">
                                <span className="relative z-10 flex items-center justify-center gap-2">
                                  <Send className="h-4 w-4 group-hover/btn:translate-x-1 transition-transform" />
                                  {t('positions.applyNow')}
                                  <TrendingUp className="h-4 w-4 group-hover/btn:translate-y-[-2px] transition-transform" />
                                </span>
                                <div className="absolute inset-0 bg-gradient-to-r from-primary/0 via-primary-foreground/10 to-primary/0 translate-x-[-100%] group-hover/btn:translate-x-[100%] transition-transform duration-700" />
                              </Button>
                            </Link>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            </section>
          )}

          {/* Operations & Support */}
          {operationsPositions.length > 0 && (
            <section className="space-y-6">
              <div className="flex items-center gap-3 pb-4 border-b-2">
                <div className="p-3 rounded-xl bg-gradient-to-br from-teal-500/20 to-teal-500/5">
                  <BarChart3 className="h-6 w-6 text-teal-600 dark:text-teal-400" />
                </div>
                <div>
                  <h3 className="text-3xl font-bold">{t('positions.operations')}</h3>
                  <p className="text-sm text-muted-foreground">{operationsPositions.length} {locale === 'ar' ? 'وظيفة' : 'positions'}</p>
                </div>
              </div>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {operationsPositions.map((position, index) => {
                  const isClosed = !position.isOpen;
                const isFilled = !!position.filledBy || isClosed;
                  const requirements = locale === 'ar' ? position.requirements : position.requirementsEn;
                  const positionId = (locale === 'ar' ? position.title : position.titleEn).toLowerCase().replace(/\s+/g, '-');
                  return (
                    <Card
                      key={index}
                      id={positionId}
                      className={`
                        scroll-mt-24 transition-all duration-300 hover:shadow-xl group
                        ${isFilled
                          ? 'border-2 border-green-500/30 bg-gradient-to-br from-green-500/5 to-background'
                          : 'border-2 border-border hover:border-primary/40 bg-card hover:-translate-y-1'
                        }
                      `}
                    >
                      <CardHeader className="space-y-4">
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex-1">
                            <CardTitle className="text-xl mb-3 flex items-center gap-2">
                              {locale === 'ar' ? position.title : position.titleEn}
                              {!isFilled && <Sparkles className="h-4 w-4 text-primary animate-pulse" />}
                            </CardTitle>
                            <div className="flex gap-2 flex-wrap">
                              {position.employmentType && (
                                <Badge variant="outline" className="text-xs">
                                  <Clock className="h-3 w-3 mr-1" />
                                  {position.employmentType === 'full-time' ? t('positions.fullTime') : t('positions.projectBased')}
                                </Badge>
                              )}
                              {isFilled ? (
                                <>
                                  <Badge className={isClosed ? "bg-gray-200 text-gray-700 dark:bg-gray-700 dark:text-gray-300 border-gray-400" : "bg-green-500/20 text-green-700 dark:text-green-300 border-green-500/30 hover:bg-green-500/30"}>
                                    <CheckCircle2 className="h-3 w-3 mr-1" />
                                    {isClosed ? (locale === 'ar' ? 'اكتمل الفريق' : 'Team Complete') : t('positions.filled')}
                                  </Badge>
                                  {position.filledBy && (
                                    <Badge variant="outline" className="bg-orange-500/10 text-orange-700 dark:text-orange-400 border-orange-500/30">
                                      {position.filledBy}
                                    </Badge>
                                  )}
                                </>
                              ) : (
                                <>
                                  <Badge variant="default" className="shadow-sm">
                                    {position.count} {locale === 'ar' ? 'وظيفة' : 'position(s)'}
                                  </Badge>
                                  <Badge className="bg-blue-500/20 text-blue-700 dark:text-blue-300 border-blue-500/30">
                                    {t('positions.vacant')}
                                  </Badge>
                                </>
                              )}
                            </div>
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="space-y-2 max-h-64 overflow-y-auto pr-2 custom-scrollbar">
                          <ul className="space-y-2">
                            {requirements.map((req, idx) => {
                              const isBonus = req.startsWith('⭐');
                              const isSection = req.startsWith('---');
                              const isEmpty = req.trim() === '';
                              const cleanReq = isBonus ? req.substring(2).trim() : req.replace(/^---\s*/, '').replace(/\s*---$/, '').trim();

                              if (isEmpty) {
                                return <li key={idx} className="h-2" />;
                              }

                              if (isSection) {
                                return (
                                  <li key={idx} className="pt-3 pb-1.5 first:pt-0">
                                    <h4 className="text-xs font-bold uppercase tracking-wider text-primary/90 flex items-center gap-2">
                                      <div className="h-px flex-1 bg-primary/20" />
                                      {cleanReq}
                                      <div className="h-px flex-1 bg-primary/20" />
                                    </h4>
                                  </li>
                                );
                              }

                              return (
                                <li key={idx} className="text-sm flex items-start gap-2.5 pl-1 group/item">
                                  <CheckCircle2 className="h-3.5 w-3.5 text-primary/70 mt-0.5 flex-shrink-0 group-hover/item:text-primary transition-colors" />
                                  <span className="text-muted-foreground leading-relaxed">
                                    {isBonus && <span className="text-yellow-600 dark:text-yellow-400">⭐ </span>}
                                    {cleanReq}
                                  </span>
                                </li>
                              );
                            })}
                          </ul>
                        </div>
                        {!isFilled && (
                          <div className="pt-4 border-t">
                            <Link href={`/${locale}/careers/apply/${positionSlug(position.titleEn)}`}>
                              <Button className="w-full group/btn relative overflow-hidden" size="lg">
                                <span className="relative z-10 flex items-center justify-center gap-2">
                                  <Send className="h-4 w-4 group-hover/btn:translate-x-1 transition-transform" />
                                  {t('positions.applyNow')}
                                  <TrendingUp className="h-4 w-4 group-hover/btn:translate-y-[-2px] transition-transform" />
                                </span>
                                <div className="absolute inset-0 bg-gradient-to-r from-primary/0 via-primary-foreground/10 to-primary/0 translate-x-[-100%] group-hover/btn:translate-x-[100%] transition-transform duration-700" />
                              </Button>
                            </Link>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            </section>
          )}

          {/* Sales & Marketing Positions */}
          {salesPositions.length > 0 && (
            <section className="space-y-6">
              <div className="flex items-center gap-3 pb-4 border-b-2">
                <div className="p-3 rounded-xl bg-gradient-to-br from-orange-500/20 to-orange-500/5">
                  <ShoppingCart className="h-6 w-6 text-orange-600 dark:text-orange-400" />
                </div>
                <div>
                  <h3 className="text-3xl font-bold">{t('positions.sales')}</h3>
                  <p className="text-sm text-muted-foreground">{salesPositions.length} {locale === 'ar' ? 'وظيفة' : 'positions'}</p>
                </div>
              </div>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {salesPositions.map((position, index) => {
                  const isClosed = !position.isOpen;
                const isFilled = !!position.filledBy || isClosed;
                  const requirements = locale === 'ar' ? position.requirements : position.requirementsEn;
                  const positionId = (locale === 'ar' ? position.title : position.titleEn).toLowerCase().replace(/\s+/g, '-');
                  const isMarketingSpecialist = position.title === 'أخصائي تسويق رقمي' || position.titleEn === 'Digital Marketing Specialist';
                  return (
                    <Card
                      key={index}
                      id={positionId}
                      className={`
                        scroll-mt-24 transition-all duration-300 hover:shadow-xl group
                        ${isFilled
                          ? 'border-2 border-green-500/30 bg-gradient-to-br from-green-500/5 to-background'
                          : 'border-2 border-orange-500/30 hover:border-orange-500/50 bg-card hover:-translate-y-1'
                        }
                      `}
                    >
                      <CardHeader className="space-y-4">
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex-1">
                            <CardTitle className="text-xl mb-3 flex items-center gap-2">
                              {locale === 'ar' ? position.title : position.titleEn}
                              {!isFilled && <Sparkles className="h-4 w-4 text-primary animate-pulse" />}
                            </CardTitle>
                            <div className="flex gap-2 flex-wrap">
                              {position.employmentType && (
                                <Badge variant="outline" className="text-xs">
                                  <Clock className="h-3 w-3 mr-1" />
                                  {position.employmentType === 'full-time' ? t('positions.fullTime') : t('positions.projectBased')}
                                </Badge>
                              )}
                              {isFilled ? (
                                <>
                                  <Badge className={isClosed ? "bg-gray-200 text-gray-700 dark:bg-gray-700 dark:text-gray-300 border-gray-400" : "bg-green-500/20 text-green-700 dark:text-green-300 border-green-500/30 hover:bg-green-500/30"}>
                                    <CheckCircle2 className="h-3 w-3 mr-1" />
                                    {isClosed ? (locale === 'ar' ? 'اكتمل الفريق' : 'Team Complete') : t('positions.filled')}
                                  </Badge>
                                  {position.filledBy && (
                                    <Badge variant="outline" className="bg-orange-500/10 text-orange-700 dark:text-orange-400 border-orange-500/30">
                                      {position.filledBy}
                                    </Badge>
                                  )}
                                </>
                              ) : (
                                <>
                                  <Badge variant="default" className="shadow-sm">
                                    {position.count} {locale === 'ar' ? 'وظيفة' : 'position(s)'}
                                  </Badge>
                                  <Badge className="bg-blue-500/20 text-blue-700 dark:text-blue-300 border-blue-500/30">
                                    {t('positions.vacant')}
                                  </Badge>
                                </>
                              )}
                              {isMarketingSpecialist && !isFilled && (
                                <div className="relative">
                                  <div className="absolute inset-0 bg-gradient-to-r from-green-400 via-emerald-400 to-green-400 rounded-full blur-md opacity-75 animate-ping" />
                                  <Badge className="relative bg-gradient-to-r from-green-500 via-emerald-500 to-green-500 text-white font-bold text-xs px-4 py-2 shadow-xl border-2 border-white/80 hover:scale-105 transition-transform">
                                    <Sparkles className="h-3.5 w-3.5 mr-1.5 animate-spin" />
                                    {locale === 'ar' ? '✨ التقديم مفتوح' : '✨ Apply Open'}
                                  </Badge>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="space-y-2 max-h-64 overflow-y-auto pr-2 custom-scrollbar">
                          <ul className="space-y-2">
                            {requirements.map((req, idx) => {
                              const isBonus = req.startsWith('⭐');
                              const isSection = req.startsWith('---');
                              const isEmpty = req.trim() === '';
                              const cleanReq = isBonus ? req.substring(2).trim() : req.replace(/^---\s*/, '').replace(/\s*---$/, '').trim();

                              if (isEmpty) {
                                return <li key={idx} className="h-2" />;
                              }

                              if (isSection) {
                                return (
                                  <li key={idx} className="pt-3 pb-1.5 first:pt-0">
                                    <h4 className="text-xs font-bold uppercase tracking-wider text-primary/90 flex items-center gap-2">
                                      <div className="h-px flex-1 bg-primary/20" />
                                      {cleanReq}
                                      <div className="h-px flex-1 bg-primary/20" />
                                    </h4>
                                  </li>
                                );
                              }

                              return (
                                <li key={idx} className="text-sm flex items-start gap-2.5 pl-1 group/item">
                                  <CheckCircle2 className="h-3.5 w-3.5 text-primary/70 mt-0.5 flex-shrink-0 group-hover/item:text-primary transition-colors" />
                                  <span className="text-muted-foreground leading-relaxed">
                                    {isBonus && <span className="text-yellow-600 dark:text-yellow-400">⭐ </span>}
                                    {cleanReq}
                                  </span>
                                </li>
                              );
                            })}
                          </ul>
                        </div>
                        {!isFilled && (
                          <div className="pt-4 border-t">
                            <Link href={`/${locale}/careers/apply/${positionSlug(position.titleEn)}`}>
                              <Button className="w-full group/btn relative overflow-hidden" size="lg">
                                <span className="relative z-10 flex items-center justify-center gap-2">
                                  <Send className="h-4 w-4 group-hover/btn:translate-x-1 transition-transform" />
                                  {t('positions.applyNow')}
                                  <TrendingUp className="h-4 w-4 group-hover/btn:translate-y-[-2px] transition-transform" />
                                </span>
                                <div className="absolute inset-0 bg-gradient-to-r from-primary/0 via-primary-foreground/10 to-primary/0 translate-x-[-100%] group-hover/btn:translate-x-[100%] transition-transform duration-700" />
                              </Button>
                            </Link>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            </section>
          )}
        </div>

        {/* Enhanced Hiring Process */}
        <div className="mt-24 mb-16">
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 mb-4">
              <TrendingUp className="h-4 w-4 text-primary" />
              <span className="text-sm font-medium text-primary">{locale === 'ar' ? 'عملية التوظيف' : 'Hiring Process'}</span>
            </div>
            <h2 className="text-4xl font-bold mb-3">
              {t('hiringProcess.title')}
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              {locale === 'ar'
                ? 'رحلتك معنا خلال 4 خطوات بسيطة وواضحة'
                : 'Your journey with us through 4 simple and clear steps'}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 relative">
            {/* Connection Lines */}
            <div className="hidden lg:block absolute top-12 left-0 right-0 h-0.5 bg-gradient-to-r from-primary/0 via-primary/30 to-primary/0" />

            {[1, 2, 3, 4].map((step) => (
              <Card key={step} className="relative border-2 hover:border-primary/50 transition-all duration-300 hover:shadow-xl hover:-translate-y-2 group">
                <CardHeader>
                  <div className="relative">
                    <div className="absolute -top-6 left-1/2 -translate-x-1/2 rounded-full bg-gradient-to-br from-primary to-primary/70 text-primary-foreground w-12 h-12 flex items-center justify-center font-bold text-lg shadow-lg shadow-primary/30 group-hover:scale-110 transition-transform">
                      {step}
                    </div>
                  </div>
                  <CardTitle className="text-lg text-center mt-4 pt-4 border-t">
                    {t(`hiringProcess.step${step}`)}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground text-center leading-relaxed">
                    {t(`hiringProcess.step${step}Desc`)}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>

      </div>
    </PublicShell>
  );
}
