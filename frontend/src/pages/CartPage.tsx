import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { Trash2, Plus, Minus, ShoppingBag, ArrowRight } from 'lucide-react';
import { useCartStore } from '../store';
import { useCart } from '../hooks';

export default function CartPage() {
  const { items, subtotal } = useCartStore();
  const { removeItem, updateItem } = useCart();

  const shipping = subtotal > 100 ? 0 : 5;
  const total = subtotal + shipping;

  return (
    <>
      <Helmet><title>Shopping Cart — HiveNest</title></Helmet>
      <div className="max-w-6xl mx-auto px-4 py-10">
        <h1 className="text-2xl font-bold text-gray-900 mb-8 flex items-center gap-3">
          <ShoppingBag size={26} className="text-primary" /> Shopping Cart
          {items.length > 0 && (
            <span className="bg-primary text-white text-sm px-3 py-0.5 rounded-full">
              {items.reduce((s, i) => s + i.quantity, 0)}
            </span>
          )}
        </h1>

        {items.length === 0 ? (
          <div className="text-center py-24">
            <ShoppingBag size={80} strokeWidth={1} className="mx-auto text-gray-200 mb-5" />
            <h2 className="text-xl font-semibold text-gray-700 mb-2">Your cart is empty</h2>
            <p className="text-gray-400 mb-6">Add some products to get started.</p>
            <Link to="/products" className="inline-block bg-primary text-white px-8 py-3 rounded-xl font-medium hover:bg-primary-dark transition-colors">
              Browse Products
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-3">
              {items.map((item) => (
                <div key={item.id} className="flex gap-4 bg-white border border-gray-100 rounded-2xl p-4">
                  <Link to={`/products/${item.product.slug}`}>
                    <img
                      src={item.product.images?.[0]?.url || '/placeholder.jpg'}
                      alt={item.product.name}
                      className="w-24 h-24 object-cover rounded-xl flex-shrink-0"
                    />
                  </Link>
                  <div className="flex-1 min-w-0">
                    <Link to={`/products/${item.product.slug}`}>
                      <p className="font-medium text-gray-800 hover:text-primary transition-colors line-clamp-2">
                        {item.product.name}
                      </p>
                    </Link>
                    {item.variant && (
                      <p className="text-xs text-gray-500 mt-0.5">{item.variant.name}: {item.variant.value}</p>
                    )}
                    <p className="text-primary font-bold mt-1">
                      ${(Number(item.product.price) * item.quantity).toFixed(2)}
                    </p>
                    <div className="flex items-center justify-between mt-3">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => updateItem({ id: item.id, quantity: item.quantity - 1 })}
                          className="w-7 h-7 border border-gray-200 rounded-lg flex items-center justify-center hover:border-primary transition-colors"
                        >
                          <Minus size={13} />
                        </button>
                        <span className="text-sm font-semibold w-8 text-center">{item.quantity}</span>
                        <button
                          onClick={() => updateItem({ id: item.id, quantity: item.quantity + 1 })}
                          className="w-7 h-7 border border-gray-200 rounded-lg flex items-center justify-center hover:border-primary transition-colors"
                        >
                          <Plus size={13} />
                        </button>
                      </div>
                      <button
                        onClick={() => removeItem(item.id)}
                        className="text-gray-400 hover:text-red-500 transition-colors"
                      >
                        <Trash2 size={17} />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="lg:col-span-1">
              <div className="bg-white border border-gray-100 rounded-2xl p-6 sticky top-24">
                <h2 className="font-bold text-lg mb-4">Order Summary</h2>
                <div className="space-y-2.5 text-sm mb-5">
                  <div className="flex justify-between text-gray-600">
                    <span>Subtotal</span>
                    <span>${subtotal.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-gray-600">
                    <span>Shipping</span>
                    <span>{shipping === 0 ? <span className="text-green-600">Free</span> : `$${shipping.toFixed(2)}`}</span>
                  </div>
                  <div className="flex justify-between font-bold text-base border-t border-gray-100 pt-2.5 mt-1">
                    <span>Total</span>
                    <span className="text-primary">${total.toFixed(2)}</span>
                  </div>
                </div>
                <Link
                  to="/checkout"
                  className="w-full bg-primary text-white py-3.5 rounded-xl font-semibold flex items-center justify-center gap-2 hover:bg-primary-dark transition-colors shadow-lg shadow-primary/25"
                >
                  Proceed to Checkout <ArrowRight size={17} />
                </Link>
                <Link to="/products" className="block text-center text-sm text-primary hover:underline mt-4">
                  Continue Shopping
                </Link>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
}
