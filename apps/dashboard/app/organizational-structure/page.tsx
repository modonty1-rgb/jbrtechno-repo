import { OrganizationalStructure } from './components/OrganizationalStructure';
import { prisma } from '@jbrtechno/database';
import { Card, CardContent, CardHeader, CardTitle } from '@jbrtechno/ui';
import { Network, Users, CheckCircle2, AlertCircle, TrendingUp } from 'lucide-react';

export default async function OrganizationalStructurePage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const isArabic = true;
  const positions = await prisma.position.findMany({
    orderBy: [{ phase: 'asc' }, { order: 'asc' }],
  });

  const totalPositions = positions.length;
  const filledPositions = positions.filter((p) => p.filledBy).length;
  const vacantPositions = totalPositions - filledPositions;
  const fillRate = totalPositions > 0 ? Math.round((filledPositions / totalPositions) * 100) : 0;

  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl space-y-8">
      {/* Header Section */}
      <div className="space-y-4">
        <div className="flex items-center gap-3">
          <div className="p-3 rounded-xl bg-gradient-to-br from-primary/20 to-primary/5 backdrop-blur-sm">
            <Network className="h-7 w-7 text-primary" />
          </div>
          <div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text">
              {isArabic ? 'الهيكل التنظيمي' : 'Organizational Structure'}
            </h1>
            <p className="text-muted-foreground mt-1">
              {isArabic
                ? 'نظرة شاملة على هيكل الفريق والمناصب - مؤشرات الأداء والوضع الحالي'
                : 'Comprehensive view of team structure and positions - Performance indicators and current status'}
            </p>
          </div>
        </div>

        {/* Business Metrics */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card className="border-2 border-primary/20">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                <Users className="h-4 w-4" />
                {isArabic ? 'إجمالي المناصب' : 'Total Positions'}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-baseline gap-2">
                <span className="text-3xl font-bold">{totalPositions}</span>
                <span className="text-sm text-muted-foreground">{isArabic ? 'منصب' : 'positions'}</span>
              </div>
            </CardContent>
          </Card>

          <Card className="border-2 border-green-500/20 bg-gradient-to-br from-green-500/5 to-transparent">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-green-600 dark:text-green-400" />
                {isArabic ? 'مناصب مشغولة' : 'Filled Positions'}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-baseline gap-2">
                <span className="text-3xl font-bold text-green-600 dark:text-green-400">{filledPositions}</span>
                <span className="text-sm text-muted-foreground">{isArabic ? 'منصب' : 'positions'}</span>
              </div>
            </CardContent>
          </Card>

          <Card className="border-2 border-orange-500/20 bg-gradient-to-br from-orange-500/5 to-transparent">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                <AlertCircle className="h-4 w-4 text-orange-600 dark:text-orange-400" />
                {isArabic ? 'مناصب شاغرة' : 'Vacant Positions'}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-baseline gap-2">
                <span className="text-3xl font-bold text-orange-600 dark:text-orange-400">{vacantPositions}</span>
                <span className="text-sm text-muted-foreground">{isArabic ? 'منصب' : 'positions'}</span>
              </div>
            </CardContent>
          </Card>

          <Card className="border-2 border-blue-500/20 bg-gradient-to-br from-blue-500/5 to-transparent">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                <TrendingUp className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                {isArabic ? 'معدل الإشغال' : 'Fill Rate'}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-baseline gap-2">
                <span className="text-3xl font-bold text-blue-600 dark:text-blue-400">{fillRate}%</span>
                <span className="text-sm text-muted-foreground">{isArabic ? 'مكتمل' : 'complete'}</span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Organizational Structure */}
      <OrganizationalStructure locale={locale} />
    </div>
  );
}

