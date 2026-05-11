import { prisma } from '@jbrtechno/database';
import { getApplicationStatsByPosition } from '@/lib/applications';
import { ApplicationCard } from '@/components/applications/ApplicationCard';
import { Card, CardContent } from '@jbrtechno/ui';
import { Button } from '@jbrtechno/ui';
import { Briefcase, Users, Clock, CheckCircle2, XCircle, ArrowLeft, CalendarClock } from 'lucide-react';
import Link from 'next/link';
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
  const { locale, position } = params;
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
  const displayPosition =
    matchedPosition ? (locale === 'ar' ? matchedPosition.title : matchedPosition.titleEn) : decodedPosition;

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

  const buildFilterHref = (statusKey: StatusFilterKey) => {
    const params = new URLSearchParams();
    if (sort === 'newest') {
      params.set('sort', 'newest');
    }
    if (search) {
      params.set('search', search);
    }
    if (interviewFilter && interviewFilter !== 'all') {
      params.set('interviewFilter', interviewFilter);
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
  // Users can enter any part of the email or phone number to search
  // Restructure to properly combine AND conditions with OR
  if (search && search.trim()) {
    const searchTerm = search.trim();
    // Prisma's contains works for partial matching in MongoDB
    // It searches for the search term anywhere in the email or phone string
    // Use AND to properly combine with other conditions
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
    // Filter to only include applications without scheduled interview dates
    // This handles both null values and missing/undefined fields
    applications = fetchedApplications.filter((app) => {
      const interviewDate = app.scheduledInterviewDate;
      // scheduledInterviewDate is DateTime? (Date | null), so we just check if it's null/undefined
      return !interviewDate || interviewDate === null || interviewDate === undefined;
    });
  }

  // Calculate interview statistics
  const hasInterviewCount = fetchedApplications.filter(
    (app) => app.scheduledInterviewDate != null
  ).length;

  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      {/* Header */}
      <div className="mb-8">
        <Link href="/applications">
          <Button variant="ghost" size="sm" className="mb-4">
            <ArrowLeft className="h-4 w-4 mr-2" />
            {locale === 'ar' ? 'العودة لجميع الطلبات' : 'Back to All Applications'}
          </Button>
        </Link>

        <div className="flex items-center gap-3 mb-3">
          <div className="p-3 rounded-xl bg-gradient-to-br from-primary/20 to-primary/5">
            <Briefcase className="h-7 w-7 text-primary" />
          </div>
          <div>
            <h1 className="text-4xl font-bold">{displayPosition}</h1>
          </div>
        </div>
        <p className="text-muted-foreground text-base">
          {locale === 'ar'
            ? `إحصائيات وطلبات التوظيف لوظيفة ${displayPosition}`
            : `Application statistics and details for ${displayPosition} position`}
        </p>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-4 mb-8">
        <Link href={buildFilterHref('total')} className="block">
          <Card className={isActiveStatus('total') ? 'ring-2 ring-primary' : ''}>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">
                    {locale === 'ar' ? 'إجمالي الطلبات' : 'Total'}
                  </p>
                  <p className="text-3xl font-bold mt-1">{stats.total}</p>
                </div>
                <Users className="h-8 w-8 text-muted-foreground" />
              </div>
            </CardContent>
          </Card>
        </Link>

        <Link href={buildFilterHref('pending')} className="block">
          <Card className={isActiveStatus('pending') ? 'ring-2 ring-primary' : ''}>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">
                    {locale === 'ar' ? 'قيد المراجعة' : 'Pending'}
                  </p>
                  <p className="text-3xl font-bold mt-1 text-yellow-600">{stats.pending}</p>
                </div>
                <Clock className="h-8 w-8 text-yellow-600" />
              </div>
            </CardContent>
          </Card>
        </Link>

        <Link href={buildFilterHref('reviewed')} className="block">
          <Card className={isActiveStatus('reviewed') ? 'ring-2 ring-primary' : ''}>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">
                    {locale === 'ar' ? 'تمت المراجعة' : 'Reviewed'}
                  </p>
                  <p className="text-3xl font-bold mt-1 text-blue-600">{stats.reviewed}</p>
                </div>
                <CheckCircle2 className="h-8 w-8 text-blue-600" />
              </div>
            </CardContent>
          </Card>
        </Link>

        <Link href={buildFilterHref('accepted')} className="block">
          <Card className={isActiveStatus('accepted') ? 'ring-2 ring-primary' : ''}>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">
                    {locale === 'ar' ? 'مقبول' : 'Accepted'}
                  </p>
                  <p className="text-3xl font-bold mt-1 text-green-600">{stats.accepted}</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    {locale === 'ar' ? 'الردود:' : 'Responses:'}{' '}
                    <span className="text-green-500 font-semibold">{stats.acceptedWithResponses}</span>
                  </p>
                </div>
                <CheckCircle2 className="h-8 w-8 text-green-600" />
              </div>
            </CardContent>
          </Card>
        </Link>

        <Link href={buildFilterHref('rejected')} className="block">
          <Card className={isActiveStatus('rejected') ? 'ring-2 ring-primary' : ''}>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">
                    {locale === 'ar' ? 'مرفوض' : 'Rejected'}
                  </p>
                  <p className="text-3xl font-bold mt-1 text-red-600">{stats.rejected}</p>
                </div>
                <XCircle className="h-8 w-8 text-red-600" />
              </div>
            </CardContent>
          </Card>
        </Link>

        <Card className="border-purple-200 dark:border-purple-800 bg-gradient-to-br from-purple-50 to-transparent dark:from-purple-950/20">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">
                  {locale === 'ar' ? 'لديهم موعد مقابلة' : 'With Interview'}
                </p>
                <p className="text-3xl font-bold mt-1 text-purple-600">{hasInterviewCount}</p>
              </div>
              <CalendarClock className="h-8 w-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Sort and Applications List */}
      <>
        <div className="flex items-center gap-4 mb-6 flex-wrap">
          <h2 className="text-xl font-semibold">
            {locale === 'ar' ? 'الطلبات' : 'Applications'}
          </h2>
          <div className="flex items-center gap-3 flex-1 min-w-[300px]">
            <SearchApplications locale={locale} currentSearch={search || ''} />
            <SortApplications locale={locale} currentSort={sort || 'oldest'} />
            <FilterInterviewDropdown locale={locale} currentValue={interviewFilter || 'all'} />
          </div>
        </div>
        {applications.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {applications.map((application) => (
              <ApplicationCard key={application.id} application={application} locale={locale} />
            ))}
          </div>
        ) : (
        <Card>
          <CardContent className="p-12 text-center">
            <Briefcase className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">
              {search
                ? locale === 'ar'
                  ? 'لم يتم العثور على نتائج'
                  : 'No Results Found'
                : locale === 'ar'
                ? 'لا توجد طلبات بعد'
                : 'No Applications Yet'}
            </h3>
            <p className="text-muted-foreground">
              {search
                ? locale === 'ar'
                  ? `لا توجد طلبات تطابق البحث: "${search}"`
                  : `No applications match the search: "${search}"`
                : locale === 'ar'
                ? 'لم يتم استلام أي طلبات توظيف لهذه الوظيفة'
                : 'No job applications have been received for this position yet'}
            </p>
          </CardContent>
        </Card>
        )}
      </>
    </div>
  );
}

