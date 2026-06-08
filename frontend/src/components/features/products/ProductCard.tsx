import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Heart, ShoppingBag, Eye, Star } from 'lucide-react';
import { motion } from 'framer-motion';
import { useCart, useWishlist } from '../../../hooks';
import { useAuthStore, useUIStore } from '../../../store';
import type { ProductCard as ProductCardType } from '../../../types';

// Category → emoji + gradient for reliable fallback
const CATEGORY_STYLES: Record<string, { emoji: string; from: string; to: string }> = {
  clothes:   { emoji: '👕', from: '#667eea', to: '#764ba2' },
  footwear:  { emoji: '👟', from: '#f093fb', to: '#f5576c' },
  jewelry:   { emoji: '💍', from: '#ffd700', to: '#ffa500' },
  perfume:   { emoji: '🌸', from: '#a18cd1', to: '#fbc2eb' },
  cosmetics: { emoji: '💄', from: '#ff9a9e', to: '#fecfef' },
  glasses:   { emoji: '🕶️', from: '#4facfe', to: '#00f2fe' },
  bags:      { emoji: '👜', from: '#43e97b', to: '#38f9d7' },
  watches:   { emoji: '⌚', from: '#fa709a', to: '#fee140' },
  default:   { emoji: '🛍️', from: '#ff4785', to: '#ff8c42' },
};

function getCategoryKey(categoryName?: string) {
  if (!categoryName) return 'default';
  return categoryName.toLowerCase();
}

interface Props {
  product: ProductCardType;
  className?: string;
}

