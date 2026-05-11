import { Loader2 } from 'lucide-react';
import { Card, CardContent, CardHeader } from '@jbrtechno/ui';
import { PublicShell } from '@/components/layout/PublicShell';

export default function InterviewLoading() {
  return (
    <PublicShell>
      <div className="container mx-auto px-4 py-8 max-w-3xl">
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2 mb-4">
              <div className="h-8 w-64 bg-muted animate-pulse rounded" />
            </div>
            <div className="space-y-3">
              <div className="h-20 w-full bg-muted animate-pulse rounded" />
              <div className="h-20 w-full bg-muted animate-pulse rounded" />
              <div className="h-16 w-full bg-muted animate-pulse rounded" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {Array.from({ length: 8 }).map((_, i) => (
                <div key={i} className="space-y-2">
                  <div className="h-4 w-32 bg-muted animate-pulse rounded" />
                  {i < 3 ? (
                    <div className="h-24 w-full bg-muted animate-pulse rounded" />
                  ) : (
                    <div className="h-10 w-full bg-muted animate-pulse rounded" />
                  )}
                </div>
              ))}
            </div>
            <div className="mt-6 flex items-center justify-center gap-2">
              <Loader2 className="h-6 w-6 animate-spin text-primary" />
              <span className="text-sm text-muted-foreground">
                جاري تحميل النموذج...
              </span>
            </div>
          </CardContent>
        </Card>
      </div>
    </PublicShell>
  );
}

