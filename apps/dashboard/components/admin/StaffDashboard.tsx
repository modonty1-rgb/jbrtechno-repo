import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@jbrtechno/ui';
import { Button } from '@jbrtechno/ui';
import { MetricCard } from '@jbrtechno/ui';
import { getUserTasks } from '@/actions/tasks';
import { getManagementNotes } from '@/actions/managementNotes';
import { getStaffTimeEntries } from '@/actions/clockify';
import { prisma } from '@jbrtechno/database';
import { UserRole, TaskStatus } from '@jbrtechno/database';
import { ListTodo, FileText, CheckCircle2, Clock, ArrowRight } from 'lucide-react';
import Link from 'next/link';
import { MyTimeRefreshButton } from './MyTimeRefreshButton';

interface StaffDashboardProps {
  userId: string;
  userName: string | null | undefined;
  locale: string;
  role: UserRole;
}

const formatHours = (hours: number): string => {
  const h = Math.floor(hours);
  const m = Math.floor((hours - h) * 60);
  return `${h}h ${m}m`;
};

export async function StaffDashboard({
  userId,
  userName,
  locale,
  role,
}: StaffDashboardProps) {
  const isArabic = true;

  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59);

  // Find staff record for this user (for Clockify summary)
  const staff = await prisma.staff.findUnique({
    where: { userId },
    select: { id: true },
  });

  const [tasksResult, notesResult, timeResult] = await Promise.all([
    getUserTasks(userId),
    getManagementNotes(userId, role),
    staff ? getStaffTimeEntries(staff.id) : Promise.resolve({ success: false } as const),
  ]);

  const tasks = tasksResult.success ? tasksResult.tasks || [] : [];
  const notes = notesResult.success ? notesResult.notes || [] : [];
  const hasTimeSummary =
    !!(timeResult && 'success' in timeResult && timeResult.success && timeResult.summary);

  const staffHours =
    hasTimeSummary && timeResult && 'summary' in timeResult && timeResult.summary
      ? timeResult.summary.totalHours
      : 0;

  const todayDate = new Date();
  const todayKey = todayDate.toISOString().split('T')[0];
  const todayHours =
    hasTimeSummary && timeResult && 'summary' in timeResult && timeResult.summary
      ? timeResult.summary.dailyBreakdown.find((day) => day.date === todayKey)?.hours || 0
      : 0;

  const pendingTasks = tasks.filter((t) => t.status === TaskStatus.PENDING).length;
  const inProgressTasks = tasks.filter((t) => t.status === TaskStatus.IN_PROGRESS).length;
  const completedTasks = tasks.filter((t) => t.status === TaskStatus.COMPLETED).length;
  const unreadNotes = notes.filter((n) => !(n.readBy && n.readBy.includes(userId))).length;

  return (
    <div className="container mx-auto px-4 py-6 max-w-7xl space-y-8">
      <div className="space-y-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            {isArabic ? 'لوحة التحكم' : 'Dashboard'}
          </h1>
          <p className="text-muted-foreground mt-1">
            {isArabic
              ? `مرحباً ${userName || ''}`
              : `Welcome, ${userName || 'User'}`}
          </p>
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <MetricCard
            title={isArabic ? 'إجمالي المهام' : 'Total Tasks'}
            value={tasks.length.toString()}
            icon={ListTodo}
          />
          <MetricCard
            title={isArabic ? 'مهام قيد الانتظار' : 'Pending Tasks'}
            value={pendingTasks.toString()}
            icon={Clock}
          />
          <MetricCard
            title={isArabic ? 'مهام قيد التنفيذ' : 'In Progress'}
            value={inProgressTasks.toString()}
            icon={CheckCircle2}
          />
          <MetricCard
            title={isArabic ? 'ملاحظات غير مقروءة' : 'Unread Notes'}
            value={unreadNotes.toString()}
            icon={FileText}
          />
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          <Card className="flex h-full flex-col">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>{isArabic ? 'مهامي' : 'My Tasks'}</CardTitle>
                  <CardDescription>
                    {isArabic
                      ? 'عرض وإدارة المهام المخصصة لك'
                      : 'View and manage tasks assigned to you'}
                  </CardDescription>
                </div>
                <ListTodo className="h-8 w-8 text-muted-foreground" />
              </div>
            </CardHeader>
            <CardContent className="flex-1 space-y-4">
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">
                    {isArabic ? 'إجمالي المهام' : 'Total Tasks'}
                  </span>
                  <span className="font-semibold">{tasks.length}</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">
                    {isArabic ? 'مكتملة' : 'Completed'}
                  </span>
                  <span className="font-semibold text-green-600 dark:text-green-400">
                    {completedTasks}
                  </span>
                </div>
              </div>
            </CardContent>
            <CardFooter>
              <Link href="/tasks/my-tasks" className="w-full">
                <Button className="w-full" variant="outline">
                  {isArabic ? 'عرض جميع المهام' : 'View All Tasks'}
                  <ArrowRight className={`h-4 w-4 ${isArabic ? 'mr-2 rotate-180' : 'ml-2'}`} />
                </Button>
              </Link>
            </CardFooter>
          </Card>

          <Card className="flex h-full flex-col">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>{isArabic ? 'سجل الوقت' : 'My Time'}</CardTitle>
                  <CardDescription>
                    {isArabic
                      ? 'عرض سجل ساعات عملك في Clockify'
                      : 'View your Clockify time entries'}
                  </CardDescription>
                </div>
                <Clock className="h-8 w-8 text-muted-foreground" />
              </div>
            </CardHeader>
            <CardContent className="flex-1 space-y-4">
              {hasTimeSummary ? (
                <div className={`grid grid-cols-1 gap-3 sm:grid-cols-2 ${isArabic ? 'text-right' : 'text-left'}`}>
                  {/* Month total */}
                  <div className="space-y-1">
                    <div className="text-xs uppercase tracking-wide text-muted-foreground">
                      {isArabic
                        ? startOfMonth.toLocaleDateString('ar-SA', { month: 'long', year: 'numeric' })
                        : startOfMonth.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                    </div>
                    <div className="text-2xl font-bold">
                      {formatHours(staffHours)}
                    </div>
                  </div>

                  {/* Today + date range */}
                  <div className={`flex flex-col items-start gap-2 ${isArabic ? 'items-end' : 'items-start'}`}>
                    <span className="text-xs text-muted-foreground">
                      {todayDate.toLocaleDateString('en-GB')}
                    </span>
                    <span className="inline-flex items-center rounded-full bg-muted px-3 py-1 text-xs font-medium text-muted-foreground">
                      <span className="font-semibold">
                        {formatHours(todayHours)}
                      </span>
                    </span>
                  </div>
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">
                  {isArabic
                    ? 'لا توجد ساعات عمل مسجلة لهذا الشهر حتى الآن.'
                    : 'No working hours recorded for this month yet.'}
                </p>
              )}
            </CardContent>
            <CardFooter className={`flex gap-2 ${isArabic ? 'flex-row-reverse' : ''}`}>
              <MyTimeRefreshButton className="h-10 w-10" />
              <Button variant="outline" className="flex-1 h-10" asChild>
              <Link href="/my-time">
                  {isArabic ? 'عرض سجل الوقت' : 'View My Time'}
                  <ArrowRight className={`h-4 w-4 ${isArabic ? 'mr-2 rotate-180' : 'ml-2'}`} />
                </Link>
              </Button>
            </CardFooter>
          </Card>

          <Card className="flex h-full flex-col">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>{isArabic ? 'الملاحظات' : 'Notes'}</CardTitle>
                  <CardDescription>
                    {isArabic
                      ? 'عرض الملاحظات والإعلانات المهمة'
                      : 'View important notes and announcements'}
                  </CardDescription>
                </div>
                <FileText className="h-8 w-8 text-muted-foreground" />
              </div>
            </CardHeader>
            <CardContent className="flex-1 space-y-4">
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">
                    {isArabic ? 'إجمالي الملاحظات' : 'Total Notes'}
                  </span>
                  <span className="font-semibold">{notes.length}</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">
                    {isArabic ? 'غير مقروءة' : 'Unread'}
                  </span>
                  <span className="font-semibold text-primary">
                    {unreadNotes}
                  </span>
                </div>
              </div>
            </CardContent>
            <CardFooter>
              <Link href="/notes" className="w-full">
                <Button className="w-full" variant="outline">
                  {isArabic ? 'عرض جميع الملاحظات' : 'View All Notes'}
                  <ArrowRight className={`h-4 w-4 ${isArabic ? 'mr-2 rotate-180' : 'ml-2'}`} />
                </Button>
              </Link>
            </CardFooter>
          </Card>
        </div>
      </div>
    </div>
  );
}
