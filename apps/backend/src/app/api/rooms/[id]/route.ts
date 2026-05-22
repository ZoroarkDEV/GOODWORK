import { NextResponse } from 'next/server';
import { query } from '@/lib/db';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const roomResult = await query('SELECT * FROM rooms WHERE id = $1;', [id]);

    if (roomResult.rows.length === 0) {
      return NextResponse.json(
        { error: 'Sala não encontrada.' },
        { status: 404 }
      );
    }

    return NextResponse.json(roomResult.rows[0], { status: 200 });

  } catch (error: any) {
    console.error('Error fetching room:', error);
    return NextResponse.json(
      { error: 'Erro interno ao buscar sala.' },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { name, description, capacity, hourly_rate, image_url, amenities, active } = body;

    // Check if room exists
    const checkResult = await query('SELECT id FROM rooms WHERE id = $1;', [id]);
    if (checkResult.rows.length === 0) {
      return NextResponse.json(
        { error: 'Sala não encontrada.' },
        { status: 404 }
      );
    }

    // Construct dynamic update query based on provided fields
    const updateFields: string[] = [];
    const queryParams: any[] = [];
    let paramIndex = 1;

    if (name !== undefined) {
      updateFields.push(`name = $${paramIndex++}`);
      queryParams.push(name);
    }
    if (description !== undefined) {
      updateFields.push(`description = $${paramIndex++}`);
      queryParams.push(description);
    }
    if (capacity !== undefined) {
      updateFields.push(`capacity = $${paramIndex++}`);
      queryParams.push(capacity);
    }
    if (hourly_rate !== undefined) {
      updateFields.push(`hourly_rate = $${paramIndex++}`);
      queryParams.push(hourly_rate);
    }
    if (image_url !== undefined) {
      updateFields.push(`image_url = $${paramIndex++}`);
      queryParams.push(image_url);
    }
    if (amenities !== undefined) {
      updateFields.push(`amenities = $${paramIndex++}`);
      queryParams.push(JSON.stringify(amenities));
    }
    if (active !== undefined) {
      updateFields.push(`active = $${paramIndex++}`);
      queryParams.push(active);
    }

    if (updateFields.length === 0) {
      return NextResponse.json(
        { error: 'Nenhum campo fornecido para atualização.' },
        { status: 400 }
      );
    }

    queryParams.push(id);
    const updateQuery = `
      UPDATE rooms 
      SET ${updateFields.join(', ')} 
      WHERE id = $${paramIndex}
      RETURNING id, name, capacity, hourly_rate, active;
    `;

    const result = await query(updateQuery, queryParams);
    const updatedRoom = result.rows[0];

    return NextResponse.json(updatedRoom, { status: 200 });

  } catch (error: any) {
    console.error('Error updating room:', error);
    return NextResponse.json(
      { error: 'Erro interno ao atualizar sala.' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    // Check if room exists
    const checkResult = await query('SELECT id FROM rooms WHERE id = $1;', [id]);
    if (checkResult.rows.length === 0) {
      return NextResponse.json(
        { error: 'Sala não encontrada.' },
        { status: 404 }
      );
    }

    // Soft Delete: Set active = FALSE
    const deleteQuery = 'UPDATE rooms SET active = FALSE WHERE id = $1 RETURNING id, name, active;';
    const result = await query(deleteQuery, [id]);
    const deletedRoom = result.rows[0];

    return NextResponse.json(
      { message: 'Sala inativada com sucesso.', room: deletedRoom },
      { status: 200 }
    );

  } catch (error: any) {
    console.error('Error deleting room:', error);
    return NextResponse.json(
      { error: 'Erro interno ao inativar sala.' },
      { status: 500 }
    );
  }
}