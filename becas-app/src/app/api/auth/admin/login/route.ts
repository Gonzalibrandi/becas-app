import { NextRequest, NextResponse } from 'next/server'
import { validateCredentials, createSession } from '@/lib/auth/admin'

export const dynamic = 'force-dynamic'

// POST /api/auth/login - log in as admin
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { username, password } = body
    
    if (!username || !password) {
      return NextResponse.json({ error: 'Username and password required' }, { status: 400 })
    }
    
    const valid = await validateCredentials(username, password)
    
    if (!valid) {
      return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 })
    }
    
    await createSession()
    
    return NextResponse.json({ success: true, message: 'Logged in successfully' })
  } catch (error) {
    console.error('Login error:', error)
    return NextResponse.json({ error: 'Login failed' }, { status: 500 })
  }
}
