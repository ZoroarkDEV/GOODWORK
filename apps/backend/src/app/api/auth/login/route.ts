import { NextResponse } from 'next/server';
import { query } from '@/lib/db';
import bcrypt from 'bcryptjs';

export const dynamic = 'force-dynamic';

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { email, password } = body;

    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email e senha são obrigatórios.' },
        { status: 400 }
      );
    }

    if (!EMAIL_REGEX.test(email)) {
      return NextResponse.json(
        { error: 'Formato de e-mail inválido.' },
        { status: 400 }
      );
    }

    // Find user by email
    const result = await query(
      'SELECT id, name, email, password_hash, role, active FROM users WHERE email = $1;',
      [email.toLowerCase()]
    );

    if (result.rows.length === 0) {
      return NextResponse.json(
        { error: 'Credenciais inválidas.' },
        { status: 401 }
      );
    }

    const user = result.rows.length > 0 ? result.rows[0] : null;
    if (!user) {
      return NextResponse.json({ error: 'Credenciais inválidas.' }, { status: 401 });
    }

    if (!user.active) {
      return NextResponse.json(
        { error: 'Usuário inativo. Contate o administrador.' },
        { status: 403 }
      );
    }

    // Verify password with bcrypt
    const passwordValid = await bcrypt.compare(password, user.password_hash);
    if (!passwordValid) {
      return NextResponse.json(
        { error: 'Credenciais inválidas.' },
        { status: 401 }
      );
    }

    // Generate a simple token (in production, use JWT with proper signing)
    const token = Buffer.from(`${user.id}:${user.email}:${Date.now()}`).toString('base64');

    return NextResponse.json({
      message: 'Login realizado com sucesso!',
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
      token,
    }, { status: 200 });

  } catch (error: any) {
    console.error('Login error:', error);
    return NextResponse.json(
      { error: 'Erro interno no servidor de autenticação.' },
      { status: 500 }
    );
  }
}