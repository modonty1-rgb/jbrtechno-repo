'use server';

import { auth } from '@/lib/auth';
import { prisma } from '@jbrtechno/database';
import { Prisma, UserRole, CostType, CategoryType } from '@jbrtechno/database';
import { revalidatePath } from 'next/cache';
import { getCategoryLabelMap, validateCategoryId } from '@/actions/categories';

const FINANCE_CATEGORY_KEY_BY_LABEL: Record<string, string> = {
  'فريق القيادة': 'leadership',
  'الفريق التقني': 'technical',
  'فريق المحتوى': 'content',
  'التسويق والمبيعات': 'marketing-sales',
  'الفريق التشغيلي': 'operations',
  'البنية التحتية والتقنية': 'infrastructure',
  'المصروفات الإدارية': 'overhead',
  'التسويق والإعلان': 'marketing',
};

function financeKeyFromCategoryLabel(label: string | null): string {
  if (!label) return '';
  return FINANCE_CATEGORY_KEY_BY_LABEL[label] ?? '';
}

export interface GetCostsResult {
  success: boolean;
  costs?: Array<{
    id: string;
    label: string;
    amount: number;
    description: string | null;
    categoryId: string | null;
    categoryLabel: string | null;
    categoryKey: string;
    costType: CostType;
    order: number;
    createdAt: Date;
    updatedAt: Date;
  }>;
  error?: string;
}

export async function getCosts(
  categoryId?: string,
  costType?: CostType
): Promise<GetCostsResult> {
  try {
    const where: Prisma.CostWhereInput = {};
    if (categoryId) where.categoryId = categoryId;
    if (costType) {
      where.type = costType;
    }

    const costs = await prisma.cost.findMany({
      where,
      orderBy: [
        { createdAt: 'asc' },
      ],
    });

    const categoryLabelMap = await getCategoryLabelMap();

    const mappedCosts = costs.map((cost) => ({
      id: cost.id,
      label: cost.name,
      amount: cost.amount,
      description: cost.description,
      categoryId: cost.categoryId ?? null,
      categoryLabel: cost.categoryId ? categoryLabelMap[cost.categoryId] ?? null : null,
      categoryKey: financeKeyFromCategoryLabel(
        cost.categoryId ? categoryLabelMap[cost.categoryId] ?? null : null
      ),
      costType: cost.type,
      order: 0,
      createdAt: cost.createdAt,
      updatedAt: cost.updatedAt,
    }));

    return {
      success: true,
      costs: mappedCosts,
    };
  } catch (error) {
    console.error('getCosts error:', error);
    return {
      success: false,
      error: 'Failed to fetch costs',
      costs: [],
    };
  }
}

export interface GetCostsByCategoryResult {
  success: boolean;
  costsByCategory?: Record<string, Array<{
    id: string;
    label: string;
    amount: number;
    description: string | null;
    costType: CostType;
    order: number;
  }>>;
  error?: string;
}

export async function getCostsByCategory(): Promise<GetCostsByCategoryResult> {
  try {
    const costs = await prisma.cost.findMany({ orderBy: [{ createdAt: 'asc' }] });
    const categoryLabelMap = await getCategoryLabelMap();

    const costsByCategory: GetCostsByCategoryResult['costsByCategory'] = {};

    for (const cost of costs) {
      const key = cost.categoryId ?? 'uncategorized';
      if (!costsByCategory[key]) {
        costsByCategory[key] = [];
      }
      costsByCategory[key]!.push({
        id: cost.id,
        label: cost.name,
        amount: cost.amount,
        description: cost.description,
        costType: cost.type,
        order: 0,
      });
    }

    return {
      success: true,
      costsByCategory: Object.fromEntries(
        Object.entries(costsByCategory).map(([categoryId, items]) => [
          categoryLabelMap[categoryId] ?? categoryId,
          items,
        ])
      ),
    };
  } catch (error) {
    console.error('getCostsByCategory error:', error);
    return {
      success: false,
      error: 'Failed to fetch costs by category',
    };
  }
}

export interface CreateCostResult {
  success: boolean;
  id?: string;
  error?: string;
}

export async function createCost(data: {
  label: string;
  amount: number;
  description?: string | null;
  categoryId: string;
  costType: CostType;
  order?: number;
}): Promise<CreateCostResult> {
  try {
    const session = await auth();

    if (
      !session?.user ||
      session.user.role !== UserRole.SUPER_ADMIN
    ) {
      return {
        success: false,
        error: 'Unauthorized',
      };
    }

    const valid = await validateCategoryId({ id: data.categoryId, type: CategoryType.EXPENSE });
    if (!valid.valid) {
      return {
        success: false,
        error: valid.error,
      };
    }

    const created = await prisma.cost.create({
      data: {
        name: data.label,
        amount: data.amount,
        description: data.description || null,
        categoryId: data.categoryId,
        type: data.costType,
        date: new Date(),
      },
    });

    revalidatePath('/ar/admin/costs');
    revalidatePath('/en/admin/costs');

    return {
      success: true,
      id: created.id,
    };
  } catch (error) {
    console.error('createCost error:', error);
    return {
      success: false,
      error: 'Failed to create cost',
    };
  }
}

