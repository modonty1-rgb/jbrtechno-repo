'use server';

import { auth } from '@/lib/auth';
import { prisma } from '@jbrtechno/database';
import { UserRole, SourceOfIncomeType } from '@jbrtechno/database';
import { revalidatePath } from 'next/cache';

export interface GetSourcesOfIncomeResult {
  success: boolean;
  sources?: Array<{
    id: string;
    key: string;
    label: string;
    description: string | null;
    type: SourceOfIncomeType;
    isActive: boolean;
    metadata: any;
  }>;
  error?: string;
}

export async function getSourcesOfIncome(
  type?: SourceOfIncomeType
): Promise<GetSourcesOfIncomeResult> {
  try {
    const where: any = {};
    if (type) {
      where.type = type;
    }

    const sources = await prisma.sourceOfIncome.findMany({
      where,
      orderBy: [
        { name: 'asc' },
      ],
    });

    const mappedSources = sources.map((source) => ({
      id: source.id,
      key: source.id,
      label: source.name,
      description: source.description,
      type: source.type,
      isActive: true,
      metadata: null,
    }));

    return {
      success: true,
      sources: mappedSources,
    };
  } catch (error) {
    console.error('getSourcesOfIncome error:', error);
    return {
      success: false,
      error: 'Failed to fetch sources of income',
      sources: [],
    };
  }
}

export interface GetAllSourcesOfIncomeResult {
  success: boolean;
  sources?: Array<{
    id: string;
    key: string;
    label: string;
    description: string | null;
    type: SourceOfIncomeType;
    isActive: boolean;
    metadata: any;
  }>;
  error?: string;
}

export async function getAllSourcesOfIncome(): Promise<GetAllSourcesOfIncomeResult> {
  try {
    const sources = await prisma.sourceOfIncome.findMany({
      orderBy: [
        { type: 'desc' },
        { name: 'desc' },
      ],
    });

    const mappedSources = sources.map((source) => ({
      id: source.id,
      key: source.id,
      label: source.name,
      description: source.description,
      type: source.type,
      isActive: true,
      metadata: null,
    }));

    return {
      success: true,
      sources: mappedSources,
    };
  } catch (error) {
    console.error('getAllSourcesOfIncome error:', error);
    return {
      success: false,
      error: 'Failed to fetch sources of income',
      sources: [],
    };
  }
}

export interface GetSourceOfIncomeResult {
  success: boolean;
  source?: {
    id: string;
    key: string;
    label: string;
    description: string | null;
    type: SourceOfIncomeType;
    isActive: boolean;
    metadata: any;
  };
  error?: string;
}

function isValidObjectId(id: string): boolean {
  return /^[0-9a-fA-F]{24}$/.test(id);
}

export async function getSourceOfIncome(
  key: string
): Promise<GetSourceOfIncomeResult> {
  try {
    let source;

    // Check if key is a valid ObjectID
    if (isValidObjectId(key)) {
      // Try to find by ID first
      source = await prisma.sourceOfIncome.findUnique({
        where: { id: key },
      });
    }

    // If not found by ID or key is not a valid ObjectID, search by name
    if (!source) {
      // Map common plan keys to Arabic names
      const planNameMap: Record<string, string[]> = {
        'subscription-standard': ['ستاندارد', 'standard'],
        'subscription-basic': ['بيسك', 'basic'],
        'subscription-pro': ['برو', 'pro'],
        'subscription-premium': ['بريميوم', 'premium'],
      };

      const searchTerms = planNameMap[key] || [key.toLowerCase()];

      // Search by name containing any of the search terms
      const sources = await prisma.sourceOfIncome.findMany({
        where: {
          OR: searchTerms.map(term => ({
            name: { contains: term },
          })),
        },
        take: 1,
      });

      source = sources[0] || null;
    }

    if (!source) {
      return {
        success: false,
        error: 'Source of income not found',
      };
    }

    return {
      success: true,
      source: {
        id: source.id,
        key: source.id,
        label: source.name,
        description: source.description,
        type: source.type,
        isActive: true,
        metadata: null,
      },
    };
  } catch (error) {
    console.error('getSourceOfIncome error:', error);
    return {
      success: false,
      error: 'Failed to fetch source of income',
    };
  }
}

