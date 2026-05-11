import { z } from 'zod';

const languageProficiencySchema = z.enum([
  'excellent',
  'very_good',
  'good',
  'fair',
]);

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

