import { cookies } from 'next/headers'

// Read credentials from environment variables
const ADMIN_USER = process.env.ADMIN_USERNAME || 'admin'
const ADMIN_PASS = process.env.ADMIN_PASSWORD || 'password'
const SESSION_COOKIE = 'admin_session'
const SESSION_VALUE = process.env.ADMIN_SESSION_SECRET || 'authenticated_session'

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
