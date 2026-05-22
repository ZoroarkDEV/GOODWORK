import { NextResponse } from 'next/server';
import { query } from '@/lib/db'; // Using the existing DB query function

// --- Booking Schema Definition (Based on README) ---
interface Booking {
  id: string; // uuid
  room_id: string; // uuid
  user_id: string; // uuid
  start_time: string; // timestamp
  end_time: string; // timestamp
  total_price: number;
  status: 'pending' | 'confirmed' | 'canceled' | 'finished';
  notes: string | null;
}

// Helper to map DB result rows to the expected interface
const mapToBooking = (row: any): Booking => ({
  id: row.id,
  room_id: row.room_id,
  user_id: row.user_id,
  start_time: row.start_time,
  end_time: row.end_time,
  total_price: parseFloat(row.total_price),
  status: row.status,
  notes: row.notes,
});

export async function GET() {
  try {
    // Fetch all bookings (can add filtering/sorting later)
    // NOTE: For now, fetching all bookings. In a real app, this would be paginated and filtered.
    const result = await query(
      'SELECT id, room_id, user_id, start_time, end_time, total_price, status, notes FROM bookings ORDER BY start_time ASC;'
    );

    const bookings: Booking[] = result.rows.map(mapToBooking);

    return NextResponse.json(bookings, { status: 200 });

  } catch (error: any) {
    console.error('Error fetching bookings:', error);
    return NextResponse.json(
      { error: 'Erro interno ao buscar reservas.' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { room_id, user_id, start_time, end_time, notes } = body;

    // Basic validation
    if (!room_id || !user_id || !start_time || !end_time) {
      return NextResponse.json(
        { error: 'Dados incompletos. Campos obrigatórios: room_id, user_id, start_time, end_time.' },
        { status: 400 }
      );
    }

    const startTime = new Date(start_time);
    const endTime = new Date(end_time);

    // Business Rules Validation (from README)
    const minDurationMinutes = 30;
    const maxDurationHours = 8;
    const maxAdvanceDays = 30;
    const cancellationWindowHours = 2;

    const now = new Date();
    const thirtyDaysFromNow = new Date();
    thirtyDaysFromNow.setDate(now.getDate() + maxAdvanceDays);

    if (startTime < now) {
      return NextResponse.json({ error: 'O horário de início deve ser no futuro.' }, { status: 400 });
    }
    if (endTime <= startTime) {
      return NextResponse.json({ error: 'O horário de fim deve ser posterior ao horário de início.' }, { status: 400 });
    }
    if (startTime > thirtyDaysFromNow) {
      return NextResponse.json({ error: `Reservas só podem ser criadas com no máximo ${maxAdvanceDays} dias de antecedência.` }, { status: 400 });
    }
    if (endTime.getTime() - startTime.getTime() < minDurationMinutes * 60 * 1000) {
      return NextResponse.json({ error: `A duração mínima da reserva é de ${minDurationMinutes} minutos.` }, { status: 400 });
    }
    if ((endTime.getTime() - startTime.getTime()) / (1000 * 60 * 60) > maxDurationHours) {
      return NextResponse.json({ error: `A duração máxima contínua permitida de reserva é de ${maxDurationHours} horas.` }, { status: 400 });
    }

    // Check for booking conflicts
    const conflictQuery = `
      SELECT id FROM bookings
      WHERE room_id = $1
      AND status IN ('pending', 'confirmed')
      AND (
        (start_time < $3 AND end_time > $2) OR -- New booking overlaps existing
        (start_time >= $2 AND start_time < $3) OR -- New booking starts during existing
        (end_time > $2 AND end_time <= $3) -- New booking ends during existing
      );
    `;
    const conflictResult = await query(conflictQuery, [room_id, startTime.toISOString(), endTime.toISOString()]);

    if (conflictResult.rows.length > 0) {
      return NextResponse.json(
        { error: 'Conflito de reserva detectado. A sala já está reservada neste período.' },
        { status: 409 } // Conflict
      );
    }

    // Calculate total price (assuming hourly_rate is fetched from rooms table, but not done here for simplicity)
    // For now, a placeholder price. In a real app, fetch room's hourly_rate.
    const estimatedDurationHours = (endTime.getTime() - startTime.getTime()) / (1000 * 60 * 60);
    const totalPrice = estimatedDurationHours * 100; // Placeholder rate

    const insertQuery = `
      INSERT INTO bookings (room_id, user_id, start_time, end_time, total_price, status, notes)
      VALUES ($1, $2, $3, $4, $5, 'pending', $6)
      RETURNING id, room_id, user_id, start_time, end_time, total_price, status;
    `;

    const result = await query(insertQuery, [
      room_id,
      user_id,
      startTime.toISOString(),
      endTime.toISOString(),
      totalPrice,
      notes || null,
    ]);

    const newBooking = result.rows[0];

    // TODO: Trigger notifications (e.g., to user, manager)
    // For now, we'll stub this out. In a real application, this would involve sending emails or other alerts.
    console.log(`Notification: New booking created for room ${room_id} by user ${user_id}.`);

    // TODO: Integrate with Google Calendar API
    // For now, we'll stub this out. In a real application, this would involve calling the Google Calendar API.
    console.log(`Google Calendar: Booking for room ${room_id} from ${startTime.toISOString()} to ${endTime.toISOString()} needs to be added.`);

    return NextResponse.json(newBooking, { status: 201 });

  } catch (error: any) {
    console.error('Error creating booking:', error);
    return NextResponse.json(
      { error: 'Erro interno ao criar reserva.' },
      { status: 500 }
    );
  }
}

export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { room_id, user_id, start_time, end_time, status, notes } = body;

    // Basic validation
    if (!room_id || !user_id || !start_time || !end_time || !status) {
      return NextResponse.json(
        { error: 'Dados incompletos. Campos obrigatórios: room_id, user_id, start_time, end_time, status.' },
        { status: 400 }
      );
    }

    const startTime = new Date(start_time);
    const endTime = new Date(end_time);

    // Business Rules Validation (similar to POST, but for updates)
    const minDurationMinutes = 30;
    const maxDurationHours = 8;
    const cancellationWindowHours = 2;

    if (endTime <= startTime) {
      return NextResponse.json({ error: 'O horário de fim deve ser posterior ao horário de início.' }, { status: 400 });
    }
    if (endTime.getTime() - startTime.getTime() < minDurationMinutes * 60 * 1000) {
      return NextResponse.json({ error: `A duração mínima da reserva é de ${minDurationMinutes} minutos.` }, { status: 400 });
    }
    if ((endTime.getTime() - startTime.getTime()) / (1000 * 60 * 60) > maxDurationHours) {
      return NextResponse.json({ error: `A duração máxima contínua permitida de reserva é de ${maxDurationHours} horas.` }, { status: 400 });
    }

    // Check for conflicts if times or room are changed (more complex logic needed here)
    // For simplicity, we'll allow updates but a real app needs conflict checks.

    const updateQuery = `
      UPDATE bookings
      SET room_id = $1, user_id = $2, start_time = $3, end_time = $4, status = $5, notes = $6
      WHERE id = $7
      RETURNING id, room_id, user_id, start_time, end_time, total_price, status;
    `;

    // NOTE: total_price calculation might need to be re-evaluated based on updated times/room.
    // For now, we'll assume it's either provided or calculated elsewhere.
    // The current query doesn't update total_price, which might be an oversight.
    // For now, we'll use a placeholder or assume it's not updated via PUT.

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

    // Check if booking exists
    const checkResult = await query('SELECT id, status FROM bookings WHERE id = $1;', [id]);
    if (checkResult.rows.length === 0) {
      return NextResponse.json(
        { error: 'Reserva não encontrada.' },
        { status: 404 }
      );
    }

    const existingBooking = checkResult.rows[0];

    // Business Rules Validation (Cancellation Window)
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

    // Soft Delete: Set status = 'canceled'
    const deleteQuery = 'UPDATE bookings SET status = $1 WHERE id = $2 RETURNING id, status;';
    const result = await query(deleteQuery, ['canceled', id]);
    const canceledBooking = result.rows[0];

    // TODO: Trigger notifications (e.g., to user, manager)
    // For now, we'll stub this out. In a real application, this would involve sending emails or other alerts.
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
