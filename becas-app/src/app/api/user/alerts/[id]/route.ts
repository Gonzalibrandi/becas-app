import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/db/prisma';
import { requireUserAuth } from '@/lib/auth/user';

export const dynamic = 'force-dynamic';

interface RouteParams {
  params: Promise<{ id: string }>;
}

// GET /api/user/alerts/[id] - get an alert by ID
export async function GET(request: NextRequest, { params }: RouteParams) {
  const auth = await requireUserAuth();
  if (!auth.authenticated || !auth.user) {
    return auth.errorResponse;
  }

  try {
    const { id } = await params;

    const alert = await prisma.scholarshipAlert.findFirst({
      where: { 
        id,
        userId: auth.user.id // Ensure user owns this alert
      }
    });

    if (!alert) {
      return NextResponse.json({ error: 'Alert not found' }, { status: 404 });
    }

    return NextResponse.json(alert);
  } catch (error) {
    console.error('Error fetching alert:', error);
    return NextResponse.json({ error: 'Failed to fetch alert' }, { status: 500 });
  }
}

// PATCH /api/user/alerts/[id] - update an alert by ID
export async function PATCH(request: NextRequest, { params }: RouteParams) {
  const auth = await requireUserAuth();
  if (!auth.authenticated || !auth.user) {
    return auth.errorResponse;
  }

  try {
    const { id } = await params;
    const body = await request.json();

    // Verify ownership
    const existing = await prisma.scholarshipAlert.findFirst({
      where: { id, userId: auth.user.id }
    });

    if (!existing) {
      return NextResponse.json({ error: 'Alert not found' }, { status: 404 });
    }

    // Build update data
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const updateData: any = {};
    
    if (body.name !== undefined) updateData.name = body.name;
    if (body.criteria !== undefined) updateData.criteria = body.criteria;
    if (body.isActive !== undefined) updateData.isActive = body.isActive;
    
    if (body.frequency !== undefined) {
      const validFrequencies = ['DAILY', 'WEEKLY'];
      if (!validFrequencies.includes(body.frequency)) {
        return NextResponse.json({ error: 'Invalid frequency' }, { status: 400 });
      }
      updateData.frequency = body.frequency;
    }

    const alert = await prisma.scholarshipAlert.update({
      where: { id },
      data: updateData
    });

    return NextResponse.json(alert);
  } catch (error) {
    console.error('Error updating alert:', error);
    return NextResponse.json({ error: 'Failed to update alert' }, { status: 500 });
  }
}

// DELETE /api/user/alerts/[id] - delete an alert by ID
export async function DELETE(request: NextRequest, { params }: RouteParams) {
  const auth = await requireUserAuth();
  if (!auth.authenticated || !auth.user) {
    return auth.errorResponse;
  }

  try {
    const { id } = await params;

    // Verify ownership
    const existing = await prisma.scholarshipAlert.findFirst({
      where: { id, userId: auth.user.id }
    });

    if (!existing) {
      return NextResponse.json({ error: 'Alert not found' }, { status: 404 });
    }

    await prisma.scholarshipAlert.delete({
      where: { id }
    });

    return NextResponse.json({ success: true, message: 'Alert deleted' });
  } catch (error) {
    console.error('Error deleting alert:', error);
    return NextResponse.json({ error: 'Failed to delete alert' }, { status: 500 });
  }
}
