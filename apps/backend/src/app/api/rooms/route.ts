import { NextResponse } from 'next/server';
import { query } from '@/lib/db';

// --- Room Schema Definition (Based on README) ---
interface Room {
  id: string; // uuid
  name: string;
  description: string;
  capacity: number;
  hourly_rate: number;
  image_url: string;
  amenities: string[]; // Stored as JSONB, but handled as array here for simplicity
  active: boolean;
}

// Helper to map DB result rows to the expected interface
const mapToRoom = (row: any): Room => ({
  id: row.id,
  name: row.name,
  description: row.description,
  capacity: row.capacity,
  hourly_rate: parseFloat(row.hourly_rate),
  image_url: row.image_url,
  amenities: row.amenities || [],
  active: row.active,
});

export async function GET() {
  try {
    // Fetch all active rooms
    const result = await query(
      'SELECT id, name, description, capacity, hourly_rate, image_url, amenities, active FROM rooms WHERE active = TRUE ORDER BY name ASC;'
    );

    const rooms: Room[] = result.rows.map(mapToRoom);

    return NextResponse.json(rooms, { status: 200 });

  } catch (error: any) {
    console.error('Error fetching rooms:', error);
    return NextResponse.json(
      { error: 'Erro interno ao buscar salas.' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name, description, capacity, hourly_rate, image_url, amenities } = body;

    // Basic validation based on README schema
    if (!name || typeof capacity !== 'number' || typeof hourly_rate !== 'number' || !image_url) {
      return NextResponse.json(
        { error: 'Dados incompletos ou inválidos. Campos obrigatórios: name, capacity (number), hourly_rate (number), image_url.' },
        { status: 400 }
      );
    }

    // NOTE: Role check (Manager/Admin) is omitted as auth context is not available here yet.
    // NOTE: ID generation (uuid) is handled by PostgreSQL default.

    const insertQuery = `
      INSERT INTO rooms (name, description, capacity, hourly_rate, image_url, amenities, active)
      VALUES ($1, $2, $3, $4, $5, $6, TRUE)
      RETURNING id, name, capacity, hourly_rate, active;
    `;
    
    const result = await query(insertQuery, [
      name,
      description || null,
      capacity,
      hourly_rate,
      image_url,
      JSON.stringify(amenities || []) // Ensure amenities array is stringified for JSONB
    ]);

    const newRoom = result.rows[0];

    return NextResponse.json(newRoom, { status: 201 });

  } catch (error: any) {
    console.error('Error creating room:', error);
    return NextResponse.json(
      { error: 'Erro interno ao criar sala.' },
      { status: 500 }
    );
  }
}
