'use server';

import { auth } from '@/lib/auth';
import { prisma } from '@jbrtechno/database';
import { Prisma, UserRole, CategoryType } from '@jbrtechno/database';
import { revalidatePath } from 'next/cache';

const ALLOWED_CATEGORY_TYPES: readonly CategoryType[] = [CategoryType.EXPENSE, CategoryType.REVENUE] as const;

function isJsonObject(value: Prisma.JsonValue | undefined): value is Prisma.JsonObject {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function getString(value: Prisma.JsonValue | undefined): string | null {
  return typeof value === 'string' ? value : null;
}

function getNumber(value: Prisma.JsonValue | undefined): number | null {
  return typeof value === 'number' ? value : null;
}

type RawCategoryRow = {
  id: string;
  label: string;
  parentId: string | null;
  type: CategoryType;
  order: number;
};

async function rawAggregateCategories(match: Prisma.JsonObject): Promise<RawCategoryRow[]> {
  const result = await prisma.$runCommandRaw({
    aggregate: 'Category',
    pipeline: [
      { $match: match },
      {
        $addFields: {
          id: { $toString: '$_id' },
          parentId: {
            $cond: [
              { $ifNull: ['$parentId', false] },
              { $toString: '$parentId' },
              null,
            ],
          },
        },
      },
      {
        $project: {
          _id: 0,
          id: 1,
          label: 1,
          parentId: 1,
          type: 1,
          order: 1,
        },
      },
      { $sort: { order: 1, label: 1 } },
    ],
    cursor: {},
  });

  if (!isJsonObject(result)) return [];
  const cursor = result.cursor;
  if (!isJsonObject(cursor)) return [];
  const firstBatch = cursor.firstBatch;
  if (!Array.isArray(firstBatch)) return [];

  const rows: RawCategoryRow[] = [];
  for (const item of firstBatch) {
    if (!isJsonObject(item)) continue;

    const id = getString(item.id);
    const label = getString(item.label);
    const parentId = getString(item.parentId) ?? null;
    const typeStr = getString(item.type);
    const order = getNumber(item.order) ?? 0;

    if (!id || !label || !typeStr) continue;
    if (!ALLOWED_CATEGORY_TYPES.includes(typeStr as CategoryType)) continue;

    rows.push({
      id,
      label,
      parentId,
      type: typeStr as CategoryType,
      order,
    });
  }

  return rows;
}

async function rawCountCategories(query: Prisma.JsonObject): Promise<number> {
  const result = await prisma.$runCommandRaw({
    count: 'Category',
    query,
  });

  if (!isJsonObject(result)) return 0;
  const n = getNumber(result.n);
  return n ?? 0;
}

async function rawFindCategoryById(id: string): Promise<RawCategoryRow | null> {
  const rows = await rawAggregateCategories({
    _id: { $oid: id },
    type: { $in: [...ALLOWED_CATEGORY_TYPES] },
  });
  return rows[0] ?? null;
}

async function rawUpdateCategoryById(id: string, data: Prisma.JsonObject): Promise<void> {
  await prisma.$runCommandRaw({
    update: 'Category',
    updates: [{ q: { _id: { $oid: id } }, u: { $set: data }, multi: false }],
  });
}

async function rawDeleteCategoryById(id: string): Promise<void> {
  await prisma.$runCommandRaw({
    delete: 'Category',
    deletes: [{ q: { _id: { $oid: id } }, limit: 1 }],
  });
}

export interface GetCategoriesResult {
  success: boolean;
  categories?: Array<{
    id: string;
    label: string;
    parentId: string | null;
    type: CategoryType;
    order: number;
  }>;
  error?: string;
}

export async function getCategories(type?: CategoryType): Promise<GetCategoriesResult> {
  try {
    const match: Prisma.JsonObject = type
      ? { type }
      : { type: { $in: [...ALLOWED_CATEGORY_TYPES] } };

    const categories = await rawAggregateCategories(match);

    return {
      success: true,
      categories,
    };
  } catch (error) {
    console.error('getCategories error:', error);
    return {
      success: false,
      error: 'Failed to fetch categories',
      categories: [],
    };
  }
}

export interface GetCategoryTreeResult {
  success: boolean;
  categories?: Array<{
    id: string;
    label: string;
    parentId: string | null;
    type: CategoryType;
    order: number;
    children?: Array<{
      id: string;
      label: string;
      parentId: string | null;
      type: CategoryType;
      order: number;
    }>;
  }>;
  error?: string;
}

export async function getCategoryTree(type?: CategoryType): Promise<GetCategoryTreeResult> {
  try {
    const match: Prisma.JsonObject = type
      ? { type }
      : { type: { $in: [...ALLOWED_CATEGORY_TYPES] } };

    const allCategories = await rawAggregateCategories(match);

    const byId = new Map<string, (typeof allCategories)[number] & { children: RawCategoryRow[] }>();
    for (const c of allCategories) byId.set(c.id, { ...c, children: [] });

    const roots: Array<(typeof allCategories)[number] & { children: RawCategoryRow[] }> = [];
    for (const node of byId.values()) {
      if (node.parentId && byId.has(node.parentId)) {
        byId.get(node.parentId)!.children.push(node);
      } else {
        roots.push(node);
      }
    }

    const sortTree = (nodes: Array<RawCategoryRow & { children?: RawCategoryRow[] }>) => {
      nodes.sort((a, b) => a.order - b.order || a.label.localeCompare(b.label));
      for (const n of nodes) {
        if (n.children?.length) sortTree(n.children);
      }
    };
    sortTree(roots);

    return {
      success: true,
      categories: roots,
    };
  } catch (error) {
    console.error('getCategoryTree error:', error);
    return {
      success: false,
      error: 'Failed to fetch category tree',
      categories: [],
    };
  }
}

export interface CreateCategoryResult {
  success: boolean;
  error?: string;
}

export async function createCategory(data: {
  label: string;
  parentId?: string | null;
  type: CategoryType;
  order?: number;
}): Promise<CreateCategoryResult> {
  try {
    const session = await auth();

    if (!session?.user || session.user.role !== UserRole.SUPER_ADMIN) {
      return {
        success: false,
        error: 'Unauthorized',
      };
    }

    // If parentId provided, verify parent exists
    if (data.parentId) {
      const parentCount = await rawCountCategories({ _id: { $oid: data.parentId } });
      if (parentCount === 0) {
        return {
          success: false,
          error: 'Parent category not found',
        };
      }
    }

    await prisma.category.create({
      data: {
        label: data.label,
        parentId: data.parentId || null,
        type: data.type,
        order: data.order || 0,
      },
    });

    revalidatePath('/ar/admin/categories');
    revalidatePath('/en/admin/categories');
    revalidatePath('/ar/admin/costs');
    revalidatePath('/en/admin/costs');

    return {
      success: true,
    };
  } catch (error) {
    console.error('createCategory error:', error);

    return {
      success: false,
      error: 'Failed to create category',
    };
  }
}

export interface UpdateCategoryResult {
  success: boolean;
  error?: string;
}

export async function updateCategory(
  id: string,
  data: {
    label?: string;
    parentId?: string | null;
    type?: CategoryType;
    order?: number;
  }
): Promise<UpdateCategoryResult> {
  try {
    const session = await auth();

    if (!session?.user || session.user.role !== UserRole.SUPER_ADMIN) {
      return {
        success: false,
        error: 'Unauthorized',
      };
    }

    const existingCount = await rawCountCategories({ _id: { $oid: id } });
    if (existingCount === 0) {
      return {
        success: false,
        error: 'Category not found',
      };
    }

    // If parentId provided, verify parent exists
    if (data.parentId !== undefined && data.parentId !== null) {
      const parentCount = await rawCountCategories({ _id: { $oid: data.parentId } });
      if (parentCount === 0) {
        return {
          success: false,
          error: 'Parent category not found',
        };
      }

      // Prevent circular reference
      if (data.parentId === id) {
        return {
          success: false,
          error: 'Category cannot be its own parent',
        };
      }
    }

    const updateData: Prisma.JsonObject = {};
    if (data.label !== undefined) updateData.label = data.label;
    if (data.parentId !== undefined) updateData.parentId = data.parentId ? { $oid: data.parentId } : null;
    if (data.type !== undefined) updateData.type = data.type;
    if (data.order !== undefined) updateData.order = data.order;

    await rawUpdateCategoryById(id, updateData);

    revalidatePath('/ar/admin/categories');
    revalidatePath('/en/admin/categories');
    revalidatePath('/ar/admin/costs');
    revalidatePath('/en/admin/costs');

    return {
      success: true,
    };
  } catch (error) {
    console.error('updateCategory error:', error);
    return {
      success: false,
      error: 'Failed to update category',
    };
  }
}

export interface DeleteCategoryResult {
  success: boolean;
  error?: string;
}

export async function deleteCategory(id: string): Promise<DeleteCategoryResult> {
  try {
    const session = await auth();

    if (!session?.user || session.user.role !== UserRole.SUPER_ADMIN) {
      return {
        success: false,
        error: 'Unauthorized',
      };
    }

    const category = await rawFindCategoryById(id);
    if (!category) {
      return {
        success: false,
        error: 'Category not found',
      };
    }

    // Check if category has children
    const childrenCount = await rawCountCategories({ parentId: { $oid: id } });
    if (childrenCount > 0) {
      return {
        success: false,
        error: 'Cannot delete category with subcategories. Delete subcategories first.',
      };
    }

    // Check if category is used in transactions
    const transactionsCount = await prisma.transaction.count({ where: { categoryId: id } });
    if (transactionsCount > 0) {
      return {
        success: false,
        error: 'Cannot delete category that is used in transactions',
      };
    }

    // Check if category is used in costs
    const costsCount = await prisma.cost.count({ where: { categoryId: id } });
    if (costsCount > 0) {
      return {
        success: false,
        error: 'Cannot delete category that is used in costs',
      };
    }

    await rawDeleteCategoryById(id);

    revalidatePath('/ar/admin/categories');
    revalidatePath('/en/admin/categories');
    revalidatePath('/ar/admin/costs');
    revalidatePath('/en/admin/costs');

    return {
      success: true,
    };
  } catch (error) {
    console.error('deleteCategory error:', error);
    return {
      success: false,
      error: 'Failed to delete category',
    };
  }
}

export interface CategoryUsageCounts {
  transactions: number;
  costs: number;
}

export async function getCategoryLabelMap(): Promise<Record<string, string>> {
  const categories = await rawAggregateCategories({
    type: { $in: [...ALLOWED_CATEGORY_TYPES] },
  });

  const map: Record<string, string> = {};
  for (const c of categories) {
    map[c.id] = c.label;
  }
  return map;
}

export async function getActiveCategoryTreeByType(type: CategoryType): Promise<GetCategoryTreeResult> {
  return await getCategoryTree(type);
}

export async function getCategoryUsageCounts(id: string): Promise<CategoryUsageCounts> {
  const [transactions, costs] = await Promise.all([
    prisma.transaction.count({ where: { categoryId: id } }),
    prisma.cost.count({ where: { categoryId: id } }),
  ]);

  return {
    transactions,
    costs,
  };
}

export async function validateCategoryId(params: {
  id: string;
  type?: CategoryType;
}): Promise<{ valid: true } | { valid: false; error: string }> {
  const rows = await rawAggregateCategories({
    _id: { $oid: params.id },
    ...(params.type ? { type: params.type } : { type: { $in: [...ALLOWED_CATEGORY_TYPES] } }),
  });
  const category = rows[0];
  if (!category) return { valid: false, error: 'Category not found' };

  return { valid: true };
}














