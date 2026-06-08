import { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { Calendar, Eye, ChevronRight, ArrowLeft } from 'lucide-react';
import { useBlog } from '../hooks';
import LoadingSpinner from '../components/ui/LoadingSpinner';

function proxyImage(url?: string, w = 800, h = 400) {
  if (!url) return null;
  return `https://wsrv.nl/?url=${encodeURIComponent(url)}&w=${w}&h=${h}&fit=cover&output=jpg`;
}

function BlogFeaturedImage({ src, alt }: { src: string; alt: string }) {
  const [error, setError] = useState(false);
  const proxied = proxyImage(src, 800, 450);
  if (error || !proxied) {
    return (
      <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-primary/10 to-primary/5 min-h-48">
        <span className="text-6xl">📖</span>
      </div>
    );
  }
  return <img src={proxied} alt={alt} className="w-full h-full object-cover" onError={() => setError(true)} />;
}

export default function BlogDetail() {
  const { slug } = useParams<{ slug: string }>();
  const { data, isLoading } = useBlog(slug!);

  if (isLoading) return <LoadingSpinner fullScreen />;
  if (!data) return <div className="text-center py-20 text-gray-500">Blog post not found</div>;

  const { blog, related } = data;

  return (
    <>
      <Helmet>
        <title>{blog.metaTitle || `${blog.title} — HiveNest Blog`}</title>
        <meta name="description" content={blog.metaDesc || blog.excerpt} />
      </Helmet>

      <div className="max-w-4xl mx-auto px-4 py-10">
        {/* Breadcrumb */}
        <nav className="flex items-center gap-2 text-sm text-gray-500 mb-6">
          <Link to="/" className="hover:text-primary">Home</Link>
          <ChevronRight size={14} />
          <Link to="/blog" className="hover:text-primary">Blog</Link>
          <ChevronRight size={14} />
          <span className="text-gray-800 truncate">{blog.title}</span>
        </nav>

        {/* Header */}
        <div className="mb-6">
          <span className="text-sm font-semibold text-primary uppercase tracking-wide bg-primary/10 px-3 py-1 rounded-full">{blog.category?.name}</span>
          <h1 className="text-3xl font-bold text-gray-900 mt-4 mb-3 leading-tight">{blog.title}</h1>
          <div className="flex items-center gap-4 text-sm text-gray-400">
            <span className="flex items-center gap-1.5"><Calendar size={14} />{new Date(blog.publishedAt).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</span>
            <span className="flex items-center gap-1.5"><Eye size={14} />{blog.viewCount} views</span>
            <span>By {blog.author}</span>
          </div>
        </div>

        {/* Featured image */}
        {blog.image && (
          <div className="aspect-video rounded-2xl overflow-hidden mb-8 bg-gray-100">
            <BlogFeaturedImage src={blog.image} alt={blog.title} />
          </div>
        )}

        {/* Content */}
        <article
          className="prose prose-gray max-w-none text-gray-700 leading-relaxed prose-headings:text-gray-900 prose-headings:font-bold prose-a:text-primary"
          dangerouslySetInnerHTML={{ __html: blog.content }}
        />

        {/* Tags */}
        {blog.tags && (
          <div className="flex flex-wrap gap-2 mt-8 pt-6 border-t border-gray-100">
            <span className="text-sm font-medium text-gray-500">Tags:</span>
            {blog.tags.split(',').map((tag: string) => (
              <Link key={tag} to={`/blog?search=${tag.trim()}`} className="px-3 py-1 bg-gray-100 rounded-full text-xs font-medium text-gray-600 hover:bg-primary hover:text-white transition-colors">
                {tag.trim()}
              </Link>
            ))}
          </div>
        )}

        {/* Related */}
        {related?.length > 0 && (
          <section className="mt-12 pt-8 border-t border-gray-100">
            <h2 className="text-xl font-bold text-gray-900 mb-6">Related Articles</h2>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
              {related.map((post: any) => (
                <Link key={post.id} to={`/blog/${post.slug}`} className="group block bg-white border border-gray-100 rounded-xl overflow-hidden hover:shadow-md transition-all">
                  {post.image && (
                    <div className="aspect-video overflow-hidden bg-gray-100">
                      <img
                        src={`https://wsrv.nl/?url=${encodeURIComponent(post.image)}&w=400&h=225&fit=cover&output=jpg`}
                        alt={post.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        onError={(e) => { (e.target as HTMLImageElement).style.display='none'; }}
                      />
                    </div>
                  )}
                  <div className="p-4">
                    <h3 className="font-semibold text-sm text-gray-800 line-clamp-2 group-hover:text-primary transition-colors">{post.title}</h3>
                    <p className="text-xs text-gray-400 mt-1">{new Date(post.publishedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</p>
                  </div>
                </Link>
              ))}
            </div>
          </section>
        )}

        <Link to="/blog" className="inline-flex items-center gap-2 text-sm text-primary font-medium hover:underline mt-8">
          <ArrowLeft size={16} /> Back to Blog
        </Link>
      </div>
    </>
  );
}
