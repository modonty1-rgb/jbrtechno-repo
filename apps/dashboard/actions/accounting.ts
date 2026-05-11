'use server';

import { prisma } from '@jbrtechno/database';
import { expenseSchema, revenueSchema, ExpenseFormData, RevenueFormData } from '@/lib/validations/accounting';
import { revalidatePath } from 'next/cache';
import { CategoryType } from '@jbrtechno/database';
import { validateCategoryId } from '@/actions/categories';

async function assertValidCategoryId(categoryId: string, expectedType: CategoryType): Promise<string> {
  const res = await validateCategoryId({ id: categoryId, type: expectedType });
  if (!res.valid) throw new Error(res.error);
  return categoryId;
}

export interface AddTransactionResult {
  success: boolean;
  error?: string;
  transactionId?: string;
}

export async function addExpense(
  data: Omit<ExpenseFormData, 'type'>
): Promise<AddTransactionResult> {
  try {
    const validatedData = expenseSchema.parse({
      ...data,
      type: 'EXPENSE' as const,
    });

    const categoryId = validatedData.categoryId
      ? await assertValidCategoryId(validatedData.categoryId, CategoryType.EXPENSE)
      : null;

    const transaction = await prisma.transaction.create({
      data: {
        type: 'EXPENSE',
        amount: validatedData.amount,
        description: validatedData.description,
        categoryId,
        date: validatedData.date,
        invoiceImageUrl: validatedData.invoiceImageUrl || null,
        invoiceImagePublicId: validatedData.invoiceImagePublicId || null,
      },
    });

    revalidatePath('/[locale]/admin/accounting', 'page');

    return {
      success: true,
      transactionId: transaction.id,
    };
  } catch (error) {
    console.error('Add expense error:', error);

    if (error instanceof Error) {
      return {
        success: false,
        error: error.message,
      };
    }

    return {
      success: false,
      error: 'Failed to add expense. Please try again.',
    };
  }
}

export async function addRevenue(
  data: Omit<RevenueFormData, 'type'>
): Promise<AddTransactionResult> {
  try {
    const validatedData = revenueSchema.parse({
      ...data,
      type: 'REVENUE' as const,
    });

    const categoryId = validatedData.categoryId
      ? await assertValidCategoryId(validatedData.categoryId, CategoryType.REVENUE)
      : null;

    const transaction = await prisma.transaction.create({
      data: {
        type: 'REVENUE',
        amount: validatedData.amount,
        description: validatedData.description,
        categoryId,
        date: validatedData.date,
      },
    });

    revalidatePath('/[locale]/admin/accounting', 'page');

    return {
      success: true,
      transactionId: transaction.id,
    };
  } catch (error) {
    console.error('Add revenue error:', error);

    if (error instanceof Error) {
      return {
        success: false,
        error: error.message,
      };
    }

    return {
      success: false,
      error: 'Failed to add revenue. Please try again.',
    };
  }
}

export async function getTransactions() {
  try {
    const transactions = await prisma.transaction.findMany({
      orderBy: {
        date: 'desc',
      },
    });

    return transactions;
  } catch (error) {
    console.error('Get transactions error:', error);
    return [];
  }
}

export interface TrialBalance {
  totalExpenses: number;
  totalRevenue: number;
  netProfit: number;
}

export async function getTrialBalance(): Promise<TrialBalance> {
  try {
    const [expenses, revenues] = await Promise.all([
      prisma.transaction.aggregate({
        where: {
          type: 'EXPENSE',
        },
        _sum: {
          amount: true,
        },
      }),
      prisma.transaction.aggregate({
        where: {
          type: 'REVENUE',
        },
        _sum: {
          amount: true,
        },
      }),
    ]);

    const totalExpenses = expenses._sum.amount || 0;
    const totalRevenue = revenues._sum.amount || 0;
    const netProfit = totalRevenue - totalExpenses;

    return {
      totalExpenses,
      totalRevenue,
      netProfit,
    };
  } catch (error) {
    console.error('Get trial balance error:', error);
    return {
      totalExpenses: 0,
      totalRevenue: 0,
      netProfit: 0,
    };
  }
}

export async function updateTransaction(
  transactionId: string,
  data: Omit<ExpenseFormData, 'type'> | Omit<RevenueFormData, 'type'>
): Promise<AddTransactionResult> {
  try {
    // Get existing transaction to determine type
    const existing = await prisma.transaction.findUnique({
      where: { id: transactionId },
    });

    if (!existing) {
      return {
        success: false,
        error: 'Transaction not found',
      };
    }

    let validatedData: ExpenseFormData | RevenueFormData;
    if (existing.type === 'EXPENSE') {
      validatedData = expenseSchema.parse({
        ...data,
        type: 'EXPENSE' as const,
      });
    } else {
      validatedData = revenueSchema.parse({
        ...data,
        type: 'REVENUE' as const,
      });
    }

    const expectedCategoryType =
      existing.type === 'EXPENSE' ? CategoryType.EXPENSE : CategoryType.REVENUE;
    const categoryId = validatedData.categoryId
      ? await assertValidCategoryId(validatedData.categoryId, expectedCategoryType)
      : null;

    await prisma.transaction.update({
      where: { id: transactionId },
      data: {
        amount: validatedData.amount,
        description: validatedData.description,
        categoryId,
        date: validatedData.date,
        ...(existing.type === 'EXPENSE' && 'invoiceImageUrl' in validatedData
          ? {
            invoiceImageUrl: validatedData.invoiceImageUrl || null,
            invoiceImagePublicId: validatedData.invoiceImagePublicId || null,
          }
          : {}),
      },
    });

    revalidatePath('/[locale]/admin/accounting', 'page');

    return {
      success: true,
      transactionId,
    };
  } catch (error) {
    console.error('Update transaction error:', error);

    if (error instanceof Error) {
      return {
        success: false,
        error: error.message,
      };
    }

    return {
      success: false,
      error: 'Failed to update transaction. Please try again.',
    };
  }
}

export async function deleteTransaction(
  transactionId: string
): Promise<AddTransactionResult> {
  try {
    await prisma.transaction.delete({
      where: { id: transactionId },
    });

    revalidatePath('/[locale]/admin/accounting', 'page');

    return {
      success: true,
      transactionId,
    };
  } catch (error) {
    console.error('Delete transaction error:', error);

    if (error instanceof Error) {
      return {
        success: false,
        error: error.message,
      };
    }

    return {
      success: false,
      error: 'Failed to delete transaction. Please try again.',
    };
  }
}

