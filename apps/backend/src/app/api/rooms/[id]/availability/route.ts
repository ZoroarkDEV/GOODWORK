import { NextResponse } from 'next/server';
import { query } from '@/lib/db';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const { searchParams } = new URL(request.url);
    const startDateParam = searchParams.get('startDate');
    const endDateParam = searchParams.get('endDate');

    if (!startDateParam || !endDateParam) {
      return NextResponse.json(
        { error: 'startDate e endDate são obrigatórios nos parâmetros da query.' },
        { status: 400 }
      );
    }

    const startDate = new Date(startDateParam);
    const endDate = new Date(endDateParam);

    if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
      return NextResponse.json(
        { error: 'Formato de data inválido. Use YYYY-MM-DD ou similar.' },
        { status: 400 }
      );
    }

    if (endDate <= startDate) {
      return NextResponse.json(
        { error: 'O endDate deve ser posterior ao startDate.' },
        { status: 400 }
      );
    }

    // Fetch existing bookings for the room within the specified date range
    // We need to find bookings that overlap with the requested period.
    // Overlap occurs if:
    // 1. An existing booking starts before the requested end date AND ends after the requested start date.
    const availabilityQuery = `
      SELECT id, start_time, end_time, status
      FROM bookings
      WHERE room_id = $1
      AND status IN ('pending', 'confirmed')
      AND start_time < $3 -- Existing booking starts before requested end
      AND end_time > $2; -- Existing booking ends after requested start
    `;

    const result = await query(availabilityQuery, [id, startDate.toISOString(), endDate.toISOString()]);

    // If there are any overlapping bookings, the room is not fully available.
    // For a more granular availability (e.g., specific time slots), more complex logic would be needed.
    // This query checks if the *entire* period is free from conflicting bookings.
    const isAvailable = result.rows.length === 0;

    return NextResponse.json({ roomId: id, startDate: startDate.toISOString(), endDate: endDate.toISOString(), isAvailable }, { status: 200 });

  } catch (error: any) {
    console.error('Error checking room availability:', error);
    return NextResponse.json(
      { error: 'Erro interno ao verificar disponibilidade da sala.' },
      { status: 500 }
    );
  }
}
