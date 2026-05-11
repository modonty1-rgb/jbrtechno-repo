import { prisma } from '@jbrtechno/database';
import { Card, CardContent, CardHeader, CardTitle } from '@jbrtechno/ui';
import { InterviewCard } from '@/components/applications/InterviewCard';
import { InterviewsPageClient } from '@/components/applications/InterviewsPageClient';
import { CalendarClock, ArrowLeft } from 'lucide-react';
import Link from 'next/link';

interface InterviewsPageProps {
  params: Promise<{ locale: string }>;
}

export default async function InterviewsPage({ params }: InterviewsPageProps) {
  const { locale } = await params;
  const isArabic = true;

  const applications = await prisma.application.findMany({
    where: {
      scheduledInterviewDate: { not: null },
    },
    select: {
      id: true,
      applicantName: true,
      position: true,
      phone: true,
      profileImageUrl: true,
      scheduledInterviewDate: true,
      interviewResponseSubmittedAt: true,
      appointmentConfirmed: true,
      lastSalary: true,
      expectedSalary: true,
    },
    orderBy: [
      { scheduledInterviewDate: 'desc' },
      { interviewResponseSubmittedAt: 'desc' },
    ],
  });

  const applicationIds = applications.map((app) => app.id);

  const interviewResults = await prisma.interviewResult.findMany({
    where: {
      applicationId: { in: applicationIds },
    },
    select: {
      applicationId: true,
      result: true,
    },
  });

  const resultMap = new Map(
    interviewResults.map((result) => [result.applicationId, { result: result.result }])
  );

  const interviews = applications.map((app) => ({
    ...app,
    interviewResult: resultMap.get(app.id) || null,
  }));

  // Calculate statistics
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const totalInterviews = interviews.length;
  const upcomingInterviews = interviews.filter(
    (interview) =>
      interview.scheduledInterviewDate &&
      new Date(interview.scheduledInterviewDate) >= today
  ).length;
  const passedInterviews = interviews.filter(
    (interview) => interview.interviewResult?.result === 'PASSED'
  ).length;
  const failedInterviews = interviews.filter(
    (interview) => interview.interviewResult?.result === 'FAILED'
  ).length;
  const pendingResults = interviews.filter(
    (interview) =>
      interview.interviewResult?.result === 'PENDING' || !interview.interviewResult
  ).length;

  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      <div className="mb-8">
        <Link
          href="/applications"
          className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors mb-6"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>{isArabic ? 'العودة إلى الطلبات' : 'Back to Applications'}</span>
        </Link>

        <div className="flex items-center gap-3 mb-3">
          <div className="p-3 rounded-xl bg-gradient-to-br from-primary/20 to-primary/5">
            <CalendarClock className="h-7 w-7 text-primary" />
          </div>
          <div>
            <h1 className="text-4xl font-bold">
              {isArabic ? 'المقابلات' : 'Interviews'}
            </h1>
          </div>
        </div>
        <p className="text-muted-foreground text-base">
          {isArabic
            ? 'إدارة ومتابعة جميع المقابلات المجدولة'
            : 'Manage and track all scheduled interviews'}
        </p>
      </div>

      <InterviewsPageClient
        interviews={interviews.map((interview) => ({
          ...interview,
          appointmentConfirmed: interview.appointmentConfirmed ?? false,
          lastSalary: interview.lastSalary || null,
          expectedSalary: interview.expectedSalary || null,
        }))}
        statistics={{
          total: totalInterviews,
          upcoming: upcomingInterviews,
          passed: passedInterviews,
          failed: failedInterviews,
          pending: pendingResults,
        }}
        locale={locale}
      />
    </div>
  );
}
