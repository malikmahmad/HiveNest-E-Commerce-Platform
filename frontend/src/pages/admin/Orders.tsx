import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Eye, X, ChevronDown } from 'lucide-react';
import { adminAPI } from '../../services/api';
import toast from 'react-hot-toast';

const STATUS_OPTIONS = ['PENDING', 'PROCESSING', 'SHIPPED', 'DELIVERED', 'CANCELLED'];
const PAYMENT_OPTIONS = ['PENDING', 'PAID', 'FAILED', 'REFUNDED'];

const STATUS_COLORS: Record<string, string> = {
  PENDING: 'bg-yellow-100 text-yellow-700',
  PROCESSING: 'bg-blue-100 text-blue-700',
  SHIPPED: 'bg-purple-100 text-purple-700',
  DELIVERED: 'bg-green-100 text-green-700',
  CANCELLED: 'bg-red-100 text-red-700',
};
const PAYMENT_COLORS: Record<string, string> = {
  PENDING: 'bg-yellow-100 text-yellow-700',
  PAID: 'bg-green-100 text-green-700',
  FAILED: 'bg-red-100 text-red-700',
  REFUNDED: 'bg-gray-100 text-gray-600',
};

export default function AdminOrders() {
  const [statusFilter, setStatusFilter] = useState('');
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [selectedOrder, setSelectedOrder] = useState<any>(null);
  const [trackingInput, setTrackingInput] = useState('');
  const qc = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ['admin-orders', statusFilter, search, page],
    queryFn: () => adminAPI.getOrders({ status: statusFilter || undefined, search: search || undefined, page, limit: 20 }).then((r) => r.data),
  });

  const updateMutation = useMutation({
    mutationFn: (payload: { id: string; status?: string; paymentStatus?: string; trackingNumber?: string }) => {
      const { id, ...data } = payload;
      return adminAPI.updateOrder(id, data);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admin-orders'] });
      toast.success('Order updated');
    },
    onError: (err: any) => toast.error(err.response?.data?.message || 'Update failed'),
  });

  const orders = data?.data || [];
  const pagination = data?.pagination;

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Orders</h1>
      <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
        <div className="p-4 border-b border-gray-100 flex flex-wrap gap-3">
          <input
            type="text" value={search} onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by order # or customer..."
            className="flex-1 min-w-48 px-4 py-2.5 border border-gray-200 rounded-xl text-sm outline-none focus:border-primary"
          />
          <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}
            className="px-4 py-2.5 border border-gray-200 rounded-xl text-sm outline-none focus:border-primary">
            <option value="">All Status</option>
            {STATUS_OPTIONS.map((s) => <option key={s} value={s}>{s}</option>)}
          </select>
        </div>

        {isLoading ? (
          <div className="flex justify-center py-12"><div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" /></div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50">
                <tr>
                  {['Order #', 'Customer', 'Date', 'Total', 'Payment', 'Order Status', 'Actions'].map((h) => (
                    <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {orders.length === 0 && (
                  <tr><td colSpan={7} className="text-center py-12 text-gray-400">No orders found</td></tr>
                )}
                {orders.map((order: any) => (
                  <tr key={order.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-4 py-3 font-mono text-xs font-semibold text-gray-700">{order.orderNumber}</td>
                    <td className="px-4 py-3">
                      <p className="font-medium text-gray-800">{order.user?.name}</p>
                      <p className="text-xs text-gray-400">{order.user?.email}</p>
                    </td>
                    <td className="px-4 py-3 text-gray-500 text-xs">{new Date(order.createdAt).toLocaleDateString()}</td>
                    <td className="px-4 py-3 font-bold text-primary">${Number(order.total).toFixed(2)}</td>

                    {/* Payment status — click to toggle PAID */}
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1.5">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${PAYMENT_COLORS[order.paymentStatus] || 'bg-gray-100 text-gray-600'}`}>
                          {order.paymentStatus}
                        </span>
                        {order.paymentStatus !== 'PAID' && (
                          <button
                            onClick={() => updateMutation.mutate({ id: order.id, paymentStatus: 'PAID' })}
                            className="text-xs bg-green-500 text-white px-2 py-0.5 rounded-full hover:bg-green-600 transition-colors font-medium"
                            title="Mark as Paid"
                          >
                            ✓ Paid
                          </button>
                        )}
                      </div>
                    </td>

                    {/* Order status dropdown */}
                    <td className="px-4 py-3">
                      <select
                        value={order.status}
                        onChange={(e) => updateMutation.mutate({ id: order.id, status: e.target.value })}
                        className="border border-gray-200 rounded-lg px-2 py-1.5 text-xs outline-none focus:border-primary bg-white"
                      >
                        {STATUS_OPTIONS.map((s) => <option key={s} value={s}>{s}</option>)}
                      </select>
                    </td>

                    {/* View detail */}
                    <td className="px-4 py-3">
                      <button
                        onClick={() => { setSelectedOrder(order); setTrackingInput(order.trackingNumber || ''); }}
                        className="p-1.5 text-primary hover:bg-primary/10 rounded-lg transition-colors"
                        title="View Details"
                      >
                        <Eye size={15} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {pagination && pagination.totalPages > 1 && (
          <div className="flex justify-center gap-2 p-4 border-t border-gray-100">
            {Array.from({ length: Math.min(pagination.totalPages, 7) }).map((_, i) => (
              <button key={i} onClick={() => setPage(i + 1)}
                className={`w-9 h-9 rounded-lg text-sm font-medium transition-colors ${page === i + 1 ? 'bg-primary text-white' : 'border border-gray-200 hover:border-primary'}`}>
                {i + 1}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Order Detail Modal */}
      {selectedOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" onClick={() => setSelectedOrder(null)}>
          <div className="absolute inset-0 bg-black/40" />
          <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between p-5 border-b border-gray-100">
              <h2 className="font-bold text-lg">Order {selectedOrder.orderNumber}</h2>
              <button onClick={() => setSelectedOrder(null)} className="p-1.5 hover:bg-gray-100 rounded-lg"><X size={18} /></button>
            </div>
            <div className="p-5 space-y-4">
              {/* Customer */}
              <div className="bg-gray-50 rounded-xl p-4">
                <p className="text-xs font-semibold text-gray-500 uppercase mb-2">Customer</p>
                <p className="font-medium">{selectedOrder.user?.name}</p>
                <p className="text-sm text-gray-500">{selectedOrder.user?.email}</p>
              </div>

              {/* Items */}
              <div>
                <p className="text-xs font-semibold text-gray-500 uppercase mb-2">Items</p>
                <div className="space-y-2">
                  {selectedOrder.items?.map((item: any) => (
                    <div key={item.id} className="flex justify-between text-sm bg-gray-50 px-3 py-2 rounded-lg">
                      <span className="text-gray-700">{item.name} × {item.quantity}</span>
                      <span className="font-semibold">${Number(item.total).toFixed(2)}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Totals */}
              <div className="bg-gray-50 rounded-xl p-4 space-y-1.5 text-sm">
                <div className="flex justify-between text-gray-600"><span>Subtotal</span><span>${Number(selectedOrder.subtotal).toFixed(2)}</span></div>
                <div className="flex justify-between text-gray-600"><span>Shipping</span><span>${Number(selectedOrder.shipping).toFixed(2)}</span></div>
                {Number(selectedOrder.discount) > 0 && <div className="flex justify-between text-green-600"><span>Discount</span><span>-${Number(selectedOrder.discount).toFixed(2)}</span></div>}
                <div className="flex justify-between font-bold text-base pt-1 border-t border-gray-200"><span>Total</span><span className="text-primary">${Number(selectedOrder.total).toFixed(2)}</span></div>
              </div>

              {/* Status controls */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-gray-500 uppercase mb-1.5">Order Status</label>
                  <select
                    value={selectedOrder.status}
                    onChange={(e) => {
                      updateMutation.mutate({ id: selectedOrder.id, status: e.target.value });
                      setSelectedOrder({ ...selectedOrder, status: e.target.value });
                    }}
                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-primary"
                  >
                    {STATUS_OPTIONS.map((s) => <option key={s} value={s}>{s}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-500 uppercase mb-1.5">Payment Status</label>
                  <select
                    value={selectedOrder.paymentStatus}
                    onChange={(e) => {
                      updateMutation.mutate({ id: selectedOrder.id, paymentStatus: e.target.value });
                      setSelectedOrder({ ...selectedOrder, paymentStatus: e.target.value });
                    }}
                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-primary"
                  >
                    {PAYMENT_OPTIONS.map((s) => <option key={s} value={s}>{s}</option>)}
                  </select>
                </div>
              </div>

              {/* Tracking number */}
              <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase mb-1.5">Tracking Number</label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={trackingInput}
                    onChange={(e) => setTrackingInput(e.target.value)}
                    placeholder="e.g. TCS-12345678"
                    className="flex-1 border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-primary"
                  />
                  <button
                    onClick={() => {
                      updateMutation.mutate({ id: selectedOrder.id, trackingNumber: trackingInput });
                      setSelectedOrder({ ...selectedOrder, trackingNumber: trackingInput });
                    }}
                    className="bg-primary text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-primary-dark transition-colors"
                  >
                    Save
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