export async function getSourceOfIncomeById(
  id: string
): Promise<GetSourceOfIncomeResult> {
  try {
    const source = await prisma.sourceOfIncome.findUnique({
      where: { id },
    });

    if (!source) {
      return {
        success: false,
        error: 'Source of income not found',
      };
    }

    return {
      success: true,
      source: {
        id: source.id,
        key: source.id,
        label: source.name,
        description: source.description,
        type: source.type,
        isActive: true,
        metadata: null,
      },
    };
  } catch (error) {
    console.error('getSourceOfIncomeById error:', error);
    return {
      success: false,
      error: 'Failed to fetch source of income',
    };
  }
}

export interface CreateSourceOfIncomeResult {
  success: boolean;
  id?: string;
  error?: string;
}

function generateKeyFromLabel(label: string): string {
  return label
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export async function createSourceOfIncome(data: {
  label: string;
  description?: string | null;
  type: SourceOfIncomeType;
  metadata?: any;
}): Promise<CreateSourceOfIncomeResult> {
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

    const created = await prisma.sourceOfIncome.create({
      data: {
        name: data.label,
        description: data.description || null,
        type: data.type,
        amount: 0,
        date: new Date(),
      },
    });

    revalidatePath('/ar/admin/source-of-income');
    revalidatePath('/en/admin/source-of-income');

    return {
      success: true,
      id: created.id,
    };
  } catch (error) {
    console.error('createSourceOfIncome error:', error);
    return {
      success: false,
      error: 'Failed to create source of income',
    };
  }
}

export interface UpdateSourceOfIncomeResult {
  success: boolean;
  error?: string;
}

export async function updateSourceOfIncome(
  id: string,
  data: {
    label?: string;
    description?: string | null;
    type?: SourceOfIncomeType;
    isActive?: boolean;
    metadata?: any;
  }
): Promise<UpdateSourceOfIncomeResult> {
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

    // Check if source exists
    const existing = await prisma.sourceOfIncome.findUnique({
      where: { id },
    });

    if (!existing) {
      return {
        success: false,
        error: 'Source of income not found',
      };
    }

    const updateData: any = {};
    if (data.label !== undefined) updateData.name = data.label;
    if (data.description !== undefined) updateData.description = data.description;
    if (data.type !== undefined) updateData.type = data.type;

    await prisma.sourceOfIncome.update({
      where: { id },
      data: updateData,
    });

    revalidatePath('/ar/admin/source-of-income');
    revalidatePath('/en/admin/source-of-income');

    return {
      success: true,
    };
  } catch (error) {
    console.error('updateSourceOfIncome error:', error);
    return {
      success: false,
      error: 'Failed to update source of income',
    };
  }
}

export interface DeleteSourceOfIncomeResult {
  success: boolean;
  error?: string;
}

export async function deleteSourceOfIncome(
  id: string
): Promise<DeleteSourceOfIncomeResult> {
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

    // Check if source exists
    const existing = await prisma.sourceOfIncome.findUnique({
      where: { id },
    });

    if (!existing) {
      return {
        success: false,
        error: 'Source of income not found',
      };
    }

    // TODO: Check if source is used in transactions or other places
    // For now, allow deletion

    await prisma.sourceOfIncome.delete({
      where: { id },
    });

    revalidatePath('/ar/admin/source-of-income');
    revalidatePath('/en/admin/source-of-income');

    return {
      success: true,
    };
  } catch (error) {
    console.error('deleteSourceOfIncome error:', error);
    return {
      success: false,
      error: 'Failed to delete source of income',
    };
  }
}













