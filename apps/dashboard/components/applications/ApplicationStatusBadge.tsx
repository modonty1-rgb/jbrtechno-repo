import { Badge } from '@jbrtechno/ui';
import { ApplicationStatus } from '@jbrtechno/database';
import { CheckCircle2, Clock, XCircle, Eye } from 'lucide-react';

interface ApplicationStatusBadgeProps {
  status: ApplicationStatus;
  locale?: string;
  className?: string;
}

const statusConfig = {
  PENDING: {
    icon: Clock,
    labelEn: 'Pending',
    labelAr: 'قيد المراجعة',
    className: 'bg-yellow-500/10 text-yellow-700 dark:text-yellow-400 border-yellow-500/20',
  },
  REVIEWED: {
    icon: Eye,
    labelEn: 'Reviewed',
    labelAr: 'تمت المراجعة',
    className: 'bg-blue-500/10 text-blue-700 dark:text-blue-400 border-blue-500/20',
  },
  ACCEPTED: {
    icon: CheckCircle2,
    labelEn: 'Accepted',
    labelAr: 'مقبول',
    className: 'bg-green-500/10 text-green-700 dark:text-green-400 border-green-500/20',
  },
  REJECTED: {
    icon: XCircle,
    labelEn: 'Rejected',
    labelAr: 'مرفوض',
    className: 'bg-red-500/10 text-red-700 dark:text-red-400 border-red-500/20',
  },
};

export function ApplicationStatusBadge({ status, locale = 'en', className }: ApplicationStatusBadgeProps) {
  const config = statusConfig[status];
  const Icon = config.icon;
  const label = config.labelAr;

  return (
    <Badge variant="outline" className={`gap-1.5 ${config.className} ${className ?? ''}`}>
      <Icon className="h-3.5 w-3.5" />
      {label}
    </Badge>
  );
}
















