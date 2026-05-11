'use client';

import { PositionCard } from './PositionCard';
import { techRoles } from '../helpers/staffRoles';

interface TechTeamSectionProps {
  locale: string;
}

export function TechTeamSection({ locale }: TechTeamSectionProps) {
  const isArabic = true;

  return (
    <div className="space-y-4">
      <div className="space-y-4">
        <div className="flex gap-4 flex-wrap justify-center">
          {techRoles.map((role) => (
            <PositionCard
              key={role.title}
              title={role.title}
              count={1}
              icon={role.icon}
              filled={role.filled}
              filledBy={isArabic ? role.filledByAr ?? role.filledByEn : role.filledByEn ?? role.filledByAr}
              color={role.color}
              temporary={role.temporary}
              email={role.email}
              locale={locale}
            />
          ))}
        </div>
      </div>
    </div>
  );
}


