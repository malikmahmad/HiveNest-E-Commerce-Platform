import { useEffect } from 'react';
import { createPortal } from 'react-dom';
import { Link, useNavigate } from 'react-router-dom';
import { X, ShoppingBag, Plus, Minus, Trash2, ArrowRight } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useCartStore } from '../../../store';
import { useCart } from '../../../hooks';

export default function CartDrawer() {
  const { isOpen, closeCart, items, subtotal } = useCartStore();
  const { removeItem, updateItem } = useCart();
  const navigate = useNavigate();

  // Close on Escape key
  useEffect(() => {
    if (!isOpen) return;
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') closeCart(); };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [isOpen, closeCart]);

  if (!isOpen) return null;

  return createPortal(
    <div style={{ position: 'fixed', inset: 0, zIndex: 9999 }}>
      {/* Backdrop — plain div, no animation library */}
      <div
        style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.45)', cursor: 'pointer' }}
        onClick={closeCart}
      />

      {/* Drawer */}
      <AnimatePresence>
        <motion.div
          key="cart-drawer"
          initial={{ x: '100%' }}
          animate={{ x: 0 }}
          exit={{ x: '100%' }}
          transition={{ type: 'spring', damping: 30, stiffness: 300 }}
          style={{ position: 'absolute', right: 0, top: 0, height: '100%', width: '100%', maxWidth: '28rem' }}
          className="bg-white flex flex-col shadow-2xl"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
            <div className="flex items-center gap-2">
              <ShoppingBag size={20} className="text-primary" />
              <h2 className="font-bold text-lg">Shopping Cart</h2>
              {items.length > 0 && (
                <span className="bg-primary text-white text-xs font-bold px-2 py-0.5 rounded-full">
                  {items.reduce((s, i) => s + i.quantity, 0)}
                </span>
              )}
            </div>
            <button
              onClick={closeCart}
              className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <X size={20} />
            </button>
          </div>

          {/* Items */}
          <div className="flex-1 overflow-y-auto py-4">
            {items.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full gap-4 text-gray-400 px-6">
                <ShoppingBag size={64} strokeWidth={1} />
                <p className="text-lg font-medium">Your cart is empty</p>
                <p className="text-sm text-center">Looks like you haven't added anything yet.</p>
                <button
                  onClick={() => { closeCart(); navigate('/products'); }}
                  className="bg-primary text-white px-6 py-2.5 rounded-lg text-sm font-medium hover:bg-primary-dark transition-colors"
                >
                  Start Shopping
                </button>
              </div>
            ) : (
              <div className="px-4 space-y-3">
                {items.map((item) => (
                  <div key={item.id} className="flex gap-3 bg-gray-50 rounded-xl p-3">
                    <Link to={`/products/${item.product.slug}`} onClick={closeCart}>
                      <img
                        src={item.product.images?.[0]?.url || '/placeholder.jpg'}
                        alt={item.product.name}
                        className="w-20 h-20 object-cover rounded-lg flex-shrink-0"
                      />
                    </Link>
                    <div className="flex-1 min-w-0">
                      <Link to={`/products/${item.product.slug}`} onClick={closeCart}>
                        <p className="text-sm font-medium text-gray-800 line-clamp-2 hover:text-primary transition-colors">
                          {item.product.name}
                        </p>
                      </Link>
                      {item.variant && (
                        <p className="text-xs text-gray-500 mt-0.5">{item.variant.name}: {item.variant.value}</p>
                      )}
                      <p className="text-primary font-bold text-sm mt-1">
                        ${(Number(item.product.price) * item.quantity).toFixed(2)}
                      </p>
                      <div className="flex items-center justify-between mt-2">
                        <div className="flex items-center gap-1.5">
                          <button
                            onClick={() => updateItem({ id: item.id, quantity: item.quantity - 1 })}
                            className="w-6 h-6 bg-white border border-gray-200 rounded-md flex items-center justify-center hover:border-primary transition-colors"
                          >
                            <Minus size={12} />
                          </button>
                          <span className="text-sm font-semibold w-6 text-center">{item.quantity}</span>
                          <button
                            onClick={() => updateItem({ id: item.id, quantity: item.quantity + 1 })}
                            className="w-6 h-6 bg-white border border-gray-200 rounded-md flex items-center justify-center hover:border-primary transition-colors"
                          >
                            <Plus size={12} />
                          </button>
                        </div>
                        <button
                          onClick={() => removeItem(item.id)}
                          className="text-gray-400 hover:text-red-500 transition-colors p-1"
                        >
                          <Trash2 size={15} />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Footer */}
          {items.length > 0 && (
            <div className="px-5 py-4 border-t border-gray-100 bg-gray-50">
              <div className="flex justify-between items-center mb-1">
                <span className="text-sm text-gray-500">Subtotal</span>
                <span className="font-bold text-lg">${Number(subtotal).toFixed(2)}</span>
              </div>
              <p className="text-xs text-gray-400 mb-4">Shipping and taxes calculated at checkout</p>
              <div className="flex gap-2">
                <Link
                  to="/cart"
                  onClick={closeCart}
                  className="flex-1 border border-gray-300 text-gray-700 py-3 rounded-lg text-sm font-medium text-center hover:border-primary hover:text-primary transition-colors"
                >
                  View Cart
                </Link>
                <Link
                  to="/checkout"
                  onClick={closeCart}
                  className="flex-1 bg-primary text-white py-3 rounded-lg text-sm font-medium text-center hover:bg-primary-dark transition-colors flex items-center justify-center gap-1.5"
                >
                  Checkout <ArrowRight size={16} />
                </Link>
              </div>
            </div>
          )}
        </motion.div>
      </AnimatePresence>
    </div>,
    document.body
  );
}
