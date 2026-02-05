import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { requireAuth } from '@/lib/auth'

// Force dynamic rendering
export const dynamic = 'force-dynamic'

type BulkAction = 'delete' | 'changeStatus'

interface BulkRequest {
  ids: string[]
  action: BulkAction
  payload?: {
    status?: string
  }
}

// POST /api/scholarships/bulk - Bulk actions (protected)
export async function POST(request: NextRequest) {
  // Verify authentication
  const auth = await requireAuth()
  if (!auth.authenticated) {
    return auth.errorResponse
  }

  try {
    const body: BulkRequest = await request.json()
    const { ids, action, payload } = body

    if (!ids || !Array.isArray(ids) || ids.length === 0) {
      return NextResponse.json({ error: 'No IDs provided' }, { status: 400 })
    }

    if (!action) {
      return NextResponse.json({ error: 'No action specified' }, { status: 400 })
    }

    let result: { count: number }

    switch (action) {
      case 'delete':
        result = await prisma.scholarship.deleteMany({
          where: { id: { in: ids } },
        })
        return NextResponse.json({ 
          success: true, 
          message: `${result.count} beca(s) eliminada(s)`,
          count: result.count 
        })

      case 'changeStatus':
        if (!payload?.status) {
          return NextResponse.json({ error: 'No status provided' }, { status: 400 })
        }
        result = await prisma.scholarship.updateMany({
          where: { id: { in: ids } },
          data: { status: payload.status },
        })
        return NextResponse.json({ 
          success: true, 
          message: `${result.count} beca(s) actualizada(s) a ${payload.status}`,
          count: result.count 
        })

      default:
        return NextResponse.json({ error: 'Invalid action' }, { status: 400 })
    }
  } catch (error) {
    console.error('Error in bulk action:', error)
    return NextResponse.json({ error: 'Failed to perform bulk action' }, { status: 500 })
  }
}
