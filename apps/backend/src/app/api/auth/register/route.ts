import { NextResponse } from 'next/server';
import { query } from '@/lib/db';
import bcrypt from 'bcryptjs';

export const dynamic = 'force-dynamic';

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name, email, password, role, phone } = body;

    // Validation
    if (!name || !email || !password) {
      return NextResponse.json(
        { error: 'Nome, email e senha são obrigatórios.' },
        { status: 400 }
      );
    }

    if (!EMAIL_REGEX.test(email)) {
      return NextResponse.json(
        { error: 'Formato de e-mail inválido.' },
        { status: 400 }
      );
    }

    if (password.length < 6) {
      return NextResponse.json(
        { error: 'A senha deve ter no mínimo 6 caracteres.' },
        { status: 400 }
      );
    }

    const validRoles = ['user', 'manager', 'admin'];
    const userRole = role && validRoles.includes(role) ? role : 'user';

    // Check if user already exists
    const checkUser = await query('SELECT id FROM users WHERE email = $1;', [email.toLowerCase()]);
    if (checkUser.rows.length > 0) {
      return NextResponse.json(
        { error: 'Este e-mail já está sendo utilizado.' },
        { status: 409 }
      );
    }

    // Hash password
    const passwordHash = await bcrypt.hash(password, 12);

    // Insert new user
    const insertResult = await query(
      `INSERT INTO users (name, email, password_hash, role, phone, active) 
       VALUES ($1, $2, $3, $4, $5, TRUE) 
       RETURNING id, name, email, role, phone, active, created_at;`,
      [name, email.toLowerCase(), passwordHash, userRole, phone || null]
    );

    const newUser = insertResult.rows[0];

    return NextResponse.json({
      message: 'Usuário registrado com sucesso!',
      user: {
        id: newUser.id,
        name: newUser.name,
        email: newUser.email,
        role: newUser.role,
        active: newUser.active,
        created_at: newUser.created_at,
      }
    }, { status: 201 });

  } catch (error: any) {
    console.error('Registration error:', error);
    return NextResponse.json(
      { error: 'Erro interno ao registrar usuário.' },
      { status: 500 }
    );
  }
}