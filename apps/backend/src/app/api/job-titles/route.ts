import { NextResponse } from "next/server";
import { query } from "@/lib/db";

export async function GET() {
  try {
    const result = await query(
      "SELECT id, name, category, active FROM job_titles WHERE active = TRUE ORDER BY category ASC, name ASC;"
    );
    return NextResponse.json(result.rows, { status: 200 });
  } catch (error: any) {
    console.error("Error fetching job titles:", error);
    return NextResponse.json(
      { error: "Erro interno ao buscar cargos." },
      { status: 500 }
    );
  }
}