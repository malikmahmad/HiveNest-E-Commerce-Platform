import { Link } from 'react-router-dom';
import { Facebook, Twitter, Instagram, Linkedin, Mail, Phone, MapPin, Send } from 'lucide-react';
import { useState } from 'react';
import toast from 'react-hot-toast';

export default function Footer() {
  const [email, setEmail] = useState('');

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    toast.success('Subscribed successfully!');
    setEmail('');
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
              className="flex-1 md:w-72 px-4 py-3 bg-white/10 border border-white/20 rounded-l-lg text-white placeholder-gray-400 outline-none focus:border-primary text-sm"
            />
            <button type="submit" className="bg-primary text-white px-5 rounded-r-lg hover:bg-primary-dark transition-colors flex items-center gap-2">
              <Send size={16} /> Subscribe
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
          <div className="flex gap-3">
            {[{ Icon: Facebook, href: '#' }, { Icon: Twitter, href: '#' }, { Icon: Instagram, href: '#' }, { Icon: Linkedin, href: '#' }].map(({ Icon, href }) => (
              <a key={href} href={href} className="w-9 h-9 bg-white/10 hover:bg-primary rounded-lg flex items-center justify-center transition-colors">
                <Icon size={16} />
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
              <a href="tel:+923001234567" className="hover:text-primary transition-colors">+92 300 1234567</a>
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
