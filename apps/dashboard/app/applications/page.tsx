import { prisma } from '@jbrtechno/database';
import { Card, CardContent, CardHeader, CardTitle } from '@jbrtechno/ui';
import { Badge } from '@jbrtechno/ui';
import { Briefcase, Users, Clock, CheckCircle2, XCircle, ArrowRight, CalendarClock, Eye } from 'lucide-react';
import Link from 'next/link';
import { InterviewsSummaryCard } from '@/components/applications/InterviewsSummaryCard';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@jbrtechno/ui';
import { Button } from '@jbrtechno/ui';
import { FinalHireSection } from '@/components/applications/FinalHireSection';

export default async function ApplicationsPage({
  params
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;

  // Fetch all applications and group by position
  const [applications, stats] = await Promise.all([
    prisma.application.findMany({
      orderBy: { createdAt: 'desc' },
    }),
    prisma.application.groupBy({
      by: ['status'],
      _count: true,
    }),
  ]);

  const statsMap = {
    total: applications.length,
    pending: stats.find((s) => s.status === 'PENDING')?._count || 0,
    reviewed: stats.find((s) => s.status === 'REVIEWED')?._count || 0,
    accepted: stats.find((s) => s.status === 'ACCEPTED')?._count || 0,
    rejected: stats.find((s) => s.status === 'REJECTED')?._count || 0,
  };

  // Calculate interview statistics - only count actual scheduled interviews
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const totalInterviews = applications.filter(
    (app) => app.scheduledInterviewDate !== null
  ).length;

  const upcomingInterviews = applications.filter(
    (app) =>
      app.scheduledInterviewDate !== null &&
      new Date(app.scheduledInterviewDate) >= today
  ).length;

  // Get all team positions from DB (live source of truth)
  const teamPositions = await prisma.position.findMany({
    orderBy: [{ phase: 'asc' }, { order: 'asc' }],
  });

  // Group applications by position (using Position.title as canonical key)
  const applicationsByPosition = applications.reduce((acc, app) => {
    const key = app.position;
    if (!acc[key]) {
      acc[key] = { position: key, total: 0, pending: 0, reviewed: 0, accepted: 0, rejected: 0 };
    }
    acc[key].total++;
    if (app.status === 'PENDING') acc[key].pending++;
    if (app.status === 'REVIEWED') acc[key].reviewed++;
    if (app.status === 'ACCEPTED') acc[key].accepted++;
    if (app.status === 'REJECTED') acc[key].rejected++;
    return acc;
  }, {} as Record<string, { position: string; total: number; pending: number; reviewed: number; accepted: number; rejected: number }>);

  // Build position stats — include applications for positions both in DB and any orphans
  const dbStats = teamPositions.map((pos) => {
    const appData = applicationsByPosition[pos.title] ?? applicationsByPosition[pos.titleEn];
    return {
      position: pos.title,
      titleAr: pos.title,
      total: appData?.total || 0,
      pending: appData?.pending || 0,
      reviewed: appData?.reviewed || 0,
      accepted: appData?.accepted || 0,
      rejected: appData?.rejected || 0,
      hasApplications: !!appData,
    };
  });

  // Surface orphaned applications (whose position no longer exists in DB)
  const knownTitles = new Set(teamPositions.flatMap((p) => [p.title, p.titleEn]));
  const orphans = Object.values(applicationsByPosition)
    .filter((g) => !knownTitles.has(g.position))
    .map((g) => ({
      position: g.position,
      titleAr: g.position,
      total: g.total,
      pending: g.pending,
      reviewed: g.reviewed,
      accepted: g.accepted,
      rejected: g.rejected,
      hasApplications: true,
    }));

  const positionStats = [...dbStats, ...orphans]
    .sort((a, b) => (b.total - a.total))
    .filter((pos) => pos.total > 0);

  // Fetch accepted applications with scheduled interviews
  const acceptedApplications = await prisma.application.findMany({
    where: {
      status: 'ACCEPTED',
      scheduledInterviewDate: { not: null },
    },
    select: {
      id: true,
      applicantName: true,
      position: true,
      email: true,
      phone: true,
      scheduledInterviewDate: true,
      createdAt: true,
    },
    orderBy: { createdAt: 'desc' },
  });

  // Get interview results for these applications
  const acceptedApplicationIds = acceptedApplications.map((app) => app.id);
  const interviewResults = await prisma.interviewResult.findMany({
    where: {
      applicationId: { in: acceptedApplicationIds },
      result: 'PASSED',
    },
    select: {
      applicationId: true,
      result: true,
    },
  });

  // Create a map of applicationId to interview result
  const resultMap = new Map(
    interviewResults.map((result) => [result.applicationId, result.result])
  );

  // Filter to only applications with PASSED interview result
  const acceptedInterviewedApplications = acceptedApplications.filter(
    (app) => resultMap.has(app.id)
  );

  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-3">
          <div className="p-3 rounded-xl bg-gradient-to-br from-primary/20 to-primary/5">
            <Briefcase className="h-7 w-7 text-primary" />
          </div>
          <div>
            <h1 className="text-4xl font-bold">
              {locale === 'ar' ? 'طلبات التوظيف' : 'Job Applications'}
            </h1>
          </div>
        </div>
        <p className="text-muted-foreground text-base">
          {locale === 'ar'
            ? 'نظرة عامة على طلبات التوظيف حسب الوظيفة'
            : 'Overview of job applications by position'}
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-4 mb-8">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">
                  {locale === 'ar' ? 'إجمالي الطلبات' : 'Total Applications'}
                </p>
                <p className="text-3xl font-bold mt-1">{statsMap.total}</p>
              </div>
              <Users className="h-8 w-8 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">
                  {locale === 'ar' ? 'قيد المراجعة' : 'Pending'}
                </p>
                <p className="text-3xl font-bold mt-1 text-yellow-600">{statsMap.pending}</p>
              </div>
              <Clock className="h-8 w-8 text-yellow-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">
                  {locale === 'ar' ? 'تمت المراجعة' : 'Reviewed'}
                </p>
                <p className="text-3xl font-bold mt-1 text-blue-600">{statsMap.reviewed}</p>
              </div>
              <CheckCircle2 className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">
                  {locale === 'ar' ? 'مقبول' : 'Accepted'}
                </p>
                <p className="text-3xl font-bold mt-1 text-green-600">{statsMap.accepted}</p>
              </div>
              <CheckCircle2 className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">
                  {locale === 'ar' ? 'مرفوض' : 'Rejected'}
                </p>
                <p className="text-3xl font-bold mt-1 text-red-600">{statsMap.rejected}</p>
              </div>
              <XCircle className="h-8 w-8 text-red-600" />
            </div>
          </CardContent>
        </Card>

        <InterviewsSummaryCard
          totalInterviews={totalInterviews}
          upcomingInterviews={upcomingInterviews}
          locale={locale}
        />
      </div>

      {/* Position Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {positionStats.map((positionStat) => {
          const displayName = locale === 'ar' ? positionStat.titleAr : positionStat.position;
          const hasApps = positionStat.hasApplications;

          return (
            <Link
              key={positionStat.position}
              href={`/applications/position/${encodeURIComponent(positionStat.position)}`}
            >
              <Card className={`h-full hover:shadow-lg transition-all duration-300 cursor-pointer group ${hasApps
                ? 'border-primary/30 hover:border-primary/50 bg-gradient-to-br from-primary/5 to-transparent'
                : 'border-muted hover:border-muted-foreground/30 bg-muted/30'
                }`}>
                <CardHeader>
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3 flex-1">
                      <div className={`p-3 rounded-xl transition-all ${hasApps
                        ? 'bg-gradient-to-br from-primary/20 to-primary/5 group-hover:from-primary/30 group-hover:to-primary/10'
                        : 'bg-muted/50 group-hover:bg-muted/70'
                        }`}>
                        <Briefcase className={`h-6 w-6 ${hasApps ? 'text-primary' : 'text-muted-foreground'}`} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <CardTitle className={`text-lg mb-1 line-clamp-2 ${!hasApps && 'text-muted-foreground'}`}>
                          {displayName}
                        </CardTitle>
                        <div className="flex items-center gap-2">
                          <Badge
                            variant={hasApps ? 'secondary' : 'outline'}
                            className={`text-xs ${!hasApps && 'text-muted-foreground'}`}
                          >
                            {positionStat.total} {locale === 'ar' ? 'طلب' : 'applications'}
                          </Badge>
                        </div>
                      </div>
                    </div>
                    <ArrowRight className={`h-5 w-5 text-muted-foreground group-hover:text-primary transition-all group-hover:translate-x-1 ${locale === 'ar' ? 'rotate-180' : ''}`} />
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {positionStat.pending > 0 && (
                      <div className="flex items-center justify-between text-sm">
                        <div className="flex items-center gap-2">
                          <Clock className="h-4 w-4 text-yellow-600" />
                          <span className="text-muted-foreground">
                            {locale === 'ar' ? 'قيد المراجعة' : 'Pending'}
                          </span>
                        </div>
                        <span className="font-semibold text-yellow-600">{positionStat.pending}</span>
                      </div>
                    )}
                    {positionStat.reviewed > 0 && (
                      <div className="flex items-center justify-between text-sm">
                        <div className="flex items-center gap-2">
                          <CheckCircle2 className="h-4 w-4 text-blue-600" />
                          <span className="text-muted-foreground">
                            {locale === 'ar' ? 'تمت المراجعة' : 'Reviewed'}
                          </span>
                        </div>
                        <span className="font-semibold text-blue-600">{positionStat.reviewed}</span>
                      </div>
                    )}
                    {positionStat.accepted > 0 && (
                      <div className="flex items-center justify-between text-sm">
                        <div className="flex items-center gap-2">
                          <CheckCircle2 className="h-4 w-4 text-green-600" />
                          <span className="text-muted-foreground">
                            {locale === 'ar' ? 'مقبول' : 'Accepted'}
                          </span>
                        </div>
                        <span className="font-semibold text-green-600">{positionStat.accepted}</span>
                      </div>
                    )}
                    {positionStat.rejected > 0 && (
                      <div className="flex items-center justify-between text-sm">
                        <div className="flex items-center gap-2">
                          <XCircle className="h-4 w-4 text-red-600" />
                          <span className="text-muted-foreground">
                            {locale === 'ar' ? 'مرفوض' : 'Rejected'}
                          </span>
                        </div>
                        <span className="font-semibold text-red-600">{positionStat.rejected}</span>
                      </div>
                    )}
                    {positionStat.total === 0 && (
                      <p className="text-sm text-muted-foreground text-center py-2 italic">
                        {locale === 'ar' ? 'لا توجد طلبات بعد' : 'No applications yet'}
                      </p>
                    )}
                  </div>
                </CardContent>
              </Card>
            </Link>
          );
        })}
      </div>

      {/* Accepted Interviewed Applications Table */}
      {acceptedInterviewedApplications.length > 0 && (
        <Card className="mt-8">
          <CardHeader>
            <CardTitle className="text-2xl">
              {locale === 'ar' ? 'المرشحون المقبولون' : 'Accepted Candidates'}
            </CardTitle>
            <p className="text-sm text-muted-foreground mt-2">
              {locale === 'ar'
                ? 'جميع المرشحين المقبولين الذين اجتازوا المقابلة بنجاح'
                : 'All accepted candidates who passed the interview'}
            </p>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className={locale === 'ar' ? 'text-right' : 'text-left'}>
                      {locale === 'ar' ? 'اسم المرشح' : 'Applicant Name'}
                    </TableHead>
                    <TableHead className={locale === 'ar' ? 'text-right' : 'text-left'}>
                      {locale === 'ar' ? 'الوظيفة' : 'Position'}
                    </TableHead>
                    <TableHead className={locale === 'ar' ? 'text-right' : 'text-left'}>
                      {locale === 'ar' ? 'الهاتف' : 'Phone'}
                    </TableHead>
                    <TableHead className={locale === 'ar' ? 'text-right' : 'text-left'}>
                      {locale === 'ar' ? 'الإجراءات' : 'Actions'}
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {acceptedInterviewedApplications.map((application) => (
                    <TableRow key={application.id}>
                      <TableCell className="font-medium">
                        {application.applicantName}
                      </TableCell>
                      <TableCell>{application.position}</TableCell>
                      <TableCell>{application.phone}</TableCell>
                      <TableCell>
                        <Button
                          asChild
                          variant="outline"
                          size="sm"
                          className={locale === 'ar' ? 'flex-row-reverse' : ''}
                        >
                          <Link href={`/applications/${application.id}`}>
                            <Eye className={`h-4 w-4 ${locale === 'ar' ? 'ml-2' : 'mr-2'}`} />
                            {locale === 'ar' ? 'عرض' : 'View'}
                          </Link>
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Final Hire Section */}
      <FinalHireSection locale={locale} />
    </div>
  );
}

