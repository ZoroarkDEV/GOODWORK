import { NextResponse } from "next/server";
import { query } from "@/lib/db";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get("user_id");

    if (!userId) {
      return NextResponse.json({ error: "user_id é obrigatório" }, { status: 400 });
    }

    const result = await query(
      "SELECT * FROM notifications WHERE user_id = $1 ORDER BY created_at DESC LIMIT 50;",
      [userId]
    );

    return NextResponse.json(result.rows ?? []);
  } catch (error: any) {
    console.error("Notifications error:", error);
    return NextResponse.json({ error: "Erro ao buscar notificações" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { user_id, type, title, message, metadata } = body;

    if (!user_id || !title) {
      return NextResponse.json({ error: "Dados incompletos" }, { status: 400 });
    }

    const result = await query(
      `INSERT INTO notifications (user_id, type, title, message, metadata, read)
       VALUES ($1, $2, $3, $4, $5, FALSE)
       RETURNING *;`,
      [
        user_id,
        type || "general",
        title,
        message || "",
        JSON.stringify(metadata || {}),
      ]
    );

    return NextResponse.json(result.rows[0], { status: 201 });
  } catch (error: any) {
    console.error("Create notification error:", error);
    return NextResponse.json({ error: "Erro ao criar notificação" }, { status: 500 });
  }
}

export async function PATCH(request: Request) {
  try {
    const body = await request.json();
    const { id, read } = body;

    if (!id) {
      return NextResponse.json({ error: "Dados incompletos" }, { status: 400 });
    }

    const result = await query(
      "UPDATE notifications SET read = $1 WHERE id = $2 RETURNING *;",
      [read, id]
    );

    if (result.rows.length === 0) {
      return NextResponse.json({ error: "Notificação não encontrada" }, { status: 404 });
    }

    return NextResponse.json(result.rows[0]);
  } catch (error: any) {
    console.error("Update notification error:", error);
    return NextResponse.json({ error: "Erro ao atualizar notificação" }, { status: 500 });
  }
}