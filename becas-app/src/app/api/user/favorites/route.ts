import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/db/prisma';
import { requireUserAuth } from '@/lib/auth/user';

export const dynamic = 'force-dynamic';

// GET /api/user/favorites - List user's saved scholarships
export async function GET(request: NextRequest) {
  const auth = await requireUserAuth();
  if (!auth.authenticated || !auth.user) {
    return auth.errorResponse;
  }

  try {
    const user = await prisma.user.findUnique({
      where: { id: auth.user.id },
      include: {
        savedScholarships: {
          include: {
            categories: true
          },
          orderBy: { createdAt: 'desc' }
        }
      }
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Add computed isActive field
    const today = new Date();
    const scholarships = user.savedScholarships.map(s => ({
      ...s,
      isActive: !s.deadline || s.deadline >= today,
    }));

    return NextResponse.json(scholarships);
  } catch (error) {
    console.error('Error fetching favorites:', error);
    return NextResponse.json({ error: 'Failed to fetch favorites' }, { status: 500 });
  }
}

// POST /api/user/favorites - Add scholarship to favorites
export async function POST(request: NextRequest) {
  const auth = await requireUserAuth();
  if (!auth.authenticated || !auth.user) {
    return auth.errorResponse;
  }

  try {
    const { scholarshipId } = await request.json();

    if (!scholarshipId) {
      return NextResponse.json({ error: 'scholarshipId is required' }, { status: 400 });
    }

    // Verify scholarship exists
    const scholarship = await prisma.scholarship.findUnique({
      where: { id: scholarshipId }
    });

    if (!scholarship) {
      return NextResponse.json({ error: 'Scholarship not found' }, { status: 404 });
    }

    // Add to favorites
    await prisma.user.update({
      where: { id: auth.user.id },
      data: {
        savedScholarships: {
          connect: { id: scholarshipId }
        }
      }
    });

    return NextResponse.json({ success: true, message: 'Added to favorites' });
  } catch (error) {
    console.error('Error adding to favorites:', error);
    return NextResponse.json({ error: 'Failed to add to favorites' }, { status: 500 });
  }
}

// DELETE /api/user/favorites - Remove scholarship from favorites
export async function DELETE(request: NextRequest) {
  const auth = await requireUserAuth();
  if (!auth.authenticated || !auth.user) {
    return auth.errorResponse;
  }

  try {
    const { scholarshipId } = await request.json();

    if (!scholarshipId) {
      return NextResponse.json({ error: 'scholarshipId is required' }, { status: 400 });
    }

    // Remove from favorites
    await prisma.user.update({
      where: { id: auth.user.id },
      data: {
        savedScholarships: {
          disconnect: { id: scholarshipId }
        }
      }
    });

    return NextResponse.json({ success: true, message: 'Removed from favorites' });
  } catch (error) {
    console.error('Error removing from favorites:', error);
    return NextResponse.json({ error: 'Failed to remove from favorites' }, { status: 500 });
  }
}
