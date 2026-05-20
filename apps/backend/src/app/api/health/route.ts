import { NextResponse } from 'next/server';
import { query } from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    // Test the database connectivity by fetching current time
    const result = await query('SELECT NOW() as db_time;');
    const dbTime = result.rows[0]?.db_time;

    return NextResponse.json({
      status: 'healthy',
      service: 'GOODWORK Backend API',
      timestamp: new Date().toISOString(),
      database: {
        status: 'connected',
        time: dbTime,
      }
    }, { status: 200 });

  } catch (error: any) {
    console.error('Database connection failed in healthcheck:', error);
    
    return NextResponse.json({
      status: 'unhealthy',
      service: 'GOODWORK Backend API',
      timestamp: new Date().toISOString(),
      database: {
        status: 'disconnected',
        error: error.message || String(error)
      }
    }, { status: 500 });
  }
}
