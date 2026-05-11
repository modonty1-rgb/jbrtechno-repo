import { Card, CardContent, CardHeader, CardTitle } from '@jbrtechno/ui';
import { Briefcase, Mail, Calendar, MessageSquare } from 'lucide-react';
import { prisma } from '@jbrtechno/database';
import { getApplicationCountsByPosition } from '@/lib/applications';
import { getTrialBalance } from '@/actions/accounting';
import { getAllStaffTimeSummary } from '@/actions/clockify';
import { MetricCard } from '@jbrtechno/ui';
import { TimeTrackingSection } from '@/components/admin/TimeTrackingSection';
import { auth } from '@/lib/auth';
import { UserRole } from '@jbrtechno/database';
import { StaffDashboard } from '@/components/admin/StaffDashboard';

export default async function AdminDashboardPage() {
  const locale = 'ar';
  const isArabic = true;

  const session = await auth();
  const userRole = session?.user?.role as UserRole;

  if (!session?.user) {
    return null;
  }

  if (userRole === UserRole.STAFF) {
    return (
      <StaffDashboard
        userId={session.user.id}
        userName={session.user.name}
        locale={locale}
        role={userRole}
      />
    );
  }

  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59);

  const [
    applicationCounts,
    applications,
    contactMessages,
    financialData,
    timeSummaryResult,
  ] = await Promise.all([
    getApplicationCountsByPosition(),
    prisma.application.findMany({ select: { status: true, scheduledInterviewDate: true } }),
    prisma.contactMessage.count(),
    getTrialBalance(),
    getAllStaffTimeSummary(startOfMonth, endOfMonth),
  ]);

  const totalApplications = applicationCounts.reduce((sum, c) => sum + c.total, 0);
  const pendingApplications = applications.filter(a => a.status === 'PENDING').length;
  const acceptedApplications = applications.filter(a => a.status === 'ACCEPTED').length;

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const upcomingInterviews = applications.filter(
    (app) => app.scheduledInterviewDate !== null && new Date(app.scheduledInterviewDate) >= today
  ).length;

  return (
    <div className="container mx-auto px-4 py-6 max-w-7xl space-y-8">
      <div className="space-y-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            {isArabic ? 'لوحة التحكم' : 'Business Dashboard'}
          </h1>
          <p className="text-muted-foreground mt-1">
            {isArabic
              ? 'نظرة شاملة على أداء الأعمال والمؤشرات الرئيسية'
              : 'Comprehensive overview of business performance and key metrics'}
          </p>
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {isArabic ? 'إجمالي الإيرادات' : 'Total Revenue'}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-baseline gap-2">
                <span className="text-2xl font-bold text-green-600 dark:text-green-400">
                  {financialData.totalRevenue.toLocaleString()}
                </span>
                <span className="text-sm text-muted-foreground">SAR</span>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {isArabic ? 'إجمالي المصروفات' : 'Total Expenses'}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-baseline gap-2">
                <span className="text-2xl font-bold text-red-600 dark:text-red-400">
                  {financialData.totalExpenses.toLocaleString()}
                </span>
                <span className="text-sm text-muted-foreground">SAR</span>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {isArabic ? 'صافي الربح' : 'Net Profit'}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-baseline gap-2">
                <span
                  className={`text-2xl font-bold ${financialData.netProfit >= 0
                      ? 'text-green-600 dark:text-green-400'
                      : 'text-red-600 dark:text-red-400'
                    }`}
                >
                  {financialData.netProfit.toLocaleString()}
                </span>
                <span className="text-sm text-muted-foreground">SAR</span>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <MetricCard
            title={isArabic ? 'إجمالي السير الذاتية' : 'Total CVs'}
            value={totalApplications.toString()}
            icon={Briefcase}
          />
          <MetricCard
            title={isArabic ? 'طلبات قيد المراجعة' : 'Pending Review'}
            value={pendingApplications.toString()}
            icon={Calendar}
          />
          <MetricCard
            title={isArabic ? 'مقابلات قادمة' : 'Upcoming Interviews'}
            value={upcomingInterviews.toString()}
            icon={MessageSquare}
          />
          <MetricCard
            title={isArabic ? 'رسائل التواصل' : 'Contact Messages'}
            value={contactMessages.toString()}
            icon={Mail}
          />
        </div>

        {timeSummaryResult.success && timeSummaryResult.summaries && (
          <TimeTrackingSection
            summaries={timeSummaryResult.summaries}
            startDate={startOfMonth}
            endDate={endOfMonth}
            locale={locale}
          />
        )}
      </div>
    </div>
  );
}


