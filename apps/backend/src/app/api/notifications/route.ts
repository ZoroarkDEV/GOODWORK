import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get("user_id");

    if (!userId) {
      return NextResponse.json({ error: "user_id é obrigatório" }, { status: 400 });
    }

    const { data, error } = await supabase
      .from("notifications")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: false })
      .limit(50);

    if (error) throw error;
    return NextResponse.json(data ?? []);
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

    const { data, error } = await supabase
      .from("notifications")
      .insert({
        user_id,
        type: type || "general",
        title,
        message: message || "",
        metadata: metadata || {},
        read: false,
      })
      .select()
      .single();

    if (error) throw error;
    return NextResponse.json(data, { status: 201 });
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

    const { data, error } = await supabase
      .from("notifications")
      .update({ read })
      .eq("id", id)
      .select()
      .single();

    if (error) throw error;
    return NextResponse.json(data);
  } catch (error: any) {
    console.error("Update notification error:", error);
    return NextResponse.json({ error: "Erro ao atualizar notificação" }, { status: 500 });
  }
}