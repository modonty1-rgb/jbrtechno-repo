import { Card, CardContent, CardHeader, CardTitle } from '@jbrtechno/ui';
import { Badge } from '@jbrtechno/ui';
import { getTimelinePhases } from '@/helpers/extractMetrics';

interface TimelineViewProps {
  locale: string;
}

export function TimelineView({ locale }: TimelineViewProps) {
  const phases = getTimelinePhases();
  const isArabic = true;

  return (
    <div className="space-y-8">
      {phases.map((phase, index) => (
        <div key={phase.month} className="relative">
          {index < phases.length - 1 && (
            <div
              className={`absolute top-12 ${isArabic ? 'right-6' : 'left-6'} h-full w-0.5 bg-border`}
            />
          )}
          
          <Card>
            <CardHeader>
              <div className="flex items-center gap-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary text-primary-foreground font-bold text-lg">
                  {phase.month}
                </div>
                <div className="flex-1">
                  <CardTitle className="text-2xl">
                    {isArabic ? phase.title : phase.focus}
                  </CardTitle>
                  <p className="text-sm text-muted-foreground">
                    {isArabic ? `الشهر ${phase.month}` : `Month ${phase.month}`}
                  </p>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">
                    {isArabic ? 'حجم الفريق' : 'Team Size'}
                  </p>
                  <p className="text-2xl font-bold">{phase.teamSize}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">
                    {isArabic ? 'المقالات' : 'Articles'}
                  </p>
                  <p className="text-2xl font-bold">{phase.articles}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">
                    {isArabic ? 'العملاء' : 'Clients'}
                  </p>
                  <p className="text-2xl font-bold">{phase.clients}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">MRR</p>
                  <p className="text-2xl font-bold">{phase.mrr}</p>
                </div>
              </div>
              
              {phase.clients > 0 && (
                <Badge variant="secondary" className="mt-4">
                  {isArabic ? 'معلم رئيسي' : 'Key Milestone'}
                </Badge>
              )}
            </CardContent>
          </Card>
        </div>
      ))}
    </div>
  );
}
















