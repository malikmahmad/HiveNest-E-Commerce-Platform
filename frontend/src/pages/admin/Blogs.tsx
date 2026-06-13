import { useState, useRef } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Plus, Trash2, Edit2, Loader2, Upload, ImageIcon, X } from 'lucide-react';
import toast from 'react-hot-toast';
import { adminAPI } from '../../services/api';

const EMPTY = { categoryId: '', title: '', excerpt: '', content: '', author: 'HiveNest Team', tags: '', image: '', isPublished: true };

export default function AdminBlogs() {
  const qc = useQueryClient();
  const [form, setForm] = useState<any>(EMPTY);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

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

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const res = await adminAPI.uploadImage(file);
      setForm((prev: any) => ({ ...prev, image: res.data.data.url }));
      setImgError(false);
      toast.success('Image uploaded!');
    } catch {
      toast.error('Image upload failed');
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const [imgError, setImgError] = useState(false);

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
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Blog Image</label>
                {/* Hidden file input */}
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleImageUpload}
                />
                <div className="flex gap-3 items-start">
                  <div className="flex-1">
                    {/* Upload drop zone button */}
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
                    {/* URL paste fallback */}
                    <input
                      type="text"
                      value={form.image}
                      onChange={(e) => { setImgError(false); setForm({ ...form, image: e.target.value }); }}
                      placeholder="Or paste image URL directly"
                      className="mt-2 w-full px-3 py-2 border border-gray-200 rounded-lg text-xs outline-none focus:border-primary text-gray-500"
                    />
                  </div>
                  {/* Preview */}
                  {form.image ? (
                    <div className="relative flex-shrink-0">
                      {imgError ? (
                        <div className="w-24 h-24 bg-gray-100 rounded-xl border border-gray-200 flex flex-col items-center justify-center gap-1">
                          <ImageIcon size={20} className="text-gray-400" />
                          <span className="text-[10px] text-gray-400 text-center px-1">Can't preview</span>
                        </div>
                      ) : (
                        <img
                          key={form.image}
                          src={form.image}
                          alt="preview"
                          className="w-24 h-24 object-cover rounded-xl border border-gray-200"
                          onError={() => setImgError(true)}
                        />
                      )}
                      <button
                        type="button"
                        onClick={() => { setForm({ ...form, image: '' }); setImgError(false); }}
                        className="absolute -top-2 -right-2 w-5 h-5 bg-red-500 text-white rounded-full flex items-center justify-center hover:bg-red-600"
                      ><X size={10} /></button>
                    </div>
                  ) : (
                    <div className="w-24 h-24 flex-shrink-0 bg-gray-100 rounded-xl flex items-center justify-center">
                      <ImageIcon size={28} className="text-gray-300" />
                    </div>
                  )}
                </div>
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

