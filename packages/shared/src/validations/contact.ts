import { z } from 'zod';

export const contactMessageSchema = z.object({
  fullName: z
    .string()
    .min(2, 'Please enter your full name.')
    .max(120, 'Full name is too long.'),
  email: z.string().email('Please enter a valid email address.'),
  phone: z
    .string()
    .trim()
    .min(7, 'Phone number is too short.')
    .max(25, 'Phone number is too long.')
    .regex(/^[\d+\-\s()]+$/, 'Phone number format is invalid.')
    .optional(),
  subject: z
    .string()
    .min(3, 'Subject must be at least 3 characters.')
    .max(150, 'Subject must be under 150 characters.'),
  message: z
    .string()
    .min(20, 'Message must be at least 20 characters.')
    .max(2000, 'Message must be under 2000 characters.'),
  locale: z
    .string()
    .regex(/^[a-z]{2}(?:-[A-Z]{2})?$/, 'Invalid locale format.')
    .default('en'),
});

export type ContactMessageInput = z.infer<typeof contactMessageSchema>;
