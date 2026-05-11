import { z } from 'zod';

export const transactionSchema = z.object({
  type: z.enum(['EXPENSE', 'REVENUE']),
  amount: z.number().positive('Amount must be greater than 0'),
  description: z.string().min(1, 'Description is required').max(500, 'Description is too long'),
  categoryId: z
    .string()
    .trim()
    .regex(/^[a-f0-9]{24}$/i, 'Invalid category id')
    .optional(),
  date: z.date(),
  invoiceImageUrl: z.string().url('Invalid invoice image URL').optional().or(z.literal('')),
  invoiceImagePublicId: z.string().optional(),
});

export type TransactionFormData = z.infer<typeof transactionSchema>;

// Separate schemas for expense and revenue
export const expenseSchema = transactionSchema.extend({
  type: z.literal('EXPENSE'),
  invoiceImageUrl: z.string().url('Invalid invoice image URL').optional().or(z.literal('')),
  invoiceImagePublicId: z.string().optional(),
});

export const revenueSchema = transactionSchema.extend({
  type: z.literal('REVENUE'),
}).omit({ invoiceImageUrl: true, invoiceImagePublicId: true });

export type ExpenseFormData = z.infer<typeof expenseSchema>;
export type RevenueFormData = z.infer<typeof revenueSchema>;