export interface UpdateCostResult {
  success: boolean;
  error?: string;
}

export async function updateCost(
  id: string,
  data: {
    label?: string;
    amount?: number;
    description?: string | null;
    categoryId?: string;
    costType?: CostType;
    isActive?: boolean;
    order?: number;
  }
): Promise<UpdateCostResult> {
  try {
    const session = await auth();

    if (
      !session?.user ||
      session.user.role !== UserRole.SUPER_ADMIN
    ) {
      return {
        success: false,
        error: 'Unauthorized',
      };
    }

    // Check if cost exists
    const existing = await prisma.cost.findUnique({
      where: { id },
    });

    if (!existing) {
      return {
        success: false,
        error: 'Cost not found',
      };
    }

    const updateData: Prisma.CostUpdateInput = {};

    if (data.label !== undefined) updateData.name = data.label;
    if (data.amount !== undefined) updateData.amount = data.amount;
    if (data.description !== undefined) updateData.description = data.description;
    if (data.costType !== undefined) updateData.type = data.costType;

    // If categoryId is being updated, verify new category exists
    if (data.categoryId) {
      const valid = await validateCategoryId({ id: data.categoryId, type: CategoryType.EXPENSE });
      if (!valid.valid) {
        return {
          success: false,
          error: valid.error,
        };
      }
      updateData.category = { connect: { id: data.categoryId } };
    }

    await prisma.cost.update({
      where: { id },
      data: updateData,
    });

    revalidatePath('/ar/admin/costs');
    revalidatePath('/en/admin/costs');

    return {
      success: true,
    };
  } catch (error) {
    console.error('updateCost error:', error);
    return {
      success: false,
      error: 'Failed to update cost',
    };
  }
}

export interface DeleteCostResult {
  success: boolean;
  error?: string;
}

export async function deleteCost(id: string): Promise<DeleteCostResult> {
  try {
    const session = await auth();

    if (
      !session?.user ||
      session.user.role !== UserRole.SUPER_ADMIN
    ) {
      return {
        success: false,
        error: 'Unauthorized',
      };
    }

    // Check if cost exists
    const existing = await prisma.cost.findUnique({
      where: { id },
    });

    if (!existing) {
      return {
        success: false,
        error: 'Cost not found',
      };
    }

    await prisma.cost.delete({
      where: { id },
    });

    revalidatePath('/ar/admin/costs');
    revalidatePath('/en/admin/costs');

    return {
      success: true,
    };
  } catch (error) {
    console.error('deleteCost error:', error);
    return {
      success: false,
      error: 'Failed to delete cost',
    };
  }
}

export interface GetCostsAggregatedResult {
  success: boolean;
  costs?: {
    fixed: Record<string, Array<{
      id: string;
      label: string;
      amount: number;
      description: string | null;
      order: number;
    }>>;
    variable: Record<string, Array<{
      id: string;
      label: string;
      amount: number;
      description: string | null;
      order: number;
    }>>;
  };
  error?: string;
}

export async function getCostsAggregated(): Promise<GetCostsAggregatedResult> {
  try {
    const costs = await prisma.cost.findMany({ orderBy: [{ createdAt: 'asc' }] });
    const categoryLabelMap = await getCategoryLabelMap();

    const fixed: Record<string, Array<{
      id: string;
      label: string;
      amount: number;
      description: string | null;
      order: number;
    }>> = {};
    const variable: Record<string, Array<{
      id: string;
      label: string;
      amount: number;
      description: string | null;
      order: number;
    }>> = {};

    for (const cost of costs) {
      const categoryLabel = cost.categoryId ? categoryLabelMap[cost.categoryId] ?? null : null;
      const categoryKey = financeKeyFromCategoryLabel(categoryLabel) || 'uncategorized';
      const costData = {
        id: cost.id,
        label: cost.name,
        amount: cost.amount,
        description: cost.description,
        order: 0,
      };

      if (cost.type === CostType.FIXED) {
        if (!fixed[categoryKey]) {
          fixed[categoryKey] = [];
        }
        fixed[categoryKey]!.push(costData);
      } else {
        if (!variable[categoryKey]) {
          variable[categoryKey] = [];
        }
        variable[categoryKey]!.push(costData);
      }
    }

    return {
      success: true,
      costs: {
        fixed,
        variable,
      },
    };
  } catch (error) {
    console.error('getCostsAggregated error:', error);
    return {
      success: false,
      error: 'Failed to fetch aggregated costs',
    };
  }
}












