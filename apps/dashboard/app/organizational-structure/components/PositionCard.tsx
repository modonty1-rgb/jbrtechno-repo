'use client';

import { Card } from '@jbrtechno/ui';
import { Badge } from '@jbrtechno/ui';
import { Users } from 'lucide-react';

export interface PositionCardProps {
  title: string;
  count: number;
  icon: React.ElementType;
  filled?: boolean;
  filledBy?: string;
  color?: string; // Tailwind border color class, e.g. "border-emerald-500"
  locale: string;
  temporary?: boolean;
  email?: string;
}

export function PositionCard({ title, count, icon: Icon, filled, filledBy, color = 'border-primary', locale, temporary, email }: PositionCardProps) {
  const isArabic = true;
  const isCEO = title === 'CEO';
  const isLeader = ['CEO', 'CTO', 'Ops', 'HR', 'Finance', 'Marketing'].includes(title);

  const bgColorMap: Record<string, string> = {
    'border-indigo-400': 'bg-indigo-400/10',
    'border-blue-500': 'bg-blue-500/10',
    'border-orange-500': 'bg-orange-500/10',
    'border-amber-500': 'bg-amber-500/10',
    'border-emerald-500': 'bg-emerald-500/10',
    'border-pink-500': 'bg-pink-500/10',
    'border-primary': 'bg-primary/5',
  };

  const bgColor = bgColorMap[color] ?? 'bg-muted/10';

  return (
    <Card
      className={`
        flex-none w-64 relative overflow-hidden
        transition-all duration-200
        border
        ${filled
          ? isCEO
            ? 'border-[3px] border-indigo-400'
            : isLeader
              ? `border-2 ${color}`
              : color
          : color}
        ${bgColor}
      `}
    >
      <div className="p-5">
        {temporary && (
          <div className="absolute top-2 right-2 px-2 py-0.5 bg-orange-500/20 text-orange-600 dark:text-orange-400 text-xs font-medium rounded-full border border-orange-500/30">
            {isArabic ? 'مؤقت' : 'Temp'}
          </div>
        )}
        <div className="flex items-start gap-3">
          <div className="flex-1 min-w-0">
            <h3 className="font-bold text-sm leading-tight mb-2 text-center">
              {title}
            </h3>

            {email && (
              <div className="text-[11px] text-muted-foreground text-center break-all">
                <a
                  href={`mailto:${email}`}
                  className="underline-offset-2 hover:underline"
                >
                  {email}
                </a>
              </div>
            )}

            {(filled || filledBy) && (
              <div className="mt-2 flex justify-center">
                <Badge
                  className={filled
                    ? 'bg-green-600/10 text-green-700 dark:text-green-300 border border-green-600/40'
                    : 'bg-muted text-muted-foreground border border-border/60'
                  }
                >
                  {filledBy ?? (isArabic ? 'شاغر' : 'Open')}
                </Badge>
              </div>
            )}

            <div className="mt-3 flex gap-2 justify-center">
              {email && (
                <button
                  type="button"
                  onClick={() => {
                    alert(isArabic ? 'قريباً' : 'Coming soon');
                  }}
                  className="px-3 py-1 text-[11px] rounded-full border border-border/60 bg-background/40 hover:bg-background transition-colors"
                >
                  {isArabic ? 'إرسال رسالة' : 'Send message'}
                </button>
              )}
              <button
                type="button"
                onClick={() => {
                  alert(isArabic ? 'قريباً' : 'Coming soon');
                }}
                className="px-3 py-1 text-[11px] rounded-full border border-border/60 bg-background/40 hover:bg-background transition-colors"
              >
                {isArabic ? 'حول' : 'About'}
              </button>
            </div>
          </div>
        </div>

        <div className="absolute bottom-0 left-0 right-0 h-px bg-border/40" />
      </div>
    </Card>
  );
}
