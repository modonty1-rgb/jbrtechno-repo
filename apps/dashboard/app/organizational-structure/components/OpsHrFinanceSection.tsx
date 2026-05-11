'use client';

import { PositionCard } from './PositionCard';
import { opsHrFinanceRoles } from '../helpers/staffRoles';

interface OpsHrFinanceSectionProps {
  locale: string;
}

export function OpsHrFinanceSection({ locale }: OpsHrFinanceSectionProps) {
  return (
    <div className="space-y-4">
      <div className="flex gap-4 flex-wrap justify-center">
        {opsHrFinanceRoles.map((role) => (
          <PositionCard
            key={role.title}
            title={role.title}
            count={1}
            icon={role.icon}
            color={role.color}
            email={role.email}
            locale={locale}
          />
        ))}
      </div>
    </div>
  );
}
