import { prisma } from '@jbrtechno/database';
import { RequirementStatus, RequirementPriority } from '@jbrtechno/database';

export async function seedRequirements() {
  const existingCount = await prisma.phase1Requirement.count();

  if (existingCount > 0) {
    return { success: true, message: 'Requirements already seeded', count: existingCount };
  }

  const requirements: Array<{
    category: string;
    title: string;
    status: RequirementStatus;
    priority: RequirementPriority;
  }> = [
      // Technical Infrastructure
      { category: 'Technical Infrastructure', title: 'jbrseo.com', status: RequirementStatus.COMPLETED, priority: RequirementPriority.HIGH },
      { category: 'Technical Infrastructure', title: 'Professional Email', status: RequirementStatus.PENDING, priority: RequirementPriority.HIGH },
      { category: 'Technical Infrastructure', title: 'Vercel', status: RequirementStatus.PENDING, priority: RequirementPriority.HIGH },
      { category: 'Technical Infrastructure', title: 'MongoDB Atlas', status: RequirementStatus.PENDING, priority: RequirementPriority.HIGH },
      { category: 'Technical Infrastructure', title: 'ChatGPT Business', status: RequirementStatus.PENDING, priority: RequirementPriority.HIGH },
      { category: 'Technical Infrastructure', title: 'SIM Card for WhatsApp', status: RequirementStatus.PENDING, priority: RequirementPriority.HIGH },
      { category: 'Technical Infrastructure', title: 'Social Media Accounts', status: RequirementStatus.PENDING, priority: RequirementPriority.HIGH },
      { category: 'Technical Infrastructure', title: 'Facebook Ads Budget', status: RequirementStatus.PENDING, priority: RequirementPriority.HIGH },
      { category: 'Technical Infrastructure', title: 'Cloudinary', status: RequirementStatus.COMPLETED, priority: RequirementPriority.MEDIUM },
      { category: 'Technical Infrastructure', title: 'Resend', status: RequirementStatus.PENDING, priority: RequirementPriority.MEDIUM },

      // Domain & Identity
      { category: 'Domain & Identity', title: 'SSL Certificate', status: RequirementStatus.PENDING, priority: RequirementPriority.HIGH },
      { category: 'Domain & Identity', title: 'Logo & Visual Identity', status: RequirementStatus.IN_PROGRESS, priority: RequirementPriority.MEDIUM },

      // Legal Requirements
      { category: 'Legal Requirements', title: 'Terms of Service', status: RequirementStatus.PENDING, priority: RequirementPriority.HIGH },
      { category: 'Legal Requirements', title: 'Employment Contracts', status: RequirementStatus.IN_PROGRESS, priority: RequirementPriority.MEDIUM },

      // Core Team
      { category: 'Core Team', title: 'CTO / Technical Lead', status: RequirementStatus.COMPLETED, priority: RequirementPriority.HIGH },
      { category: 'Core Team', title: 'Frontend Developer', status: RequirementStatus.COMPLETED, priority: RequirementPriority.HIGH },
      { category: 'Core Team', title: 'Backend Developer', status: RequirementStatus.COMPLETED, priority: RequirementPriority.HIGH },
      { category: 'Core Team', title: 'Operations Manager', status: RequirementStatus.COMPLETED, priority: RequirementPriority.HIGH },
      { category: 'Core Team', title: 'Designer', status: RequirementStatus.COMPLETED, priority: RequirementPriority.HIGH },
      { category: 'Core Team', title: 'React Native Developer', status: RequirementStatus.IN_PROGRESS, priority: RequirementPriority.HIGH },
      { category: 'Core Team', title: 'Head of Content', status: RequirementStatus.PENDING, priority: RequirementPriority.MEDIUM },
      { category: 'Core Team', title: 'Lawyer / Legal Advisor', status: RequirementStatus.PENDING, priority: RequirementPriority.HIGH },
    ];

  const created = await prisma.phase1Requirement.createMany({
    data: requirements,
  });

  return { success: true, message: 'Requirements seeded successfully', count: created.count };
}

