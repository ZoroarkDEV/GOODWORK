import { NextResponse } from 'next/server';
import { query } from '@/lib/db';

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const result = await query(
      `UPDATE bookings
       SET status = 'confirmed', updated_at = NOW()
       WHERE id = $1 AND status = 'pending'
       RETURNING id, status, room_id, user_id, start_time, end_time, total_price`,
      [id]
    );

    if (result.rows.length === 0) {
      return NextResponse.json(
        { error: 'Reserva não encontrada ou já confirmada.' },
        { status: 404 }
      );
    }

    return NextResponse.json(result.rows[0], { status: 200 });
  } catch (error) {
    console.error('Error confirming booking:', error);
    return NextResponse.json({ error: 'Erro ao confirmar reserva.' }, { status: 500 });
  }
}
