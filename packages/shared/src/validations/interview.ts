import { z } from 'zod';

const workLocationSchema = z.enum(['OFFICE', 'REMOTE', 'HYBRID'], {
  message: 'Please select a valid work location option',
});

const trimString = (val: string) => val.trim();

export const interviewResponseSchema = z.object({
  applicationId: z
    .string({ message: 'Application ID must be a string' })
    .min(1, 'Application ID is required')
    .trim(),

  lastJobExitReason: z
    .string({ message: 'Last job exit reason must be text' })
    .min(1, 'Please explain why you left your last job')
    .transform(trimString)
    .refine((val) => val.length >= 10, {
      message: 'Please provide a detailed reason (at least 10 characters). Be specific about why you left.',
    })
    .refine((val) => val.length <= 1000, {
      message: 'Reason is too long (maximum 1000 characters). Please be concise.',
    })
    .refine(
      (val) => {
        const uniqueChars = new Set(val.toLowerCase().replace(/\s/g, ''));
        return uniqueChars.size >= 3;
      },
      { message: 'Please provide a meaningful explanation with actual content.' }
    ),

  lastSalary: z
    .string({ message: 'Last salary must be text' })
    .min(1, 'Last salary is required')
    .transform(trimString)
    .refine((val) => val.length >= 1, { message: 'Please enter your last salary package' })
    .refine((val) => val.length <= 100, { message: 'Salary information is too long (maximum 100 characters)' }),

  expectedSalary: z
    .string({ message: 'Expected salary must be text' })
    .min(1, 'Expected salary is required')
    .transform(trimString)
    .refine((val) => val.length >= 1, { message: 'Please enter your expected salary package' })
    .refine((val) => val.length <= 100, { message: 'Salary information is too long (maximum 100 characters)' }),

  canWorkHard: z.boolean({ message: 'Work hard confirmation must be true or false' }).optional(),

  noticePeriod: z
    .string({ message: 'Start date availability must be text' })
    .min(1, 'Please specify when you are ready to start')
    .transform(trimString)
    .refine((val) => val.length >= 3, {
      message: 'Please provide more details about your availability (at least 3 characters)',
    })
    .refine((val) => val.length <= 100, {
      message: 'Start date information is too long (maximum 100 characters)',
    }),

  preferredWorkLocation: workLocationSchema,

  whyInterestedInPosition: z
    .string({ message: 'Interest explanation must be text' })
    .min(1, 'Please explain why you are interested in this position')
    .transform(trimString)
    .refine((val) => val.length >= 20, {
      message:
        'Please provide a detailed answer explaining your interest (at least 20 characters). Show us why you want this role.',
    })
    .refine((val) => val.length <= 500, {
      message: 'Answer is too long (maximum 500 characters). Please be concise but thorough.',
    })
    .refine(
      (val) => {
        const words = val.split(/\s+/).filter((w) => w.length > 0);
        return words.length >= 5;
      },
      { message: 'Please provide a more detailed explanation (at least 5 words).' }
    ),

  questionsAboutRole: z
    .string()
    .transform(trimString)
    .refine((val) => val.length <= 500, {
      message: 'Questions are too long (maximum 500 characters)',
    })
    .optional()
    .or(z.literal('')),

  willingnessToRelocate: z.boolean({ message: 'Relocation willingness must be true or false' }).optional(),

  bestInterviewTime: z
    .string({ message: 'Interview time preference must be text' })
    .min(1, 'Please specify your preferred interview time')
    .transform(trimString)
    .refine((val) => val.length >= 3, {
      message: 'Please provide more details about your preferred interview time (at least 3 characters)',
    })
    .refine((val) => val.length <= 200, {
      message: 'Interview time preference is too long (maximum 200 characters)',
    }),
});

export type InterviewResponseData = z.infer<typeof interviewResponseSchema>;
export type InterviewResponseInput = z.input<typeof interviewResponseSchema>;
