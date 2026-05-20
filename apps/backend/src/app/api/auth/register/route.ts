import { NextResponse } from 'next/server';
import { query } from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name, email, password, phone } = body;

    if (!name || !email || !password) {
      return NextResponse.json(
        { error: 'Nome, email e senha são obrigatórios.' },
        { status: 400 }
      );
    }

    // Check if user already exists
    const checkUser = await query('SELECT id FROM users WHERE email = $1;', [email.toLowerCase()]);
    if (checkUser.rows.length > 0) {
      return NextResponse.json(
        { error: 'Este e-mail já está sendo utilizado.' },
        { status: 409 }
      );
    }

    // Insert new user into database
    // Default role: 'user'
    const insertResult = await query(
      `INSERT INTO users (name, email, password_hash, role, phone, active) 
       VALUES ($1, $2, $3, 'user', $4, TRUE) 
       RETURNING id, name, email, role, phone, active;`,
      [name, email.toLowerCase(), '$2b$12$6K7r47X/v1iK/rF5D5/B3OtDskhA6P4Jj2k/L4hF2v5O6P2B2B.qK', phone || null] // Mock hash for 'admin123'
    );

    const newUser = insertResult.rows[0];

    return NextResponse.json({
      message: 'Usuário registrado com sucesso!',
      user: newUser
    }, { status: 201 });

  } catch (error: any) {
    console.error('Registration error:', error);
    return NextResponse.json(
      { error: 'Erro interno ao registrar usuário.' },
      { status: 500 }
    );
  }
}
