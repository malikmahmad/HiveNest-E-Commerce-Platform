import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, ShoppingBag, Star, Truck, Shield, RefreshCw, Headphones, Plus, Calendar, Eye } from 'lucide-react';
import { motion } from 'framer-motion';
import { Helmet } from 'react-helmet-async';
import { useHomeData, useBlogs } from '../hooks';
import ProductCard from '../components/features/products/ProductCard';
import LoadingSpinner from '../components/ui/LoadingSpinner';

const HERO_SLIDES = [
  {
    title: 'Discover Premium Fashion',
    subtitle: 'New Collection 2026',
    description: 'Explore our curated collection of premium clothing, jewelry, and accessories.',
    cta: 'Shop Now',
    href: '/products',
    bg: 'from-pink-50 to-rose-100',
    accent: 'text-primary',
    img: 'https://images.unsplash.com/photo-1483985988355-763728e1935b?w=600&q=80',
  },
  {
    title: 'Flash Sale — Up to 50% Off',
    subtitle: 'Limited Time Offer',
    description: 'Grab the best deals on selected products. Sale ends soon!',
    cta: 'View Deals',
    href: '/products?flashSale=true',
    bg: 'from-orange-50 to-amber-100',
    accent: 'text-orange-500',
    img: 'https://images.unsplash.com/photo-1558769132-cb1aea458c5e?w=600&q=80',
  },
  {
    title: 'Jewelry & Accessories',
    subtitle: 'Shine Brighter',
    description: 'Explore our exclusive collection of necklaces, rings, and earrings.',
    cta: 'Explore Jewelry',
    href: '/category/jewelry',
    bg: 'from-purple-50 to-violet-100',
    accent: 'text-purple-500',
    img: 'https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?w=600&q=80',
  },
];

const FEATURES = [
  { icon: Truck, title: 'Free Delivery', desc: 'On orders over $100' },
  { icon: Shield, title: 'Secure Payment', desc: '100% safe & protected' },
  { icon: RefreshCw, title: 'Easy Returns', desc: '30-day return policy' },
  { icon: Headphones, title: '24/7 Support', desc: 'Dedicated customer service' },
];

const CATEGORIES = [
  { name: 'Clothes',   slug: 'clothes',   emoji: '👗', bg: 'bg-blue-50',   border: 'border-blue-100',   count: '200+' },
  { name: 'Footwear',  slug: 'footwear',  emoji: '👟', bg: 'bg-green-50',  border: 'border-green-100',  count: '150+' },
  { name: 'Jewelry',   slug: 'jewelry',   emoji: '💍', bg: 'bg-yellow-50', border: 'border-yellow-100', count: '100+' },
  { name: 'Perfume',   slug: 'perfume',   emoji: '🌸', bg: 'bg-pink-50',   border: 'border-pink-100',   count: '80+' },
  { name: 'Cosmetics', slug: 'cosmetics', emoji: '💄', bg: 'bg-purple-50', border: 'border-purple-100', count: '120+' },
  { name: 'Glasses',   slug: 'glasses',   emoji: '🕶️', bg: 'bg-cyan-50',   border: 'border-cyan-100',   count: '60+' },
  { name: 'Bags',      slug: 'bags',      emoji: '👜', bg: 'bg-orange-50', border: 'border-orange-100', count: '90+' },
  { name: 'Watches',   slug: 'watches',   emoji: '⌚', bg: 'bg-gray-50',   border: 'border-gray-100',   count: '50+' },
];

