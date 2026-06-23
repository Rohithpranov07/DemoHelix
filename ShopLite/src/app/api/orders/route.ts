import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { z } from 'zod';

const userIdSchema = z.string().uuid();

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const userId = searchParams.get('userId');
  
  if (!userId) {
    return NextResponse.json({ error: "Missing userId parameter" }, { status: 400 });
  }
  
  const validationError = userIdSchema.safeParse(userId);
  if (!validationError.success) {
    return NextResponse.json({ error: "Invalid userId format" }, { status: 400 });
  }
 
  try {
    const orders = db.prepare('SELECT * FROM orders WHERE user_id = ?').all(userId);
    
    if (!orders || orders.length === 0) {
      return NextResponse.json({ orders: [] });
    }
    
    for (const order of orders) {
      const orderItems = db.prepare(`
        SELECT oi.*, p.name as product_name
        FROM order_items oi 
        JOIN products p ON oi.product_id = p.id 
        WHERE oi.order_id = ?`)
      ).all(order.id);
      
      order.order_items = orderItems || [];
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
