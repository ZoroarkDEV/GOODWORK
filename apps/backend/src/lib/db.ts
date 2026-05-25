import { Pool } from 'pg';

let pool: Pool | null = null;

function getPool(): Pool {
  if (!pool) {
    const connectionString = process.env.DATABASE_URL || 'postgresql://goodwork_admin:goodwork_secure_pass@postgres:5432/goodwork_db';
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
  const start = Date.now();
  const res = await getPool().query(text, params);
  const duration = Date.now() - start;
  console.log('Executed query:', { text, duration, rowsCount: res.rowCount });
  return res;
}

export default getPool;