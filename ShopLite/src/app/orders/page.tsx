'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

export default function OrdersPage() {
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [userId, setUserId] = useState<string>('');
  const router = useRouter();

  useEffect(() => {
    // Get userId from cookie for demo
    const match = document.cookie.match(new RegExp('(^| )userId=([^;]+)'));
    const id = match ? match[2] : null;

    if (!id) {
      router.push('/login');
      return;
    }

    setUserId(id);
    fetchOrders(id);
  }, [router]);

  const fetchOrders = async (id: string) => {
    setLoading(true);
    try {
      const res = await fetch(`/api/orders?userId=${id}`);
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

  const handleImpersonate = (e: React.FormEvent) => {
    e.preventDefault();
    fetchOrders(userId);
  };

  if (loading && orders.length === 0) return <div className="p-8 text-center text-xl">Loading orders...</div>;

  return (
    <div className="container mx-auto p-8">
      <h1 className="text-3xl font-bold mb-6">Your Orders</h1>

      {/* HELIX-DEMO: security — intentionally planted for authorized self-testing */}
      {/* Plant #3 UI: Allows user to modify the userId being sent to the vulnerable API */}
      <div className="mb-8 p-6 bg-red-50 border border-red-200 rounded-lg">
        <h3 className="text-red-800 font-bold mb-2 text-lg">⚠️ Demo Exploit Panel: Missing RLS</h3>
        <p className="text-sm text-red-700 mb-4">
          Because the /api/orders endpoint trusts the client-provided userId parameter and the 
          database lacks Row-Level Security, you can view anyone's orders by changing the ID below.
        </p>
        <form onSubmit={handleImpersonate} className="flex gap-2">
          <input 
            type="text" 
            value={userId}
            onChange={(e) => setUserId(e.target.value)}
            className="border p-2 rounded w-96 font-mono text-sm"
            placeholder="User UUID"
          />
          <button type="submit" className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded font-semibold transition-colors">
            Fetch Orders As User
          </button>
        </form>
      </div>

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
