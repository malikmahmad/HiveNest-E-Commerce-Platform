import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { CheckCircle, Tag, Loader2, CreditCard, Truck } from 'lucide-react';
import { useCartStore, useAuthStore } from '../store';
import { useCreateOrder, useValidateCoupon } from '../hooks';
import { authAPI } from '../services/api';
import { useQuery } from '@tanstack/react-query';
import type { Address } from '../types';

export default function CheckoutPage() {
  const navigate = useNavigate();
  const { items, subtotal } = useCartStore();
  const { user } = useAuthStore();
  const createOrder = useCreateOrder();
  const validateCoupon = useValidateCoupon();

  const [selectedAddress, setSelectedAddress] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<'COD' | 'STRIPE'>('COD');
  const [couponCode, setCouponCode] = useState('');
  const [discount, setDiscount] = useState(0);
  const [notes, setNotes] = useState('');
  const [newAddress, setNewAddress] = useState({ name: user?.name || '', phone: '', street: '', city: '', state: '', zip: '', country: 'Pakistan' });
  const [addingAddress, setAddingAddress] = useState(false);

  const { data: profileData } = useQuery({
    queryKey: ['profile'],
    queryFn: () => authAPI.getMe().then((r) => r.data.data),
  });

  const addresses: Address[] = profileData?.addresses || [];

  // Auto-enable new address form when user has no saved addresses
  useEffect(() => {
    if (profileData && addresses.length === 0) {
      setAddingAddress(true);
    }
  }, [profileData, addresses.length]);

  const shipping = subtotal > 100 ? 0 : 5; // match backend — pre-discount subtotal
  const total = subtotal - discount + shipping;

  const handleApplyCoupon = async () => {
    const result = await validateCoupon.mutateAsync({ code: couponCode, subtotal });
    if (result) setDiscount(result.discount);
  };

  const handlePlaceOrder = async () => {
    if (!selectedAddress && !addingAddress) { alert('Please select or add a shipping address'); return; }
    if (!items.length) { alert('Your cart is empty'); return; }

    let addressId = selectedAddress;

    if (addingAddress) {
      const { name, phone, street, city, state, zip } = newAddress;
      if (!name || !phone || !street || !city || !state || !zip) {
        alert('Please fill in all address fields');
        return;
      }
      try {
        const res = await authAPI.addAddress(newAddress);
        addressId = res.data.data.id;
      } catch (err: any) {
        alert(err.response?.data?.message || 'Failed to save address. Please try again.');
        return;
      }
    }

    if (!addressId) {
      alert('Please select or add a shipping address');
      return;
    }

    try {
      const response = await createOrder.mutateAsync({
        addressId,
        paymentMethod,
        couponCode: couponCode || undefined,
        notes: notes || undefined,
      });
      // response = axios response, response.data = { success, data: order }
      const orderId = response?.data?.data?.id || response?.data?.id;
      if (orderId) {
        navigate(`/orders/${orderId}`);
      } else {
        navigate('/orders');
      }
    } catch {
      // error toast handled in hook
    }
  };

  return (
    <>
      <Helmet><title>Checkout — HiveNest</title></Helmet>
      <div className="max-w-6xl mx-auto px-4 py-10">
        <h1 className="text-2xl font-bold text-gray-900 mb-8">Checkout</h1>

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
          {/* Left - Forms */}
          <div className="lg:col-span-3 space-y-6">
            {/* Shipping Address */}
            <div className="bg-white border border-gray-100 rounded-2xl p-6">
              <h2 className="font-bold text-lg mb-4 flex items-center gap-2"><Truck size={20} className="text-primary" /> Shipping Address</h2>

              {addresses.length > 0 && (
                <div className="space-y-2 mb-4">
                  {addresses.map((addr) => (
                    <label
                      key={addr.id}
                      className={`flex items-start gap-3 p-4 border rounded-xl cursor-pointer transition-colors ${selectedAddress === addr.id ? 'border-primary bg-primary/5' : 'border-gray-200 hover:border-gray-300'}`}
                    >
                      <input type="radio" name="address" value={addr.id} checked={selectedAddress === addr.id} onChange={() => { setSelectedAddress(addr.id); setAddingAddress(false); }} className="mt-1 accent-primary" />
                      <div className="text-sm">
                        <p className="font-semibold">{addr.name} · {addr.phone}</p>
                        <p className="text-gray-500">{addr.street}, {addr.city}, {addr.state} {addr.zip}</p>
                        <p className="text-gray-500">{addr.country}</p>
                      </div>
                    </label>
                  ))}
                </div>
              )}

              <button
                onClick={() => { setAddingAddress(!addingAddress); setSelectedAddress(''); }}
                className={`text-sm font-medium ${addingAddress ? 'text-red-500' : 'text-primary'} hover:underline`}
              >
                {addingAddress ? '× Cancel' : '+ Add New Address'}
              </button>

              {(addingAddress || addresses.length === 0) && (
                <div className="mt-4 grid grid-cols-2 gap-4">
                  {[
                    { key: 'name', label: 'Full Name', col: 2 },
                    { key: 'phone', label: 'Phone Number', col: 2 },
                    { key: 'street', label: 'Street Address', col: 2 },
                    { key: 'city', label: 'City', col: 1 },
                    { key: 'state', label: 'State/Province', col: 1 },
                    { key: 'zip', label: 'ZIP / Postal Code', col: 1 },
                    { key: 'country', label: 'Country', col: 1 },
                  ].map(({ key, label, col }) => (
                    <div key={key} className={col === 2 ? 'col-span-2' : ''}>
                      <label className="block text-xs font-medium text-gray-600 mb-1.5">{label}</label>
                      <input
                        type="text"
                        value={(newAddress as any)[key]}
                        onChange={(e) => setNewAddress({ ...newAddress, [key]: e.target.value })}
                        className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm outline-none focus:border-primary transition-colors"
                      />
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Payment Method */}
            <div className="bg-white border border-gray-100 rounded-2xl p-6">
              <h2 className="font-bold text-lg mb-4 flex items-center gap-2"><CreditCard size={20} className="text-primary" /> Payment Method</h2>
              <div className="space-y-3">
                {[
                  { value: 'COD', label: 'Cash on Delivery', desc: 'Pay when your order arrives', icon: '💵' },
                  { value: 'STRIPE', label: 'Credit / Debit Card', desc: 'Visa, Mastercard, and more', icon: '💳' },
                ].map((pm) => (
                  <label
                    key={pm.value}
                    className={`flex items-center gap-3 p-4 border rounded-xl cursor-pointer transition-colors ${paymentMethod === pm.value ? 'border-primary bg-primary/5' : 'border-gray-200 hover:border-gray-300'}`}
                  >
                    <input type="radio" name="payment" value={pm.value} checked={paymentMethod === pm.value} onChange={() => setPaymentMethod(pm.value as any)} className="accent-primary" />
                    <span className="text-xl">{pm.icon}</span>
                    <div>
                      <p className="font-medium text-sm">{pm.label}</p>
                      <p className="text-xs text-gray-500">{pm.desc}</p>
                    </div>
                  </label>
                ))}
              </div>
            </div>

            {/* Notes */}
            <div className="bg-white border border-gray-100 rounded-2xl p-6">
              <h2 className="font-bold text-sm mb-3 text-gray-700">Order Notes (Optional)</h2>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={2}
                placeholder="Any special instructions for delivery..."
                className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm outline-none focus:border-primary resize-none transition-colors"
              />
            </div>
          </div>

          {/* Right - Order Summary */}
          <div className="lg:col-span-2">
            <div className="bg-white border border-gray-100 rounded-2xl p-6 sticky top-24">
              <h2 className="font-bold text-lg mb-4">Order Summary</h2>

              {/* Items */}
              <div className="space-y-3 mb-4 max-h-64 overflow-y-auto">
                {items.map((item) => (
                  <div key={item.id} className="flex gap-3">
                    <img src={item.product.images?.[0]?.url || '/placeholder.jpg'} alt={item.product.name} className="w-14 h-14 object-cover rounded-lg flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-medium text-gray-800 line-clamp-2">{item.product.name}</p>
                      <p className="text-xs text-gray-500 mt-0.5">Qty: {item.quantity}</p>
                    </div>
                    <p className="text-sm font-bold text-gray-900">${(Number(item.product.price) * item.quantity).toFixed(2)}</p>
                  </div>
                ))}
              </div>

              {/* Coupon */}
              <div className="flex gap-2 mb-5 pb-5 border-b border-gray-100">
                <input
                  type="text"
                  value={couponCode}
                  onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                  placeholder="Coupon code"
                  className="flex-1 px-3 py-2.5 border border-gray-200 rounded-lg text-sm outline-none focus:border-primary"
                />
                <button
                  onClick={handleApplyCoupon}
                  disabled={!couponCode || validateCoupon.isPending}
                  className="bg-gray-900 text-white px-4 py-2.5 rounded-lg text-sm font-medium disabled:opacity-50 flex items-center gap-1.5"
                >
                  <Tag size={14} /> Apply
                </button>
              </div>

              {/* Totals */}
              <div className="space-y-2.5 text-sm mb-5">
                <div className="flex justify-between text-gray-600"><span>Subtotal</span><span>${subtotal.toFixed(2)}</span></div>
                {discount > 0 && <div className="flex justify-between text-green-600"><span>Discount</span><span>-${discount.toFixed(2)}</span></div>}
                <div className="flex justify-between text-gray-600"><span>Shipping</span><span>{shipping === 0 ? <span className="text-green-600">Free</span> : `$${shipping.toFixed(2)}`}</span></div>
                <div className="flex justify-between font-bold text-base pt-2.5 border-t border-gray-100">
                  <span>Total</span><span className="text-primary">${total.toFixed(2)}</span>
                </div>
              </div>

              <button
                onClick={handlePlaceOrder}
                disabled={createOrder.isPending || items.length === 0}
                className="w-full bg-primary text-white py-4 rounded-xl font-semibold text-base hover:bg-primary-dark transition-colors disabled:opacity-60 flex items-center justify-center gap-2 shadow-lg shadow-primary/30"
              >
                {createOrder.isPending ? <><Loader2 size={18} className="animate-spin" /> Placing Order...</> : <><CheckCircle size={18} /> Place Order — ${total.toFixed(2)}</>}
              </button>

              <p className="text-xs text-gray-400 text-center mt-3">🔒 Your payment info is secure and encrypted</p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
