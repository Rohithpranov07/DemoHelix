'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

export default function OrdersPage() {
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [userId, setUserId] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    // Get userId from cookie for demo
    const match = document.cookie.match(new RegExp('(^| )userId=([^;]+)'));
    const id = match ? match[2] : null;

    if (!id) {
      router.push('/login');
      return;
    }

    // Invariant [auth-check]: Trust the server-validated session ID from cookie, do not allow client override.
    // Invariant [input-validation]: Ensure ID format is valid before use.
    if (/^[0-9a-fA-F-]{36}$/.test(id)) {
      setUserId(id);
      fetchOrders(id);
    } else {
      setError('Invalid session identifier.');
    }
  }, [router]);

  const fetchOrders = async (id: string) => {
    setLoading(true);
    try {
      // Invariant [idor-prevention]: Remove userId from query string; rely on server-side session verification.
      const res = await fetch(`/api/orders`);
      const data = await res.json();
      
      if (data.error) {
        throw new Error(data.error);
      }
      
      setOrders(data.orders || []);
      setError(null);
    } catch (err: any) {
      console.error(err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (loading && orders.length === 0) return <div className="p-8 text-center text-xl">Loading orders...</div>;

  return (
    <div className="container mx-auto p-8">
      <h1 className="text-3xl font-bold mb-6">Your Orders</h1>

      {error && (
        <div className="mb-6 p-4 bg-red-100 text-red-700 rounded-md">
          <p className="font-mono text-sm">{error}</p>
        </div>
      )}

      <div className="space-y-6">
        {orders.map((order) => (
          <div key={order.id} className="border p-6 rounded-lg shadow-sm bg-white">
            <div className="flex justify-between border-b pb-4 mb-4">
              <div>
                <p className="text-sm text-gray-500">Order ID</p>
                <p className="font-mono text-sm">{order.id}</p>
              </div>
              <div className="text-right">
                <p className="text-sm text-gray-500">Status</p>
                <p className={`font-semibold capitalize ${order.status === 'delivered' ? 'text-green-600' : 'text-orange-500'}`}>
                  {order.status}
                </p>
              </div>
            </div>
            
            <table className="w-full text-left">
              <thead>
                <tr className="text-gray-500 text-sm border-b">
                  <th className="pb-2">Product</th>
                  <th className="pb-2">Qty</th>
                  <th className="pb-2 text-right">Price</th>
                </tr>
              </thead>
              <tbody>
                {order.order_items?.map((item: any) => (
                  <tr key={item.id} className="border-b last:border-0">
                    <td className="py-3">{item.products?.name || 'Unknown Product'}</td>
                    <td className="py-3">{item.quantity}</td>
                    <td className="py-3 text-right">₹{item.price_at_time}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            
            <div className="mt-4 text-right">
              <p className="text-xl font-bold">Total: ₹{order.total_amount}</p>
            </div>
          </div>
        ))}
        {orders.length === 0 && !error && (
          <p className="text-gray-500 italic">No orders found for this user.</p>
        )}
      </div>
    </div>
  );
}
