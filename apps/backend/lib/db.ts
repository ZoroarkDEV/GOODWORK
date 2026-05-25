import { Pool } from 'pg';

let pool: Pool | null = null;

function getPool(): Pool {
  if (!pool) {
    // Append sslmode=disable to prevent pg from trying SSL on servers
    // that don't support it (e.g., local PostgreSQL in Docker).
    // In production with SSL, set DB_SSL=true and sslmode=require.
    const connectionString = process.env.DATABASE_URL || '';
    const separator = connectionString.includes('?') ? '&' : '?';
    const sslMode = process.env.DB_SSL === 'true' ? 'require' : 'disable';
    const finalConnectionString = `${connectionString}${separator}sslmode=${sslMode}`;

    pool = new Pool({
      connectionString: finalConnectionString,
    });
  }
  return pool;
}

export async function query(text: string, params?: any[]) {
  const result = await getPool().query(text, params);
  return { rows: result.rows };
}