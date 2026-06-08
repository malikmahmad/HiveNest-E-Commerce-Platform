import { useParams, Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { CheckCircle, Clock, Truck, Package, XCircle, MapPin, CreditCard } from 'lucide-react';
import { useOrder, useCancelOrder } from '../hooks';
import LoadingSpinner from '../components/ui/LoadingSpinner';

const STEPS = ['PENDING', 'PROCESSING', 'SHIPPED', 'DELIVERED'];

export default function OrderDetail() {
  const { id } = useParams<{ id: string }>();
  const { data: order, isLoading } = useOrder(id!);
  const cancelOrder = useCancelOrder();

  if (isLoading) return <LoadingSpinner fullScreen />;
  if (!order) return <div className="text-center py-20 text-gray-500">Order not found</div>;

  const currentStep = STEPS.indexOf(order.status);
  const isCancellable = ['PENDING', 'PROCESSING'].includes(order.status);

  return (
    <>
      <Helmet><title>Order {order.orderNumber} — HiveNest</title></Helmet>
      <div className="max-w-4xl mx-auto px-4 py-10">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-xl font-bold text-gray-900 font-mono">{order.orderNumber}</h1>
            <p className="text-sm text-gray-400 mt-0.5">Placed on {new Date(order.createdAt).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
          </div>
          <span className={`px-4 py-1.5 rounded-full text-sm font-semibold ${order.status === 'DELIVERED' ? 'bg-green-100 text-green-700' : order.status === 'CANCELLED' ? 'bg-red-100 text-red-700' : 'bg-blue-100 text-blue-700'}`}>
            {order.status}
          </span>
        </div>

        {/* Progress tracker */}
        {order.status !== 'CANCELLED' && (
          <div className="bg-white border border-gray-100 rounded-2xl p-6 mb-6">
            <div className="flex items-center justify-between relative">
              <div className="absolute top-4 left-0 right-0 h-0.5 bg-gray-200 -z-0">
                <div className="h-full bg-primary transition-all duration-500" style={{ width: `${currentStep >= 0 ? (currentStep / (STEPS.length - 1)) * 100 : 0}%` }} />
              </div>
              {STEPS.map((step, i) => {
                const done = i <= currentStep;
                const icons = [Clock, Package, Truck, CheckCircle];
                const Icon = icons[i];
                return (
                  <div key={step} className="flex flex-col items-center gap-2 z-10">
                    <div className={`w-9 h-9 rounded-full flex items-center justify-center border-2 transition-all ${done ? 'bg-primary border-primary text-white' : 'bg-white border-gray-300 text-gray-400'}`}>
                      <Icon size={16} />
                    </div>
                    <span className={`text-xs font-medium capitalize ${done ? 'text-primary' : 'text-gray-400'}`}>{step.toLowerCase()}</span>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Items */}
          <div className="md:col-span-2 space-y-4">
            <div className="bg-white border border-gray-100 rounded-2xl p-5">
              <h2 className="font-bold text-gray-900 mb-4">Order Items</h2>
              <div className="space-y-3">
                {order.items.map((item) => (
                  <div key={item.id} className="flex gap-3">
                    <div className="w-16 h-16 bg-gray-100 rounded-xl flex-shrink-0 overflow-hidden">
                      {item.image && <img src={item.image} alt={item.name} className="w-full h-full object-cover" />}
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-800">{item.name}</p>
                      {item.variant && <p className="text-xs text-gray-500">{item.variant}</p>}
                      <p className="text-xs text-gray-400">Qty: {item.quantity}</p>
                    </div>
                    <p className="text-sm font-bold text-gray-900">${Number(item.total).toFixed(2)}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Summary */}
            <div className="bg-white border border-gray-100 rounded-2xl p-5">
              <h2 className="font-bold text-gray-900 mb-4">Price Summary</h2>
              <div className="space-y-2.5 text-sm">
                <div className="flex justify-between text-gray-600"><span>Subtotal</span><span>${Number(order.subtotal).toFixed(2)}</span></div>
                {Number(order.discount) > 0 && <div className="flex justify-between text-green-600"><span>Discount</span><span>-${Number(order.discount).toFixed(2)}</span></div>}
                <div className="flex justify-between text-gray-600"><span>Shipping</span><span>{Number(order.shipping) === 0 ? 'Free' : `$${Number(order.shipping).toFixed(2)}`}</span></div>
                <div className="flex justify-between font-bold text-base border-t border-gray-100 pt-2.5 mt-1">
                  <span>Total</span><span className="text-primary">${Number(order.total).toFixed(2)}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Side info */}
          <div className="space-y-4">
            <div className="bg-white border border-gray-100 rounded-2xl p-5">
              <h2 className="font-bold text-gray-900 mb-3 flex items-center gap-2"><MapPin size={16} className="text-primary" />Shipping To</h2>
              <div className="text-sm text-gray-600 space-y-1">
                <p className="font-semibold text-gray-800">{order.address.name}</p>
                <p>{order.address.phone}</p>
                <p>{order.address.street}</p>
                <p>{order.address.city}, {order.address.state} {order.address.zip}</p>
                <p>{order.address.country}</p>
              </div>
            </div>

            <div className="bg-white border border-gray-100 rounded-2xl p-5">
              <h2 className="font-bold text-gray-900 mb-3 flex items-center gap-2"><CreditCard size={16} className="text-primary" />Payment</h2>
              <div className="text-sm">
                <p className="text-gray-600">{order.paymentMethod.replace('_', ' ')}</p>
                <span className={`inline-block mt-1 px-2 py-0.5 rounded-full text-xs font-medium ${order.paymentStatus === 'PAID' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>
                  {order.paymentStatus}
                </span>
              </div>
            </div>

            {order.trackingNumber && (
              <div className="bg-blue-50 border border-blue-100 rounded-2xl p-5">
                <p className="text-sm font-semibold text-blue-800 mb-1">Tracking Number</p>
                <p className="font-mono text-blue-700 text-sm">{order.trackingNumber}</p>
              </div>
            )}

            {isCancellable && (
              <button
                onClick={() => { if (confirm('Cancel this order?')) cancelOrder.mutate({ id: order.id }); }}
                disabled={cancelOrder.isPending}
                className="w-full border border-red-200 text-red-500 py-2.5 rounded-xl text-sm font-medium hover:bg-red-50 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
              >
                <XCircle size={16} /> Cancel Order
              </button>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
