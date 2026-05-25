import { NextResponse } from 'next/server';
import { query } from '@/lib/db';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';

export const dynamic = 'force-dynamic';

const EMAIL_REGEX = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

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

    // Strict email validation
    if (!EMAIL_REGEX.test(email)) {
      return NextResponse.json(
        { error: 'Formato de e-mail inválido. Use um e-mail válido (ex: usuario@dominio.com).' },
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

    // Insert new user (email_verified = FALSE by default)
    const insertResult = await query(
      `INSERT INTO users (name, email, password_hash, role, phone, active, email_verified) 
       VALUES ($1, $2, $3, $4, $5, TRUE, FALSE) 
       RETURNING id, name, email, role, phone, active, email_verified, created_at;`,
      [name, email.toLowerCase(), passwordHash, userRole, phone || null]
    );

    const newUser = insertResult.rows[0];

    // Generate verification token
    const verificationToken = crypto.randomBytes(32).toString('hex');
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

    await query(
      `INSERT INTO email_verification_tokens (user_id, token, expires_at) 
       VALUES ($1, $2, $3);`,
      [newUser.id, verificationToken, expiresAt]
    );

    // In production, send email here with the verification link
    // For demo purposes, we return the token in the response
    const verificationUrl = `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:5173'}/verify-email?token=${verificationToken}`;

    return NextResponse.json({
      message: 'Usuário registrado com sucesso! Verifique seu e-mail para ativar a conta.',
      user: {
        id: newUser.id,
        name: newUser.name,
        email: newUser.email,
        role: newUser.role,
        active: newUser.active,
        email_verified: newUser.email_verified,
        created_at: newUser.created_at,
      },
      // Remove in production - only for demo
      verificationUrl,
    }, { status: 201 });

  } catch (error: any) {
    console.error('Registration error:', error);
    return NextResponse.json(
      { error: 'Erro interno ao registrar usuário.' },
      { status: 500 }
    );
  }
}