function CountdownTimer({ endDate }: { endDate: string }) {
  const [time, setTime] = useState({ days: 0, hours: 0, mins: 0, secs: 0 });
  useEffect(() => {
    const tick = () => {
      const diff = new Date(endDate).getTime() - Date.now();
      if (diff <= 0) return;
      setTime({
        days: Math.floor(diff / 86400000),
        hours: Math.floor((diff % 86400000) / 3600000),
        mins: Math.floor((diff % 3600000) / 60000),
        secs: Math.floor((diff % 60000) / 1000),
      });
    };
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [endDate]);

  return (
    <div className="flex gap-2">
      {[['Days', time.days], ['Hrs', time.hours], ['Min', time.mins], ['Sec', time.secs]].map(([label, val]) => (
        <div key={label} className="bg-gray-900 text-white rounded-lg px-3 py-2 text-center min-w-[52px]">
          <p className="text-xl font-bold leading-none">{String(val).padStart(2, '0')}</p>
          <p className="text-xs text-gray-400 mt-0.5">{label}</p>
        </div>
      ))}
    </div>
  );
}

function SectionHeader({ title, subtitle, href }: { title: string; subtitle?: string; href?: string }) {
  return (
    <div className="flex items-end justify-between mb-6">
      <div>
        <p className="text-sm font-medium text-primary mb-1">{subtitle}</p>
        <h2 className="text-2xl font-bold text-gray-900">{title}</h2>
      </div>
      {href && (
        <Link to={href} className="flex items-center gap-1.5 text-sm font-medium text-primary hover:underline">
          View All <ArrowRight size={16} />
        </Link>
      )}
    </div>
  );
}

function RightSidebar() {
  const { data: blogData } = useBlogs({ limit: 4 } as any);
  const blogs = blogData?.data?.slice(0, 4) || [];

  return (
    <aside className="w-72 flex-shrink-0 space-y-6">

      {/* Category Panel */}
      <div className="bg-white border border-gray-100 rounded-2xl overflow-hidden shadow-sm">
        <div className="px-5 py-4 border-b border-gray-100">
          <h3 className="font-bold text-gray-900 text-base uppercase tracking-wide">Category</h3>
        </div>
        <ul className="divide-y divide-gray-50">
          {CATEGORIES.map((cat) => (
            <li key={cat.slug}>
              <Link
                to={`/category/${cat.slug}`}
                className="flex items-center gap-3 px-5 py-3.5 hover:bg-primary/5 transition-colors group"
              >
                <div className={`w-10 h-10 ${cat.bg} border ${cat.border} rounded-xl flex items-center justify-center flex-shrink-0`}>
                  <span className="text-xl">{cat.emoji}</span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-gray-700 group-hover:text-primary transition-colors">
                    {cat.name}
                  </p>
                  <p className="text-xs text-gray-400">{cat.count} products</p>
                </div>
                <Plus size={16} className="text-gray-300 group-hover:text-primary transition-colors flex-shrink-0" />
              </Link>
            </li>
          ))}
        </ul>
        <div className="px-5 py-3 border-t border-gray-50">
          <Link to="/products" className="text-xs font-semibold text-primary hover:underline flex items-center gap-1">
            View All Categories <ArrowRight size={12} />
          </Link>
        </div>
      </div>

      {/* Blog Panel */}
      <div className="bg-white border border-gray-100 rounded-2xl overflow-hidden shadow-sm">
        <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
          <h3 className="font-bold text-gray-900 text-base uppercase tracking-wide">Latest Blog</h3>
          <Link to="/blog" className="text-xs text-primary font-semibold hover:underline flex items-center gap-0.5">
            View All <ArrowRight size={11} />
          </Link>
        </div>
        <div className="divide-y divide-gray-50">
          {blogs.length === 0 ? (
            <div className="px-5 py-6 text-center text-gray-400 text-sm">Loading...</div>
          ) : blogs.map((blog: any) => (
            <Link
              key={blog.id}
              to={`/blog/${blog.slug}`}
              className="flex gap-3 px-5 py-4 hover:bg-primary/5 transition-colors group"
            >
              <div className="w-16 h-14 rounded-xl overflow-hidden flex-shrink-0 bg-gray-100">
                {blog.image ? (
                  <img
                    src={blog.image}
                    alt={blog.title}
                    className="w-full h-full object-cover"
                    onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-xl">📖</div>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-medium text-primary mb-0.5">{blog.category?.name}</p>
                <h4 className="text-xs font-semibold text-gray-800 line-clamp-2 leading-snug group-hover:text-primary transition-colors">
                  {blog.title}
                </h4>
                <div className="flex items-center gap-2 mt-1.5 text-xs text-gray-400">
                  <Calendar size={10} />
                  <span>{new Date(blog.publishedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</span>
                  <Eye size={10} />
                  <span>{blog.viewCount}</span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>

    </aside>
  );
}

export default function HomePage() {
  const { data, isLoading } = useHomeData();
  const [slide, setSlide] = useState(0);

  useEffect(() => {
    const id = setInterval(() => setSlide((s) => (s + 1) % HERO_SLIDES.length), 5000);
    return () => clearInterval(id);
  }, []);

  if (isLoading) return <LoadingSpinner fullScreen />;

  const { featured = [], bestSellers = [], newArrivals = [], trending = [], flashSale = [] } = data || {};

  return (
    <>
      <Helmet>
        <title>HiveNest - Premium E-Commerce Website</title>
        <meta name="description" content="Shop premium fashion, jewelry, perfume and accessories at HiveNest. Free shipping on orders over $100." />
      </Helmet>

      {/* Hero Slider */}
      <section className="relative overflow-hidden">
        <div className="relative">
          {HERO_SLIDES.map((s, i) => (
            <motion.div
              key={i}
              initial={false}
              animate={{ opacity: slide === i ? 1 : 0, x: slide === i ? 0 : slide > i ? '-100%' : '100%' }}
              transition={{ duration: 0.5 }}
              className={`${slide === i ? 'relative' : 'absolute inset-0'} bg-gradient-to-r ${s.bg}`}
            >
              <div className="max-w-7xl mx-auto px-4 py-16 md:py-24 flex flex-col md:flex-row items-center gap-10">
                <div className="flex-1 text-center md:text-left">
                  <motion.p initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className={`text-sm font-semibold uppercase tracking-widest ${s.accent} mb-3`}>{s.subtitle}</motion.p>
                  <motion.h1 initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="text-4xl md:text-5xl font-bold text-gray-900 leading-tight mb-4">{s.title}</motion.h1>
                  <motion.p initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="text-gray-600 mb-8 max-w-md mx-auto md:mx-0">{s.description}</motion.p>
                  <Link to={s.href} className="inline-flex items-center gap-2 bg-primary text-white px-8 py-3.5 rounded-xl font-semibold hover:bg-primary-dark transition-colors shadow-lg shadow-primary/30">
                    <ShoppingBag size={18} /> {s.cta}
                  </Link>
                </div>
                <div className="flex-1 flex justify-center">
                  <img src={s.img} alt={s.title} className="w-full max-w-sm rounded-2xl shadow-2xl object-cover aspect-square" />
                </div>
              </div>
            </motion.div>
          ))}
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
            {HERO_SLIDES.map((_, i) => (
              <button key={i} onClick={() => setSlide(i)} className={`w-2 h-2 rounded-full transition-all ${slide === i ? 'bg-primary w-6' : 'bg-gray-300'}`} />
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="border-y border-gray-100 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 py-8 grid grid-cols-2 md:grid-cols-4 gap-6">
          {FEATURES.map(({ icon: Icon, title, desc }) => (
            <div key={title} className="flex items-center gap-3">
              <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center flex-shrink-0">
                <Icon size={22} className="text-primary" />
              </div>
              <div>
                <p className="font-semibold text-sm text-gray-900">{title}</p>
                <p className="text-xs text-gray-500">{desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── MAIN LAYOUT: Left Sidebar + Content ── */}
      <div className="max-w-7xl mx-auto px-4 py-10">
        <div className="flex gap-7 items-start">

          <div className="hidden lg:block">
            <div className="sticky top-24">
              <RightSidebar />
            </div>
          </div>

          <div className="flex-1 min-w-0 space-y-14">

            {/* Flash Sale */}
            {flashSale.length > 0 && (
              <section className="bg-gray-900 rounded-2xl py-10 px-6">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-8 gap-4">
                  <div>
                    <p className="text-primary font-semibold text-sm uppercase tracking-wide mb-1">⚡ Flash Sale</p>
                    <h2 className="text-2xl font-bold text-white">Limited Time Deals</h2>
                  </div>
                  {flashSale[0]?.flashSaleEnd && <CountdownTimer endDate={flashSale[0].flashSaleEnd} />}
                </div>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {flashSale.map((p: any) => <ProductCard key={p.id} product={p} />)}
                </div>
              </section>
            )}

            {/* Featured Products */}
            {featured.length > 0 && (
              <section>
                <SectionHeader title="Featured Products" subtitle="Handpicked For You" href="/products?featured=true" />
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 md:gap-5">
                  {featured.map((p: any) => <ProductCard key={p.id} product={p} />)}
                </div>
              </section>
            )}

            {/* Banner CTA */}
            <section>
              <div className="bg-gradient-to-r from-primary to-primary-dark rounded-3xl overflow-hidden">
                <div className="flex flex-col md:flex-row items-center justify-between px-8 py-10 gap-6">
                  <div className="text-white text-center md:text-left">
                    <p className="text-sm font-medium opacity-80 mb-2">Exclusive Offer</p>
                    <h3 className="text-3xl font-bold mb-2">Get 10% Off Your First Order</h3>
                    <p className="opacity-80">Use code <strong>WELCOME10</strong> at checkout</p>
                  </div>
                  <Link to="/register" className="bg-white text-primary px-8 py-3.5 rounded-xl font-bold hover:shadow-lg transition-all whitespace-nowrap flex-shrink-0">
                    Sign Up & Save
                  </Link>
                </div>
              </div>
            </section>

            {/* Best Sellers */}
            {bestSellers.length > 0 && (
              <section>
                <SectionHeader title="Best Sellers" subtitle="Most Popular" href="/products?bestSeller=true" />
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 md:gap-5">
                  {bestSellers.map((p: any) => <ProductCard key={p.id} product={p} />)}
                </div>
              </section>
            )}

            {/* New Arrivals */}
            {newArrivals.length > 0 && (
              <section className="bg-gray-50 rounded-2xl p-6">
                <SectionHeader title="New Arrivals" subtitle="Fresh In Store" href="/products?newArrival=true" />
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 md:gap-5">
                  {newArrivals.map((p: any) => <ProductCard key={p.id} product={p} />)}
                </div>
              </section>
            )}

            {/* Trending */}
            {trending.length > 0 && (
              <section>
                <SectionHeader title="Trending Now" subtitle="What's Hot" href="/products?trending=true" />
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 md:gap-5">
                  {trending.map((p: any) => <ProductCard key={p.id} product={p} />)}
                </div>
              </section>
            )}

          </div>

        </div>
      </div>

      {/* Testimonials */}
      <section className="bg-primary/5 py-14">
        <div className="max-w-7xl mx-auto px-4">
          <SectionHeader title="What Our Customers Say" subtitle="Reviews" />
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              { name: 'Sarah Ahmed', rating: 5, text: 'Amazing quality products! My jacket arrived quickly and fits perfectly. Will definitely shop again.', location: 'Karachi, Pakistan' },
              { name: 'Ali Hassan', rating: 5, text: 'Best online shopping experience. The jewelry I bought for my wife was exactly as shown. Very happy!', location: 'Lahore, Pakistan' },
              { name: 'Fatima Khan', rating: 5, text: 'Great prices and fast delivery. The customer service team was very helpful when I had a query.', location: 'Islamabad, Pakistan' },
            ].map((t) => (
              <div key={t.name} className="bg-white p-6 rounded-2xl shadow-sm">
                <div className="flex gap-1 mb-3">
                  {Array.from({ length: t.rating }).map((_, i) => <Star key={i} size={16} className="text-yellow-400 fill-yellow-400" />)}
                </div>
                <p className="text-gray-600 text-sm leading-relaxed mb-4">"{t.text}"</p>
                <div>
                  <p className="font-semibold text-gray-900 text-sm">{t.name}</p>
                  <p className="text-xs text-gray-400">{t.location}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}

