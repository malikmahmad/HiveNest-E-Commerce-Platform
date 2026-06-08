import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { AlertTriangle, Save, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';
import { adminAPI } from '../../services/api';

export default function AdminInventory() {
  const qc = useQueryClient();
  const [editingId, setEditingId] = useState<string | null>(null);
  const [stockValue, setStockValue] = useState<number>(0);

  const { data: inventory = [], isLoading } = useQuery({
    queryKey: ['admin-inventory'],
    queryFn: () => adminAPI.getInventory().then((r) => r.data.data),
  });

  const updateMutation = useMutation({
    mutationFn: ({ productId, stock }: { productId: string; stock: number }) => adminAPI.updateInventory(productId, stock),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['admin-inventory'] }); toast.success('Stock updated'); setEditingId(null); },
    onError: (err: any) => toast.error(err.response?.data?.message || 'Failed'),
  });

  const lowStock = inventory.filter((i: any) => i.stock <= (i.lowStock || 5));

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Inventory</h1>
          {lowStock.length > 0 && (
            <p className="text-sm text-orange-600 flex items-center gap-1.5 mt-1">
              <AlertTriangle size={14} /> {lowStock.length} products with low stock
            </p>
          )}
        </div>
      </div>

      {/* Low stock alert */}
      {lowStock.length > 0 && (
        <div className="bg-orange-50 border border-orange-200 rounded-2xl p-4 mb-6">
          <h3 className="font-semibold text-orange-800 mb-2 flex items-center gap-2"><AlertTriangle size={16} /> Low Stock Alert</h3>
          <div className="flex flex-wrap gap-2">
            {lowStock.map((item: any) => (
              <span key={item.id} className="bg-white border border-orange-200 px-3 py-1.5 rounded-lg text-sm text-orange-700">
                {item.product?.name} — <strong>{item.stock}</strong> left
              </span>
            ))}
          </div>
        </div>
      )}

      <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
        {isLoading ? <div className="flex justify-center py-12"><div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" /></div> : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50">
                <tr>{['Product', 'SKU', 'Current Stock', 'Low Stock Alert', 'Status', 'Action'].map((h) => <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">{h}</th>)}</tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {inventory.map((item: any) => (
                  <tr key={item.id} className={`hover:bg-gray-50 transition-colors ${item.stock <= (item.lowStock || 5) ? 'bg-orange-50/30' : ''}`}>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <img src={item.product?.images?.[0]?.url || '/placeholder.jpg'} alt={item.product?.name} className="w-10 h-10 object-cover rounded-lg flex-shrink-0" />
                        <p className="font-medium text-gray-800 line-clamp-1 max-w-48">{item.product?.name}</p>
                      </div>
                    </td>
                    <td className="px-4 py-3 font-mono text-xs text-gray-500">{item.product?.sku}</td>
                    <td className="px-4 py-3">
                      {editingId === item.productId ? (
                        <input type="number" min={0} value={stockValue} onChange={(e) => setStockValue(parseInt(e.target.value) || 0)}
                          className="w-24 px-3 py-1.5 border border-primary rounded-lg text-sm outline-none focus:ring-1 focus:ring-primary/20" autoFocus />
                      ) : (
                        <span className={`font-bold ${item.stock > 10 ? 'text-green-600' : item.stock > 0 ? 'text-orange-600' : 'text-red-600'}`}>
                          {item.stock}
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-gray-500">{item.lowStock || 5}</td>
                    <td className="px-4 py-3">
                      <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${item.stock > 10 ? 'bg-green-100 text-green-700' : item.stock > 0 ? 'bg-orange-100 text-orange-700' : 'bg-red-100 text-red-700'}`}>
                        {item.stock > 10 ? 'In Stock' : item.stock > 0 ? 'Low Stock' : 'Out of Stock'}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      {editingId === item.productId ? (
                        <div className="flex items-center gap-2">
                          <button onClick={() => updateMutation.mutate({ productId: item.productId, stock: stockValue })} disabled={updateMutation.isPending}
                            className="flex items-center gap-1.5 bg-primary text-white px-3 py-1.5 rounded-lg text-xs font-medium hover:bg-primary-dark transition-colors disabled:opacity-60">
                            {updateMutation.isPending ? <Loader2 size={12} className="animate-spin" /> : <Save size={12} />} Save
                          </button>
                          <button onClick={() => setEditingId(null)} className="px-3 py-1.5 border border-gray-200 rounded-lg text-xs hover:border-gray-300 transition-colors">Cancel</button>
                        </div>
                      ) : (
                        <button onClick={() => { setEditingId(item.productId); setStockValue(item.stock); }}
                          className="px-3 py-1.5 border border-gray-200 rounded-lg text-xs text-blue-600 hover:border-blue-300 hover:bg-blue-50 transition-colors">
                          Update Stock
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
