import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

const SESSION_COOKIE = 'admin_session'

export function proxy(request: NextRequest) {
  const { pathname, method } = { pathname: request.nextUrl.pathname, method: request.method }
  
  // Protected API routes that require authentication
  const protectedPatterns = [
    { pattern: '/api/scholarships/bulk', methods: ['POST', 'DELETE'] },
    { pattern: '/api/scholarships', methods: ['POST'] },
  ]
  
  // Check if this is a protected route
  const isProtected = protectedPatterns.some(({ pattern, methods }) => 
    pathname.startsWith(pattern) && methods.includes(method)
  )
  
  if (isProtected) {
    const session = request.cookies.get(SESSION_COOKIE)
    const expectedValue = process.env.ADMIN_SESSION_SECRET || 'authenticated_session'
    
    if (session?.value !== expectedValue) {
      return NextResponse.json(
        { error: 'No autorizado. Inicia sesión como administrador.' },
        { status: 401 }
      )
    }
  }
  
  // Protect admin pages (except login)
  if (pathname.startsWith('/admin') && !pathname.startsWith('/admin/login')) {
    const session = request.cookies.get(SESSION_COOKIE)
    const expectedValue = process.env.ADMIN_SESSION_SECRET || 'authenticated_session'
    
    if (session?.value !== expectedValue) {
      const loginUrl = new URL('/admin/login', request.url)
      loginUrl.searchParams.set('from', pathname)
      return NextResponse.redirect(loginUrl)
    }
  }
  
  return NextResponse.next()
}

export const config = {
  matcher: [
    '/admin/:path*',
    '/api/scholarships/:path*',
  ],
}
