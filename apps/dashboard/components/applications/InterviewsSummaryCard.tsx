import { Card, CardContent } from '@jbrtechno/ui';
import { CalendarClock } from 'lucide-react';
import Link from 'next/link';

interface InterviewsSummaryCardProps {
  totalInterviews: number;
  upcomingInterviews: number;
  locale: string;
}

export function InterviewsSummaryCard({
  totalInterviews,
  upcomingInterviews,
  locale,
}: InterviewsSummaryCardProps) {
  const isArabic = true;

  return (
    <Link href="/applications/interviews">
      <Card className="cursor-pointer hover:shadow-lg transition-all duration-300 border-primary/30 hover:border-primary/50 bg-gradient-to-br from-primary/5 to-transparent">
        <CardContent className="p-6">
          <div className="flex items-center justify-between gap-4 flex-wrap">
            <div className="min-w-[120px]">
              <p className="text-sm text-muted-foreground">
                {isArabic ? 'المقابلات' : 'Interviews'}
              </p>
              <div className="mt-1 space-y-1">
                <p className="text-2xl font-bold text-primary">{totalInterviews}</p>
                <p className="text-xs text-muted-foreground">
                  {isArabic ? `${upcomingInterviews} قادمة` : `${upcomingInterviews} upcoming`}
                </p>
              </div>
            </div>
            <CalendarClock className="h-8 w-8 text-primary" />
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
















