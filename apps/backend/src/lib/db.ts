import { Pool } from 'pg';

const connectionString = process.env.DATABASE_URL || 'postgresql://goodwork_admin:goodwork_secure_pass@localhost:5432/goodwork_db';

const isLocal = connectionString.includes('localhost') || connectionString.includes('127.0.0.1');

const pool = new Pool({
  connectionString,
  ssl: (process.env.NODE_ENV === 'production' && !isLocal) ? { rejectUnauthorized: false } : false
});

export async function query(text: string, params?: any[]) {
  const start = Date.now();
  const res = await pool.query(text, params);
  const duration = Date.now() - start;
  console.log('Executed query:', { text, duration, rowsCount: res.rowCount });
  return res;
}

export default pool;
