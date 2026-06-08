import { Link, useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { ShoppingBag, Trash2, Plus, Minus, ArrowLeft, ArrowRight } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useCartStore } from '../store';
import { useCart } from '../hooks';

export default function CartPageComponent() {
  const { items, subtotal } = useCartStore();
  const { removeItem, updateItem } = useCart();
  const navigate = useNavigate();
  const shipping = subtotal > 100 ? 0 : 5;

  return (
    <>
      <Helmet><title>Shopping Cart — HiveNest</title></Helmet>
      <div className="max-w-6xl mx-auto px-4 py-10">
        <h1 className="text-2xl font-bold text-gray-900 mb-8 flex items-center gap-3">
          <ShoppingBag size={26} className="text-primary" /> Shopping Cart
          {items.length > 0 && <span className="bg-primary text-white text-sm px-3 py-0.5 rounded-full">{items.length} items</span>}
        </h1>

        {items.length === 0 ? (
          <div className="text-center py-24">
            <ShoppingBag size={80} strokeWidth={1} className="mx-auto text-gray-200 mb-5" />
            <h2 className="text-xl font-semibold text-gray-700 mb-2">Your cart is empty</h2>
            <p className="text-gray-400 mb-6">Looks like you haven't added anything yet.</p>
            <Link to="/products" className="inline-flex items-center gap-2 bg-primary text-white px-8 py-3 rounded-xl font-medium hover:bg-primary-dark transition-colors">
              <ArrowLeft size={18} /> Continue Shopping
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Items */}
            <div className="lg:col-span-2 space-y-4">
              <AnimatePresence>
                {items.map((item) => (
                  <motion.div
                    key={item.id}
                    layout
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    className="bg-white border border-gray-100 rounded-2xl p-5 flex gap-4"
                  >
                    <Link to={`/products/${item.product.slug}`}>
                      <img src={item.product.images?.[0]?.url || '/placeholder.jpg'} alt={item.product.name} className="w-24 h-24 object-cover rounded-xl flex-shrink-0" />
                    </Link>
                    <div className="flex-1 min-w-0">
                      <Link to={`/products/${item.product.slug}`} className="font-semibold text-gray-800 hover:text-primary transition-colors line-clamp-2">{item.product.name}</Link>
                      {item.variant && <p className="text-sm text-gray-500 mt-0.5">{item.variant.name}: {item.variant.value}</p>}
                      <p className="text-primary font-bold text-lg mt-1">${Number(item.product.price).toFixed(2)}</p>
                    </div>
                    <div className="flex flex-col items-end justify-between">
                      <button onClick={() => removeItem(item.id)} className="text-gray-300 hover:text-red-500 transition-colors"><Trash2 size={18} /></button>
                      <div className="flex items-center gap-2 bg-gray-50 rounded-xl p-1">
                        <button onClick={() => updateItem({ id: item.id, quantity: item.quantity - 1 })} className="w-8 h-8 rounded-lg hover:bg-gray-200 flex items-center justify-center transition-colors">
                          <Minus size={14} />
                        </button>
                        <span className="w-8 text-center font-semibold">{item.quantity}</span>
                        <button onClick={() => updateItem({ id: item.id, quantity: item.quantity + 1 })} className="w-8 h-8 rounded-lg hover:bg-gray-200 flex items-center justify-center transition-colors">
                          <Plus size={14} />
                        </button>
                      </div>
                      <p className="font-bold text-gray-900">${(Number(item.product.price) * item.quantity).toFixed(2)}</p>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
              <Link to="/products" className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-primary transition-colors mt-2">
                <ArrowLeft size={16} /> Continue Shopping
              </Link>
            </div>

            {/* Summary */}
            <div className="bg-white border border-gray-100 rounded-2xl p-6 h-fit sticky top-24">
              <h2 className="font-bold text-lg text-gray-900 mb-5">Order Summary</h2>
              <div className="space-y-3 text-sm mb-5">
                <div className="flex justify-between text-gray-600"><span>Subtotal ({items.reduce((s, i) => s + i.quantity, 0)} items)</span><span>${subtotal.toFixed(2)}</span></div>
                <div className="flex justify-between text-gray-600"><span>Shipping</span><span>{shipping === 0 ? <span className="text-green-600 font-medium">Free</span> : `$${shipping.toFixed(2)}`}</span></div>
                {shipping > 0 && <p className="text-xs text-gray-400">Free shipping on orders over $100</p>}
                <div className="flex justify-between font-bold text-base pt-3 border-t border-gray-100">
                  <span>Total</span><span className="text-primary text-lg">${(subtotal + shipping).toFixed(2)}</span>
                </div>
              </div>
              <button onClick={() => navigate('/checkout')} className="w-full bg-primary text-white py-3.5 rounded-xl font-semibold flex items-center justify-center gap-2 hover:bg-primary-dark transition-colors shadow-lg shadow-primary/25">
                Proceed to Checkout <ArrowRight size={18} />
              </button>
            </div>
          </div>
        )}
      </div>
    </>
  );
}
