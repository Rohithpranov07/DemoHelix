import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const q = searchParams.get('q') || '';

  try {
    // HELIX-DEMO: security — intentionally planted for authorized self-testing
    // Plant #1: SQLi by raw string concatenation instead of parameterized query
    const query = `SELECT * FROM products WHERE name LIKE '%${q}%'`;
    const rows = db.prepare(query).all();
    
    return NextResponse.json({ products: rows });
  } catch (err: any) {
    console.error("Database connection or query error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
