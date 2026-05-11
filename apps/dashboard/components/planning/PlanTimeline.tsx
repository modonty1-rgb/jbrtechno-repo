'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@jbrtechno/ui';
import { Badge } from '@jbrtechno/ui';
import {
  ChevronDown,
  ChevronRight,
  CheckCircle2,
  Circle,
  Target,
  Users,
  FileText,
  DollarSign,
  TrendingUp
} from 'lucide-react';
import { cn } from '@jbrtechno/shared';

interface Subsection {
  id: string;
  title: string;
  description?: string;
  items?: string[];
  deliverables?: string[];
  competitors?: Array<{
    name: string;
    strengths: string;
    weaknesses: string;
    pricing?: string;
    differentiation: string;
  }>;
  positions?: Array<{
    number: string;
    title: string;
    description: string;
    skills: string;
  }>;
  technical?: string[];
  leadership?: string[];
  conclusion?: string;
  categories?: Array<{
    name: string;
    items: string[];
  }>;
  budget?: {
    staffCosts: string;
    operationalCosts: string;
    total: string;
  };
  expectedRevenue?: {
    mrr: string;
    month3Revenue?: string;
    month4Revenue?: string;
    month12Revenue?: string;
    annualRevenue?: string;
    year1Target?: {
      clients: string;
      monthlyRecognizedRevenue: string;
    };
  };
  mustHave?: string[];
  shouldHave?: string[];
  niceToHave?: string[];
}

interface Section {
  id: number | string;
  title: string;
  subsections?: Subsection[];
  focus?: string;
  teamSize?: number;
  articles?: string | number;
  clients?: number;
  mrr?: string;
  cost?: string;
}

interface PlanTimelineProps {
  sections: Section[];
  showMetrics?: boolean;
}

