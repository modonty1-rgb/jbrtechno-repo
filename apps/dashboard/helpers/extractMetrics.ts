export interface ProjectMetrics {
  teamSize: number;
  launchMonths: number;
  budgetMin: string;
  budgetMax: string;
  targetClients: string;
  totalArticles: string;
  mrr: string;
}

export function extractMetricsFromDocs(): ProjectMetrics {
  return {
    teamSize: 10,
    launchMonths: 4,
    budgetMin: '390,000',
    budgetMax: '504,000',
    targetClients: '30-40',
    totalArticles: '100+',
    mrr: '45,000-80,000',
  };
}

export interface TimelinePhase {
  month: number;
  title: string;
  focus: string;
  teamSize: number;
  articles: number;
  clients: number;
  mrr: string;
}

export function getTimelinePhases(): TimelinePhase[] {
  return [
    { month: 1, title: 'التأسيس', focus: 'Foundation', teamSize: 4, articles: 10, clients: 0, mrr: '0' },
    { month: 2, title: 'التطوير', focus: 'Development', teamSize: 7, articles: 30, clients: 0, mrr: '0' },
    { month: 3, title: 'البيتا', focus: 'Beta', teamSize: 10, articles: 70, clients: 7, mrr: '10-15K' },
    { month: 4, title: 'الإطلاق', focus: 'Launch', teamSize: 10, articles: 100, clients: 35, mrr: '50-80K' },
  ];
}
