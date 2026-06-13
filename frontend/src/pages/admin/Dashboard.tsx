import { useQuery } from '@tanstack/react-query';
import { TrendingUp, ShoppingCart, Users, Package, AlertTriangle, DollarSign } from 'lucide-react';
import { adminAPI } from '../../services/api';

export default function AdminDashboard() {
  const { data, isLoading } = useQuery({
    queryKey: ['admin-dashboard'],
    queryFn: () => adminAPI.getDashboard().then((r) => r.data.data),
    refetchInterval: 30000,
  });

  if (isLoading) return <div className="flex justify-center py-20"><div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" /></div>;

  const { stats, recentOrders = [], topProducts = [], ordersByStatus = [] } = data || {};

  const STATUS_COLORS: Record<string, string> = {
    PENDING: 'bg-yellow-100 text-yellow-700',
    PROCESSING: 'bg-blue-100 text-blue-700',
    SHIPPED: 'bg-purple-100 text-purple-700',
    DELIVERED: 'bg-green-100 text-green-700',
    CANCELLED: 'bg-red-100 text-red-700',
  };

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Dashboard</h1>

      {/* Stats cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {[
          { label: 'Total Revenue', value: `$${(stats?.totalRevenue || 0).toLocaleString()}`, sub: `$${(stats?.monthRevenue || 0).toLocaleString()} this month`, icon: DollarSign, color: 'bg-green-500', growth: stats?.revenueGrowth },
          { label: 'Total Orders', value: stats?.totalOrders?.toLocaleString() || '0', sub: `${stats?.monthOrders || 0} this month`, icon: ShoppingCart, color: 'bg-blue-500' },
          { label: 'Total Customers', value: stats?.totalUsers?.toLocaleString() || '0', sub: `${stats?.monthUsers || 0} new this month`, icon: Users, color: 'bg-purple-500' },
          { label: 'Active Products', value: stats?.totalProducts?.toLocaleString() || '0', sub: `${stats?.lowStock || 0} low stock`, icon: Package, color: 'bg-orange-500' },
        ].map((card) => (
          <div key={card.label} className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm">
            <div className="flex items-center justify-between mb-3">
              <p className="text-sm text-gray-500">{card.label}</p>
              <div className={`w-10 h-10 ${card.color} bg-opacity-10 rounded-xl flex items-center justify-center`}>
                <card.icon size={20} className={card.color.replace('bg-', 'text-')} />
              </div>
            </div>
            <p className="text-2xl font-bold text-gray-900">{card.value}</p>
            <p className="text-xs text-gray-400 mt-1">{card.sub}</p>
            {card.growth !== undefined && (
              <p className={`text-xs font-medium mt-1 flex items-center gap-1 ${Number(card.growth) >= 0 ? 'text-green-600' : 'text-red-500'}`}>
                <TrendingUp size={12} /> {card.growth}% vs last month
              </p>
            )}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Orders */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-gray-100 p-5">
          <h2 className="font-bold text-gray-900 mb-4">Recent Orders</h2>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100">
                  <th className="text-left py-2 px-3 text-gray-500 font-medium text-xs">Order</th>
                  <th className="text-left py-2 px-3 text-gray-500 font-medium text-xs">Customer</th>
                  <th className="text-left py-2 px-3 text-gray-500 font-medium text-xs">Total</th>
                  <th className="text-left py-2 px-3 text-gray-500 font-medium text-xs">Status</th>
                </tr>
              </thead>
              <tbody>
                {recentOrders.slice(0, 8).map((order: any) => (
                  <tr key={order.id} className="border-b border-gray-50 hover:bg-gray-50 transition-colors">
                    <td className="py-2.5 px-3 font-mono text-xs text-gray-600">{order.orderNumber}</td>
                    <td className="py-2.5 px-3">
                      <p className="font-medium text-gray-800">{order.user?.name}</p>
                      <p className="text-xs text-gray-400">{order.user?.email}</p>
                    </td>
                    <td className="py-2.5 px-3 font-semibold">${Number(order.total).toFixed(2)}</td>
                    <td className="py-2.5 px-3">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${STATUS_COLORS[order.status] || 'bg-gray-100 text-gray-600'}`}>
                        {order.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Top Products */}
        <div className="bg-white rounded-2xl border border-gray-100 p-5">
          <h2 className="font-bold text-gray-900 mb-4">Top Products</h2>
          <div className="space-y-3">
            {topProducts.map((p: any, i: number) => (
              <div key={p.id} className="flex items-center gap-3">
                <span className="text-sm font-bold text-gray-400 w-5">{i + 1}</span>
                <img src={p.images?.[0]?.url || '/placeholder.jpg'} alt={p.name} className="w-10 h-10 object-cover rounded-lg" />
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-medium text-gray-800 truncate">{p.name}</p>
                  <p className="text-xs text-gray-400">{p.totalSold} sold</p>
                </div>
                <p className="text-sm font-bold text-primary">${Number(p.price).toFixed(0)}</p>
              </div>
            ))}
          </div>

          {/* Order status breakdown */}
          <h2 className="font-bold text-gray-900 mb-3 mt-6">Orders by Status</h2>
          <div className="space-y-2">
            {ordersByStatus.map((s: any) => (
              <div key={s.status} className="flex items-center justify-between">
                <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${STATUS_COLORS[s.status] || 'bg-gray-100 text-gray-600'}`}>{s.status}</span>
                <span className="text-sm font-bold text-gray-700">{s._count.status}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