function SubsectionContent({ subsection }: { subsection: Subsection }) {
  if (subsection.description) {
    return <p className="text-sm text-muted-foreground mb-3">{subsection.description}</p>;
  }

  if (subsection.competitors) {
    return (
      <div className="space-y-3">
        {subsection.competitors.map((comp, idx) => (
          <div key={idx} className="p-3 rounded-lg bg-muted/50 space-y-2">
            <h5 className="font-semibold text-sm">{comp.name}</h5>
            <div className="space-y-1 text-xs">
              <p><span className="font-medium text-green-600">نقاط القوة:</span> {comp.strengths}</p>
              <p><span className="font-medium text-orange-600">نقاط الضعف:</span> {comp.weaknesses}</p>
              {comp.pricing && <p><span className="font-medium text-blue-600">الأسعار:</span> {comp.pricing}</p>}
              <p><span className="font-medium text-purple-600">التمييز:</span> {comp.differentiation}</p>
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (subsection.positions) {
    return (
      <div className="space-y-3">
        {subsection.positions.map((pos, idx) => (
          <div key={idx} className="p-3 rounded-lg border bg-card space-y-2">
            <div className="flex items-start gap-2">
              <Badge variant="outline" className="shrink-0">{pos.number}</Badge>
              <div className="flex-1">
                <h5 className="font-semibold text-sm">{pos.title}</h5>
                <p className="text-xs text-muted-foreground mt-1">{pos.description}</p>
                <p className="text-xs text-primary mt-2">{pos.skills}</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (subsection.technical && subsection.leadership) {
    return (
      <div className="space-y-4">
        <div>
          <h5 className="font-semibold text-sm mb-2">المؤهلات التقنية:</h5>
          <ul className="space-y-1">
            {subsection.technical.map((item, idx) => (
              <li key={idx} className="text-sm flex items-start gap-2">
                <CheckCircle2 className="h-4 w-4 text-blue-500 mt-0.5 shrink-0" />
                <span className="text-muted-foreground">{item}</span>
              </li>
            ))}
          </ul>
        </div>
        <div>
          <h5 className="font-semibold text-sm mb-2">المؤهلات القيادية:</h5>
          <ul className="space-y-1">
            {subsection.leadership.map((item, idx) => (
              <li key={idx} className="text-sm flex items-start gap-2">
                <CheckCircle2 className="h-4 w-4 text-purple-500 mt-0.5 shrink-0" />
                <span className="text-muted-foreground">{item}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    );
  }

  if (subsection.categories) {
    return (
      <div className="space-y-4">
        {subsection.categories.map((cat, idx) => (
          <div key={idx}>
            <h5 className="font-semibold text-sm mb-2 text-primary">{cat.name}:</h5>
            <ul className="space-y-1">
              {cat.items.map((item, itemIdx) => (
                <li key={itemIdx} className="text-sm flex items-start gap-2">
                  <CheckCircle2 className="h-4 w-4 text-green-500 mt-0.5 shrink-0" />
                  <span className="text-muted-foreground">{item}</span>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    );
  }

  if (subsection.budget) {
    return (
      <div className="space-y-3">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <div className="p-3 rounded-lg bg-blue-500/10 border border-blue-500/20">
            <p className="text-xs text-muted-foreground mb-1">تكاليف الموظفين</p>
            <p className="text-sm font-bold text-blue-600">{subsection.budget.staffCosts}</p>
          </div>
          <div className="p-3 rounded-lg bg-purple-500/10 border border-purple-500/20">
            <p className="text-xs text-muted-foreground mb-1">التكاليف التشغيلية</p>
            <p className="text-sm font-bold text-purple-600">{subsection.budget.operationalCosts}</p>
          </div>
          <div className="p-3 rounded-lg bg-green-500/10 border border-green-500/20">
            <p className="text-xs text-muted-foreground mb-1">الإجمالي</p>
            <p className="text-sm font-bold text-green-600">{subsection.budget.total}</p>
          </div>
        </div>
        {subsection.expectedRevenue && (
          <div className="p-3 rounded-lg bg-amber-500/10 border border-amber-500/20">
            <p className="text-xs font-medium mb-2">العوائد المتوقعة:</p>
            <div className="space-y-1 text-xs">
              <p><span className="font-medium">MRR:</span> {subsection.expectedRevenue.mrr}</p>
              {subsection.expectedRevenue.month3Revenue && (
                <p><span className="font-medium">إيرادات الشهر الثالث:</span> {subsection.expectedRevenue.month3Revenue}</p>
              )}
              {subsection.expectedRevenue.month4Revenue && (
                <p><span className="font-medium">إيرادات الشهر الرابع:</span> {subsection.expectedRevenue.month4Revenue}</p>
              )}
              {subsection.expectedRevenue.month12Revenue && (
                <p><span className="font-medium">إيرادات الشهر الثاني عشر:</span> {subsection.expectedRevenue.month12Revenue}</p>
              )}
              {subsection.expectedRevenue.annualRevenue && (
                <p><span className="font-medium">الإيرادات السنوية:</span> {subsection.expectedRevenue.annualRevenue}</p>
              )}
              {subsection.expectedRevenue.year1Target && (
                <>
                  <p><span className="font-medium">العملاء المستهدفون:</span> {subsection.expectedRevenue.year1Target.clients}</p>
                  <p><span className="font-medium">الإيراد المعترف به شهرياً:</span> {subsection.expectedRevenue.year1Target.monthlyRecognizedRevenue}</p>
                </>
              )}
            </div>
          </div>
        )}
      </div>
    );
  }

  if (subsection.mustHave || subsection.shouldHave || subsection.niceToHave) {
    return (
      <div className="space-y-4">
        {subsection.mustHave && (
          <div>
            <Badge variant="destructive" className="mb-2">Must-Have</Badge>
            <ul className="space-y-1">
              {subsection.mustHave.map((item, idx) => (
                <li key={idx} className="text-sm flex items-start gap-2">
                  <CheckCircle2 className="h-4 w-4 text-red-500 mt-0.5 shrink-0" />
                  <span className="text-muted-foreground">{item}</span>
                </li>
              ))}
            </ul>
          </div>
        )}
        {subsection.shouldHave && (
          <div>
            <Badge variant="default" className="mb-2">Should-Have</Badge>
            <ul className="space-y-1">
              {subsection.shouldHave.map((item, idx) => (
                <li key={idx} className="text-sm flex items-start gap-2">
                  <CheckCircle2 className="h-4 w-4 text-blue-500 mt-0.5 shrink-0" />
                  <span className="text-muted-foreground">{item}</span>
                </li>
              ))}
            </ul>
          </div>
        )}
        {subsection.niceToHave && (
          <div>
            <Badge variant="secondary" className="mb-2">Nice-to-Have</Badge>
            <ul className="space-y-1">
              {subsection.niceToHave.map((item, idx) => (
                <li key={idx} className="text-sm flex items-start gap-2">
                  <CheckCircle2 className="h-4 w-4 text-green-500 mt-0.5 shrink-0" />
                  <span className="text-muted-foreground">{item}</span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    );
  }

  return null;
}

export function PlanTimeline({ sections, showMetrics = false }: PlanTimelineProps) {
  const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set());

  const toggleSection = (id: string) => {
    const newExpanded = new Set(expandedSections);
    if (newExpanded.has(id)) {
      newExpanded.delete(id);
    } else {
      newExpanded.add(id);
    }
    setExpandedSections(newExpanded);
  };

  const getColorClass = (index: number) => {
    const colors = [
      'bg-blue-500',
      'bg-purple-500',
      'bg-green-500',
      'bg-amber-500',
      'bg-pink-500'
    ];
    return colors[index % colors.length];
  };

  return (
    <div className="relative">
      {/* Timeline line */}
      <div className="absolute left-8 top-0 bottom-0 w-0.5 bg-border no-print" />

      {sections.map((section, idx) => {
        const sectionId = `section-${section.id}`;
        const isExpanded = expandedSections.has(sectionId);
        const colorClass = getColorClass(idx);

        return (
          <div key={section.id} className="relative mb-8 last:mb-0">
            {/* Step indicator */}
            <div
              className={cn(
                'absolute left-4 w-8 h-8 rounded-full flex items-center justify-center text-white font-bold text-sm transition-all no-print',
                colorClass,
                'hover:scale-110 shadow-lg'
              )}
            >
              {typeof section.id === 'number' ? section.id : idx + 1}
            </div>

            {/* Content card */}
            <div className="ml-20">
              <Card
                className={cn(
                  'transition-all duration-300',
                  isExpanded && 'shadow-md'
                )}
              >
                <CardHeader
                  className={cn(
                    'pb-3 cursor-pointer hover:bg-accent/50 transition-colors rounded-t-lg',
                    section.subsections && 'cursor-pointer'
                  )}
                  onClick={() => section.subsections && toggleSection(sectionId)}
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <CardTitle className="text-lg mb-2">{section.title}</CardTitle>

                      {/* Metrics badges */}
                      {showMetrics && (section.focus || section.teamSize || section.articles || section.clients !== undefined || section.mrr) && (
                        <div className="flex flex-wrap gap-2 mt-3">
                          {section.focus && (
                            <Badge variant="outline" className="gap-1">
                              <Target className="h-3 w-3" />
                              {section.focus}
                            </Badge>
                          )}
                          {section.teamSize && (
                            <Badge variant="outline" className="gap-1">
                              <Users className="h-3 w-3" />
                              {section.teamSize} أشخاص
                            </Badge>
                          )}
                          {section.articles && (
                            <Badge variant="outline" className="gap-1">
                              <FileText className="h-3 w-3" />
                              {section.articles} مقالة
                            </Badge>
                          )}
                          {section.clients !== undefined && section.clients > 0 && (
                            <Badge variant="outline" className="gap-1 bg-green-500/10 border-green-500/20 text-green-700">
                              <CheckCircle2 className="h-3 w-3" />
                              {section.clients} عميل
                            </Badge>
                          )}
                          {section.mrr && section.mrr !== "0" && (
                            <Badge variant="outline" className="gap-1 bg-blue-500/10 border-blue-500/20 text-blue-700">
                              <TrendingUp className="h-3 w-3" />
                              MRR: {section.mrr}
                            </Badge>
                          )}
                        </div>
                      )}

                      {section.cost && (
                        <div className="mt-3 flex items-center gap-2 text-sm">
                          <DollarSign className="h-4 w-4 text-muted-foreground" />
                          <span className="text-muted-foreground">{section.cost}</span>
                        </div>
                      )}
                    </div>

                    {section.subsections && (
                      <div className="flex-shrink-0">
                        {isExpanded ? (
                          <ChevronDown className="h-5 w-5 text-muted-foreground transition-transform" />
                        ) : (
                          <ChevronRight className="h-5 w-5 text-muted-foreground transition-transform" />
                        )}
                      </div>
                    )}
                  </div>
                </CardHeader>

                {isExpanded && section.subsections && (
                  <CardContent className="pt-0 space-y-4">
                    {section.subsections.map((subsection) => (
                      <div key={subsection.id} className="border-l-2 border-primary/20 pl-4 py-2">
                        <div className="mb-3">
                          <div className="flex items-center gap-2">
                            <Circle className="h-3 w-3 text-primary fill-primary shrink-0" />
                            <h4 className="font-semibold text-sm text-primary">
                              {subsection.title}
                            </h4>
                          </div>
                        </div>

                        <div className="space-y-3">
                          <SubsectionContent subsection={subsection} />

                          {subsection.items && subsection.items.length > 0 && (
                            <ul className="space-y-1.5">
                              {subsection.items.map((item, itemIdx) => (
                                <li key={itemIdx} className="text-sm flex items-start gap-2">
                                  <CheckCircle2 className="h-4 w-4 text-primary/70 mt-0.5 shrink-0" />
                                  <span className="text-muted-foreground">{item}</span>
                                </li>
                              ))}
                            </ul>
                          )}

                          {subsection.deliverables && subsection.deliverables.length > 0 && (
                            <div className="mt-3 p-3 rounded-lg bg-green-500/10 border border-green-500/20">
                              <p className="text-xs font-semibold text-green-700 dark:text-green-400 mb-2">
                                المخرجات:
                              </p>
                              <ul className="space-y-1">
                                {subsection.deliverables.map((item, itemIdx) => (
                                  <li key={itemIdx} className="text-xs flex items-start gap-2">
                                    <CheckCircle2 className="h-3.5 w-3.5 text-green-600 dark:text-green-400 mt-0.5 shrink-0" />
                                    <span className="text-green-700 dark:text-green-300">{item}</span>
                                  </li>
                                ))}
                              </ul>
                            </div>
                          )}

                          {subsection.conclusion && (
                            <p className="text-sm italic text-muted-foreground mt-3 p-3 bg-muted/50 rounded-lg">
                              {subsection.conclusion}
                            </p>
                          )}
                        </div>
                      </div>
                    ))}
                  </CardContent>
                )}
              </Card>
            </div>
          </div>
        );
      })}
    </div>
  );
}

