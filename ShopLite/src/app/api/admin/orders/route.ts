import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET(request: Request) {
  const authHeader = request.headers.get('authorization');
  
  if (authHeader !== `Bearer ${process.env.ADMIN_API_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const orders = db.prepare('SELECT * FROM orders ORDER BY created_at DESC').all() as any[];
    
    for (const order of orders) {
      const user = db.prepare('SELECT email FROM users WHERE id = ?').get(order.user_id) as any;
      order.users = { email: user?.email };

      order.order_items = db.prepare(`
        SELECT oi.*, p.name as product_name
        FROM order_items oi 
        JOIN products p ON oi.product_id = p.id 
        WHERE oi.order_id = ?
      `).all(order.id);
    }

    return NextResponse.json(orders);
  } catch (error: any) {
    console.error("Database error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
