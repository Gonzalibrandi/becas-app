
import { NextResponse } from 'next/server'
import prisma from '@/lib/db/prisma'
import { requireAuth } from '@/lib/auth/admin'

export const dynamic = 'force-dynamic'

// GET /api/countries - List all countries
export async function GET() {
  try {
    const countries = await prisma.country.findMany({
      orderBy: { name: 'asc' },
    })
    return NextResponse.json(countries)
  } catch (error) {
    console.error('Error fetching countries:', error)
    return NextResponse.json({ error: 'Failed to fetch countries' }, { status: 500 })
  }
}

// POST /api/countries - Create a new country
export async function POST(request: Request) {
  const auth = await requireAuth()
  if (!auth.authenticated) {
    return auth.errorResponse
  }

  try {
    const body = await request.json()
    const name = body.name?.trim()

    if (!name) {
      return NextResponse.json({ error: 'Name is required' }, { status: 400 })
    }

    // Generate slug
    const slug = name
      .toLowerCase()
      .normalize('NFKD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9]/g, '-')
      .replace(/-+/g, '-')
      .replace(/^-|-$/g, '')

    // Check duplicate
    const existing = await prisma.country.findFirst({
      where: { OR: [{ name }, { slug }] },
    })

    if (existing) {
      return NextResponse.json(
        { error: 'Country already exists', existing },
        { status: 409 }
      )
    }

    const country = await prisma.country.create({
      data: { name, slug, isoCode: body.isoCode || null },
    })

    return NextResponse.json(country, { status: 201 })
  } catch (error) {
    console.error('Error creating country:', error)
    return NextResponse.json({ error: 'Failed to create country' }, { status: 500 })
  }
}
