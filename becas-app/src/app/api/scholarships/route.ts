import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/db/prisma'
import { requireAuth } from '@/lib/auth/admin'
import { CATEGORIES } from '@/lib/utils/categories'

// Force dynamic rendering - prevents build-time static analysis errors
export const dynamic = 'force-dynamic'

// GET /api/scholarships - get list of scholarships with filters
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
    where.countries = { some: { slug: { contains: country, mode: 'insensitive' } } }
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
      { countries: { some: { name: { contains: search } } } },
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
      include: {
        categories: true,
        countries: true,
      }
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

// POST /api/scholarships - create a new scholarship
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
      deadline: body.deadline ? new Date(body.deadline) : null,
      startDate: (body.start_date || body.startDate) ? new Date(body.start_date || body.startDate) : null,
      fundingType: body.funding_type || body.fundingType || 'UNKNOWN',
      educationLevel: body.education_level || body.educationLevel || 'OTHER',
      benefits: body.benefits || '',
      requirements: body.requirements || '',
      duration: body.duration || '',
      status: body.status || 'DRAFT',
      isRecommended: body.isRecommended || false,
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

    // Extract category info from body
    const categorySlugs: string[] = body.category_slugs || body.categorySlugs || [];
    const categoryIds: string[] = body.categoryIds || [];

    // Resolve category IDs to connect
    let categoriesToConnect: { id: string }[] = [];

    if (categoryIds.length > 0) {
      categoriesToConnect = categoryIds.map((id: string) => ({ id }));
    } else if (categorySlugs.length > 0) {
      // 1. Find existing categories
      const existingCategories = await prisma.category.findMany({
        where: { slug: { in: categorySlugs } },
        select: { id: true, slug: true },
      });
      
      const existingSlugs = new Set(existingCategories.map(c => c.slug));
      categoriesToConnect = existingCategories.map(c => ({ id: c.id }));

      // 2. Create missing categories if valid
      const missingSlugs = categorySlugs.filter((slug: string) => !existingSlugs.has(slug));
      
      for (const slug of missingSlugs) {
        const definition = CATEGORIES.find(c => c.slug === slug);
        if (definition) {
          try {
            const newCategory = await prisma.category.create({
              data: {
                name: definition.name,
                slug: definition.slug,
              },
              select: { id: true }
            });
            categoriesToConnect.push({ id: newCategory.id });
          } catch (e) {
            console.error(`Failed to auto-create category ${slug}:`, e);
          }
        }
      }
    }

    // Resolve country IDs to connect
    const countryIds: string[] = body.countryIds || [];
    let countriesToConnect = countryIds.map((id) => ({ id }));

    // Handle string country input (from Scraper/Import)
    // If no explicit IDs provided, try to resolve country string
    if (countriesToConnect.length === 0 && (body.country || body.country_name)) {
      const countryName = (body.country || body.country_name).trim();
      if (countryName) {
        // Try to find by name or slug
        const slug = generateSlug(countryName);
        let country = await prisma.country.findFirst({
            where: {
                OR: [
                    { name: { equals: countryName, mode: 'insensitive' } },
                    { slug: { equals: slug, mode: 'insensitive' } }
                ]
            },
            select: { id: true }
        });

        // Auto-Create if not found
        if (!country) {
            try {
                country = await prisma.country.create({
                    data: {
                        name: countryName,
                        slug: slug,
                        isoCode: null // Unknown for now
                    },
                    select: { id: true }
                });
            } catch (e) {
                 console.error(`Failed to auto-create country ${countryName}:`, e);
            }
        }

        if (country) {
            countriesToConnect.push({ id: country.id });
        }
      }
    }

    // Create scholarship with categories
    const scholarship = await prisma.scholarship.create({ 
      data: {
        ...data,
        ...(categoriesToConnect.length > 0 && {
          categories: { connect: categoriesToConnect },
        }),
        ...(countriesToConnect.length > 0 && {
          countries: { connect: countriesToConnect },
        }),
      },
      select: { // Added select clause
          id: true,
          title: true,
          slug: true,
          // country removed
          deadline: true,
          fundingType: true,
          educationLevel: true,
          description: true,
          categories: { select: { name: true, slug: true } },
          countries: { select: { name: true } }, // New relation
        },
    });
    
    return NextResponse.json(scholarship, { status: 201 })
  } catch (error) {
    console.error('Error creating scholarship:', error)
    return NextResponse.json({ error: 'Failed to create scholarship', details: String(error) }, { status: 400 })
  }
}

