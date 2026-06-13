import { useState } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { Calendar, Eye } from 'lucide-react';
import { motion } from 'framer-motion';
import { useBlogs, useBlogCategories } from '../hooks';
import LoadingSpinner from '../components/ui/LoadingSpinner';

// Simple image component with fallback
function BlogImage({ src, alt, className }: { src?: string; alt: string; className?: string }) {
  const [error, setError] = useState(false);
  if (!src || error) {
    return (
      <div className={`w-full h-full flex items-center justify-center bg-gradient-to-br from-primary/10 to-primary/5 ${className}`}>
        <span className="text-4xl">📖</span>
      </div>
    );
  }
  return <img src={src} alt={alt} className={className} onError={() => setError(true)} loading="lazy" />;
}

export default function BlogPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const category = searchParams.get('category') || '';
  const page = parseInt(searchParams.get('page') || '1');

  const { data, isLoading } = useBlogs({ category: category || undefined, page, limit: 9 });
  const { data: categories } = useBlogCategories();
  const blogs = data?.data || [];
  const pagination = data?.pagination;

  return (
    <>
      <Helmet><title>HiveNest</title></Helmet>
      <div className="max-w-7xl mx-auto px-4 py-10">
        {/* Header */}
        <div className="text-center mb-10">
          <p className="text-sm font-semibold text-primary uppercase tracking-wide mb-2">Our Blog</p>
          <h1 className="text-3xl font-bold text-gray-900">Fashion & Lifestyle</h1>
          <p className="text-gray-500 mt-2">Style guides, product reviews and fashion tips</p>
        </div>

        <div className="flex flex-col lg:flex-row gap-8">
          {/* Sidebar */}
          <aside className="lg:w-56 flex-shrink-0">
            <div className="bg-white border border-gray-100 rounded-2xl p-5 sticky top-24">
              <h3 className="font-bold text-gray-900 mb-3">Categories</h3>
              <button onClick={() => setSearchParams({})} className={`block w-full text-left px-3 py-2 rounded-lg text-sm mb-1 transition-colors ${!category ? 'bg-primary text-white' : 'hover:bg-gray-100 text-gray-600'}`}>
                All Posts {pagination && <span className="opacity-60">({pagination.total})</span>}
              </button>
              {categories?.map((cat: any) => (
                <button key={cat.id} onClick={() => setSearchParams({ category: cat.slug })}
                  className={`block w-full text-left px-3 py-2 rounded-lg text-sm mb-1 transition-colors ${category === cat.slug ? 'bg-primary text-white' : 'hover:bg-gray-100 text-gray-600'}`}>
                  {cat.name} <span className="opacity-60">({cat._count?.blogs})</span>
                </button>
              ))}
            </div>
          </aside>

          {/* Grid */}
          <div className="flex-1">
            {isLoading ? <LoadingSpinner /> : blogs.length === 0 ? (
              <div className="text-center py-20 text-gray-400"><p className="text-lg">No blog posts found</p></div>
            ) : (
              <motion.div initial="hidden" animate="visible" variants={{ visible: { transition: { staggerChildren: 0.05 } } }} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {blogs.map((blog: any) => (
                  <motion.div key={blog.id} variants={{ hidden: { opacity: 0, y: 15 }, visible: { opacity: 1, y: 0 } }}>
                    <Link to={`/blog/${blog.slug}`} className="group block bg-white border border-gray-100 rounded-2xl overflow-hidden hover:shadow-lg transition-all">
                      <div className="aspect-video bg-gray-100 overflow-hidden">
                        <BlogImage src={blog.image} alt={blog.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                      </div>
                      <div className="p-5">
                        <span className="text-xs text-primary font-semibold uppercase tracking-wide">{blog.category?.name}</span>
                        <h2 className="font-bold text-gray-900 mt-1 mb-2 line-clamp-2 group-hover:text-primary transition-colors leading-snug">{blog.title}</h2>
                        {blog.excerpt && <p className="text-sm text-gray-500 line-clamp-2 mb-3">{blog.excerpt}</p>}
                        <div className="flex items-center gap-3 text-xs text-gray-400">
                          <span className="flex items-center gap-1"><Calendar size={12} />{new Date(blog.publishedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                          <span className="flex items-center gap-1"><Eye size={12} />{blog.viewCount}</span>
                        </div>
                      </div>
                    </Link>
                  </motion.div>
                ))}
              </motion.div>
            )}

            {/* Pagination */}
            {pagination && pagination.totalPages > 1 && (
              <div className="flex justify-center gap-2 mt-10">
                {Array.from({ length: pagination.totalPages }).map((_, i) => (
                  <button key={i} onClick={() => setSearchParams({ ...(category ? { category } : {}), page: String(i + 1) })}
                    className={`w-10 h-10 rounded-lg text-sm font-medium transition-colors ${page === i + 1 ? 'bg-primary text-white' : 'border border-gray-200 hover:border-primary'}`}>
                    {i + 1}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
