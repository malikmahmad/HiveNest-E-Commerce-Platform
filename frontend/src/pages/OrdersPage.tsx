// ─── OrdersPage.tsx ───────────────────────────────────────────
import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { Package, ChevronRight, Clock } from 'lucide-react';
import { useOrders, useCancelOrder } from '../hooks';
import LoadingSpinner from '../components/ui/LoadingSpinner';

const STATUS_STYLES: Record<string, string> = {
  PENDING: 'bg-yellow-100 text-yellow-700',
  PROCESSING: 'bg-blue-100 text-blue-700',
  SHIPPED: 'bg-purple-100 text-purple-700',
  DELIVERED: 'bg-green-100 text-green-700',
  CANCELLED: 'bg-red-100 text-red-700',
  REFUNDED: 'bg-gray-100 text-gray-600',
};

export function OrdersPage() {
  const { data, isLoading } = useOrders();
  const orders = data?.data || [];

  if (isLoading) return <LoadingSpinner fullScreen />;

  return (
    <>
      <Helmet><title>My Orders — HiveNest</title></Helmet>
      <div className="max-w-4xl mx-auto px-4 py-10">
        <h1 className="text-2xl font-bold text-gray-900 mb-6">My Orders</h1>
        {orders.length === 0 ? (
          <div className="text-center py-20 text-gray-400">
            <Package size={64} className="mx-auto mb-4 opacity-30" strokeWidth={1} />
            <p className="text-lg font-medium mb-2">No orders yet</p>
            <Link to="/products" className="inline-block bg-primary text-white px-6 py-2.5 rounded-lg text-sm font-medium mt-3 hover:bg-primary-dark transition-colors">Start Shopping</Link>
          </div>
        ) : (
          <div className="space-y-4">
            {orders.map((order: any) => (
              <Link key={order.id} to={`/orders/${order.id}`} className="block bg-white border border-gray-100 rounded-2xl p-5 hover:shadow-md transition-all group">
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <p className="font-bold text-gray-900 font-mono text-sm">{order.orderNumber}</p>
                    <p className="text-xs text-gray-400 flex items-center gap-1 mt-0.5"><Clock size={12} />{new Date(order.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className={`px-3 py-1 rounded-full text-xs font-semibold ${STATUS_STYLES[order.status]}`}>{order.status}</span>
                    <ChevronRight size={18} className="text-gray-400 group-hover:text-primary transition-colors" />
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <p className="text-sm text-gray-500">{order.items?.length} item{order.items?.length !== 1 ? 's' : ''}</p>
                  <p className="font-bold text-primary text-lg">${Number(order.total).toFixed(2)}</p>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </>
  );
}

export default OrdersPage;
