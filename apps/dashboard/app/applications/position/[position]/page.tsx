import { prisma } from '@jbrtechno/database';
import { getApplicationStatsByPosition } from '@/lib/applications';
import { ApplicationCard } from '@/components/applications/ApplicationCard';
import { ApplicationRow } from '@/components/applications/ApplicationRow';
import { ApplicationsViewToggle } from '@/components/applications/ApplicationsViewToggle';
import { Card, CardContent } from '@jbrtechno/ui';
import { Button } from '@jbrtechno/ui';
import { Briefcase, ArrowRight, CalendarClock } from 'lucide-react';
import Link from 'next/link';
import { cn } from '@jbrtechno/shared';
import { SortApplications } from '@/components/applications/SortApplications';
import { SearchApplications } from '@/components/applications/SearchApplications';
import { FilterInterviewDropdown } from '@/components/applications/FilterInterviewDropdown';

export default async function PositionApplicationsPage(
  props: {
    params: Promise<{ locale: string; position: string }>;
    searchParams: Promise<{ sort?: string; status?: string; search?: string; interviewFilter?: string }>;
  }
) {
  const params = await props.params;
  const { position } = params;
  const searchParams = await props.searchParams;
  const { sort, status, search, interviewFilter } = searchParams;
  const decodedPosition = decodeURIComponent(position);
  // Look up the position in DB by either title or titleEn
  const matchedPosition = await prisma.position.findFirst({
    where: { OR: [{ title: decodedPosition }, { titleEn: decodedPosition }] },
  });
  const canonicalPosition = matchedPosition?.title ?? decodedPosition;
  const positionAliases = matchedPosition
    ? Array.from(new Set([matchedPosition.title, matchedPosition.titleEn]))
    : [decodedPosition];
  const displayPosition = matchedPosition?.title ?? decodedPosition;

  type StatusFilterKey = 'pending' | 'reviewed' | 'accepted' | 'rejected' | 'total';
  const statusValueMap: Record<Exclude<StatusFilterKey, 'total'>, 'PENDING' | 'REVIEWED' | 'ACCEPTED' | 'REJECTED'> = {
    pending: 'PENDING',
    reviewed: 'REVIEWED',
    accepted: 'ACCEPTED',
    rejected: 'REJECTED',
  };
  const allowedStatusKeys: StatusFilterKey[] = ['pending', 'reviewed', 'accepted', 'rejected', 'total'];
  const normalizedStatus: StatusFilterKey =
    status && allowedStatusKeys.includes(status.toLowerCase() as StatusFilterKey)
      ? (status.toLowerCase() as StatusFilterKey)
      : 'pending';
  const selectedStatus =
    normalizedStatus === 'total'
      ? null
      : statusValueMap[normalizedStatus as Exclude<StatusFilterKey, 'total'>];

  const buildFilterHref = (statusKey: StatusFilterKey, interviewKey?: string) => {
    const params = new URLSearchParams();
    if (sort === 'newest') {
      params.set('sort', 'newest');
    }
    if (search) {
      params.set('search', search);
    }
    const effectiveInterview = interviewKey ?? interviewFilter;
    if (effectiveInterview && effectiveInterview !== 'all') {
      params.set('interviewFilter', effectiveInterview);
    }
    params.set('status', statusKey);
    return `?${params.toString()}`;
  };

  const isActiveStatus = (statusKey: StatusFilterKey) => normalizedStatus === statusKey;

  // Determine sort order (default: oldest first)
  const sortOrder = sort === 'newest' ? 'desc' : 'asc';

  // Build where clause
  const baseConditions: any = {
    position: { in: positionAliases },
    ...(selectedStatus ? { status: selectedStatus } : {}),
  };

  // Build final where clause
  let whereClause: any = baseConditions;

  // Add interview filter
  // Note: For "not-yet", we'll filter in JavaScript after fetching
  // because Prisma MongoDB null filtering can be unreliable for missing fields
  if (interviewFilter === 'has') {
    whereClause.scheduledInterviewDate = { not: null };
  }
  // For "not-yet", we don't add the filter here - we'll filter after fetching

  // Add search filter for email or phone (supports partial text matching)
  if (search && search.trim()) {
    const searchTerm = search.trim();
    whereClause = {
      AND: [
        whereClause,
        {
          OR: [
            { email: { contains: searchTerm } },
            { phone: { contains: searchTerm } },
          ],
        },
      ],
    };
  }

  // Fetch statistics and applications for this position
  const [stats, fetchedApplications] = await Promise.all([
    getApplicationStatsByPosition(canonicalPosition, positionAliases),
    prisma.application.findMany({
      where: whereClause,
      orderBy: { createdAt: sortOrder },
    }),
  ]);

  // Post-filter for "not-yet" - filter in JavaScript to ensure it works correctly
  let applications = fetchedApplications;
  if (interviewFilter === 'not-yet') {
    applications = fetchedApplications.filter((app) => !app.scheduledInterviewDate);
  }

  // Calculate interview statistics
  const hasInterviewCount = fetchedApplications.filter(
    (app) => app.scheduledInterviewDate != null
  ).length;

  const chipBase =
    'inline-flex items-center gap-2 px-4 py-2 rounded-full border text-[13.5px] font-bold transition-colors';
  const chipIdle = 'border-border bg-card text-muted-foreground hover:border-primary';
  const chipActive = 'border-primary bg-primary text-primary-foreground';

  const statusChips: { key: StatusFilterKey; label: string; count: number; countClass: string }[] = [
    { key: 'total', label: 'الكل', count: stats.total, countClass: 'text-foreground' },
    { key: 'pending', label: 'قيد المراجعة', count: stats.pending, countClass: 'text-warning' },
    { key: 'reviewed', label: 'تمت المراجعة', count: stats.reviewed, countClass: 'text-info' },
    { key: 'accepted', label: 'مقبول', count: stats.accepted, countClass: 'text-success' },
    { key: 'rejected', label: 'مرفوض', count: stats.rejected, countClass: 'text-destructive' },
  ];

  const interviewChipActive = interviewFilter === 'has';

  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      {/* Header */}
      <div className="mb-6">
        <Link href="/applications">
          <Button variant="ghost" size="sm" className="mb-4">
            <ArrowRight className="h-4 w-4 ms-0 me-2" />
            العودة لجميع الطلبات
          </Button>
        </Link>

        <div className="flex items-center gap-3">
          <div className="p-3 rounded-xl bg-gradient-to-br from-primary/20 to-primary/5">
            <Briefcase className="h-7 w-7 text-primary" />
          </div>
          <div>
            <h1 className="text-3xl font-bold">{displayPosition}</h1>
            <p className="text-muted-foreground text-sm">طلبات التوظيف المقدمة على هذه الوظيفة</p>
          </div>
        </div>
      </div>

      {/* Status filter chips */}
      <div className="flex flex-wrap gap-2 mb-4">
        {statusChips.map((chip) => (
          <Link
            key={chip.key}
            href={buildFilterHref(chip.key)}
            className={cn(chipBase, isActiveStatus(chip.key) ? chipActive : chipIdle)}
          >
            {chip.label}
            <span className={cn('text-[15px] font-extrabold', isActiveStatus(chip.key) ? 'text-primary-foreground' : chip.countClass)}>
              {chip.count}
            </span>
          </Link>
        ))}
        <Link
          href={buildFilterHref(normalizedStatus, interviewChipActive ? 'all' : 'has')}
          className={cn(chipBase, interviewChipActive ? chipActive : chipIdle)}
        >
          <CalendarClock className="h-4 w-4" />
          لديهم مقابلة
          <span className={cn('text-[15px] font-extrabold', interviewChipActive ? 'text-primary-foreground' : 'text-chart-3')}>
            {hasInterviewCount}
          </span>
        </Link>
      </div>

      {/* Toolbar */}
      <div className="flex items-center gap-3 mb-6 flex-wrap">
        <div className="flex items-center gap-3 flex-1 min-w-[280px]">
          <SearchApplications locale="ar" currentSearch={search || ''} />
          <SortApplications locale="ar" currentSort={sort || 'oldest'} />
          <FilterInterviewDropdown locale="ar" currentValue={interviewFilter || 'all'} />
        </div>
        <ApplicationsViewToggle />
      </div>

      {applications.length > 0 ? (
        <>
          {/* Rows view (default) */}
          <div className="flex flex-col gap-2 [[data-applications-view=cards]_&]:hidden">
            {applications.map((application) => (
              <ApplicationRow key={application.id} application={application} />
            ))}
          </div>
          {/* Cards view */}
          <div className="hidden [[data-applications-view=cards]_&]:grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {applications.map((application) => (
              <ApplicationCard key={application.id} application={application} />
            ))}
          </div>
        </>
      ) : (
        <Card>
          <CardContent className="p-12 text-center">
            <Briefcase className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">
              {search ? 'لم يتم العثور على نتائج' : 'لا توجد طلبات بعد'}
            </h3>
            <p className="text-muted-foreground">
              {search
                ? `لا توجد طلبات تطابق البحث: "${search}"`
                : 'لم يتم استلام أي طلبات توظيف لهذه الوظيفة'}
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
