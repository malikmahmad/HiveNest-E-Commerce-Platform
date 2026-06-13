import { useState, useEffect } from 'react';
import { useSearchParams, useParams } from 'react-router-dom';
import { SlidersHorizontal, ChevronDown, X, Grid3X3, List } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Helmet } from 'react-helmet-async';
import { useProducts } from '../hooks';
import ProductCard from '../components/features/products/ProductCard';
import LoadingSpinner from '../components/ui/LoadingSpinner';

const SORT_OPTIONS = [
  { value: 'newest', label: 'Newest First' },
  { value: 'price-low', label: 'Price: Low to High' },
  { value: 'price-high', label: 'Price: High to Low' },
  { value: 'rating', label: 'Highest Rated' },
  { value: 'popular', label: 'Most Popular' },
];

const PRICE_RANGES = [
  { label: 'Under $25', min: 0, max: 25 },
  { label: '$25 – $50', min: 25, max: 50 },
  { label: '$50 – $100', min: 50, max: 100 },
  { label: '$100 – $200', min: 100, max: 200 },
  { label: 'Over $200', min: 200, max: undefined },
];

export default function ProductsPage() {
  const { slug: categorySlug } = useParams();
  const [searchParams, setSearchParams] = useSearchParams();
  const [filtersOpen, setFiltersOpen] = useState(false);

  const page = parseInt(searchParams.get('page') || '1');
  const sort = searchParams.get('sort') || 'newest';
  const search = searchParams.get('search') || '';
  const minPrice = searchParams.get('minPrice') ? parseFloat(searchParams.get('minPrice')!) : undefined;
  const maxPrice = searchParams.get('maxPrice') ? parseFloat(searchParams.get('maxPrice')!) : undefined;
  const featured = searchParams.get('featured') === 'true';
  const newArrival = searchParams.get('newArrival') === 'true';
  const bestSeller = searchParams.get('bestSeller') === 'true';
  const trending = searchParams.get('trending') === 'true';
  const flashSale = searchParams.get('flashSale') === 'true';

  const filters = {
    page, sort, search, minPrice, maxPrice,
    ...(categorySlug ? { category: categorySlug } : {}),
    ...(featured ? { featured: true } : {}),
    ...(newArrival ? { newArrival: true } : {}),
    ...(bestSeller ? { bestSeller: true } : {}),
    ...(trending ? { trending: true } : {}),
    ...(flashSale ? { flashSale: true } : {}),
    limit: 12,
  };

  const { data, isLoading, isFetching } = useProducts(filters);
  const products = data?.data || [];
  const pagination = data?.pagination;

  const updateParam = (key: string, value: string | undefined) => {
    const next = new URLSearchParams(searchParams);
    if (value) next.set(key, value); else next.delete(key);
    next.delete('page');
    setSearchParams(next);
  };

  const pageTitle = categorySlug
    ? `${categorySlug.charAt(0).toUpperCase() + categorySlug.slice(1)} — HiveNest`
    : search ? `Search: "${search}" — HiveNest` : 'All Products — HiveNest';

  return (
    <>
      <Helmet>
        <title>HiveNest</title>
        <meta name="description" content="Shop premium products at HiveNest." />
      </Helmet>

      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Page header */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900">
            {categorySlug ? categorySlug.charAt(0).toUpperCase() + categorySlug.slice(1)
              : search ? `Results for "${search}"`
              : flashSale ? '🔥 Flash Sale'
              : featured ? 'Featured Products'
              : 'All Products'}
          </h1>
          {pagination && <p className="text-sm text-gray-500 mt-1">{pagination.total} products found</p>}
        </div>

        <div className="flex gap-6">
          {/* Sidebar filters */}
          <aside className={`${filtersOpen ? 'fixed inset-0 z-50 bg-white overflow-y-auto p-6 md:relative md:inset-auto md:z-auto md:bg-transparent md:p-0' : 'hidden md:block'} w-full md:w-56 flex-shrink-0`}>
            <div className="flex items-center justify-between mb-5 md:hidden">
              <h2 className="font-bold text-lg">Filters</h2>
              <button onClick={() => setFiltersOpen(false)}><X size={20} /></button>
            </div>

            {/* Price Range */}
            <div className="mb-6">
              <h3 className="font-semibold text-sm text-gray-900 mb-3">Price Range</h3>
              <div className="space-y-2">
                {PRICE_RANGES.map((range) => {
                  const active = minPrice === range.min && maxPrice === range.max;
                  return (
                    <button
                      key={range.label}
                      onClick={() => {
                        if (active) { updateParam('minPrice', undefined); updateParam('maxPrice', undefined); }
                        else { updateParam('minPrice', range.min.toString()); updateParam('maxPrice', range.max?.toString()); }
                      }}
                      className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${active ? 'bg-primary text-white' : 'hover:bg-gray-100 text-gray-600'}`}
                    >
                      {range.label}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Special Filters */}
            <div className="mb-6">
              <h3 className="font-semibold text-sm text-gray-900 mb-3">Filter By</h3>
              <div className="space-y-2">
                {[
                  { key: 'featured', label: '⭐ Featured', value: featured },
                  { key: 'newArrival', label: '🆕 New Arrivals', value: newArrival },
                  { key: 'bestSeller', label: '🏆 Best Sellers', value: bestSeller },
                  { key: 'trending', label: '🔥 Trending', value: trending },
                  { key: 'flashSale', label: '⚡ Flash Sale', value: flashSale },
                ].map(({ key, label, value }) => (
                  <button
                    key={key}
                    onClick={() => updateParam(key, value ? undefined : 'true')}
                    className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${value ? 'bg-primary text-white' : 'hover:bg-gray-100 text-gray-600'}`}
                  >
                    {label}
                  </button>
                ))}
              </div>
            </div>

            {/* Active filters clear */}
            {(minPrice || maxPrice || featured || newArrival || bestSeller || trending || flashSale || search) && (
              <button
                onClick={() => setSearchParams({})}
                className="w-full text-sm text-red-500 border border-red-200 rounded-lg py-2 hover:bg-red-50 transition-colors"
              >
                Clear All Filters
              </button>
            )}
          </aside>

          {/* Main content */}
          <div className="flex-1 min-w-0">
            {/* Toolbar */}
            <div className="flex items-center justify-between mb-5 gap-3">
              <button
                onClick={() => setFiltersOpen(true)}
                className="md:hidden flex items-center gap-2 border border-gray-200 rounded-lg px-3 py-2 text-sm"
              >
                <SlidersHorizontal size={16} /> Filters
              </button>

              <div className="flex items-center gap-2 ml-auto">
                <span className="text-sm text-gray-500 hidden sm:block">Sort by:</span>
                <select
                  value={sort}
                  onChange={(e) => updateParam('sort', e.target.value)}
                  className="border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-primary"
                >
                  {SORT_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
                </select>
              </div>
            </div>

            {/* Products grid */}
            {isLoading ? (
              <LoadingSpinner />
            ) : products.length === 0 ? (
              <div className="text-center py-20 text-gray-400">
                <p className="text-5xl mb-4">🔍</p>
                <p className="text-lg font-medium">No products found</p>
                <p className="text-sm mt-1">Try adjusting your filters</p>
              </div>
            ) : (
              <motion.div
                initial="hidden"
                animate="visible"
                variants={{ visible: { transition: { staggerChildren: 0.04 } } }}
                className={`grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 ${isFetching ? 'opacity-60' : ''}`}
              >
                {products.map((product: any) => (
                  <motion.div
                    key={product.id}
                    variants={{ hidden: { opacity: 0, y: 15 }, visible: { opacity: 1, y: 0 } }}
                  >
                    <ProductCard product={product} />
                  </motion.div>
                ))}
              </motion.div>
            )}

            {/* Pagination */}
            {pagination && pagination.totalPages > 1 && (
              <div className="flex items-center justify-center gap-2 mt-10 flex-wrap">
                {/* Previous */}
                <button
                  onClick={() => {
                    const next = new URLSearchParams(searchParams);
                    next.set('page', String(page - 1));
                    setSearchParams(next);
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                  }}
                  disabled={!pagination.hasPrev}
                  className="px-4 py-2 border border-gray-200 rounded-lg text-sm font-medium disabled:opacity-40 disabled:cursor-not-allowed hover:border-primary hover:text-primary transition-colors"
                >
                  Previous
                </button>

                {/* Page numbers */}
                {(() => {
                  const total = pagination.totalPages;
                  const current = page;
                  const pages: (number | '...')[] = [];

                  if (total <= 7) {
                    for (let i = 1; i <= total; i++) pages.push(i);
                  } else {
                    pages.push(1);
                    if (current > 3) pages.push('...');
                    for (let i = Math.max(2, current - 1); i <= Math.min(total - 1, current + 1); i++) pages.push(i);
                    if (current < total - 2) pages.push('...');
                    pages.push(total);
                  }

                  return pages.map((p, i) =>
                    p === '...' ? (
                      <span key={`dot-${i}`} className="w-10 h-10 flex items-center justify-center text-gray-400 text-sm">…</span>
                    ) : (
                      <button
                        key={p}
                        onClick={() => {
                          const next = new URLSearchParams(searchParams);
                          next.set('page', String(p));
                          setSearchParams(next);
                          window.scrollTo({ top: 0, behavior: 'smooth' });
                        }}
                        className={`w-10 h-10 rounded-lg text-sm font-semibold transition-colors ${
                          page === p
                            ? 'bg-primary text-white shadow-md shadow-primary/30'
                            : 'border border-gray-200 text-gray-600 hover:border-primary hover:text-primary'
                        }`}
                      >
                        {p}
                      </button>
                    )
                  );
                })()}

                {/* Next */}
                <button
                  onClick={() => {
                    const next = new URLSearchParams(searchParams);
                    next.set('page', String(page + 1));
                    setSearchParams(next);
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                  }}
                  disabled={!pagination.hasNext}
                  className="px-4 py-2 border border-gray-200 rounded-lg text-sm font-medium disabled:opacity-40 disabled:cursor-not-allowed hover:border-primary hover:text-primary transition-colors"
                >
                  Next
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
