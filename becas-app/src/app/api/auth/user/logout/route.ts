import { NextResponse } from 'next/server';
import { destroyUserSession } from '@/lib/auth/user';

export async function POST() {
  try {
    await destroyUserSession();
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Logout error:', error);
    return NextResponse.json(
      { error: 'Error al cerrar sesión' },
      { status: 500 }
    );
  }
}
