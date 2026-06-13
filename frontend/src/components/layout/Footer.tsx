import { Link } from 'react-router-dom';
import { Mail, Phone, MapPin, Send } from 'lucide-react';
import { useState } from 'react';
import toast from 'react-hot-toast';
import { api } from '../../services/api';

const socialLinks = [
  {
    label: 'LinkedIn',
    href: 'https://www.linkedin.com/in/malik-muhammad-ahmad-788b62338',
    color: 'hover:bg-[#0A66C2]',
    icon: (
      <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4">
        <path d="M20.447 20.452H17.21v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.988V9h3.12v1.561h.042c.435-.823 1.496-1.691 3.079-1.691 3.292 0 3.9 2.167 3.9 4.988v6.594zM5.337 7.433a1.808 1.808 0 1 1 0-3.616 1.808 1.808 0 0 1 0 3.616zm1.561 13.019H3.775V9h3.123v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.226.792 24 1.771 24h20.451C23.2 24 24 23.226 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
      </svg>
    ),
  },
  {
    label: 'Twitter / X',
    href: 'https://x.com/MalikMuhammox1',
    color: 'hover:bg-black',
    icon: (
      <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4">
        <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.746l7.73-8.835L1.254 2.25H8.08l4.253 5.622 5.91-5.622zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
      </svg>
    ),
  },
  {
    label: 'Instagram',
    href: 'https://www.instagram.com/priv_ahmad007/',
    color: 'hover:bg-gradient-to-br hover:from-[#f9ce34] hover:via-[#ee2a7b] hover:to-[#6228d7]',
    icon: (
      <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4">
        <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 1 0 0 12.324 6.162 6.162 0 0 0 0-12.324zM12 16a4 4 0 1 1 0-8 4 4 0 0 1 0 8zm6.406-11.845a1.44 1.44 0 1 0 0 2.881 1.44 1.44 0 0 0 0-2.881z"/>
      </svg>
    ),
  },
  {
    label: 'Facebook',
    href: 'https://www.facebook.com/profile.php?id=100086022546117',
    color: 'hover:bg-[#1877F2]',
    icon: (
      <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4">
        <path d="M24 12.073C24 5.404 18.627 0 12 0S0 5.404 0 12.073C0 18.1 4.388 23.094 10.125 24v-8.437H7.078v-3.49h3.047V9.41c0-3.025 1.791-4.697 4.533-4.697 1.312 0 2.686.236 2.686.236v2.97h-1.513c-1.491 0-1.956.93-1.956 1.886v2.269h3.328l-.532 3.49h-2.796V24C19.612 23.094 24 18.1 24 12.073z"/>
      </svg>
    ),
  },
];

