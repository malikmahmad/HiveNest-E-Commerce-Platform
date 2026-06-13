import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Plus, Trash2, Edit2, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';
import { adminAPI } from '../../services/api';

export default function AdminCategories() {
  const qc = useQueryClient();
  const [form, setForm] = useState({ name: '', description: '', icon: '', isActive: true, sortOrder: 0 });
  const [editing, setEditing] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);

  const { data: categories = [], isLoading } = useQuery({
    queryKey: ['admin-categories'],
    queryFn: () => adminAPI.getCategories().then((r) => r.data.data),
  });

  const createMutation = useMutation({
    mutationFn: (data: object) => adminAPI.createCategory(data),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['admin-categories'] }); toast.success('Category created'); setShowForm(false); setForm({ name: '', description: '', icon: '', isActive: true, sortOrder: 0 }); },
    onError: (err: any) => toast.error(err.response?.data?.message || 'Failed'),
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: object }) => adminAPI.updateCategory(id, data),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['admin-categories'] }); toast.success('Updated'); setEditing(null); },
    onError: (err: any) => toast.error(err.response?.data?.message || 'Failed'),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => adminAPI.deleteCategory(id),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['admin-categories'] }); toast.success('Deleted'); },
    onError: (err: any) => toast.error(err.response?.data?.message || 'Failed'),
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editing) updateMutation.mutate({ id: editing, data: form });
    else createMutation.mutate(form);
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Categories</h1>
        <button onClick={() => { setShowForm(!showForm); setEditing(null); setForm({ name: '', description: '', icon: '', isActive: true, sortOrder: 0 }); }}
          className="bg-primary text-white px-4 py-2.5 rounded-xl text-sm font-medium flex items-center gap-2 hover:bg-primary-dark transition-colors">
          <Plus size={16} /> Add Category
        </button>
      </div>

      {showForm && (
        <div className="bg-white border border-gray-100 rounded-2xl p-6 mb-6">
          <h2 className="font-bold text-gray-900 mb-4">{editing ? 'Edit Category' : 'New Category'}</h2>
          <form onSubmit={handleSubmit} className="grid grid-cols-2 gap-4">
            <div className="col-span-2 sm:col-span-1">
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Name *</label>
              <input type="text" required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })}
                className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm outline-none focus:border-primary transition-colors" />
            </div>
            <div className="col-span-2 sm:col-span-1">
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Icon (emoji/class)</label>
              <input type="text" value={form.icon} onChange={(e) => setForm({ ...form, icon: e.target.value })} placeholder="👕"
                className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm outline-none focus:border-primary transition-colors" />
            </div>
            <div className="col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Description</label>
              <input type="text" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })}
                className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm outline-none focus:border-primary transition-colors" />
            </div>
            <div className="col-span-2 flex gap-3">
              <button type="submit" disabled={createMutation.isPending || updateMutation.isPending}
                className="bg-primary text-white px-6 py-2.5 rounded-xl text-sm font-medium flex items-center gap-2 hover:bg-primary-dark transition-colors disabled:opacity-60">
                {(createMutation.isPending || updateMutation.isPending) && <Loader2 size={14} className="animate-spin" />}
                {editing ? 'Update' : 'Create'}
              </button>
              <button type="button" onClick={() => { setShowForm(false); setEditing(null); }}
                className="px-6 py-2.5 border border-gray-200 rounded-xl text-sm hover:border-gray-300 transition-colors">Cancel</button>
            </div>
          </form>
        </div>
      )}

      {isLoading ? <div className="flex justify-center py-12"><div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" /></div> : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {categories.map((cat: any) => (
            <div key={cat.id} className="bg-white border border-gray-100 rounded-2xl p-5">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-3">
                  <span className="text-2xl">{cat.icon || '📦'}</span>
                  <div>
                    <p className="font-bold text-gray-900">{cat.name}</p>
                    <p className="text-xs text-gray-400">/{cat.slug}</p>
                  </div>
                </div>
                <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${cat.isActive ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                  {cat.isActive ? 'Active' : 'Hidden'}
                </span>
              </div>
              {cat.description && <p className="text-sm text-gray-500 mb-3 line-clamp-2">{cat.description}</p>}
              <p className="text-xs text-gray-400 mb-3">{cat._count?.products || 0} products · {cat.subCategories?.length || 0} subcategories</p>
              <div className="flex gap-2">
                <button onClick={() => { setForm({ name: cat.name, description: cat.description || '', icon: cat.icon || '', isActive: cat.isActive, sortOrder: cat.sortOrder }); setEditing(cat.id); setShowForm(true); }}
                  className="flex-1 flex items-center justify-center gap-1.5 py-2 border border-gray-200 rounded-lg text-sm text-blue-600 hover:border-blue-300 hover:bg-blue-50 transition-colors">
                  <Edit2 size={14} /> Edit
                </button>
                <button onClick={() => { if (confirm('Delete category?')) deleteMutation.mutate(cat.id); }}
                  className="flex-1 flex items-center justify-center gap-1.5 py-2 border border-gray-200 rounded-lg text-sm text-red-500 hover:border-red-200 hover:bg-red-50 transition-colors">
                  <Trash2 size={14} /> Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

