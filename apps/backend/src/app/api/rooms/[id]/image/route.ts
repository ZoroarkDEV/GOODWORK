import { NextResponse } from 'next/server';
import { query } from '@/lib/db';

export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;

    // Check if room exists
    const checkResult = await query('SELECT id FROM rooms WHERE id = $1;', [id]);
    if (checkResult.rows.length === 0) {
      return NextResponse.json({ error: 'Sala não encontrada.' }, { status: 404 });
    }

    // Get the file from the request
    const formData = await request.formData();
    const file = formData.get('file') as File | null;

    if (!file) {
      return NextResponse.json({ error: 'Nenhum arquivo enviado.' }, { status: 400 });
    }

    // NOTE: Supabase Storage upload requires a configured Supabase project.
    // For now, we simulate the image URL and store it in the database.
    // In production, replace this with actual Supabase Storage upload logic.
    const imageUrl = `/images/rooms/${id}/${file.name}`;

    // Update the room's image_url in the database
    const updateResult = await query(
      'UPDATE rooms SET image_url = $1 WHERE id = $2 RETURNING id, name, image_url;',
      [imageUrl, id]
    );

    const updatedRoom = updateResult.rows[0];

    return NextResponse.json(updatedRoom, { status: 200 });

  } catch (error: any) {
    console.error('Error handling image upload:', error);
    return NextResponse.json(
      { error: 'Erro interno no servidor ao processar upload de imagem.' },
      { status: 500 }
    );
  }
}