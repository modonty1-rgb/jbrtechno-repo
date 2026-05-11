export interface CostItem {
  label: string;
  amount: number;
  description?: string;
  category?: string;
  details?: string;
}

export interface CostsData {
  fixed: {
    leadership: { items: CostItem[] };
    technical: { items: CostItem[] };
    content: { items: CostItem[] };
    marketingSales: { items: CostItem[] };
    operations: { items: CostItem[] };
    infrastructure: { items: CostItem[] };
    overhead: { items: CostItem[] };
  };
  variable: {
    marketing: { items: CostItem[] };
  };
  byPhase?: {
    launch?: {
      leadership?: number;
      technical?: number;
      content?: number;
      marketingSales?: number;
      operations?: number;
      marketing?: number;
      infrastructure?: number;
      total?: number;
      months?: string;
    };
    growth?: {
      leadership?: number;
      technical?: number;
      content?: number;
      marketingSales?: number;
      operations?: number;
      marketing?: number;
      infrastructure?: number;
      total?: number;
      months?: string;
    };
    scale?: {
      leadership?: number;
      technical?: number;
      content?: number;
      marketingSales?: number;
      operations?: number;
      marketing?: number;
      infrastructure?: number;
      total?: number;
      months?: string;
    };
  };
}

export interface FinanceData {
  currency: string;
  period: string;
  version?: string;
  costs: CostsData;
  revenue: {
    pricingPlans: Array<{
      name: string;
      annualPrice: number;
      currency: string;
      articlesPerMonth: number;
      contentDuration: number;
      monthlyRecognizedRevenue?: number;
      description?: string;
    }>;
    clientDistribution: {
      basic: { percentage: number; annualPrice: number; monthlyRecognizedRevenue: number };
      standard: { percentage: number; annualPrice: number; monthlyRecognizedRevenue: number };
      pro: { percentage: number; annualPrice: number; monthlyRecognizedRevenue: number };
      premium: { percentage: number; annualPrice: number; monthlyRecognizedRevenue: number };
    };
    averageMonthlyPerClient: number;
    averageMonthlyCashFlowPerClient?: number;
    averageAnnualPrice: number;
    recognitionModel?: {
      paymentPeriod: number;
      recognitionPeriod: number;
      monthlyRecognitionRate: number;
      description?: string;
    };
    year1Target: {
      clients: number;
      monthlyRecognizedRevenue: number;
      annualRevenue?: number;
      profitMargins?: number;
      currency?: string;
    };
    projections?: Array<{
      month: string | number;
      clients: string | number;
      avgMonthlyRecognizedRevenue?: number;
      monthlyRecognizedRevenue: string | number;
      annualRevenueCollected?: string | number;
      cumulativeAnnualRevenue?: string | number;
      note?: string;
    }>;
    addOns?: {
      potentialServices?: Array<{ name: string; price: number; currency: string; note?: string }>;
      adoptionRate?: number;
      note?: string;
    };
  };
  metrics?: {
    cac?: { target: number; range: [number, number]; note?: string };
    ltv?: { value: number; note?: string };
    costSavings?: { percentage?: string | number };
    margins?: {
      gross?: {
        blended?: string;
      };
    };
    ltvCacRatio?: {
      value?: string;
      note?: string;
    };
  };
  investment?: {
    breakdown: Array<{
      phase: string;
      amount: number;
      currency: string;
      description?: string;
    }>;
  };
}

export function formatCurrency(amount: number, currency: string = 'SAR'): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

export function calculateCategoryTotal(items: Array<{ amount: number }>): number {
  return items.reduce((sum, item) => sum + (item.amount || 0), 0);
}

export function calculateFinanceTotals(finance: FinanceData): {
  total: number;
  fixed: number;
  variable: number;
  byCategory: {
    leadership: number;
    technical: number;
    content: number;
    marketingSales: number;
    operations: number;
    infrastructure: number;
    overhead: number;
    marketing: number;
  };
} {
  const fixed = calculateCategoryTotal(finance.costs.fixed.leadership.items) +
    calculateCategoryTotal(finance.costs.fixed.technical.items) +
    calculateCategoryTotal(finance.costs.fixed.content.items) +
    calculateCategoryTotal(finance.costs.fixed.marketingSales.items) +
    calculateCategoryTotal(finance.costs.fixed.operations.items) +
    calculateCategoryTotal(finance.costs.fixed.infrastructure.items) +
    calculateCategoryTotal(finance.costs.fixed.overhead.items);

  const variable = calculateCategoryTotal(finance.costs.variable.marketing.items);

  return {
    total: fixed + variable,
    fixed,
    variable,
    byCategory: {
      leadership: calculateCategoryTotal(finance.costs.fixed.leadership.items),
      technical: calculateCategoryTotal(finance.costs.fixed.technical.items),
      content: calculateCategoryTotal(finance.costs.fixed.content.items),
      marketingSales: calculateCategoryTotal(finance.costs.fixed.marketingSales.items),
      operations: calculateCategoryTotal(finance.costs.fixed.operations.items),
      infrastructure: calculateCategoryTotal(finance.costs.fixed.infrastructure.items),
      overhead: calculateCategoryTotal(finance.costs.fixed.overhead.items),
      marketing: calculateCategoryTotal(finance.costs.variable.marketing.items),
    },
  };
}