export default function ProductCard({ product, className = '' }: Props) {
  const [imgError, setImgError] = useState(false);
  const [imgLoaded, setImgLoaded] = useState(false);
  const { addToCart, isAdding } = useCart();
  const { isWishlisted, toggleWishlist } = useWishlist();
  const { isAuthenticated } = useAuthStore();
  const { openAuthModal } = useUIStore();

  const rawImage = product.images?.[0]?.url;
  // Skip wsrv.nl proxy for local URLs (localhost or relative /uploads paths)
  const isLocalUrl = rawImage && (
    rawImage.includes('localhost') ||
    rawImage.includes('127.0.0.1') ||
    rawImage.startsWith('/uploads') ||
    rawImage.startsWith('/')
  );
  const primaryImage = rawImage
    ? isLocalUrl
      ? rawImage  // use directly — Vite proxies /uploads to backend
      : `https://wsrv.nl/?url=${encodeURIComponent(rawImage)}&w=400&h=400&fit=cover&output=jpg`
    : null;

  const catKey = getCategoryKey(product.category?.name);
  const catStyle = CATEGORY_STYLES[catKey] || CATEGORY_STYLES.default;
  const discount = product.comparePrice
    ? Math.round((1 - Number(product.price) / Number(product.comparePrice)) * 100)
    : product.discount;
  const wished = isWishlisted(product.id);

  const handleAddToCart = async (e: React.MouseEvent) => {
    e.preventDefault();
    if (!isAuthenticated) { openAuthModal('login'); return; }
    await addToCart({ productId: product.id, quantity: 1 });
  };

  const handleWishlist = (e: React.MouseEvent) => {
    e.preventDefault();
    if (!isAuthenticated) { openAuthModal('login'); return; }
    toggleWishlist(product.id);
  };

  const isOutOfStock = product.inventory && product.inventory.stock === 0;

  return (
    <motion.div
      whileHover={{ y: -4 }}
      transition={{ duration: 0.2 }}
      className={`group bg-white rounded-xl border border-gray-100 overflow-hidden hover:shadow-lg transition-all duration-300 ${className}`}
    >
      <Link to={`/products/${product.slug}`} className="block">
        {/* Image */}
        <div className="relative aspect-square overflow-hidden" style={{ background: `linear-gradient(135deg, ${catStyle.from}18, ${catStyle.to}25)` }}>
          {/* Beautiful category fallback — always visible behind image */}
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 select-none"
               style={{ background: `linear-gradient(135deg, ${catStyle.from}22, ${catStyle.to}44)` }}>
            <span className="text-5xl">{catStyle.emoji}</span>
            <span className="text-xs font-semibold text-white/80 bg-black/20 px-2 py-0.5 rounded-full">
              {product.category?.name}
            </span>
          </div>

          {/* Loading shimmer */}
          {!imgLoaded && !imgError && primaryImage && (
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-pulse" />
          )}

          {/* Actual image on top */}
          {primaryImage && !imgError && (
            <img
              src={primaryImage}
              alt={product.name}
              onError={() => setImgError(true)}
              onLoad={() => setImgLoaded(true)}
              loading="lazy"
              className={`absolute inset-0 w-full h-full object-cover transition-all duration-500 group-hover:scale-105 ${imgLoaded ? 'opacity-100' : 'opacity-0'}`}
            />
          )}

          {/* Badges */}
          <div className="absolute top-2 left-2 flex flex-col gap-1.5">
            {discount > 0 && (
              <span className="bg-primary text-white text-xs font-bold px-2 py-0.5 rounded-full">
                -{discount}%
              </span>
            )}
            {product.isNewArrival && (
              <span className="bg-green-500 text-white text-xs font-bold px-2 py-0.5 rounded-full">NEW</span>
            )}
            {product.isFlashSale && (
              <span className="bg-orange-500 text-white text-xs font-bold px-2 py-0.5 rounded-full">SALE</span>
            )}
            {isOutOfStock && (
              <span className="bg-gray-500 text-white text-xs font-bold px-2 py-0.5 rounded-full">OUT OF STOCK</span>
            )}
          </div>

          {/* Actions overlay */}
          <div className="absolute top-2 right-2 flex flex-col gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
            <motion.button
              whileTap={{ scale: 0.9 }}
              onClick={handleWishlist}
              className={`w-9 h-9 rounded-full shadow-md flex items-center justify-center transition-colors ${wished ? 'bg-primary text-white' : 'bg-white hover:bg-primary hover:text-white'}`}
            >
              <Heart size={16} fill={wished ? 'currentColor' : 'none'} />
            </motion.button>
            <Link
              to={`/products/${product.slug}`}
              onClick={(e) => e.stopPropagation()}
              className="w-9 h-9 bg-white rounded-full shadow-md flex items-center justify-center hover:bg-primary hover:text-white transition-colors"
            >
              <Eye size={16} />
            </Link>
          </div>

          {/* Add to cart - bottom */}
          <motion.button
            whileTap={{ scale: 0.98 }}
            onClick={handleAddToCart}
            disabled={isAdding || !!isOutOfStock}
            className="absolute bottom-0 left-0 right-0 bg-gray-900 text-white py-2.5 text-sm font-medium flex items-center justify-center gap-2 translate-y-full group-hover:translate-y-0 transition-transform duration-300 disabled:opacity-60"
          >
            <ShoppingBag size={16} />
            {isOutOfStock ? 'Out of Stock' : isAdding ? 'Adding...' : 'Add to Cart'}
          </motion.button>
        </div>

        {/* Info */}
        <div className="p-3.5">
          {product.category && (
            <p className="text-xs text-primary font-medium uppercase tracking-wide mb-1">{product.category.name}</p>
          )}
          <h3 className="text-sm font-medium text-gray-800 line-clamp-2 mb-2 leading-snug group-hover:text-primary transition-colors">
            {product.name}
          </h3>

          {/* Rating */}
          <div className="flex items-center gap-1.5 mb-2">
            <div className="flex gap-0.5">
              {Array.from({ length: 5 }).map((_, i) => (
                <Star
                  key={i}
                  size={12}
                  className={i < Math.floor(product.avgRating) ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300 fill-gray-300'}
                />
              ))}
            </div>
            <span className="text-xs text-gray-400">({product.totalReviews})</span>
          </div>

          {/* Price */}
          <div className="flex items-center gap-2">
            <span className="text-base font-bold text-primary">${Number(product.price).toFixed(2)}</span>
            {product.comparePrice && (
              <del className="text-sm text-gray-400">${Number(product.comparePrice).toFixed(2)}</del>
            )}
          </div>
        </div>
      </Link>
    </motion.div>
  );
}
