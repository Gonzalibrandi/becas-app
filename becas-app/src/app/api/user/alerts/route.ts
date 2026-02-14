import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/db/prisma';
import { requireUserAuth } from '@/lib/auth/user';

export const dynamic = 'force-dynamic';

// GET /api/user/alerts - get user alerts list
export async function GET() {
  const auth = await requireUserAuth();
  if (!auth.authenticated || !auth.user) {
    return auth.errorResponse;
  }

  try {
    const alerts = await prisma.scholarshipAlert.findMany({
      where: { userId: auth.user.id },
      orderBy: { createdAt: 'desc' }
    });

    return NextResponse.json(alerts);
  } catch (error) {
    console.error('Error fetching alerts:', error);
    return NextResponse.json({ error: 'Failed to fetch alerts' }, { status: 500 });
  }
}

// POST /api/user/alerts - create a new alert
export async function POST(request: NextRequest) {
  const auth = await requireUserAuth();
  if (!auth.authenticated || !auth.user) {
    return auth.errorResponse;
  }

  try {
    const body = await request.json();

    // Validate criteria
    const criteria = body.criteria || {};
    if (typeof criteria !== 'object') {
      return NextResponse.json({ error: 'criteria must be an object' }, { status: 400 });
    }

    // Validate frequency
    const validFrequencies = ['DAILY', 'WEEKLY'];
    const frequency = body.frequency || 'WEEKLY';
    if (!validFrequencies.includes(frequency)) {
      return NextResponse.json({ error: 'Invalid frequency. Use DAILY or WEEKLY' }, { status: 400 });
    }

    const alert = await prisma.scholarshipAlert.create({
      data: {
        name: body.name || 'Mi Alerta',
        criteria: criteria,
        frequency: frequency,
        isActive: body.isActive !== false,
        userId: auth.user.id
      }
    });

    return NextResponse.json(alert, { status: 201 });
  } catch (error) {
    console.error('Error creating alert:', error);
    return NextResponse.json({ error: 'Failed to create alert' }, { status: 500 });
  }
}
