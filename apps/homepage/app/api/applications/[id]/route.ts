import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@jbrtechno/database';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const application = await prisma.application.findUnique({
      where: { id },
    });

    if (!application) {
      return NextResponse.json({ error: 'Application not found' }, { status: 404 });
    }

    return NextResponse.json(application);
  } catch (error) {
    console.error('Error fetching application:', error);
    return NextResponse.json(
      { error: 'Failed to fetch application' },
      { status: 500 }
    );
  }
}

