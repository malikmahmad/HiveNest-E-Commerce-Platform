import { useState, useRef } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Plus, Edit2, Trash2, Search, X, Loader2, Upload, ImageIcon } from 'lucide-react';
import toast from 'react-hot-toast';
import { adminAPI, productAPI } from '../../services/api';

const EMPTY_FORM = {
  name: '', description: '', shortDesc: '', brand: '', sku: '',
  price: '', comparePrice: '', stock: '0', categoryId: '',
  imageUrl: '',
  isFeatured: false, isNewArrival: false, isBestSeller: false,
  isTrending: false, isFlashSale: false, isActive: true,
};

export default function AdminProducts() {
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [showModal, setShowModal] = useState(false);
  const [editProduct, setEditProduct] = useState<any>(null);
  const [form, setForm] = useState({ ...EMPTY_FORM });
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const qc = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ['admin-products', search, page],
    queryFn: () => productAPI.getAll({ search: search || undefined, page, limit: 20 }).then((r) => r.data),
  });

  const { data: catData } = useQuery({
    queryKey: ['admin-categories'],
    queryFn: () => adminAPI.getCategories().then((r) => r.data.data),
  });
  const categories = catData || [];

  const createMutation = useMutation({
    mutationFn: (data: object) => adminAPI.createProduct(data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admin-products'] });
      toast.success('Product created!');
      closeModal();
    },
    onError: (err: any) => toast.error(err.response?.data?.message || 'Failed to create product'),
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: object }) => adminAPI.updateProduct(id, data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admin-products'] });
      toast.success('Product updated!');
      closeModal();
    },
    onError: (err: any) => toast.error(err.response?.data?.message || 'Failed to update product'),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => adminAPI.deleteProduct(id),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['admin-products'] }); toast.success('Product deleted'); },
    onError: (err: any) => toast.error(err.response?.data?.message || 'Delete failed'),
  });

  const openAdd = () => {
    setEditProduct(null);
    setForm({ ...EMPTY_FORM });
    setShowModal(true);
  };

  const openEdit = (p: any) => {
    setEditProduct(p);
    setForm({
      name: p.name || '',
      description: p.description || '',
      shortDesc: p.shortDesc || '',
      brand: p.brand || '',
      sku: p.sku || '',
      price: String(p.price || ''),
      comparePrice: String(p.comparePrice || ''),
      stock: String(p.inventory?.stock ?? 0),
      categoryId: p.categoryId || '',
      imageUrl: p.images?.[0]?.url || '',
      isFeatured: p.isFeatured || false,
      isNewArrival: p.isNewArrival || false,
      isBestSeller: p.isBestSeller || false,
      isTrending: p.isTrending || false,
      isFlashSale: p.isFlashSale || false,
      isActive: p.isActive ?? true,
    });
    setShowModal(true);
  };

  const closeModal = () => { setShowModal(false); setEditProduct(null); setForm({ ...EMPTY_FORM }); };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name || !form.price || !form.categoryId || !form.sku || !form.description) {
      toast.error('Please fill all required fields');
      return;
    }
    const payload = {
      ...form,
      price: parseFloat(form.price),
      comparePrice: form.comparePrice ? parseFloat(form.comparePrice) : undefined,
      stock: parseInt(form.stock) || 0,
    };
    if (editProduct) {
      updateMutation.mutate({ id: editProduct.id, data: payload });
    } else {
      createMutation.mutate(payload);
    }
  };

  const f = (key: keyof typeof form, val: any) => setForm((prev) => ({ ...prev, [key]: val }));

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const res = await adminAPI.uploadImage(file);
      f('imageUrl', res.data.data.url);
      toast.success('Image uploaded!');
    } catch {
      toast.error('Image upload failed');
    } finally {
      setUploading(false);
    }
  };

  const products = data?.data || [];
  const pagination = data?.pagination;
  const isPending = createMutation.isPending || updateMutation.isPending;

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Products</h1>
        <button onClick={openAdd} className="bg-primary text-white px-4 py-2.5 rounded-xl text-sm font-medium flex items-center gap-2 hover:bg-primary-dark transition-colors">
          <Plus size={16} /> Add Product
        </button>
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
        <div className="p-4 border-b border-gray-100">
          <div className="relative">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input type="text" value={search} onChange={(e) => { setSearch(e.target.value); setPage(1); }}
              placeholder="Search products..."
              className="w-full pl-9 pr-4 py-2.5 border border-gray-200 rounded-xl text-sm outline-none focus:border-primary transition-colors" />
          </div>
        </div>

        {isLoading ? (
          <div className="flex justify-center py-12"><div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" /></div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50">
                <tr>
                  {['Product', 'Category', 'Price', 'Stock', 'Status', 'Actions'].map((h) => (
                    <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {products.length === 0 && (
                  <tr><td colSpan={6} className="text-center py-12 text-gray-400">No products found</td></tr>
                )}
                {products.map((p: any) => (
                  <tr key={p.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <img src={p.images?.[0]?.url || '/placeholder.jpg'} alt={p.name} className="w-10 h-10 object-cover rounded-lg flex-shrink-0" />
                        <div>
                          <p className="font-medium text-gray-800 line-clamp-1">{p.name}</p>
                          <p className="text-xs text-gray-400 font-mono">{p.sku}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-gray-600">{p.category?.name}</td>
                    <td className="px-4 py-3">
                      <p className="font-semibold text-primary">${Number(p.price).toFixed(2)}</p>
                      {p.comparePrice && <p className="text-xs text-gray-400 line-through">${Number(p.comparePrice).toFixed(2)}</p>}
                    </td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        (p.inventory?.stock ?? 0) > 10 ? 'bg-green-100 text-green-700'
                        : (p.inventory?.stock ?? 0) > 0 ? 'bg-yellow-100 text-yellow-700'
                        : 'bg-red-100 text-red-700'}`}>
                        {p.inventory?.stock ?? 0} units
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${p.isActive ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                        {p.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1.5">
                        <button onClick={() => openEdit(p)} className="p-1.5 text-blue-500 hover:bg-blue-50 rounded-lg transition-colors" title="Edit"><Edit2 size={15} /></button>
                        <button onClick={() => { if (window.confirm(`Delete "${p.name}"?`)) deleteMutation.mutate(p.id); }}
                          className="p-1.5 text-red-500 hover:bg-red-50 rounded-lg transition-colors" title="Delete"><Trash2 size={15} /></button>
                      </div>
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

      {/* Add / Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" onClick={closeModal}>
          <div className="absolute inset-0 bg-black/50" />
          <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between p-5 border-b border-gray-100 sticky top-0 bg-white z-10">
              <h2 className="font-bold text-lg">{editProduct ? 'Edit Product' : 'Add New Product'}</h2>
              <button onClick={closeModal} className="p-1.5 hover:bg-gray-100 rounded-lg"><X size={18} /></button>
            </div>

            <form onSubmit={handleSubmit} className="p-5 space-y-4">
              {/* Basic Info */}
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2">
                  <label className="block text-xs font-semibold text-gray-600 mb-1.5">Product Name *</label>
                  <input value={form.name} onChange={(e) => f('name', e.target.value)} required
                    className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm outline-none focus:border-primary" placeholder="e.g. Hooded Winter Jacket" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1.5">SKU *</label>
                  <input value={form.sku} onChange={(e) => f('sku', e.target.value)} required
                    className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm outline-none focus:border-primary" placeholder="e.g. HN-001" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1.5">Brand</label>
                  <input value={form.brand} onChange={(e) => f('brand', e.target.value)}
                    className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm outline-none focus:border-primary" placeholder="e.g. Nike" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1.5">Price ($) *</label>
                  <input type="number" step="0.01" min="0" value={form.price} onChange={(e) => f('price', e.target.value)} required
                    className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm outline-none focus:border-primary" placeholder="0.00" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1.5">Compare Price ($)</label>
                  <input type="number" step="0.01" min="0" value={form.comparePrice} onChange={(e) => f('comparePrice', e.target.value)}
                    className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm outline-none focus:border-primary" placeholder="Original price (optional)" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1.5">Category *</label>
                  <select value={form.categoryId} onChange={(e) => f('categoryId', e.target.value)} required
                    className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm outline-none focus:border-primary bg-white">
                    <option value="">Select category</option>
                    {categories.map((c: any) => <option key={c.id} value={c.id}>{c.name}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1.5">Stock</label>
                  <input type="number" min="0" value={form.stock} onChange={(e) => f('stock', e.target.value)}
                    className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm outline-none focus:border-primary" placeholder="0" />
                </div>
                <div className="col-span-2">
                  <label className="block text-xs font-semibold text-gray-600 mb-1.5">Description *</label>
                  <textarea value={form.description} onChange={(e) => f('description', e.target.value)} required rows={3}
                    className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm outline-none focus:border-primary resize-none" placeholder="Product description..." />
                </div>
                <div className="col-span-2">
                  <label className="block text-xs font-semibold text-gray-600 mb-1.5">Short Description</label>
                  <input value={form.shortDesc} onChange={(e) => f('shortDesc', e.target.value)}
                    className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm outline-none focus:border-primary" placeholder="Brief summary (optional)" />
                </div>

                {/* Image Upload */}
                <div className="col-span-2">
                  <label className="block text-xs font-semibold text-gray-600 mb-1.5">Product Image</label>
                  <div className="flex gap-3 items-start">
                    {/* Upload button */}
                    <div className="flex-1">
                      <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={handleImageUpload}
                      />
                      <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        disabled={uploading}
                        className="w-full border-2 border-dashed border-gray-300 hover:border-primary rounded-xl py-4 flex flex-col items-center gap-2 transition-colors disabled:opacity-50 cursor-pointer hover:bg-primary/5"
                      >
                        {uploading ? (
                          <><Loader2 size={22} className="animate-spin text-primary" /><span className="text-xs text-gray-500">Uploading...</span></>
                        ) : (
                          <><Upload size={22} className="text-gray-400" /><span className="text-xs text-gray-500">Click to upload image</span><span className="text-xs text-gray-400">JPG, PNG, WebP — max 5MB</span></>
                        )}
                      </button>
                      {/* Also allow URL paste */}
                      <input
                        type="text"
                        value={form.imageUrl}
                        onChange={(e) => f('imageUrl', e.target.value)}
                        placeholder="Or paste image URL directly"
                        className="mt-2 w-full px-3 py-2 border border-gray-200 rounded-lg text-xs outline-none focus:border-primary text-gray-500"
                      />
                    </div>
                    {/* Preview */}
                    {form.imageUrl ? (
                      <div className="relative flex-shrink-0">
                        <img
                          src={form.imageUrl}
                          alt="preview"
                          className="w-24 h-24 object-cover rounded-xl border border-gray-200"
                          onError={(e) => { (e.target as HTMLImageElement).src = '/placeholder.jpg'; }}
                        />
                        <button
                          type="button"
                          onClick={() => f('imageUrl', '')}
                          className="absolute -top-2 -right-2 w-5 h-5 bg-red-500 text-white rounded-full flex items-center justify-center text-xs hover:bg-red-600"
                        >×</button>
                      </div>
                    ) : (
                      <div className="w-24 h-24 flex-shrink-0 bg-gray-100 rounded-xl flex items-center justify-center">
                        <ImageIcon size={28} className="text-gray-300" />
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Flags */}
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-2">Product Tags</label>
                <div className="flex flex-wrap gap-3">
                  {[
                    { key: 'isFeatured', label: '⭐ Featured' },
                    { key: 'isNewArrival', label: '🆕 New Arrival' },
                    { key: 'isBestSeller', label: '🔥 Best Seller' },
                    { key: 'isTrending', label: '📈 Trending' },
                    { key: 'isFlashSale', label: '⚡ Flash Sale' },
                    { key: 'isActive', label: '✅ Active' },
                  ].map(({ key, label }) => (
                    <label key={key} className="flex items-center gap-2 cursor-pointer select-none">
                      <input type="checkbox" checked={(form as any)[key]} onChange={(e) => f(key as any, e.target.checked)}
                        className="accent-primary w-4 h-4" />
                      <span className="text-sm text-gray-700">{label}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-3 pt-2 border-t border-gray-100">
                <button type="button" onClick={closeModal}
                  className="flex-1 border border-gray-200 text-gray-700 py-2.5 rounded-xl text-sm font-medium hover:bg-gray-50 transition-colors">
                  Cancel
                </button>
                <button type="submit" disabled={isPending}
                  className="flex-1 bg-primary text-white py-2.5 rounded-xl text-sm font-medium hover:bg-primary-dark transition-colors disabled:opacity-60 flex items-center justify-center gap-2">
                  {isPending ? <><Loader2 size={16} className="animate-spin" /> Saving...</> : editProduct ? 'Update Product' : 'Create Product'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

