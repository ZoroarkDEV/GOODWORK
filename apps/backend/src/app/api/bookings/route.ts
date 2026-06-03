import { NextResponse } from 'next/server';
import { query } from '@/lib/db'; // Using the existing DB query function
import { sendBookingConfirmationEmail } from '@/lib/email';

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

    // Calculate total price based on database room hourly_rate
    const roomResult = await query(
      'SELECT hourly_rate, name FROM rooms WHERE id = $1 AND active = TRUE',
      [room_id]
    );
    if (roomResult.rows.length === 0) {
      return NextResponse.json({ error: 'Sala não encontrada ou inativa.' }, { status: 404 });
    }
    const hourlyRate = parseFloat(roomResult.rows[0].hourly_rate);
    const roomName = roomResult.rows[0].name;
    const estimatedDurationHours = (endTime.getTime() - startTime.getTime()) / (1000 * 60 * 60);
    const totalPrice = estimatedDurationHours * hourlyRate;

    // Garantir que o user_id existe na tabela local 'users' para não violar a constraint de chave estrangeira
    const userCheck = await query('SELECT id FROM users WHERE id = $1', [user_id]);
    if (userCheck.rows.length === 0) {
      await query(
        `INSERT INTO users (id, name, email, role, active, email_verified)
         VALUES ($1, $2, $3, 'user', TRUE, TRUE)
         ON CONFLICT (id) DO NOTHING`,
        [user_id, 'Usuário GOODWORK', `user_${user_id}@goodwork.com`]
      );
    }

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

    // Fire-and-forget — não bloqueia a resposta
    query('SELECT name, email FROM users WHERE id = $1', [user_id])
      .then(async (userResult) => {
        if (userResult.rows.length > 0) {
          const { name, email } = userResult.rows[0];
          await sendBookingConfirmationEmail({
            toEmail: email,
            toName: name,
            roomName: roomName, // variável da Sprint 3
            startTime: startTime.toISOString(),
            endTime: endTime.toISOString(),
            totalPrice: totalPrice,
            bookingId: newBooking.id,
          });
        }
      })
      .catch((err) => console.error('[BOOKING] Falha no email:', err));

    const fmt = (iso: string) => iso.replace(/[-:]/g, '').replace('.000Z', 'Z');
    const calendarLink = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(`Reserva GOODWORK — ${roomName}`)}&dates=${fmt(startTime.toISOString())}/${fmt(endTime.toISOString())}&location=${encodeURIComponent('GOODWORK Coworking')}&ctz=America%2FSao_Paulo`;

    return NextResponse.json({ ...newBooking, calendar_link: calendarLink }, { status: 201 });

  } catch (error: any) {
    console.error('Error creating booking:', error);
    return NextResponse.json(
      { error: 'Erro interno ao criar reserva.' },
      { status: 500 }
    );
  }
}

