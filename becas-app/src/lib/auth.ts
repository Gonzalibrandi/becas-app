import { cookies } from 'next/headers'

// Simple auth helpers with hardcoded credentials
const ADMIN_USER = 'gonzalo'
const ADMIN_PASS = 'librandi'
const SESSION_COOKIE = 'admin_session'
const SESSION_VALUE = 'authenticated_gonzalo_2026'

export async function validateCredentials(username: string, password: string): Promise<boolean> {
  return username === ADMIN_USER && password === ADMIN_PASS
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
