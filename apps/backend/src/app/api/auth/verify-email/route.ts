import { NextResponse } from 'next/server';
import { query } from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const token = searchParams.get('token');

    if (!token) {
      return NextResponse.json(
        { error: 'Token de verificação não fornecido.' },
        { status: 400 }
      );
    }

    // Find the verification token
    const tokenResult = await query(
      `SELECT id, user_id, token, expires_at, used 
       FROM email_verification_tokens 
       WHERE token = $1;`,
      [token]
    );

    if (tokenResult.rows.length === 0) {
      return NextResponse.json(
        { error: 'Token de verificação inválido.' },
        { status: 400 }
      );
    }

    const verificationToken = tokenResult.rows[0];

    // Check if token is already used
    if (verificationToken.used) {
      return NextResponse.json(
        { error: 'Este token já foi utilizado.' },
        { status: 400 }
      );
    }

    // Check if token is expired
    if (new Date(verificationToken.expires_at) < new Date()) {
      return NextResponse.json(
        { error: 'Token expirado. Solicite um novo e-mail de verificação.' },
        { status: 400 }
      );
    }

    // Mark token as used
    await query(
      'UPDATE email_verification_tokens SET used = TRUE WHERE id = $1;',
      [verificationToken.id]
    );

    // Verify the user's email
    await query(
      'UPDATE users SET email_verified = TRUE WHERE id = $1;',
      [verificationToken.user_id]
    );

    // Get user data
    const userResult = await query(
      'SELECT id, name, email, role FROM users WHERE id = $1;',
      [verificationToken.user_id]
    );

    const user = userResult.rows[0];

    return NextResponse.json({
      message: 'E-mail verificado com sucesso! Você já pode fazer login.',
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    }, { status: 200 });

  } catch (error: any) {
    console.error('Email verification error:', error);
    return NextResponse.json(
      { error: 'Erro interno ao verificar e-mail.' },
      { status: 500 }
    );
  }
}

// Resend verification email
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { email } = body;

    if (!email) {
      return NextResponse.json(
        { error: 'E-mail é obrigatório.' },
        { status: 400 }
      );
    }

    // Find user
    const userResult = await query(
      'SELECT id, name, email, email_verified FROM users WHERE email = $1;',
      [email.toLowerCase()]
    );

    if (userResult.rows.length === 0) {
      return NextResponse.json(
        { error: 'Usuário não encontrado.' },
        { status: 404 }
      );
    }

    const user = userResult.rows[0];

    if (user.email_verified) {
      return NextResponse.json(
        { error: 'Este e-mail já foi verificado.' },
        { status: 400 }
      );
    }

    // Invalidate old tokens
    await query(
      'UPDATE email_verification_tokens SET used = TRUE WHERE user_id = $1 AND used = FALSE;',
      [user.id]
    );

    // Generate new token
    const crypto = await import('crypto');
    const verificationToken = crypto.randomBytes(32).toString('hex');
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

    await query(
      `INSERT INTO email_verification_tokens (user_id, token, expires_at) 
       VALUES ($1, $2, $3);`,
      [user.id, verificationToken, expiresAt]
    );

    const verificationUrl = `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:5173'}/verify-email?token=${verificationToken}`;

    return NextResponse.json({
      message: 'E-mail de verificação reenviado com sucesso!',
      // Remove in production
      verificationUrl,
    }, { status: 200 });

  } catch (error: any) {
    console.error('Resend verification error:', error);
    return NextResponse.json(
      { error: 'Erro interno ao reenviar e-mail de verificação.' },
      { status: 500 }
    );
  }
}