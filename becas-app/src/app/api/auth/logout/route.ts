import { NextResponse } from 'next/server'
import { destroySession } from '@/lib/auth/admin'

export const dynamic = 'force-dynamic'

export async function POST() {
  try {
    await destroySession()
    return NextResponse.json({ success: true, message: 'Logged out successfully' })
  } catch (error) {
    console.error('Logout error:', error)
    return NextResponse.json({ error: 'Logout failed' }, { status: 500 })
  }
}
