import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { seedRequirements } from '@/lib/seedRequirements';

export async function POST() {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const result = await seedRequirements();
    return NextResponse.json(result);
  } catch (error) {
    console.error('Error seeding requirements:', error);
    return NextResponse.json(
      { error: 'Failed to seed requirements' },
      { status: 500 }
    );
  }
}

