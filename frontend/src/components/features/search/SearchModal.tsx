import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { Search, X, TrendingUp, Clock } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useUIStore } from '../../../store';
import { useSearch } from '../../../hooks';

const TRENDING = ['Winter Jacket', 'Women\'s Shoes', 'Gold Watch', 'Perfume', 'Earrings'];

export default function SearchModal() {
  const { closeSearch } = useUIStore();
  const [query, setQuery] = useState('');
  const [debouncedQ, setDebouncedQ] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);
  const [recentSearches, setRecentSearches] = useState<string[]>(() => {
    try { return JSON.parse(localStorage.getItem('hn_searches') || '[]'); } catch { return []; }
  });

  const { data: results, isLoading } = useSearch(debouncedQ);

  useEffect(() => {
    const t = setTimeout(() => setDebouncedQ(query), 300);
    return () => clearTimeout(t);
  }, [query]);

  useEffect(() => { inputRef.current?.focus(); }, []);

  const addRecent = (q: string) => {
    const updated = [q, ...recentSearches.filter((s) => s !== q)].slice(0, 5);
    setRecentSearches(updated);
    localStorage.setItem('hn_searches', JSON.stringify(updated));
  };

  const handleSelect = (term: string) => {
    addRecent(term);
    closeSearch();
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/60 z-50 flex items-start justify-center pt-20 px-4"
        onClick={closeSearch}
      >
        <motion.div
          initial={{ opacity: 0, y: -20, scale: 0.97 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -20 }}
          onClick={(e) => e.stopPropagation()}
          className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl overflow-hidden"
        >
          {/* Search input */}
          <div className="flex items-center gap-3 px-5 py-4 border-b border-gray-100">
            <Search size={20} className="text-gray-400 flex-shrink-0" />
            <input
              ref={inputRef}
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search products, brands, categories..."
              className="flex-1 text-base outline-none text-gray-800 placeholder-gray-400"
            />
            {query && (
              <button onClick={() => setQuery('')} className="text-gray-400 hover:text-gray-600">
                <X size={18} />
              </button>
            )}
            <button onClick={closeSearch} className="text-sm text-gray-500 hover:text-gray-700 pl-3 border-l border-gray-200">
              Cancel
            </button>
          </div>

          {/* Results */}
          <div className="max-h-96 overflow-y-auto">
            {isLoading && (
              <div className="flex justify-center py-8">
                <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
              </div>
            )}

            {/* Product results */}
            {results && results.length > 0 && (
              <div className="py-2">
                <p className="px-5 py-2 text-xs font-semibold text-gray-400 uppercase tracking-wide">Products</p>
                {results.map((product: any) => (
                  <Link
                    key={product.id}
                    to={`/products/${product.slug}`}
                    onClick={() => handleSelect(product.name)}
                    className="flex items-center gap-3 px-5 py-3 hover:bg-gray-50 transition-colors"
                  >
                    <img
                      src={product.images?.[0]?.url || '/placeholder.jpg'}
                      alt={product.name}
                      className="w-12 h-12 object-cover rounded-lg"
                    />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-800 truncate">{product.name}</p>
                      <p className="text-xs text-gray-500">{product.category?.name}</p>
                    </div>
                    <p className="text-sm font-bold text-primary">${Number(product.price).toFixed(2)}</p>
                  </Link>
                ))}
                <Link
                  to={`/products?search=${encodeURIComponent(debouncedQ)}`}
                  onClick={() => { handleSelect(debouncedQ); }}
                  className="block px-5 py-3 text-sm text-primary font-medium hover:bg-primary-50 transition-colors border-t border-gray-100 text-center"
                >
                  View all results for "{debouncedQ}" →
                </Link>
              </div>
            )}

            {results && results.length === 0 && debouncedQ && (
              <div className="py-10 text-center text-gray-400">
                <Search size={40} className="mx-auto mb-3 opacity-30" />
                <p>No results for "{debouncedQ}"</p>
                <p className="text-sm mt-1">Try different keywords</p>
              </div>
            )}

            {/* Recent searches */}
            {!query && recentSearches.length > 0 && (
              <div className="py-2">
                <p className="px-5 py-2 text-xs font-semibold text-gray-400 uppercase tracking-wide flex items-center gap-1.5">
                  <Clock size={12} /> Recent
                </p>
                {recentSearches.map((s) => (
                  <Link
                    key={s}
                    to={`/products?search=${encodeURIComponent(s)}`}
                    onClick={() => handleSelect(s)}
                    className="flex items-center gap-3 px-5 py-2.5 hover:bg-gray-50 text-sm text-gray-600 transition-colors"
                  >
                    <Clock size={14} className="text-gray-300" /> {s}
                  </Link>
                ))}
              </div>
            )}

            {/* Trending */}
            {!query && (
              <div className="py-2 border-t border-gray-100">
                <p className="px-5 py-2 text-xs font-semibold text-gray-400 uppercase tracking-wide flex items-center gap-1.5">
                  <TrendingUp size={12} /> Trending
                </p>
                <div className="flex flex-wrap gap-2 px-5 pb-4">
                  {TRENDING.map((t) => (
                    <Link
                      key={t}
                      to={`/products?search=${encodeURIComponent(t)}`}
                      onClick={() => handleSelect(t)}
                      className="px-3 py-1.5 bg-gray-100 hover:bg-primary hover:text-white text-sm rounded-full transition-colors text-gray-600"
                    >
                      {t}
                    </Link>
                  ))}
                </div>
              </div>
            )}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
