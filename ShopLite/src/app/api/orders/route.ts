import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { verifyAuth } from '@/lib/auth';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  
  // Verify authentication and authorization
  const authResult = await verifyAuth(request);
  if (!authResult.success) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const userId = authResult.userId;

  try {
    // Enforce Row-Level Security by strictly filtering by authenticated user ID
    const orders = db.prepare('SELECT * FROM orders WHERE user_id = ?').all(userId) as any[];
    
    for (const order of orders) {
      order.order_items = db.prepare(`
        SELECT oi.*, p.name as product_name
        FROM order_items oi 
        JOIN products p ON oi.product_id = p.id 
        WHERE oi.order_id = ?
      `).all(order.id);
    }

    return NextResponse.json({ orders });
  } catch (error: any) {
    console.error("Database error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
