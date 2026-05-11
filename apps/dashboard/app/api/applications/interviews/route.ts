import { NextResponse } from 'next/server';
import { prisma } from '@jbrtechno/database';

export async function GET() {
  try {
    const applications = await prisma.application.findMany({
      where: {
        scheduledInterviewDate: { not: null },
      },
      select: {
        id: true,
        applicantName: true,
        position: true,
        phone: true,
        profileImageUrl: true,
        scheduledInterviewDate: true,
        interviewResponseSubmittedAt: true,
        appointmentConfirmed: true,
        lastSalary: true,
        expectedSalary: true,
      },
      orderBy: [
        { scheduledInterviewDate: 'desc' },
        { interviewResponseSubmittedAt: 'desc' },
      ],
    });

    const applicationIds = applications.map((app) => app.id);

    const interviewResults = await prisma.interviewResult.findMany({
      where: {
        applicationId: { in: applicationIds },
      },
      select: {
        applicationId: true,
        result: true,
      },
    });

    const resultMap = new Map(
      interviewResults.map((result) => [result.applicationId, { result: result.result }])
    );

    const interviews = applications.map((app) => ({
      ...app,
      interviewResult: resultMap.get(app.id) || null,
    }));

    return NextResponse.json({ interviews });
  } catch (error) {
    console.error('Error fetching interviews:', error);
    return NextResponse.json(
      { error: 'Failed to fetch interviews' },
      { status: 500 }
    );
  }
}

