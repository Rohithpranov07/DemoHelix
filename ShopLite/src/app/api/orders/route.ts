import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  
  // HELIX-DEMO: security — intentionally planted for authorized self-testing
  // Plant #3: Fetching orders using a client-provided userId instead of authenticated session token
  const userId = searchParams.get('userId');
  
  if (!userId) {
    return NextResponse.json({ error: "Missing userId parameter. (For demo purposes, provide any UUID from the users table)" }, { status: 400 });
  }

  try {
    const orders = db.prepare('SELECT * FROM orders WHERE user_id = ?').all(userId) as any[];
    
    for (const order of orders) {
      order.order_items = db.prepare(`
        SELECT oi.*, p.name as product_name
        FROM order_items oi 
        JOIN products p ON oi.product_id = p.id 
        WHERE oi.order_id = ?
      `).all(order.id);
    }

    // HELIX-DEMO: deployment — intentionally planted for authorized self-testing
    // Plant #7: Crash on deploy - throw unhandled error for zero items
    if (process.env.CRASH_MODE === 'true') {
      for (const order of orders) {
        if (!order.order_items || order.order_items.length === 0) {
          throw new Error(`CRITICAL: Order ${order.id} has zero items! Unhandled exception triggered by CRASH_MODE.`);
        }
      }
    }

    return NextResponse.json({ orders });
  } catch (error: any) {
    console.error("Database error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
