'use client';

import { PositionCard } from './PositionCard';
import { LeadershipSection } from './LeadershipSection';
import { OpsHrFinanceSection } from './OpsHrFinanceSection';
import { TechTeamSection } from './TechTeamSection';
import { MarketingTeamSection } from './MarketingTeamSection';
import { ceoRole } from '../helpers/staffRoles';

interface OrganizationalStructureProps {
  locale: string;
}

export function OrganizationalStructure({ locale }: OrganizationalStructureProps) {
  const isArabic = true;
  const ceoFilledBy = isArabic ? ceoRole.filledByAr ?? ceoRole.filledByEn : ceoRole.filledByEn ?? ceoRole.filledByAr;

  return (
    <div className="space-y-8">
      {/* CEO Level */}
      <div className="flex justify-center">
        <PositionCard
          title={ceoRole.title}
          count={1}
          icon={ceoRole.icon}
          filled={ceoRole.filled}
          filledBy={ceoFilledBy}
          color={ceoRole.color}
          email={ceoRole.email}
          locale={locale}
        />
      </div>

      {/* Leadership Level */}
      <LeadershipSection locale={locale} />

      {/* Operations, HR & Finance Section */}
      <OpsHrFinanceSection locale={locale} />

      {/* Section Divider */}
      <div className="my-12 flex justify-center">
        <div className="w-48 h-px bg-border/40" />
      </div>

      {/* CTO → Technical Team Section */}
      <TechTeamSection locale={locale} />

      {/* Section Divider */}
      <div className="my-12 flex justify-center">
        <div className="w-48 h-px bg-border/40" />
      </div>

      {/* Head of Marketing → Sales & Marketing Team Section */}
      <MarketingTeamSection locale={locale} />

      {/* Color system hint */}
      <div className="pt-4 pb-2 px-4">
        <p className="text-xs text-muted-foreground text-center max-w-2xl mx-auto leading-relaxed">
          {isArabic
            ? 'نظام الألوان: لون إطار الكرت يوضح القائد المسؤول عن القسم. النيلي = المدير التنفيذي، الأزرق = التقنية، البرتقالي = العمليات، الكهرماني = الموارد البشرية، الأخضر = المالية، الوردي = التسويق. كل فريق يستخدم نفس لون إطار قائده.'
            : 'Color system: the card border color shows the leader responsible for that area. Indigo = CEO, Blue = Tech, Orange = Operations, Amber = HR, Emerald = Finance, Pink = Marketing. Each team member inherits the border color of their leader.'}
        </p>
      </div>
    </div>
  );
}