export default function Footer() {
  const [email, setEmail] = useState('');
  const [subscribed, setSubscribed] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubscribe = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || loading) return;

    setLoading(true);
    try {
      const { data } = await api.post('/newsletter/subscribe', { email });

      setSubscribed(true);
      toast.success(data.message || '🎉 Subscribed! Check your email.', {
        duration: 5000,
        style: { background: '#1f2937', color: '#fff', border: '1px solid #ec4899' },
      });
      setEmail('');
      setTimeout(() => setSubscribed(false), 5000);
    } catch (err: any) {
      const message = err?.response?.data?.message || 'Something went wrong. Please try again.';
      toast.error(message, {
        style: { background: '#1f2937', color: '#fff' },
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <footer className="bg-gray-900 text-gray-300">
      {/* Newsletter */}
      <div className="bg-primary/10 border-t border-primary/20">
        <div className="max-w-7xl mx-auto px-4 py-10 flex flex-col md:flex-row items-center justify-between gap-6">
          <div>
            <h3 className="text-lg font-bold text-white mb-1">Subscribe to Our Newsletter</h3>
            <p className="text-sm text-gray-400">Get the latest deals, fashion tips and exclusive offers.</p>
          </div>
          <form onSubmit={handleSubscribe} className="flex w-full md:w-auto gap-0">
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email address"
              className="flex-1 md:w-72 px-4 py-3 bg-white/10 border border-white/20 rounded-l-lg text-white placeholder-gray-400 outline-none focus:border-primary text-sm transition-all duration-300 focus:bg-white/15"
            />
            <button
              type="submit"
              disabled={subscribed || loading}
              className={`text-white px-5 rounded-r-lg transition-all duration-300 flex items-center gap-2 font-medium min-w-[130px] justify-center ${
                subscribed
                  ? 'bg-green-600 scale-95'
                  : loading
                  ? 'bg-primary/70 cursor-not-allowed'
                  : 'bg-primary hover:bg-pink-600 hover:scale-[1.02] active:scale-95'
              }`}
            >
              {loading ? (
                <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                </svg>
              ) : (
                <Send size={16} />
              )}
              {subscribed ? 'Subscribed!' : loading ? 'Sending...' : 'Subscribe'}
            </button>
          </form>
        </div>
      </div>

      {/* Main footer */}
      <div className="max-w-7xl mx-auto px-4 py-14 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10">
        {/* Brand */}
        <div>
          <Link to="/" className="text-2xl font-bold text-white mb-4 block">
            Hive<span className="text-primary">Nest</span>
          </Link>
          <p className="text-sm text-gray-400 leading-relaxed mb-5">
            Your premium destination for fashion, jewelry, perfume, and lifestyle products. Quality you can trust, style you'll love.
          </p>
          {/* Social Icons */}
          <div className="flex gap-3">
            {socialLinks.map(({ label, href, color, icon }) => (
              <a
                key={label}
                href={href}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={label}
                className={`
                  w-9 h-9 bg-white/10 rounded-lg flex items-center justify-center
                  transition-all duration-300 ease-in-out
                  hover:scale-110 hover:shadow-lg hover:shadow-primary/30
                  active:scale-95 ${color}
                `}
              >
                {icon}
              </a>
            ))}
          </div>
        </div>

        {/* Categories */}
        <div>
          <h4 className="text-white font-semibold mb-4">Categories</h4>
          <ul className="space-y-2.5 text-sm">
            {['Clothes', 'Footwear', 'Jewelry', 'Perfume', 'Cosmetics', 'Glasses', 'Bags'].map((cat) => (
              <li key={cat}>
                <Link to={`/category/${cat.toLowerCase()}`} className="hover:text-primary transition-colors">{cat}</Link>
              </li>
            ))}
          </ul>
        </div>

        {/* Quick Links */}
        <div>
          <h4 className="text-white font-semibold mb-4">Quick Links</h4>
          <ul className="space-y-2.5 text-sm">
            {[
              { label: 'Home', href: '/' },
              { label: 'Products', href: '/products' },
              { label: 'Blog', href: '/blog' },
              { label: 'Hot Offers', href: '/products?flashSale=true' },
              { label: 'My Account', href: '/profile' },
              { label: 'My Orders', href: '/orders' },
              { label: 'Wishlist', href: '/wishlist' },
            ].map(({ label, href }) => (
              <li key={label}>
                <Link to={href} className="hover:text-primary transition-colors">{label}</Link>
              </li>
            ))}
          </ul>
        </div>

        {/* Contact */}
        <div>
          <h4 className="text-white font-semibold mb-4">Contact Us</h4>
          <ul className="space-y-3 text-sm">
            <li className="flex items-start gap-3">
              <MapPin size={16} className="text-primary mt-0.5 flex-shrink-0" />
              <span>123 Fashion Street, Karachi, Pakistan</span>
            </li>
            <li className="flex items-center gap-3">
              <Phone size={16} className="text-primary flex-shrink-0" />
              <a href="tel:+923262770290" className="hover:text-primary transition-colors">+92 326 2770290</a>
            </li>
            <li className="flex items-center gap-3">
              <Mail size={16} className="text-primary flex-shrink-0" />
              <a href="mailto:support@hivenest.com" className="hover:text-primary transition-colors">support@hivenest.com</a>
            </li>
          </ul>
          <div className="mt-5">
            <p className="text-xs text-gray-500 mb-2">We Accept</p>
            <div className="flex gap-2">
              {['VISA', 'MC', 'JCB', 'COD'].map((p) => (
                <span key={p} className="px-2 py-1 bg-white/10 rounded text-xs font-mono">{p}</span>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Bottom */}
      <div className="border-t border-white/10 py-5">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row justify-between items-center gap-3 text-xs text-gray-500">
          <p>© {new Date().getFullYear()} HiveNest. All rights reserved.</p>
          <div className="flex gap-4">
            <Link to="/privacy" className="hover:text-gray-300 transition-colors">Privacy Policy</Link>
            <Link to="/terms" className="hover:text-gray-300 transition-colors">Terms of Service</Link>
            <Link to="/returns" className="hover:text-gray-300 transition-colors">Returns</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
