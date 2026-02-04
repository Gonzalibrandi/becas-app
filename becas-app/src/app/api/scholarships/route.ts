import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

// GET /api/scholarships - List scholarships with filters
export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams
  
  // Query parameters
  const search = searchParams.get('search')
  const country = searchParams.get('country')
  const fundingType = searchParams.get('funding_type')
  const educationLevel = searchParams.get('education_level')
  const status = searchParams.get('status')
  const active = searchParams.get('active')
  
  // Build where clause
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const where: any = {}
  
  // Default: only show PUBLISHED for public API
  // Admin will pass status parameter explicitly
  if (status) {
    where.status = status
  } else {
    where.status = 'PUBLISHED'
  }
  
  if (country) {
    where.country = { contains: country }
  }
  
  if (fundingType) {
    where.fundingType = fundingType
  }
  
  if (educationLevel) {
    where.educationLevel = educationLevel
  }
  
  if (search) {
    where.OR = [
      { title: { contains: search } },
      { description: { contains: search } },
      { country: { contains: search } },
    ]
  }
  
  // Active filter (deadline >= today or null)
  if (active === 'true') {
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    where.OR = [
      { deadline: { gte: today } },
      { deadline: null },
    ]
  } else if (active === 'false') {
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    where.deadline = { lt: today }
  }
  
  try {
    const scholarships = await prisma.scholarship.findMany({
      where,
      orderBy: { createdAt: 'desc' },
    })
    
    // Add computed isActive field
    const today = new Date()
    const result = scholarships.map(s => ({
      ...s,
      isActive: !s.deadline || s.deadline >= today,
    }))
    
    return NextResponse.json(result)
  } catch (error) {
    console.error('Error fetching scholarships:', error)
    return NextResponse.json({ error: 'Failed to fetch scholarships' }, { status: 500 })
  }
}

// POST /api/scholarships - Create new scholarship (for scraper)
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    // Map incoming snake_case to camelCase
    const data = {
      slug: body.slug,
      title: body.title,
      description: body.description || '',
      applyUrl: body.apply_url || null,
      officialUrl: body.official_url || null,
      sourceUrl: body.source_url,
      country: body.country,
      deadline: body.deadline ? new Date(body.deadline) : null,
      startDate: body.start_date ? new Date(body.start_date) : null,
      fundingType: body.funding_type || 'UNKNOWN',
      educationLevel: body.education_level || 'OTHER',
      areas: body.areas || '',
      benefits: body.benefits || '',
      requirements: body.requirements || '',
      duracion: body.duracion || '',
      status: body.status || 'DRAFT',
      rawData: JSON.stringify(body.raw_data || {}),
      adminNotes: body.admin_notes || null,
    }
    
    const scholarship = await prisma.scholarship.create({ data })
    
    return NextResponse.json(scholarship, { status: 201 })
  } catch (error) {
    console.error('Error creating scholarship:', error)
    return NextResponse.json({ error: 'Failed to create scholarship', details: String(error) }, { status: 400 })
  }
}