export function calculateBreakEvenUnified(
  finance: FinanceData,
  annualPricePerClient: number
): {
  clientsPerYear: number;
  clientsPerMonth: number;
  monthlyCosts: number;
  annualCosts: number;
  annualPricePerClient: number;
} | null {
  const totals = calculateFinanceTotals(finance);
  const monthlyCosts = totals.total;
  const annualCosts = monthlyCosts * 12;

  if (!annualPricePerClient || annualPricePerClient <= 0 || !monthlyCosts) return null;

  const clientsPerYear = Math.ceil(annualCosts / annualPricePerClient);
  const clientsPerMonth = Math.ceil(clientsPerYear / 12);

  return {
    clientsPerYear,
    clientsPerMonth,
    monthlyCosts,
    annualCosts,
    annualPricePerClient,
  };
}

export function calculateBreakEvenFromFinance(
  finance: FinanceData,
  annualPricePerClient?: number
): {
  clientsPerYear: number;
  clientsPerMonth: number;
  monthlyCosts: number;
  annualCosts: number;
  annualPricePerClient: number;
} | null {
  const totals = calculateFinanceTotals(finance);
  const monthlyCosts = totals.total;
  const annualCosts = monthlyCosts * 12;

  const price =
    annualPricePerClient ||
    finance.revenue?.clientDistribution?.standard?.annualPrice ||
    3999;

  if (!price || price <= 0 || !monthlyCosts) return null;

  const clientsPerYear = Math.ceil(annualCosts / price);
  const clientsPerMonth = Math.ceil(clientsPerYear / 12);

  return {
    clientsPerYear,
    clientsPerMonth,
    monthlyCosts,
    annualCosts,
    annualPricePerClient: price,
  };
}

export function calculateAverageMonthlyRevenuePerClient(
  finance: FinanceData,
  standardMonthlyRevenue?: number
): number {
  if (standardMonthlyRevenue && standardMonthlyRevenue > 0) {
    return standardMonthlyRevenue;
  }

  const standardRevenue =
    finance.revenue?.clientDistribution?.standard?.monthlyRecognizedRevenue ||
    finance.revenue?.pricingPlans?.find((p) =>
      p.name.toLowerCase().includes("standard")
    )?.monthlyRecognizedRevenue;

  if (standardRevenue && standardRevenue > 0) {
    return standardRevenue;
  }

  return finance.revenue.averageMonthlyPerClient || 0;
}

export function calculateInvestmentFromCosts(finance: FinanceData): {
  min: number;
  max: number;
  currency: string;
} {
  const totals = calculateFinanceTotals(finance);
  const monthlyCosts = totals.total;
  const annualInvestment = monthlyCosts * 12;

  return {
    min: annualInvestment,
    max: annualInvestment,
    currency: finance.currency || 'SAR',
  };
}

export function buildFinanceDataCostsStructure(costs: {
  fixed: Record<string, Array<{ id: string; label: string; amount: number; description?: string; order?: number }>>;
  variable: Record<string, Array<{ id: string; label: string; amount: number; description?: string; order?: number }>>;
}): CostsData {
  const categoryKeyMapping: Record<string, string> = {
    'leadership': 'leadership',
    'technical': 'technical',
    'content': 'content',
    'marketing-sales': 'marketingSales',
    'operations': 'operations',
    'infrastructure': 'infrastructure',
    'overhead': 'overhead',
    'marketing': 'marketing',
  };

  const fixed: CostsData['fixed'] = {
    leadership: { items: [] },
    technical: { items: [] },
    content: { items: [] },
    marketingSales: { items: [] },
    operations: { items: [] },
    infrastructure: { items: [] },
    overhead: { items: [] },
  };

  const variable: CostsData['variable'] = {
    marketing: { items: [] },
  };

  for (const [key, items] of Object.entries(costs.fixed)) {
    const mappedKey = categoryKeyMapping[key] || key;
    if (mappedKey in fixed) {
      fixed[mappedKey as keyof typeof fixed] = {
        items: items.map(item => ({
          label: item.label,
          amount: item.amount,
          description: item.description,
        })),
      };
    }
  }

  for (const [key, items] of Object.entries(costs.variable)) {
    const mappedKey = categoryKeyMapping[key] || key;
    if (mappedKey in variable) {
      variable[mappedKey as keyof typeof variable] = {
        items: items.map(item => ({
          label: item.label,
          amount: item.amount,
          description: item.description,
        })),
      };
    }
  }

  return { fixed, variable };
}

