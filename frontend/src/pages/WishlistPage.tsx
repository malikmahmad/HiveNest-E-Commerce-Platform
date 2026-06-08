// WishlistPage.tsx
import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { Heart } from 'lucide-react';
import { useWishlistStore } from '../store';
import { useCart, useWishlist } from '../hooks';
import ProductCard from '../components/features/products/ProductCard';

export default function WishlistPage() {
  const { items } = useWishlistStore();

  return (
    <>
      <Helmet><title>My Wishlist — HiveNest</title></Helmet>
      <div className="max-w-7xl mx-auto px-4 py-10">
        <h1 className="text-2xl font-bold text-gray-900 mb-8 flex items-center gap-3">
          <Heart size={26} className="text-primary" /> My Wishlist
          {items.length > 0 && <span className="bg-primary text-white text-sm px-3 py-0.5 rounded-full">{items.length}</span>}
        </h1>
        {items.length === 0 ? (
          <div className="text-center py-24">
            <Heart size={80} strokeWidth={1} className="mx-auto text-gray-200 mb-5" />
            <h2 className="text-xl font-semibold text-gray-700 mb-2">Your wishlist is empty</h2>
            <p className="text-gray-400 mb-6">Save items you love for later.</p>
            <Link to="/products" className="inline-block bg-primary text-white px-8 py-3 rounded-xl font-medium hover:bg-primary-dark transition-colors">Browse Products</Link>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-5">
            {items.map((item) => <ProductCard key={item.id} product={item.product as any} />)}
          </div>
        )}
      </div>
    </>
  );
}
