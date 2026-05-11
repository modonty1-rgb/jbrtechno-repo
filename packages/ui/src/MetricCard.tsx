import { Card, CardContent } from './card';
import { LucideIcon } from 'lucide-react';

interface MetricCardProps {
  title: string;
  value: string;
  icon: LucideIcon;
  suffix?: string;
}

export function MetricCard({ title, value, icon: Icon, suffix }: MetricCardProps) {
  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex items-start justify-between">
          <div className="space-y-2">
            <p className="text-sm font-medium text-muted-foreground">{title}</p>
            <div className="flex items-baseline gap-1">
              <p className="text-3xl font-bold">{value}</p>
              {suffix && <span className="text-sm text-muted-foreground">{suffix}</span>}
            </div>
          </div>
          <div className="rounded-full bg-primary/10 p-3">
            <Icon className="h-6 w-6 text-primary" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
















