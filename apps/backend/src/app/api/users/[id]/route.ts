import { NextResponse } from "next/server";
import { query } from "@/lib/db";

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { name, phone, job_title } = body;

    // Check if user exists
    const checkResult = await query("SELECT id FROM users WHERE id = $1;", [id]);
    if (checkResult.rows.length === 0) {
      return NextResponse.json({ error: "Usuário não encontrado." }, { status: 404 });
    }

    const updateFields: string[] = [];
    const queryParams: any[] = [];
    let paramIndex = 1;

    if (name !== undefined) {
      updateFields.push(`name = $${paramIndex++}`);
      queryParams.push(name);
    }
    if (phone !== undefined) {
      updateFields.push(`phone = $${paramIndex++}`);
      queryParams.push(phone);
    }
    if (job_title !== undefined) {
      updateFields.push(`job_title = $${paramIndex++}`);
      updateFields.push(`updated_at = NOW()`);
      queryParams.push(job_title);
    }

    if (updateFields.length === 0) {
      return NextResponse.json({ error: "Nenhum campo fornecido para atualização." }, { status: 400 });
    }

    queryParams.push(id);
    const updateQuery = `
      UPDATE users 
      SET ${updateFields.join(", ")} 
      WHERE id = $${paramIndex}
      RETURNING id, name, email, role, phone, job_title, active;
    `;

    const result = await query(updateQuery, queryParams);
    return NextResponse.json(result.rows[0], { status: 200 });
  } catch (error: any) {
    console.error("Error updating user:", error);
    return NextResponse.json(
      { error: "Erro interno ao atualizar usuário." },
      { status: 500 }
    );
  }
}