import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { verifyAuth } from '@/lib/auth';

export async function GET(request: Request) {
  // INV-SEC-002: Verify authentication before processing
  const authResult = await verifyAuth(request);
  if (!authResult.valid) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const q = searchParams.get('q') || '';

  try {
    // INV-SEC-001: Use parameterized query to prevent SQL injection
    const rows = db.prepare('SELECT * FROM products WHERE name LIKE ?').all(`%${q}%`);
    
    return NextResponse.json({ products: rows });
  } catch (err: any) {
    console.error("Database connection or query error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
