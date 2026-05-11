import { z } from 'zod';

const languageProficiencySchema = z.enum([
  'excellent',
  'very_good',
  'good',
  'fair',
]);

const workLocationSchema = z.enum(['OFFICE', 'REMOTE', 'HYBRID'], {
  message: 'Please select a valid work location option',
});

const trimString = (val: string) => val.trim();

export const applicationSchema = z.object({
  applicantName: z
    .string()
    .min(2, 'Name must be at least 2 characters')
    .max(100),
  email: z.string().email('Invalid email address'),
  phone: z
    .string()
    .min(8, 'Phone number must be at least 8 characters')
    .max(20),
  position: z.string().min(2, 'Position is required'),
  yearsOfExperience: z
    .number()
    .min(0, 'Years of experience must be 0 or greater')
    .max(50),
  availabilityDate: z
    .string()
    .min(1, 'Availability date is required')
    .transform((value) => new Date(value)),
  currentLocation: z
    .string()
    .min(2, 'Current location is required')
    .max(100),
  arabicProficiency: languageProficiencySchema,
  englishProficiency: languageProficiencySchema,
  consentToDataUsage: z.literal(true),
  portfolioUrl: z.string().url('Invalid URL').optional().or(z.literal('')),
  githubUrl: z.string().url('Invalid URL').optional().or(z.literal('')),
  linkedinUrl: z.string().url('Invalid URL').optional().or(z.literal('')),
  skills: z.array(z.string()).min(1, 'At least one skill is required'),
  coverLetter: z
    .string()
    .min(50, 'Cover letter must be at least 50 characters')
    .max(2000),
  cvUrl: z.string().url('CV upload is required'),
  cvPublicId: z.string().min(1, 'CV public ID is required'),
  profileImageUrl: z.string().url('Profile image is required'),
  profileImagePublicId: z.string().min(1, 'Profile image public ID is required'),
  locale: z.enum(['ar', 'en']),
  
  // Interview fields
  lastJobExitReason: z
    .string({ message: 'Last job exit reason must be text' })
    .min(1, 'Please explain why you left your last job')
    .transform(trimString)
    .refine(
      (val) => val.length >= 10,
      {
        message: 'Please provide a detailed reason (at least 10 characters). Be specific about why you left.',
      }
    )
    .refine(
      (val) => val.length <= 1000,
      {
        message: 'Reason is too long (maximum 1000 characters). Please be concise.',
      }
    )
    .refine(
      (val) => {
        const uniqueChars = new Set(val.toLowerCase().replace(/\s/g, ''));
        return uniqueChars.size >= 3;
      },
      {
        message: 'Please provide a meaningful explanation with actual content.',
      }
    ),
  lastSalary: z
    .string({ message: 'Last salary must be text' })
    .min(1, 'Last salary is required')
    .transform(trimString)
    .refine(
      (val) => val.length >= 1,
      {
        message: 'Please enter your last salary package',
      }
    )
    .refine(
      (val) => val.length <= 100,
      {
        message: 'Salary information is too long (maximum 100 characters)',
      }
    ),
  expectedSalary: z
    .string({ message: 'Expected salary must be text' })
    .min(1, 'Expected salary is required')
    .transform(trimString)
    .refine(
      (val) => val.length >= 1,
      {
        message: 'Please enter your expected salary package',
      }
    )
    .refine(
      (val) => val.length <= 100,
      {
        message: 'Salary information is too long (maximum 100 characters)',
      }
    ),
  canWorkHard: z
    .boolean({ message: 'Work hard confirmation must be true or false' })
    .optional(),
  noticePeriod: z
    .string({ message: 'Notice period must be text' })
    .min(1, 'Please specify when you are ready to start')
    .transform(trimString)
    .refine(
      (val) => val.length >= 3,
      {
        message: 'Please provide more details about your availability (at least 3 characters)',
      }
    )
    .refine(
      (val) => val.length <= 100,
      {
        message: 'Start date information is too long (maximum 100 characters)',
      }
    ),
  preferredWorkLocation: workLocationSchema,
  whyInterestedInPosition: z
    .string({ message: 'Interest explanation must be text' })
    .min(1, 'Please explain why you are interested in this position')
    .transform(trimString)
    .refine(
      (val) => val.length >= 20,
      {
        message: 'Please provide a detailed answer explaining your interest (at least 20 characters). Show us why you want this role.',
      }
    )
    .refine(
      (val) => val.length <= 500,
      {
        message: 'Answer is too long (maximum 500 characters). Please be concise but thorough.',
      }
    )
    .refine(
      (val) => {
        const words = val.split(/\s+/).filter(w => w.length > 0);
        return words.length >= 5;
      },
      {
        message: 'Please provide a more detailed explanation (at least 5 words).',
      }
    ),
  questionsAboutRole: z
    .string()
    .transform(trimString)
    .refine(
      (val) => val.length <= 500,
      {
        message: 'Questions are too long (maximum 500 characters)',
      }
    )
    .optional()
    .or(z.literal('')),
  willingnessToRelocate: z
    .boolean({ message: 'Relocation willingness must be true or false' })
    .optional(),
  bestInterviewTime: z
    .string({ message: 'Interview time preference must be text' })
    .min(1, 'Please specify your preferred interview time')
    .transform(trimString)
    .refine(
      (val) => val.length >= 3,
      {
        message: 'Please provide more details about your preferred interview time (at least 3 characters)',
      }
    )
    .refine(
      (val) => val.length <= 200,
      {
        message: 'Interview time preference is too long (maximum 200 characters)',
      }
    ),
});

export type ApplicationFormData = z.infer<typeof applicationSchema>;
export type ApplicationFormInput = z.input<typeof applicationSchema>;

// File validation constants
export const ALLOWED_FILE_TYPES = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
export const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/jpg'];
export const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
export const MAX_IMAGE_SIZE = 2 * 1024 * 1024; // 2MB

export function validateFile(file: File): { valid: boolean; error?: string } {
  if (!ALLOWED_FILE_TYPES.includes(file.type)) {
    return {
      valid: false,
      error: 'Only PDF and DOCX files are allowed',
    };
  }

  if (file.size > MAX_FILE_SIZE) {
    return {
      valid: false,
      error: 'File size must be less than 5MB',
    };
  }

  return { valid: true };
}

export function validateImage(file: File): { valid: boolean; error?: string } {
  if (!ALLOWED_IMAGE_TYPES.includes(file.type)) {
    return {
      valid: false,
      error: 'Only JPG, PNG, and WebP images are allowed',
    };
  }

  if (file.size > MAX_IMAGE_SIZE) {
    return {
      valid: false,
      error: 'Image size must be less than 2MB',
    };
  }

  return { valid: true };
}

