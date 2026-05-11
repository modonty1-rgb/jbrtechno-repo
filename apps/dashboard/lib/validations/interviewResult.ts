import { z } from 'zod';

export const interviewResultSchema = z.object({
  applicationId: z
    .string({ message: 'Application ID must be a string' })
    .min(1, 'Application ID is required')
    .trim(),
  
  interviewDate: z
    .date({ message: 'Interview date is required' }),
  
  result: z
    .enum(['PASSED', 'FAILED', 'PENDING'], {
      message: 'Result must be PASSED, FAILED, or PENDING',
    }),
  
  rating: z
    .number({ message: 'Rating must be a number' })
    .int('Rating must be an integer')
    .min(1, 'Rating must be at least 1')
    .max(10, 'Rating must be at most 10')
    .optional(),
  
  interviewerName: z
    .string({ message: 'Interviewer name must be text' })
    .trim()
    .min(1, 'Interviewer name is required')
    .max(100, 'Interviewer name is too long (maximum 100 characters)')
    .optional(),
  
  strengths: z
    .array(z.string().trim().min(1, 'Strength cannot be empty'))
    .optional()
    .default([]),
  
  weaknesses: z
    .array(z.string().trim().min(1, 'Weakness cannot be empty'))
    .optional()
    .default([]),
  
  notes: z
    .string({ message: 'Notes must be text' })
    .trim()
    .max(2000, 'Notes are too long (maximum 2000 characters)')
    .optional(),
  
  recommendation: z
    .string({ message: 'Recommendation must be text' })
    .trim()
    .max(1000, 'Recommendation is too long (maximum 1000 characters)')
    .optional(),
});

export type InterviewResultData = z.infer<typeof interviewResultSchema>;
export type InterviewResultInput = z.input<typeof interviewResultSchema>;






