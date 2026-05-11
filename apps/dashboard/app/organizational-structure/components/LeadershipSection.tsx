'use client';

import { PositionCard } from './PositionCard';
import { leadershipRoles } from '../helpers/staffRoles';

interface LeadershipSectionProps {
  locale: string;
}

export function LeadershipSection({ locale }: LeadershipSectionProps) {
  const isArabic = true;

  return (
    <div className="space-y-6">
      <div className="mx-auto max-w-6xl rounded-xl border bg-background/40 border-indigo-400 border-r-4 px-4 py-6">
        <div className="flex gap-4 flex-wrap justify-center">
          {leadershipRoles.map((role) => (
            <PositionCard
              key={role.title}
              title={role.title}
              count={1}
              icon={role.icon}
              filled={role.filled}
              filledBy={isArabic ? role.filledByAr ?? role.filledByEn : role.filledByEn ?? role.filledByAr}
              color={role.color}
              email={role.email}
              locale={locale}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
