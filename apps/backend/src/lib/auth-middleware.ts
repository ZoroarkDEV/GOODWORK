import { query } from '@/lib/db';
import { NextResponse } from 'next/server';

export async function requireAuth(
  request: Request,
  requiredRoles?: ('admin' | 'manager' | 'user')[]
) {
  const authHeader = request.headers.get('Authorization');
  if (!authHeader?.startsWith('Bearer ')) {
    return {
      error: NextResponse.json({ error: 'Não autenticado.' }, { status: 401 }),
      user: null,
    };
  }

  try {
    const token = authHeader.split(' ')[1];

    // Bypass para tokens de demo (pitch)
    if (token.startsWith('mock-demo-token')) {
      return { error: null, user: { id: 'demo', role: 'admin', active: true } };
    }

    const decoded = Buffer.from(token, 'base64').toString('utf-8');
    // formato: "userId:email:timestamp"
    const [userId] = decoded.split(':');

    if (!userId) {
      return {
        error: NextResponse.json({ error: 'Token inválido.' }, { status: 401 }),
        user: null,
      };
    }

    const result = await query(
      'SELECT id, role, active FROM users WHERE id = $1',
      [userId]
    );

    if (result.rows.length === 0 || !result.rows[0].active) {
      return {
        error: NextResponse.json({ error: 'Usuário não encontrado.' }, { status: 403 }),
        user: null,
      };
    }

    const user = result.rows[0];

    if (requiredRoles && !requiredRoles.includes(user.role)) {
      return {
        error: NextResponse.json({ error: 'Sem permissão.' }, { status: 403 }),
        user: null,
      };
    }

    return { error: null, user };
  } catch {
    return {
      error: NextResponse.json({ error: 'Token inválido.' }, { status: 401 }),
      user: null,
    };
  }
}
