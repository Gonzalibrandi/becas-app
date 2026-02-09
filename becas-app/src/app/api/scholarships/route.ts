import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/db/prisma'
import { requireAuth } from '@/lib/auth/admin'

// Force dynamic rendering - prevents build-time static analysis errors
export const dynamic = 'force-dynamic'

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

// POST /api/scholarships - Create new scholarship (protected - admin only)
export async function POST(request: NextRequest) {
  // Verify authentication
  const auth = await requireAuth()
  if (!auth.authenticated) {
    return auth.errorResponse
  }

  try {
    const body = await request.json()
    
    // Helper to generate slug from title
    const generateSlug = (title: string): string => {
      const slug = title
        .toLowerCase()
        .normalize('NFKD')
        .replace(/[\u0300-\u036f]/g, '') // Remove accents
        .replace(/[^\w\s-]/g, '')
        .trim()
        .replace(/[\s_-]+/g, '-')
        .slice(0, 80)
      return `${slug}-${Date.now()}`
    }
    
    // Accept both snake_case (from Python) and camelCase (from frontend)
    const data = {
      slug: body.slug || generateSlug(body.title || 'beca'),
      title: body.title,
      description: body.description || '',
      applyUrl: body.apply_url || body.applyUrl || null,
      officialUrl: body.official_url || body.officialUrl || null,
      sourceUrl: body.source_url || body.sourceUrl || '',
      country: body.country,
      deadline: body.deadline ? new Date(body.deadline) : null,
      startDate: (body.start_date || body.startDate) ? new Date(body.start_date || body.startDate) : null,
      fundingType: body.funding_type || body.fundingType || 'UNKNOWN',
      educationLevel: body.education_level || body.educationLevel || 'OTHER',
      areas: body.areas || '',
      benefits: body.benefits || '',
      requirements: body.requirements || '',
      duracion: body.duracion || body.duration || '',
      status: body.status || 'DRAFT',
      rawData: JSON.stringify(body.raw_data || body.rawData || {}),
      adminNotes: body.admin_notes || body.adminNotes || null,
    }
    

    
    // Prevent duplicates by sourceUrl
    if (data.sourceUrl) {
      const existing = await prisma.scholarship.findFirst({
        where: { sourceUrl: data.sourceUrl }
      })
      if (existing) {
        return NextResponse.json(
          { error: 'Scholarship with this Source URL already exists', existingId: existing.id }, 
          { status: 409 }
        )
      }
    }

    // Extract category_slugs from body (comes from AI classification)
    const categorySlugs: string[] = body.category_slugs || body.categorySlugs || [];

    // Create scholarship first
    const scholarship = await prisma.scholarship.create({ 
      data,
    });

    // Connect categories if provided
    if (categorySlugs.length > 0) {
      const categories = await prisma.category.findMany({
        where: { slug: { in: categorySlugs } },
        select: { id: true }
      });

      if (categories.length > 0) {
        await prisma.scholarship.update({
          where: { id: scholarship.id },
          data: {
            categories: {
              connect: categories.map(c => ({ id: c.id }))
            }
          }
        });
      }
    }

    // Fetch the scholarship with categories included
    const result = await prisma.scholarship.findUnique({
      where: { id: scholarship.id },
      include: { categories: true }
    });
    
    return NextResponse.json(result, { status: 201 })
  } catch (error) {
    console.error('Error creating scholarship:', error)
    return NextResponse.json({ error: 'Failed to create scholarship', details: String(error) }, { status: 400 })
  }
}

