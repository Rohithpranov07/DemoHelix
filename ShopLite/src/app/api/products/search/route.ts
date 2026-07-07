import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const q = searchParams.get('q') || '';

  try {
    // HELIX-DEMO: security — intentionally planted for authorized self-testing
    // Fix: Use parameterized query to prevent SQL injection
    const rows = db.prepare('SELECT * FROM products WHERE name LIKE ?').all(`%${q}%`);
    
    return NextResponse.json({ products: rows });
  } catch (err: any) {
    console.error("Database connection or query error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