export function calculateBreakEvenClients(
  finance: FinanceData,
  monthlyRevenuePerClient?: number
): {
  clientsNeeded: number;
  monthlyCosts: number;
  monthlyRevenuePerClient: number;
} | null {
  const totals = calculateFinanceTotals(finance);
  const monthlyCosts = totals.total;

  const avgMonthlyRevenuePerClient = monthlyRevenuePerClient && monthlyRevenuePerClient > 0
    ? monthlyRevenuePerClient
    : calculateAverageMonthlyRevenuePerClient(finance, monthlyRevenuePerClient);

  if (!monthlyCosts || !avgMonthlyRevenuePerClient || avgMonthlyRevenuePerClient <= 0) {
    return null;
  }

  const clientsNeeded = Math.ceil(monthlyCosts / avgMonthlyRevenuePerClient);

  return {
    clientsNeeded,
    monthlyCosts,
    monthlyRevenuePerClient: avgMonthlyRevenuePerClient,
  };
}

export function calculateBreakEvenMonth(
  finance: FinanceData,
  standardMonthlyRevenue?: number
): {
  month: number;
  clientsNeeded: number;
  monthlyCosts: number;
  monthlyRevenuePerClient: number;
} | null {
  const breakEvenClients = calculateBreakEvenClients(finance, standardMonthlyRevenue);
  if (!breakEvenClients) return null;

  if (finance.revenue.projections && Array.isArray(finance.revenue.projections)) {
    for (const projection of finance.revenue.projections) {
      const month = typeof projection.month === 'string'
        ? parseFloat(projection.month.split('-')[1] || projection.month.split('-')[0])
        : projection.month;

      const clientCount = typeof projection.clients === 'string'
        ? parseFloat(projection.clients.replace(/[^\d.-]/g, '').split('-')[0])
        : (typeof projection.clients === 'number' ? projection.clients : 0);

      const monthlyRevenue = clientCount * breakEvenClients.monthlyRevenuePerClient;

      if (monthlyRevenue >= breakEvenClients.monthlyCosts) {
        return {
          month: Math.ceil(month),
          clientsNeeded: breakEvenClients.clientsNeeded,
          monthlyCosts: breakEvenClients.monthlyCosts,
          monthlyRevenuePerClient: breakEvenClients.monthlyRevenuePerClient,
        };
      }
    }
  }

  if (finance.revenue.projections && finance.revenue.projections.length >= 2) {
    const firstProjection = finance.revenue.projections[0];
    const lastProjection = finance.revenue.projections[finance.revenue.projections.length - 1];

    const firstMonth = typeof firstProjection.month === 'string'
      ? parseFloat(firstProjection.month.split('-')[0])
      : (typeof firstProjection.month === 'number' ? firstProjection.month : 0);
    const lastMonth = typeof lastProjection.month === 'string'
      ? parseFloat(lastProjection.month.split('-')[1] || lastProjection.month.split('-')[0])
      : (typeof lastProjection.month === 'number' ? lastProjection.month : 12);

    const firstClients = typeof firstProjection.clients === 'string'
      ? parseFloat(firstProjection.clients.replace(/[^\d.-]/g, '').split('-')[0])
      : (typeof firstProjection.clients === 'number' ? firstProjection.clients : 0);
    const lastClients = typeof lastProjection.clients === 'string'
      ? parseFloat(lastProjection.clients.replace(/[^\d.-]/g, '').split('-')[1] || lastProjection.clients.replace(/[^\d.-]/g, '').split('-')[0])
      : (typeof lastProjection.clients === 'number' ? lastProjection.clients : 500);

    const monthsDiff = lastMonth - firstMonth;
    const clientsDiff = lastClients - firstClients;
    const clientsPerMonth = monthsDiff > 0 ? clientsDiff / monthsDiff : 0;

    if (clientsPerMonth > 0) {
      const breakEvenMonth = Math.ceil(breakEvenClients.clientsNeeded / clientsPerMonth) + firstMonth;
      return {
        month: Math.min(Math.max(1, Math.ceil(breakEvenMonth)), 12),
        clientsNeeded: breakEvenClients.clientsNeeded,
        monthlyCosts: breakEvenClients.monthlyCosts,
        monthlyRevenuePerClient: breakEvenClients.monthlyRevenuePerClient,
      };
    }
  }

  const targetClientsMonth12 = finance.revenue.year1Target?.clients || 500;
  const clientsPerMonth = targetClientsMonth12 / 12;
  const breakEvenMonth = clientsPerMonth > 0 ? Math.ceil(breakEvenClients.clientsNeeded / clientsPerMonth) : 12;

  return {
    month: Math.min(Math.max(1, breakEvenMonth), 12),
    clientsNeeded: breakEvenClients.clientsNeeded,
    monthlyCosts: breakEvenClients.monthlyCosts,
    monthlyRevenuePerClient: breakEvenClients.monthlyRevenuePerClient,
  };
}
