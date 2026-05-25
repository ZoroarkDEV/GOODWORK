import { NextResponse } from 'next/server';
import { query } from '@/lib/db';

interface Booking {
  id: string;
  room_id: string;
  user_id: string;
  start_time: string;
  end_time: string;
  total_price: number;
  status: 'pending' | 'confirmed' | 'canceled' | 'finished';
  notes: string | null;
}

export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { room_id, user_id, start_time, end_time, status, notes } = body;

    if (!room_id || !user_id || !start_time || !end_time || !status) {
      return NextResponse.json(
        { error: 'Dados incompletos. Campos obrigatórios: room_id, user_id, start_time, end_time, status.' },
        { status: 400 }
      );
    }

    const startTime = new Date(start_time);
    const endTime = new Date(end_time);

    const minDurationMinutes = 30;
    const maxDurationHours = 8;

    if (endTime <= startTime) {
      return NextResponse.json({ error: 'O horário de fim deve ser posterior ao horário de início.' }, { status: 400 });
    }
    if (endTime.getTime() - startTime.getTime() < minDurationMinutes * 60 * 1000) {
      return NextResponse.json({ error: `A duração mínima da reserva é de ${minDurationMinutes} minutos.` }, { status: 400 });
    }
    if ((endTime.getTime() - startTime.getTime()) / (1000 * 60 * 60) > maxDurationHours) {
      return NextResponse.json({ error: `A duração máxima contínua permitida de reserva é de ${maxDurationHours} horas.` }, { status: 400 });
    }

    const updateQuery = `
      UPDATE bookings
      SET room_id = $1, user_id = $2, start_time = $3, end_time = $4, status = $5, notes = $6
      WHERE id = $7
      RETURNING id, room_id, user_id, start_time, end_time, total_price, status;
    `;

    const result = await query(updateQuery, [
      room_id,
      user_id,
      startTime.toISOString(),
      endTime.toISOString(),
      status,
      notes || null,
      id,
    ]);

    if (result.rows.length === 0) {
      return NextResponse.json({ error: 'Reserva não encontrada ou não pôde ser atualizada.' }, { status: 404 });
    }

    const updatedBooking = result.rows[0];
    return NextResponse.json(updatedBooking, { status: 200 });

  } catch (error: any) {
    console.error('Error updating booking:', error);
    return NextResponse.json(
      { error: 'Erro interno ao atualizar reserva.' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;

    const checkResult = await query('SELECT id, status FROM bookings WHERE id = $1;', [id]);
    if (checkResult.rows.length === 0) {
      return NextResponse.json(
        { error: 'Reserva não encontrada.' },
        { status: 404 }
      );
    }

    const existingBooking = checkResult.rows[0];

    const cancellationWindowHours = 2;
    const bookingStartTime = new Date(existingBooking.start_time);
    const now = new Date();

    if (existingBooking.status === 'canceled') {
      return NextResponse.json({ error: 'Reserva já está cancelada.' }, { status: 400 });
    }

    if (existingBooking.status === 'finished') {
      return NextResponse.json({ error: 'Não é possível cancelar uma reserva finalizada.' }, { status: 400 });
    }

    if (bookingStartTime.getTime() - now.getTime() < cancellationWindowHours * 60 * 60 * 1000) {
      return NextResponse.json(
        { error: `Cancelamento permitido apenas até ${cancellationWindowHours} horas antes do início da reserva.` },
        { status: 400 }
      );
    }

    const deleteQuery = 'UPDATE bookings SET status = $1 WHERE id = $2 RETURNING id, status;';
    const result = await query(deleteQuery, ['canceled', id]);
    const canceledBooking = result.rows[0];

    console.log(`Notification: Booking ${id} canceled.`);

    return NextResponse.json(
      { message: 'Reserva cancelada com sucesso.', booking: canceledBooking },
      { status: 200 }
    );

  } catch (error: any) {
    console.error('Error canceling booking:', error);
    return NextResponse.json(
      { error: 'Erro interno ao cancelar reserva.' },
      { status: 500 }
    );
  }
}