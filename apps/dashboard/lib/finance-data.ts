import type { FinanceData } from "@/helpers/financialCalculations";
import { prisma } from "@jbrtechno/database";
import { getCostsAggregated } from "@/actions/costs";
import { buildFinanceDataCostsStructure } from "@/helpers/financialCalculations";

export async function getFinanceData(): Promise<FinanceData | null> {
  try {
    // Note: FinanceData model does not exist in schema
    // This function returns default structure with costs from Cost table
    let data: any = {
      currency: 'SAR',
      period: 'monthly',
      version: '1.0',
    };

    // Fetch costs from Cost table
    const costsResult = await getCostsAggregated();
    let costsStructure;

    if (costsResult.success && costsResult.costs) {
      // Convert null to undefined for description to match expected type
      const normalizedCosts = {
        fixed: Object.fromEntries(
          Object.entries(costsResult.costs.fixed).map(([key, items]) => [
            key,
            items.map(item => ({
              ...item,
              description: item.description ?? undefined,
            })),
          ])
        ),
        variable: Object.fromEntries(
          Object.entries(costsResult.costs.variable).map(([key, items]) => [
            key,
            items.map(item => ({
              ...item,
              description: item.description ?? undefined,
            })),
          ])
        ),
      };
      // Build costs structure from Cost table
      costsStructure = buildFinanceDataCostsStructure(normalizedCosts);
    } else {
      // Fallback: try to use costs from FinanceData JSON (backward compatibility)
      if (data.costs) {
        costsStructure = data.costs;
      } else {
        // No costs available
        costsStructure = {
          fixed: {
            leadership: { key: 'leadership', label: 'Leadership Team', items: [] },
            technical: { key: 'technical', label: 'Technical Team', items: [] },
            content: { key: 'content', label: 'Content Team', items: [] },
            marketingSales: { key: 'marketing-sales', label: 'Marketing & Sales', items: [] },
            operations: { key: 'operations', label: 'Operations', items: [] },
            infrastructure: { key: 'infrastructure', label: 'Infrastructure', items: [] },
            overhead: { key: 'overhead', label: 'Overhead', items: [] },
          },
          variable: {
            marketing: { key: 'marketing', label: 'Marketing', items: [] },
          },
        };
      }
    }

    // Merge costs into FinanceData structure
    const financeData: FinanceData = {
      ...data,
      costs: costsStructure,
    };

    // Fix type assertion for metrics.cac.range tuple if present
    if (financeData.metrics?.cac?.range && Array.isArray(financeData.metrics.cac.range)) {
      financeData.metrics.cac.range = financeData.metrics.cac.range as [number, number];
    }

    return financeData;
  } catch (error) {
    console.error('Error fetching finance data:', error);
    return null;
  }
}

