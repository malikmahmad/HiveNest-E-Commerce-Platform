import { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { Star, Heart, ShoppingBag, ChevronRight, Minus, Plus, Truck, Shield, RefreshCw, Share2, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useProduct, useCart, useWishlist, useReviews, useAddReview } from '../hooks';
import { useAuthStore, useUIStore } from '../store';
import ProductCard from '../components/features/products/ProductCard';
import LoadingSpinner from '../components/ui/LoadingSpinner';

export default function ProductDetail() {
  const { slug } = useParams<{ slug: string }>();
  const { data, isLoading } = useProduct(slug!);
  const { addToCart, isAdding } = useCart();
  const { isWishlisted, toggleWishlist } = useWishlist();
  const { isAuthenticated } = useAuthStore();
  const { openAuthModal } = useUIStore();

  const [selectedImg, setSelectedImg] = useState(0);
  const [qty, setQty] = useState(1);
  const [selectedVariant, setSelectedVariant] = useState<string | undefined>();
  const [activeTab, setActiveTab] = useState<'desc' | 'reviews'>('desc');
  const [reviewForm, setReviewForm] = useState({ rating: 5, title: '', comment: '' });

  const { data: reviewsData } = useReviews(data?.product?.id || '', 1);
  const addReview = useAddReview();

  if (isLoading) return <LoadingSpinner fullScreen />;
  if (!data) return <div className="text-center py-20 text-gray-500">Product not found</div>;

  const { product, related } = data;
  const wished = isWishlisted(product.id);
  const stock = product.inventory?.stock ?? 0;
  const isOutOfStock = stock === 0;
  const discount = product.comparePrice
    ? Math.round((1 - product.price / product.comparePrice) * 100)
    : product.discount;

  const handleAddToCart = async () => {
    if (!isAuthenticated) { openAuthModal('login'); return; }
    await addToCart({ productId: product.id, variantId: selectedVariant, quantity: qty });
  };

  const handleWishlist = () => {
    if (!isAuthenticated) { openAuthModal('login'); return; }
    toggleWishlist(product.id);
  };

  const handleReviewSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isAuthenticated) { openAuthModal('login'); return; }
    await addReview.mutateAsync({ productId: product.id, ...reviewForm });
    setReviewForm({ rating: 5, title: '', comment: '' });
  };

  return (
    <>
      <Helmet>
        <title>{product.metaTitle || `${product.name} — HiveNest`}</title>
        <meta name="description" content={product.metaDesc || product.shortDesc || product.description.slice(0, 160)} />
      </Helmet>

      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Breadcrumb */}
        <nav className="flex items-center gap-2 text-sm text-gray-500 mb-6">
          <Link to="/" className="hover:text-primary transition-colors">Home</Link>
          <ChevronRight size={14} />
          <Link to={`/category/${product.category.slug}`} className="hover:text-primary transition-colors capitalize">{product.category.name}</Link>
          <ChevronRight size={14} />
          <span className="text-gray-800 font-medium truncate">{product.name}</span>
        </nav>

        {/* Main product section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 mb-16">
          {/* Images */}
          <div>
            <div className="relative aspect-square rounded-2xl overflow-hidden bg-gray-50 mb-3">
              <AnimatePresence mode="wait">
                <motion.img
                  key={selectedImg}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  src={product.images?.[selectedImg]?.url || '/placeholder.jpg'}
                  alt={product.name}
                  className="w-full h-full object-cover"
                />
              </AnimatePresence>
              {discount > 0 && (
                <span className="absolute top-4 left-4 bg-primary text-white px-3 py-1 rounded-full text-sm font-bold">
                  -{discount}%
                </span>
              )}
            </div>
            {product.images?.length > 1 && (
              <div className="flex gap-2 overflow-x-auto pb-1">
                {product.images.map((img, i) => (
                  <button
                    key={img.id}
                    onClick={() => setSelectedImg(i)}
                    className={`flex-shrink-0 w-16 h-16 rounded-lg overflow-hidden border-2 transition-colors ${selectedImg === i ? 'border-primary' : 'border-transparent'}`}
                  >
                    <img src={img.url} alt="" className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Info */}
          <div>
            <p className="text-sm text-primary font-semibold uppercase tracking-wide mb-2">{product.category.name}</p>
            <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-3">{product.name}</h1>

            {/* Rating */}
            <div className="flex items-center gap-3 mb-4">
              <div className="flex gap-0.5">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star key={i} size={18} className={i < Math.round(product.avgRating) ? 'text-yellow-400 fill-yellow-400' : 'text-gray-200 fill-gray-200'} />
                ))}
              </div>
              <span className="text-sm text-gray-600">{product.avgRating.toFixed(1)} ({product.totalReviews} reviews)</span>
              <span className="text-sm text-gray-400">·</span>
              <span className="text-sm text-green-600 font-medium">{product.totalSold}+ sold</span>
            </div>

            {/* Price */}
            <div className="flex items-center gap-3 mb-5">
              <span className="text-3xl font-bold text-primary">${Number(product.price).toFixed(2)}</span>
              {product.comparePrice && <del className="text-lg text-gray-400">${Number(product.comparePrice).toFixed(2)}</del>}
              {discount > 0 && <span className="bg-green-100 text-green-700 text-sm font-semibold px-2 py-0.5 rounded-full">Save {discount}%</span>}
            </div>

            {/* Short description */}
            {product.shortDesc && <p className="text-gray-600 text-sm leading-relaxed mb-5">{product.shortDesc}</p>}

            {/* Variants */}
            {product.variants?.length > 0 && (
              <div className="mb-5">
                <p className="text-sm font-semibold text-gray-700 mb-2">
                  {product.variants[0].name}: <span className="text-primary">{selectedVariant ? product.variants.find(v => v.id === selectedVariant)?.value : 'Select'}</span>
                </p>
                <div className="flex flex-wrap gap-2">
                  {product.variants.map((v) => (
                    <button
                      key={v.id}
                      onClick={() => setSelectedVariant(v.id === selectedVariant ? undefined : v.id)}
                      disabled={v.stock === 0}
                      className={`px-4 py-2 rounded-lg border text-sm font-medium transition-all ${v.id === selectedVariant ? 'border-primary bg-primary text-white' : 'border-gray-200 hover:border-primary'} ${v.stock === 0 ? 'opacity-40 cursor-not-allowed line-through' : ''}`}
                    >
                      {v.value}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Stock */}
            <div className="mb-5">
              {isOutOfStock ? (
                <span className="text-red-500 text-sm font-medium">Out of Stock</span>
              ) : stock < 10 ? (
                <span className="text-orange-500 text-sm font-medium">Only {stock} left!</span>
              ) : (
                <span className="text-green-600 text-sm font-medium">✓ In Stock</span>
              )}
            </div>

            {/* Quantity */}
            <div className="flex items-center gap-4 mb-6">
              <p className="text-sm font-semibold text-gray-700">Quantity:</p>
              <div className="flex items-center gap-2">
                <button onClick={() => setQty(Math.max(1, qty - 1))} className="w-9 h-9 rounded-lg border border-gray-200 flex items-center justify-center hover:border-primary transition-colors">
                  <Minus size={14} />
                </button>
                <span className="w-10 text-center font-semibold text-lg">{qty}</span>
                <button onClick={() => setQty(Math.min(stock, qty + 1))} disabled={isOutOfStock} className="w-9 h-9 rounded-lg border border-gray-200 flex items-center justify-center hover:border-primary transition-colors disabled:opacity-40">
                  <Plus size={14} />
                </button>
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-3 mb-6">
              <motion.button
                whileTap={{ scale: 0.97 }}
                onClick={handleAddToCart}
                disabled={isAdding || isOutOfStock}
                className="flex-1 bg-primary text-white py-3.5 rounded-xl font-semibold flex items-center justify-center gap-2 hover:bg-primary-dark transition-colors disabled:opacity-60 shadow-lg shadow-primary/25"
              >
                {isAdding ? <><Loader2 size={18} className="animate-spin" /> Adding...</> : <><ShoppingBag size={18} /> Add to Cart</>}
              </motion.button>
              <button
                onClick={handleWishlist}
                className={`w-14 h-14 rounded-xl border-2 flex items-center justify-center transition-all ${wished ? 'border-primary bg-primary text-white' : 'border-gray-200 hover:border-primary'}`}
              >
                <Heart size={20} fill={wished ? 'currentColor' : 'none'} />
              </button>
              <button className="w-14 h-14 rounded-xl border-2 border-gray-200 flex items-center justify-center hover:border-primary transition-colors">
                <Share2 size={20} />
              </button>
            </div>

            {/* Trust badges */}
            <div className="grid grid-cols-3 gap-3 border border-gray-100 rounded-xl p-4">
              {[{ icon: Truck, text: 'Free Delivery over $100' }, { icon: Shield, text: 'Secure Payment' }, { icon: RefreshCw, text: '30-day Returns' }].map(({ icon: Icon, text }) => (
                <div key={text} className="flex flex-col items-center gap-1.5 text-center">
                  <Icon size={20} className="text-primary" />
                  <p className="text-xs text-gray-500">{text}</p>
                </div>
              ))}
            </div>

            {/* Brand & SKU */}
            <div className="mt-4 text-xs text-gray-400 space-y-1">
              {product.brand && <p>Brand: <span className="text-gray-600 font-medium">{product.brand}</span></p>}
              <p>SKU: <span className="font-mono text-gray-600">{product.sku}</span></p>
              {product.tags && <p>Tags: {product.tags.split(',').map((t) => (
                <Link key={t} to={`/products?search=${t.trim()}`} className="inline-block bg-gray-100 px-2 py-0.5 rounded-full mr-1 hover:bg-primary hover:text-white transition-colors">{t.trim()}</Link>
              ))}</p>}
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="border-b border-gray-200 mb-8">
          <div className="flex gap-0">
            {[{ key: 'desc', label: 'Description' }, { key: 'reviews', label: `Reviews (${product.totalReviews})` }].map(({ key, label }) => (
              <button
                key={key}
                onClick={() => setActiveTab(key as any)}
                className={`px-6 py-3.5 text-sm font-medium border-b-2 transition-colors ${activeTab === key ? 'border-primary text-primary' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
              >
                {label}
              </button>
            ))}
          </div>
        </div>

        <AnimatePresence mode="wait">
          {activeTab === 'desc' ? (
            <motion.div key="desc" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="prose prose-sm max-w-none text-gray-600 leading-relaxed mb-16">
              <p>{product.description}</p>
            </motion.div>
          ) : (
            <motion.div key="reviews" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="mb-16">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Review form */}
                <div className="bg-gray-50 rounded-2xl p-6">
                  <h3 className="font-bold text-gray-900 mb-4">Write a Review</h3>
                  <form onSubmit={handleReviewSubmit} className="space-y-4">
                    <div>
                      <p className="text-sm font-medium text-gray-700 mb-2">Rating</p>
                      <div className="flex gap-1">
                        {Array.from({ length: 5 }).map((_, i) => (
                          <button key={i} type="button" onClick={() => setReviewForm({ ...reviewForm, rating: i + 1 })}>
                            <Star size={24} className={i < reviewForm.rating ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300 fill-gray-300'} />
                          </button>
                        ))}
                      </div>
                    </div>
                    <input type="text" placeholder="Review title" value={reviewForm.title} onChange={(e) => setReviewForm({ ...reviewForm, title: e.target.value })}
                      className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm outline-none focus:border-primary" />
                    <textarea rows={4} placeholder="Share your experience..." value={reviewForm.comment} onChange={(e) => setReviewForm({ ...reviewForm, comment: e.target.value })}
                      className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm outline-none focus:border-primary resize-none" />
                    <button type="submit" disabled={addReview.isPending} className="w-full bg-primary text-white py-2.5 rounded-lg text-sm font-semibold hover:bg-primary-dark transition-colors disabled:opacity-60">
                      {addReview.isPending ? 'Submitting...' : 'Submit Review'}
                    </button>
                    {!isAuthenticated && <p className="text-xs text-gray-400 text-center">Please <button type="button" onClick={() => openAuthModal('login')} className="text-primary underline">login</button> to review</p>}
                  </form>
                </div>

                {/* Reviews list */}
                <div className="lg:col-span-2 space-y-4">
                  {reviewsData?.data?.length === 0 && <p className="text-gray-500 text-sm py-8 text-center">No reviews yet. Be the first to review!</p>}
                  {reviewsData?.data?.map((review: any) => (
                    <div key={review.id} className="bg-white border border-gray-100 rounded-xl p-5">
                      <div className="flex items-center gap-3 mb-3">
                        <div className="w-9 h-9 bg-primary/10 rounded-full flex items-center justify-center text-primary font-bold text-sm">
                          {review.user.name.charAt(0)}
                        </div>
                        <div>
                          <p className="font-semibold text-sm text-gray-900">{review.user.name}</p>
                          <p className="text-xs text-gray-400">{new Date(review.createdAt).toLocaleDateString()}</p>
                        </div>
                        <div className="ml-auto flex gap-0.5">
                          {Array.from({ length: 5 }).map((_, i) => (
                            <Star key={i} size={14} className={i < review.rating ? 'text-yellow-400 fill-yellow-400' : 'text-gray-200 fill-gray-200'} />
                          ))}
                        </div>
                      </div>
                      {review.title && <p className="font-semibold text-sm text-gray-800 mb-1">{review.title}</p>}
                      {review.comment && <p className="text-sm text-gray-600 leading-relaxed">{review.comment}</p>}
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Related products */}
        {related?.length > 0 && (
          <section>
            <h2 className="text-xl font-bold text-gray-900 mb-5">Related Products</h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
              {related.map((p: any) => <ProductCard key={p.id} product={p} />)}
            </div>
          </section>
        )}
      </div>
    </>
  );
}
