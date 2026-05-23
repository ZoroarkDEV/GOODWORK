import { supabase } from "./supabase";

/**
 * Simple query helper that uses Supabase client.
 * Supports basic SELECT, INSERT, UPDATE, DELETE operations.
 */
export async function query(text: string, params?: any[]) {
  const sql = text.trim().toLowerCase();

  // SELECT
  if (sql.startsWith("select")) {
    const fromMatch = text.match(/from\s+([a-z_]+)/i);
    if (!fromMatch) throw new Error("Could not parse table name from SELECT");

    const tableName = fromMatch[1];
    let builder: any = supabase.from(tableName).select("*");

    if (sql.includes("where")) {
      const whereMatch = text.match(/where\s+([\s\S]+?)(?:order|group|limit|$)/i);
      if (whereMatch) {
        const conditions = whereMatch[1].trim();
        if (conditions.includes("active = true") || conditions.includes("active = $1")) {
          builder = builder.eq("active", true);
        }
        const idMatch = conditions.match(/id\s*=\s*\$(\d+)/);
        if (idMatch && params) {
          builder = builder.eq("id", params[parseInt(idMatch[1]) - 1]);
        }
        const roomIdMatch = conditions.match(/room_id\s*=\s*\$(\d+)/);
        if (roomIdMatch && params) {
          builder = builder.eq("room_id", params[parseInt(roomIdMatch[1]) - 1]);
        }
        const userIdMatch = conditions.match(/user_id\s*=\s*\$(\d+)/);
        if (userIdMatch && params) {
          builder = builder.eq("user_id", params[parseInt(userIdMatch[1]) - 1]);
        }
        const statusMatch = conditions.match(/status\s+in\s+\('([^']+)',\s*'([^']+)'\)/i);
        if (statusMatch) {
          builder = builder.in("status", [statusMatch[1], statusMatch[2]]);
        }
      }
    }

    if (sql.includes("order by")) {
      const orderMatch = text.match(/order\s+by\s+([a-z_]+)(?:\s+(asc|desc))?/i);
      if (orderMatch) {
        builder = builder.order(orderMatch[1], { ascending: orderMatch[2]?.toLowerCase() !== "desc" });
      }
    }

    const { data, error } = await builder;
    if (error) throw new Error(error.message);
    return { rows: data ?? [] };
  }

  // INSERT
  if (sql.startsWith("insert")) {
    const tableMatch = text.match(/insert\s+into\s+([a-z_]+)/i);
    if (!tableMatch) throw new Error("Could not parse table name from INSERT");

    const tableName = tableMatch[1];
    const colsMatch = text.match(/\(([^)]+)\)\s*values/i);
    if (!colsMatch || !params) throw new Error("Could not parse columns from INSERT");

    const columns = colsMatch[1].split(",").map((c) => c.trim());
    const row: Record<string, any> = {};
    columns.forEach((col, i) => {
      row[col] = params[i];
    });

    const { data, error } = await supabase.from(tableName).insert(row).select().single();
    if (error) throw new Error(error.message);
    return { rows: [data] };
  }

  // UPDATE
  if (sql.startsWith("update")) {
    const tableMatch = text.match(/update\s+([a-z_]+)/i);
    if (!tableMatch) throw new Error("Could not parse table name from UPDATE");

    const tableName = tableMatch[1];
    const setMatch = text.match(/set\s+([\s\S]+?)\s+where/i);
    if (!setMatch || !params) throw new Error("Could not parse SET from UPDATE");

    const setPairs = setMatch[1].split(",").map((p) => p.trim());
    const updateObj: Record<string, any> = {};

    for (const pair of setPairs) {
      const colMatch = pair.match(/([a-z_]+)\s*=\s*\$(\d+)/i);
      if (colMatch) {
        updateObj[colMatch[1]] = params[parseInt(colMatch[2]) - 1];
      }
    }

    const idColMatch = text.match(/where\s+([\s\S]+?)(?:returning|$)/i);
    let builder: any = supabase.from(tableName).update(updateObj);

    if (idColMatch) {
      const idMatch = idColMatch[1].match(/([a-z_]+)\s*=\s*\$(\d+)/i);
      if (idMatch) {
        builder = builder.eq(idMatch[1], params[parseInt(idMatch[2]) - 1]);
      }
    }

    const { data, error } = await builder.select();
    if (error) throw new Error(error.message);
    return { rows: data ?? [] };
  }

  // DELETE
  if (sql.startsWith("delete")) {
    const tableMatch = text.match(/delete\s+from\s+([a-z_]+)/i);
    if (!tableMatch) throw new Error("Could not parse table name from DELETE");

    const tableName = tableMatch[1];
    let builder: any = supabase.from(tableName).delete();

    const idMatch = text.match(/where\s+([a-z_]+)\s*=\s*\$(\d+)/i);
    if (idMatch && params) {
      builder = builder.eq(idMatch[1], params[parseInt(idMatch[2]) - 1]);
    }

    const { data, error } = await builder.select();
    if (error) throw new Error(error.message);
    return { rows: data ?? [] };
  }

  throw new Error(`Unsupported SQL operation: ${text.slice(0, 50)}`);
}