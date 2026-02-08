import { NextResponse } from 'next/server';
import { validateUserCredentials, createUserSession } from '@/lib/auth/user';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { emailOrUsername, password } = body;

    if (!emailOrUsername || !password) {
      return NextResponse.json(
        { error: 'Email/usuario y contraseña son requeridos' },
        { status: 400 }
      );
    }

    const user = await validateUserCredentials(emailOrUsername, password);

    if (!user) {
      return NextResponse.json(
        { error: 'Credenciales inválidas' },
        { status: 401 }
      );
    }

    await createUserSession(user.id);

    return NextResponse.json({ user });
  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}
