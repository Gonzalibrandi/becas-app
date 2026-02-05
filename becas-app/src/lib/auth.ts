import { cookies } from 'next/headers'
import bcrypt from 'bcryptjs'
import prisma from '@/lib/prisma'

const SESSION_COOKIE = 'admin_session'
const SESSION_VALUE = process.env.ADMIN_SESSION_SECRET || 'authenticated_session'

// Validate credentials against database
export async function validateCredentials(username: string, password: string): Promise<boolean> {
  try {
    const admin = await prisma.adminUser.findUnique({
      where: { username, isActive: true },
    })

    if (!admin) {
      return false
    }

    const isValid = await bcrypt.compare(password, admin.passwordHash)
    
    if (isValid) {
      // Update last login timestamp
      await prisma.adminUser.update({
        where: { id: admin.id },
        data: { lastLogin: new Date() },
      })
    }

    return isValid
  } catch (error) {
    console.error('Error validating credentials:', error)
    return false
  }
}

export async function createSession(): Promise<void> {
  const cookieStore = await cookies()
  cookieStore.set(SESSION_COOKIE, SESSION_VALUE, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 60 * 60 * 24 * 7, // 7 days
    path: '/',
  })
}

export async function destroySession(): Promise<void> {
  const cookieStore = await cookies()
  cookieStore.delete(SESSION_COOKIE)
}

export async function isAuthenticated(): Promise<boolean> {
  const cookieStore = await cookies()
  const session = cookieStore.get(SESSION_COOKIE)
  return session?.value === SESSION_VALUE
}

// Helper for API routes - returns error response if not authenticated
export async function requireAuth(): Promise<{ authenticated: boolean; errorResponse?: Response }> {
  const authenticated = await isAuthenticated()
  
  if (!authenticated) {
    return {
      authenticated: false,
      errorResponse: new Response(
        JSON.stringify({ error: 'No autorizado. Inicia sesión como administrador.' }),
        { status: 401, headers: { 'Content-Type': 'application/json' } }
      )
    }
  }
  
  return { authenticated: true }
}

// Utility to hash a password (for creating admins)
export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 12)
}

// Utility to create an admin user (for initial setup or CLI)
export async function createAdminUser(username: string, password: string, email?: string) {
  const passwordHash = await hashPassword(password)
  
  return prisma.adminUser.create({
    data: {
      username,
      passwordHash,
      email,
    },
  })
}
