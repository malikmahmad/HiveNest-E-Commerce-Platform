import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Plus, Trash2, Loader2, Tag, Copy } from 'lucide-react';
import toast from 'react-hot-toast';
import { adminAPI } from '../../services/api';

const EMPTY_FORM = { code: '', description: '', type: 'PERCENTAGE', value: '', minOrder: '', maxDiscount: '', usageLimit: '', expiresAt: '', isActive: true };

export default function AdminCoupons() {
  const qc = useQueryClient();
  const [form, setForm] = useState<any>(EMPTY_FORM);
  const [showForm, setShowForm] = useState(false);

  const { data: coupons = [], isLoading } = useQuery({
    queryKey: ['admin-coupons'],
    queryFn: () => adminAPI.getCoupons().then((r) => r.data.data),
  });

  const createMutation = useMutation({
    mutationFn: (data: object) => adminAPI.createCoupon(data),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['admin-coupons'] }); toast.success('Coupon created'); setShowForm(false); setForm(EMPTY_FORM); },
    onError: (err: any) => toast.error(err.response?.data?.message || 'Failed'),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => adminAPI.deleteCoupon(id),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['admin-coupons'] }); toast.success('Deleted'); },
  });

  const toggleMutation = useMutation({
    mutationFn: ({ id, isActive }: { id: string; isActive: boolean }) => adminAPI.updateCoupon(id, { isActive }),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['admin-coupons'] }); toast.success('Updated'); },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const payload = {
      code: form.code.toUpperCase(),
      description: form.description || undefined,
      type: form.type,
      value: parseFloat(form.value),
      minOrder: form.minOrder ? parseFloat(form.minOrder) : undefined,
      maxDiscount: form.maxDiscount ? parseFloat(form.maxDiscount) : undefined,
      usageLimit: form.usageLimit ? parseInt(form.usageLimit) : undefined,
      expiresAt: form.expiresAt ? new Date(form.expiresAt).toISOString() : undefined,
      isActive: form.isActive,
    };
    createMutation.mutate(payload);
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Coupons</h1>
        <button onClick={() => setShowForm(!showForm)} className="bg-primary text-white px-4 py-2.5 rounded-xl text-sm font-medium flex items-center gap-2 hover:bg-primary-dark transition-colors">
          <Plus size={16} /> New Coupon
        </button>
      </div>

      {showForm && (
        <div className="bg-white border border-gray-100 rounded-2xl p-6 mb-6">
          <h2 className="font-bold text-gray-900 mb-4">Create Coupon</h2>
          <form onSubmit={handleSubmit} className="grid grid-cols-2 gap-4">
            {[
              { key: 'code', label: 'Code *', placeholder: 'SAVE20', col: 1 },
              { key: 'description', label: 'Description', placeholder: 'Optional description', col: 1 },
              { key: 'value', label: 'Value *', type: 'number', placeholder: '10', col: 1 },
              { key: 'minOrder', label: 'Min Order ($)', type: 'number', placeholder: '50', col: 1 },
              { key: 'maxDiscount', label: 'Max Discount ($)', type: 'number', placeholder: '25', col: 1 },
              { key: 'usageLimit', label: 'Usage Limit', type: 'number', placeholder: '100', col: 1 },
              { key: 'expiresAt', label: 'Expires At', type: 'date', col: 1 },
            ].map(({ key, label, placeholder, type = 'text', col }) => (
              <div key={key} className={col === 2 ? 'col-span-2' : ''}>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">{label}</label>
                <input type={type} value={form[key]} onChange={(e) => setForm({ ...form, [key]: e.target.value })} placeholder={placeholder}
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm outline-none focus:border-primary transition-colors" />
              </div>
            ))}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Type</label>
              <select value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })} className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm outline-none focus:border-primary">
                <option value="PERCENTAGE">Percentage (%)</option>
                <option value="FIXED">Fixed Amount ($)</option>
              </select>
            </div>
            <div className="col-span-2 flex gap-3">
              <button type="submit" disabled={createMutation.isPending} className="bg-primary text-white px-6 py-2.5 rounded-xl text-sm font-medium flex items-center gap-2 hover:bg-primary-dark transition-colors disabled:opacity-60">
                {createMutation.isPending && <Loader2 size={14} className="animate-spin" />} Create Coupon
              </button>
              <button type="button" onClick={() => setShowForm(false)} className="px-6 py-2.5 border border-gray-200 rounded-xl text-sm hover:border-gray-300 transition-colors">Cancel</button>
            </div>
          </form>
        </div>
      )}

      {isLoading ? <div className="flex justify-center py-12"><div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" /></div> : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {coupons.map((coupon: any) => (
            <div key={coupon.id} className="bg-white border border-gray-100 rounded-2xl p-5">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <Tag size={16} className="text-primary" />
                  <code className="font-bold text-gray-900 text-sm tracking-wider bg-gray-100 px-2 py-1 rounded-lg">{coupon.code}</code>
                  <button onClick={() => { navigator.clipboard.writeText(coupon.code); toast.success('Copied!'); }}><Copy size={12} className="text-gray-400 hover:text-primary transition-colors" /></button>
                </div>
                <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${coupon.isActive && (!coupon.expiresAt || new Date(coupon.expiresAt) > new Date()) ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                  {coupon.isActive ? 'Active' : 'Inactive'}
                </span>
              </div>
              <p className="text-sm text-gray-500 mb-3">{coupon.description || 'No description'}</p>
              <div className="space-y-1.5 text-xs text-gray-500 mb-4">
                <p>Discount: <strong className="text-gray-800">{coupon.type === 'PERCENTAGE' ? `${coupon.value}%` : `$${coupon.value}`}</strong></p>
                {coupon.minOrder && <p>Min order: <strong className="text-gray-800">${coupon.minOrder}</strong></p>}
                {coupon.maxDiscount && <p>Max discount: <strong className="text-gray-800">${coupon.maxDiscount}</strong></p>}
                <p>Used: <strong className="text-gray-800">{coupon.usedCount}{coupon.usageLimit ? ` / ${coupon.usageLimit}` : ''}</strong></p>
                {coupon.expiresAt && <p>Expires: <strong className="text-gray-800">{new Date(coupon.expiresAt).toLocaleDateString()}</strong></p>}
              </div>
              <div className="flex gap-2">
                <button onClick={() => toggleMutation.mutate({ id: coupon.id, isActive: !coupon.isActive })}
                  className={`flex-1 py-2 rounded-lg text-xs font-medium transition-colors ${coupon.isActive ? 'bg-red-50 text-red-500 hover:bg-red-100' : 'bg-green-50 text-green-600 hover:bg-green-100'}`}>
                  {coupon.isActive ? 'Deactivate' : 'Activate'}
                </button>
                <button onClick={() => { if (confirm('Delete this coupon?')) deleteMutation.mutate(coupon.id); }}
                  className="flex-1 py-2 border border-red-100 text-red-500 rounded-lg text-xs font-medium hover:bg-red-50 transition-colors flex items-center justify-center gap-1">
                  <Trash2 size={12} /> Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
