import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/db/prisma'
import { requireAuth } from '@/lib/auth/admin'

// Force dynamic rendering - prevents build-time static analysis errors
export const dynamic = 'force-dynamic'

// GET /api/scholarships/[id] - Get single scholarship (public)
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  
  try {
    const scholarship = await prisma.scholarship.findUnique({
      where: { id },
    })
    
    if (!scholarship) {
      return NextResponse.json({ error: 'Scholarship not found' }, { status: 404 })
    }
    
    // Add computed isActive field
    const today = new Date()
    const result = {
      ...scholarship,
      isActive: !scholarship.deadline || scholarship.deadline >= today,
    }
    
    return NextResponse.json(result)
  } catch (error) {
    console.error('Error fetching scholarship:', error)
    return NextResponse.json({ error: 'Failed to fetch scholarship' }, { status: 500 })
  }
}

// PUT /api/scholarships/[id] - Update scholarship (protected)
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  // Verify authentication
  const auth = await requireAuth()
  if (!auth.authenticated) {
    return auth.errorResponse
  }

  const { id } = await params
  
  try {
    const body = await request.json()
    
    // Map incoming data to Prisma format
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const data: any = {}
    
    if (body.title !== undefined) data.title = body.title
    if (body.description !== undefined) data.description = body.description
    if (body.slug !== undefined) data.slug = body.slug
    if (body.apply_url !== undefined) data.applyUrl = body.apply_url
    if (body.official_url !== undefined) data.officialUrl = body.official_url
    if (body.source_url !== undefined) data.sourceUrl = body.source_url
    if (body.country !== undefined) data.country = body.country
    if (body.deadline !== undefined) data.deadline = body.deadline ? new Date(body.deadline) : null
    if (body.start_date !== undefined) data.startDate = body.start_date ? new Date(body.start_date) : null
    if (body.funding_type !== undefined) data.fundingType = body.funding_type
    if (body.education_level !== undefined) data.educationLevel = body.education_level
    if (body.areas !== undefined) data.areas = body.areas
    if (body.benefits !== undefined) data.benefits = body.benefits
    if (body.requirements !== undefined) data.requirements = body.requirements
    if (body.duracion !== undefined) data.duracion = body.duracion
    if (body.status !== undefined) data.status = body.status
    if (body.admin_notes !== undefined) data.adminNotes = body.admin_notes
    if (body.raw_data !== undefined) data.rawData = JSON.stringify(body.raw_data)
    
    const scholarship = await prisma.scholarship.update({
      where: { id },
      data,
    })
    
    return NextResponse.json(scholarship)
  } catch (error) {
    console.error('Error updating scholarship:', error)
    return NextResponse.json({ error: 'Failed to update scholarship' }, { status: 400 })
  }
}

// DELETE /api/scholarships/[id] - Delete scholarship (protected)
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  // Verify authentication
  const auth = await requireAuth()
  if (!auth.authenticated) {
    return auth.errorResponse
  }

  const { id } = await params
  
  try {
    await prisma.scholarship.delete({
      where: { id },
    })
    
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting scholarship:', error)
    return NextResponse.json({ error: 'Failed to delete scholarship' }, { status: 400 })
  }
}
