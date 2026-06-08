import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Plus, Trash2, Edit2, Eye, EyeOff, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';
import { adminAPI } from '../../services/api';

const EMPTY = { categoryId: '', title: '', excerpt: '', content: '', author: 'HiveNest Team', tags: '', image: '', isPublished: true };

export default function AdminBlogs() {
  const qc = useQueryClient();
  const [form, setForm] = useState<any>(EMPTY);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<string | null>(null);
  const [page, setPage] = useState(1);

  const { data, isLoading } = useQuery({
    queryKey: ['admin-blogs', page],
    queryFn: () => adminAPI.getBlogs({ page, limit: 15 }).then((r) => r.data),
  });

  const { data: cats } = useQuery({
    queryKey: ['blog-categories'],
    queryFn: () => fetch('/api/v1/blogs/categories').then((r) => r.json()).then((r) => r.data),
  });

  const createMutation = useMutation({
    mutationFn: (data: object) => editing ? adminAPI.updateBlog(editing, data) : adminAPI.createBlog(data),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['admin-blogs'] }); toast.success(editing ? 'Updated' : 'Created'); setShowForm(false); setForm(EMPTY); setEditing(null); },
    onError: (err: any) => toast.error(err.response?.data?.message || 'Failed'),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => adminAPI.deleteBlog(id),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['admin-blogs'] }); toast.success('Deleted'); },
  });

  const blogs = data?.data || [];
  const pagination = data?.pagination;

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Blog Posts</h1>
        <button onClick={() => { setShowForm(!showForm); setEditing(null); setForm(EMPTY); }}
          className="bg-primary text-white px-4 py-2.5 rounded-xl text-sm font-medium flex items-center gap-2 hover:bg-primary-dark transition-colors">
          <Plus size={16} /> New Post
        </button>
      </div>

      {showForm && (
        <div className="bg-white border border-gray-100 rounded-2xl p-6 mb-6">
          <h2 className="font-bold text-gray-900 mb-4">{editing ? 'Edit Post' : 'New Blog Post'}</h2>
          <form onSubmit={(e) => { e.preventDefault(); createMutation.mutate(form); }} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Category *</label>
                <select required value={form.categoryId} onChange={(e) => setForm({ ...form, categoryId: e.target.value })}
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm outline-none focus:border-primary">
                  <option value="">Select category</option>
                  {cats?.map((c: any) => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Author</label>
                <input type="text" value={form.author} onChange={(e) => setForm({ ...form, author: e.target.value })}
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm outline-none focus:border-primary" />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Title *</label>
              <input type="text" required value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })}
                className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm outline-none focus:border-primary" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Excerpt</label>
              <input type="text" value={form.excerpt} onChange={(e) => setForm({ ...form, excerpt: e.target.value })} placeholder="Short description..."
                className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm outline-none focus:border-primary" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Content * (HTML supported)</label>
              <textarea required rows={8} value={form.content} onChange={(e) => setForm({ ...form, content: e.target.value })}
                className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm outline-none focus:border-primary font-mono resize-none" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Image URL</label>
                <input type="url" value={form.image} onChange={(e) => setForm({ ...form, image: e.target.value })} placeholder="https://..."
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm outline-none focus:border-primary" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Tags (comma separated)</label>
                <input type="text" value={form.tags} onChange={(e) => setForm({ ...form, tags: e.target.value })} placeholder="fashion,style,tips"
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm outline-none focus:border-primary" />
              </div>
            </div>
            <div className="flex items-center gap-3">
              <label className="flex items-center gap-2 text-sm cursor-pointer">
                <input type="checkbox" checked={form.isPublished} onChange={(e) => setForm({ ...form, isPublished: e.target.checked })} className="accent-primary w-4 h-4" />
                Publish immediately
              </label>
            </div>
            <div className="flex gap-3">
              <button type="submit" disabled={createMutation.isPending}
                className="bg-primary text-white px-6 py-2.5 rounded-xl text-sm font-medium flex items-center gap-2 hover:bg-primary-dark transition-colors disabled:opacity-60">
                {createMutation.isPending && <Loader2 size={14} className="animate-spin" />} {editing ? 'Update' : 'Publish'}
              </button>
              <button type="button" onClick={() => { setShowForm(false); setEditing(null); }}
                className="px-6 py-2.5 border border-gray-200 rounded-xl text-sm hover:border-gray-300 transition-colors">Cancel</button>
            </div>
          </form>
        </div>
      )}

      <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
        {isLoading ? <div className="flex justify-center py-12"><div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" /></div> : (
          <table className="w-full text-sm">
            <thead className="bg-gray-50"><tr>{['Post', 'Category', 'Author', 'Views', 'Status', 'Date', 'Actions'].map((h) => <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">{h}</th>)}</tr></thead>
            <tbody className="divide-y divide-gray-100">
              {blogs.map((blog: any) => (
                <tr key={blog.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      {blog.image && <img src={blog.image} alt="" className="w-10 h-10 object-cover rounded-lg flex-shrink-0" />}
                      <p className="font-medium text-gray-800 line-clamp-1 max-w-48">{blog.title}</p>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-gray-600">{blog.category?.name}</td>
                  <td className="px-4 py-3 text-gray-600">{blog.author}</td>
                  <td className="px-4 py-3 text-gray-500">{blog.viewCount}</td>
                  <td className="px-4 py-3"><span className={`px-2 py-1 rounded-full text-xs font-medium ${blog.isPublished ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>{blog.isPublished ? 'Published' : 'Draft'}</span></td>
                  <td className="px-4 py-3 text-gray-500 text-xs">{new Date(blog.createdAt).toLocaleDateString()}</td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <button onClick={() => { setForm({ categoryId: blog.categoryId, title: blog.title, excerpt: blog.excerpt || '', content: blog.content, author: blog.author, tags: blog.tags || '', image: blog.image || '', isPublished: blog.isPublished }); setEditing(blog.id); setShowForm(true); }}
                        className="p-1.5 text-blue-500 hover:bg-blue-50 rounded-lg transition-colors"><Edit2 size={15} /></button>
                      <button onClick={() => { if (confirm('Delete post?')) deleteMutation.mutate(blog.id); }}
                        className="p-1.5 text-red-500 hover:bg-red-50 rounded-lg transition-colors"><Trash2 size={15} /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
        {pagination && pagination.totalPages > 1 && (
          <div className="flex justify-center gap-2 p-4 border-t border-gray-100">
            {Array.from({ length: Math.min(pagination.totalPages, 7) }).map((_, i) => (
              <button key={i} onClick={() => setPage(i + 1)} className={`w-9 h-9 rounded-lg text-sm font-medium transition-colors ${page === i + 1 ? 'bg-primary text-white' : 'border border-gray-200 hover:border-primary'}`}>{i + 1}</button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
