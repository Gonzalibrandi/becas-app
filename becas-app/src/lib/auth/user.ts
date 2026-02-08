import { cookies } from 'next/headers';
import bcrypt from 'bcryptjs';
import prisma from '@/lib/db/prisma';

const USER_SESSION_COOKIE = 'user_session';

// ============ Password Utilities ============

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 12);
}

export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

// ============ Session Management ============

export async function createUserSession(userId: string): Promise<void> {
  const cookieStore = await cookies();
  
  // Simple session: store the user ID directly (in production, use JWT or signed cookies)
  cookieStore.set(USER_SESSION_COOKIE, userId, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 60 * 60 * 24 * 30, // 30 days
    path: '/',
  });
}

export async function destroyUserSession(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.delete(USER_SESSION_COOKIE);
}

export async function getUserIdFromSession(): Promise<string | null> {
  const cookieStore = await cookies();
  const session = cookieStore.get(USER_SESSION_COOKIE);
  return session?.value || null;
}

// ============ User Queries ============

export type SafeUser = {
  id: string;
  firstName: string;
  lastName: string;
  username: string;
  email: string;
  createdAt: Date;
};

export async function getCurrentUser(): Promise<SafeUser | null> {
  const userId = await getUserIdFromSession();
  
  if (!userId) return null;
  
  try {
    const user = await prisma.user.findUnique({
      where: { id: userId, isActive: true },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        username: true,
        email: true,
        createdAt: true,
      },
    });
    
    return user;
  } catch (error) {
    console.error('Error getting current user:', error);
    return null;
  }
}

// ============ Authentication ============

export async function validateUserCredentials(
  emailOrUsername: string,
  password: string
): Promise<SafeUser | null> {
  try {
    // Find user by email or username
    const user = await prisma.user.findFirst({
      where: {
        isActive: true,
        OR: [
          { email: emailOrUsername.toLowerCase() },
          { username: emailOrUsername.toLowerCase() },
        ],
      },
    });

    if (!user) return null;

    const isValid = await verifyPassword(password, user.passwordHash);
    if (!isValid) return null;

    // Update last login
    await prisma.user.update({
      where: { id: user.id },
      data: { lastLogin: new Date() },
    });

    // Return safe user data (no password hash)
    return {
      id: user.id,
      firstName: user.firstName,
      lastName: user.lastName,
      username: user.username,
      email: user.email,
      createdAt: user.createdAt,
    };
  } catch (error) {
    console.error('Error validating user credentials:', error);
    return null;
  }
}

// ============ Registration ============

type RegisterUserInput = {
  firstName: string;
  lastName: string;
  username: string;
  email: string;
  password: string;
};

export async function registerUser(input: RegisterUserInput): Promise<SafeUser> {
  const passwordHash = await hashPassword(input.password);
  
  const user = await prisma.user.create({
    data: {
      firstName: input.firstName,
      lastName: input.lastName,
      username: input.username.toLowerCase(),
      email: input.email.toLowerCase(),
      passwordHash,
    },
    select: {
      id: true,
      firstName: true,
      lastName: true,
      username: true,
      email: true,
      createdAt: true,
    },
  });

  return user;
}

// ============ Profile Update ============

type UpdateProfileInput = {
  firstName?: string;
  lastName?: string;
};

export async function updateUserProfile(
  userId: string,
  data: UpdateProfileInput
): Promise<SafeUser | null> {
  try {
    const user = await prisma.user.update({
      where: { id: userId },
      data: {
        ...(data.firstName && { firstName: data.firstName }),
        ...(data.lastName && { lastName: data.lastName }),
      },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        username: true,
        email: true,
        createdAt: true,
      },
    });
    
    return user;
  } catch (error) {
    console.error('Error updating user profile:', error);
    return null;
  }
}
