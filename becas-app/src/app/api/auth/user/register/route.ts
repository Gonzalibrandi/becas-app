import { NextResponse } from 'next/server';
import { registerUser, createUserSession } from '@/lib/auth/user';
import prisma from '@/lib/db/prisma';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { firstName, lastName, username, email, password } = body;

    // Basic validation
    if (!firstName || !lastName || !username || !email || !password) {
      return NextResponse.json(
        { error: 'Todos los campos son requeridos' },
        { status: 400 }
      );
    }

    if (password.length < 6) {
      return NextResponse.json(
        { error: 'La contraseña debe tener al menos 6 caracteres' },
        { status: 400 }
      );
    }

    // Check if email or username already exists
    const existing = await prisma.user.findFirst({
      where: {
        OR: [
          { email: email.toLowerCase() },
          { username: username.toLowerCase() },
        ],
      },
    });

    if (existing) {
      const field = existing.email === email.toLowerCase() ? 'email' : 'username';
      return NextResponse.json(
        { error: `El ${field} ya está registrado` },
        { status: 409 }
      );
    }

    // Create user
    const user = await registerUser({
      firstName,
      lastName,
      username,
      email,
      password,
    });

    // Auto-login after registration
    await createUserSession(user.id);

    return NextResponse.json({ user }, { status: 201 });
  } catch (error) {
    console.error('Registration error:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}
