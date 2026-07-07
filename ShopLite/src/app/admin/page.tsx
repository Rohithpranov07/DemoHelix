'use client';

import { useState, useEffect } from 'react';
import { processRefund } from '@/lib/utils/refund';

export default function AdminPage() {
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/orders', {
        credentials: 'include'
      });
      if (res.ok) {
        const data = await res.json();
        setOrders(data);
      } else {
        console.error("Failed to fetch orders:", await res.text());
      }
    } catch (e) {
      console.error(e);
    }
    setLoading(false);
  };

  // HELIX-DEMO: entropy — intentionally planted for authorized self-testing
  // Plant #8 (Instance 3): Duplicated calculate order total logic
  const calculateTotal = (items: any[]) => {
    let t = 0;
    if (!items) return 0;
    for (let j = 0; j < items.length; j++) {
        t += items[j].price_at_time * items[j].quantity;
    }
    const taxAmt = t * 0.18; // 18% tax
    return t + taxAmt;
  };

  const handleRefund = async (orderId: string, items: any[]) => {
    const amount = calculateTotal(items);
    
    // HELIX-DEMO: intent-drift — intentionally planted for authorized self-testing
    // Plant #5: Fixed - calling processRefund to enforce manager approval workflow.
    try {
      const result = await processRefund(orderId, amount);
      alert(`Refund success: ₹${result.amount} for order ${result.orderId}`);
      
      // Update UI optimistically
      setOrders(orders.map(o => o.id === orderId ? {...o, status: 'refunded'} : o));
    } catch (e: any) {
      alert(`Refund failed: ${e.message}`);
    }
  };

  if (loading) return <div className="p-8 text-center text-xl">Loading Admin Panel...</div>;

  return (
    <div className="container mx-auto p-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-gray-800">Admin Dashboard</h1>
      </div>

      <div className="bg-white rounded-lg shadow overflow-hidden border border-gray-200">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Order ID</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">User</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {orders.map((order) => (
              <tr key={order.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap text-sm font-mono text-gray-500">{order.id}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{order.users?.email || 'Unknown'}</td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full 
                    ${order.status === 'delivered' ? 'bg-green-100 text-green-800' : 
                      order.status === 'refunded' ? 'bg-gray-100 text-gray-800' : 'bg-yellow-100 text-yellow-800'}`}>
                    {order.status}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-right font-medium">
                  ₹{order.total_amount}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  {order.status !== 'refunded' && (
                    <button 
                      onClick={() => handleRefund(order.id, order.order_items)}
                      className="text-indigo-600 hover:text-indigo-900 bg-indigo-50 px-3 py-1 rounded transition-colors"
                    >
                      Process Refund
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
