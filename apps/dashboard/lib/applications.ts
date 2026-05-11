import { prisma } from '@jbrtechno/database';

export interface ApplicationCounts {
  position: string;
  pending: number;
  total: number;
}

export interface ApplicationStatsByPosition {
  position: string;
  total: number;
  pending: number;
  reviewed: number;
  accepted: number;
  rejected: number;
  acceptedWithResponses: number;
}

/**
 * Get application counts grouped by position
 */
export async function getApplicationCountsByPosition(): Promise<ApplicationCounts[]> {
  try {
    // Get all applications grouped by position with status counts
    const applications = await prisma.application.groupBy({
      by: ['position'],
      _count: {
        id: true,
      },
    });

    // Get pending counts separately
    const pendingCounts = await prisma.application.groupBy({
      by: ['position'],
      where: {
        status: 'PENDING',
      },
      _count: {
        id: true,
      },
    });

    // Combine the results
    const countsMap = new Map<string, ApplicationCounts>();

    applications.forEach((app) => {
      countsMap.set(app.position, {
        position: app.position,
        pending: 0,
        total: app._count.id,
      });
    });

    pendingCounts.forEach((pending) => {
      const existing = countsMap.get(pending.position);
      if (existing) {
        existing.pending = pending._count.id;
      }
    });

    return Array.from(countsMap.values());
  } catch (error) {
    console.error('Error fetching application counts:', error);
    return [];
  }
}

/**
 * Generate Cloudinary thumbnail URL for PDF CVs
 * Uses Cloudinary's transformation API to create thumbnails
 */
export function generateCVThumbnailUrl(cvUrl: string): string | null {
  try {
    // Check if it's a Cloudinary URL
    if (!cvUrl.includes('res.cloudinary.com')) {
      return null;
    }

    // Check if it's a PDF (raw type)
    if (!cvUrl.includes('/raw/upload/')) {
      return null;
    }

    // Transform the URL to generate a thumbnail
    // Convert PDF first page to JPG thumbnail (100x100)
    const transformedUrl = cvUrl.replace(
      '/raw/upload/',
      '/image/upload/f_jpg,pg_1,w_100,h_100,c_fill/'
    );

    return transformedUrl;
  } catch (error) {
    console.error('Error generating CV thumbnail URL:', error);
    return null;
  }
}

/**
 * Get file extension from CV URL
 */
export function getCVFileType(cvUrl: string): 'PDF' | 'DOCX' | 'DOC' | 'FILE' | 'UNKNOWN' {
  if (!cvUrl) return 'UNKNOWN';
  try {
    const pathname = new URL(cvUrl).pathname.toLowerCase();
    if (pathname.endsWith('.pdf')) return 'PDF';
    if (pathname.endsWith('.docx')) return 'DOCX';
    if (pathname.endsWith('.doc')) return 'DOC';
    if (pathname.includes('.pdf')) return 'PDF';
    if (pathname.includes('.docx')) return 'DOCX';
    if (pathname.includes('.doc')) return 'DOC';
    // Legacy uploads without extension — Cloudinary /raw/upload/ always serves documents
    if (pathname.includes('/raw/upload/')) return 'FILE';
    return 'UNKNOWN';
  } catch {
    return 'UNKNOWN';
  }
}

/**
 * Get detailed application statistics for a specific position
 */
export async function getApplicationStatsByPosition(
  position: string,
  aliases: string[] = [position]
): Promise<ApplicationStatsByPosition> {
  try {
    const positionsFilter = aliases.length > 0 ? Array.from(new Set(aliases)) : [position];
    const baseWhere = {
      position: {
        in: positionsFilter,
      },
    };

    const [total, pending, reviewed, accepted, rejected, acceptedWithResponses] = await Promise.all([
      prisma.application.count({ where: baseWhere }),
      prisma.application.count({ where: { ...baseWhere, status: 'PENDING' } }),
      prisma.application.count({ where: { ...baseWhere, status: 'REVIEWED' } }),
      prisma.application.count({ where: { ...baseWhere, status: 'ACCEPTED' } }),
      prisma.application.count({ where: { ...baseWhere, status: 'REJECTED' } }),
      prisma.application.count({
        where: {
          ...baseWhere,
          status: 'ACCEPTED',
          interviewResponseSubmittedAt: {
            not: null,
          },
        },
      }),
    ]);

    return {
      position,
      total,
      pending,
      reviewed,
      accepted,
      rejected,
      acceptedWithResponses,
    };
  } catch (error) {
    console.error('Error fetching application stats for position:', error);
    return {
      position,
      total: 0,
      pending: 0,
      reviewed: 0,
      accepted: 0,
      rejected: 0,
      acceptedWithResponses: 0,
    };
  }
}

