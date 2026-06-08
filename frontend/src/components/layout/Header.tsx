import { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { ShoppingBag, Heart, User, Search, Menu, X, ChevronDown, LogOut, Package, Settings } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuthStore, useCartStore, useWishlistStore, useUIStore } from '../../store';
import { useAuth } from '../../hooks';

const NAV_LINKS = [
  { label: 'Home', href: '/' },
  {
    label: "Men's", href: '/category/clothes',
    sub: [
      { label: 'T-Shirts', href: '/products?subCategory=t-shirts' },
      { label: 'Jackets', href: '/products?subCategory=jacket' },
      { label: 'Shorts & Jeans', href: '/products?subCategory=shorts-jeans' },
      { label: 'Winter Wear', href: '/products?subCategory=winter-wear' },
    ],
  },
  {
    label: "Women's", href: '/category/clothes',
    sub: [
      { label: 'Dress & Frock', href: '/products?subCategory=dress-frock' },
      { label: 'T-Shirts', href: '/products?subCategory=t-shirts' },
      { label: 'Winter Wear', href: '/products?subCategory=winter-wear' },
      { label: 'Hat & Caps', href: '/products?subCategory=hat-caps' },
    ],
  },
  {
    label: 'Jewelry', href: '/category/jewelry',
    sub: [
      { label: 'Necklaces', href: '/products?subCategory=necklaces' },
      { label: 'Rings', href: '/products?subCategory=rings' },
      { label: 'Earrings', href: '/products?subCategory=earrings' },
      { label: 'Bracelets', href: '/products?subCategory=bracelets' },
    ],
  },
  {
    label: 'Perfume', href: '/category/perfume',
    sub: [
      { label: "Women's Perfume", href: '/products?category=perfume&search=women' },
      { label: "Men's Perfume", href: '/products?category=perfume&search=men' },
      { label: 'Unisex', href: '/products?category=perfume' },
    ],
  },
  { label: 'Blog', href: '/blog' },
  { label: '🔥 Hot Offers', href: '/products?flashSale=true' },
];

export default function Header() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const btnRef = useRef<HTMLButtonElement>(null);
  const navigate = useNavigate();
  const location = useLocation();

  const { user, isAuthenticated } = useAuthStore();
  const { count: cartCount } = useCartStore();
  const { items: wishItems } = useWishlistStore();
  const wishCount = wishItems.length;
  const { toggleCart } = useCartStore();
  const { openSearch } = useUIStore();
  const { logout } = useAuth();

  // Close on route change
  useEffect(() => {
    setUserMenuOpen(false);
    setMobileOpen(false);
  }, [location.pathname]);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/products?search=${encodeURIComponent(searchQuery)}`);
      setSearchQuery('');
    }
  };

  // Calculate dropdown position from button
  const getMenuPos = () => {
    if (!btnRef.current) return { top: 60, right: 16 };
    const r = btnRef.current.getBoundingClientRect();
    return { top: r.bottom + 8, right: window.innerWidth - r.right };
  };

  return (
    <header className={`sticky top-0 z-50 bg-white transition-shadow duration-300 ${scrolled ? 'shadow-md' : 'shadow-sm'}`}>
      {/* Top bar */}
      <div className="bg-gray-900 text-white text-xs py-2 hidden md:block">
        <div className="max-w-7xl mx-auto px-4 flex justify-between items-center">
          <p>🚀 Free shipping on orders over $100 | Use code <strong>WELCOME10</strong> for 10% off</p>
          <div className="flex gap-4"><span>USD $</span><span>English</span></div>
        </div>
      </div>

      {/* Main header */}
      <div className="max-w-7xl mx-auto px-4 py-3 flex items-center gap-4">
        {/* Logo */}
        <Link to="/" className="flex-shrink-0 flex items-center gap-2">
          <div className="w-9 h-9 bg-primary rounded-xl flex items-center justify-center shadow-md shadow-primary/30">
            <span className="text-white font-black text-sm leading-none">HN</span>
          </div>
          <span className="text-xl font-bold text-gray-900 tracking-tight hidden sm:block">
            Hive<span className="text-primary">Nest</span>
          </span>
        </Link>

        {/* Search bar */}
        <form onSubmit={handleSearch} className="hidden md:flex flex-1 max-w-xl mx-4">
          <div className="flex w-full rounded-lg border border-gray-200 overflow-hidden focus-within:border-primary transition-colors">
            <input
              type="text" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search products, brands..."
              className="flex-1 px-4 py-2.5 text-sm outline-none"
            />
            <button type="submit" className="bg-primary text-white px-5 hover:bg-primary-dark transition-colors">
              <Search size={18} />
            </button>
          </div>
        </form>

        {/* Actions */}
        <div className="flex items-center gap-1 ml-auto">
          <button onClick={openSearch} className="md:hidden p-2 hover:text-primary transition-colors">
            <Search size={22} />
          </button>

          {/* User avatar button */}
          <button
            ref={btnRef}
            onClick={() => {
              if (!isAuthenticated) { navigate('/login'); return; }
              setUserMenuOpen((prev) => !prev);
            }}
            className="flex items-center gap-2 p-1.5 hover:text-primary transition-colors rounded-xl hover:bg-gray-50"
          >
            {isAuthenticated && user ? (
              <div className="relative">
                {user.avatar ? (
                  <img src={user.avatar} alt={user.name} className="w-8 h-8 rounded-full object-cover ring-2 ring-primary/30" />
                ) : (
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary to-rose-400 flex items-center justify-center text-white text-sm font-bold ring-2 ring-primary/20">
                    {user.name.charAt(0).toUpperCase()}
                  </div>
                )}
                <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 bg-green-400 rounded-full border-2 border-white" />
              </div>
            ) : (
              <User size={22} />
            )}
          </button>

          {/* Wishlist */}
          <Link to="/wishlist" className="relative p-2 hover:text-primary transition-colors">
            <Heart size={22} />
            {wishCount > 0 && (
              <motion.span key={wishCount} animate={{ scale: [1, 1.3, 1] }}
                className="absolute -top-0.5 -right-0.5 w-5 h-5 bg-primary text-white text-xs rounded-full flex items-center justify-center font-bold">
                {wishCount > 9 ? '9+' : wishCount}
              </motion.span>
            )}
          </Link>

          {/* Cart */}
          <button onClick={toggleCart} className="relative p-2 hover:text-primary transition-colors">
            <ShoppingBag size={22} />
            {cartCount > 0 && (
              <motion.span key={cartCount} animate={{ scale: [1, 1.3, 1] }}
                className="absolute -top-0.5 -right-0.5 w-5 h-5 bg-primary text-white text-xs rounded-full flex items-center justify-center font-bold">
                {cartCount > 9 ? '9+' : cartCount}
              </motion.span>
            )}
          </button>

          {/* Mobile menu toggle */}
          <button onClick={() => setMobileOpen(!mobileOpen)} className="md:hidden p-2">
            {mobileOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      {/* Desktop Nav */}
      <nav className="hidden md:block border-t border-gray-100">
        <div className="max-w-7xl mx-auto px-4">
          <ul className="flex items-center gap-0">
            {NAV_LINKS.map((link) => (
              <li key={link.label} className="relative group"
                onMouseEnter={() => link.sub && setActiveDropdown(link.label)}
                onMouseLeave={() => setActiveDropdown(null)}>
                <Link to={link.href}
                  className="flex items-center gap-1 px-4 py-3.5 text-sm font-medium text-gray-700 hover:text-primary transition-colors whitespace-nowrap">
                  {link.label}
                  {link.sub && <ChevronDown size={14} className={`transition-transform ${activeDropdown === link.label ? 'rotate-180' : ''}`} />}
                </Link>
                {link.sub && (
                  <AnimatePresence>
                    {activeDropdown === link.label && (
                      <motion.div
                        initial={{ opacity: 0, y: -5 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -5 }}
                        className="absolute top-full left-0 bg-white rounded-b-xl shadow-xl border border-t-0 border-gray-100 min-w-48 z-50">
                        {link.sub.map((s) => (
                          <Link key={s.label} to={s.href}
                            className="block px-5 py-2.5 text-sm text-gray-600 hover:text-primary hover:bg-primary-50 transition-colors">
                            {s.label}
                          </Link>
                        ))}
                      </motion.div>
                    )}
                  </AnimatePresence>
                )}
              </li>
            ))}
          </ul>
        </div>
      </nav>

      {/* Mobile Menu */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}
            className="md:hidden bg-white border-t border-gray-100 overflow-hidden">
            <div className="px-4 py-4">
              <form onSubmit={handleSearch} className="flex mb-4">
                <input type="text" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search products..."
                  className="flex-1 px-4 py-2 text-sm border border-gray-200 rounded-l-lg outline-none" />
                <button type="submit" className="bg-primary text-white px-4 rounded-r-lg"><Search size={16} /></button>
              </form>
              {NAV_LINKS.map((link) => (
                <div key={link.label}>
                  <Link to={link.href} onClick={() => setMobileOpen(false)}
                    className="block py-2.5 text-sm font-medium text-gray-700 border-b border-gray-50">{link.label}</Link>
                  {link.sub && link.sub.map((s) => (
                    <Link key={s.label} to={s.href} onClick={() => setMobileOpen(false)}
                      className="block py-2 pl-4 text-sm text-gray-500 border-b border-gray-50">— {s.label}</Link>
                  ))}
                </div>
              ))}
              {!isAuthenticated ? (
                <div className="flex gap-2 mt-4">
                  <Link to="/login" onClick={() => setMobileOpen(false)} className="flex-1 bg-primary text-white text-center py-2.5 rounded-lg text-sm font-medium">Login</Link>
                  <Link to="/register" onClick={() => setMobileOpen(false)} className="flex-1 border border-primary text-primary text-center py-2.5 rounded-lg text-sm font-medium">Sign Up</Link>
                </div>
              ) : (
                <button onClick={() => { logout(); setMobileOpen(false); }}
                  className="w-full mt-4 flex items-center justify-center gap-2 py-2.5 text-sm text-red-500 border border-red-200 rounded-lg">
                  <LogOut size={16} /> Logout
                </button>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── User Dropdown via Portal ── */}
      {userMenuOpen && isAuthenticated && user && createPortal(
        <>
          {/* Invisible full-screen backdrop — clicking it closes the menu */}
          <div
            style={{ position: 'fixed', inset: 0, zIndex: 9998 }}
            onClick={() => setUserMenuOpen(false)}
          />
          {/* Dropdown card */}
          <div
            style={{
              position: 'fixed',
              top: getMenuPos().top,
              right: getMenuPos().right,
              zIndex: 9999,
              width: 240,
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="bg-white rounded-2xl shadow-2xl border border-gray-100 overflow-hidden">
              {/* User info */}
              <div className="px-4 py-4 bg-gradient-to-r from-primary/5 to-rose-50 border-b border-gray-100">
                <div className="flex items-center gap-3">
                  {user.avatar ? (
                    <img src={user.avatar} alt={user.name} className="w-11 h-11 rounded-full object-cover ring-2 ring-primary/30" />
                  ) : (
                    <div className="w-11 h-11 rounded-full bg-gradient-to-br from-primary to-rose-400 flex items-center justify-center text-white text-lg font-bold flex-shrink-0">
                      {user.name.charAt(0).toUpperCase()}
                    </div>
                  )}
                  <div className="min-w-0">
                    <p className="font-semibold text-sm text-gray-900 truncate">{user.name}</p>
                    <p className="text-xs text-gray-500 truncate">{user.email}</p>
                    {['ADMIN', 'SUPER_ADMIN'].includes(user.role) && (
                      <span className="inline-block mt-0.5 text-xs bg-primary/10 text-primary font-semibold px-2 py-0.5 rounded-full">
                        {user.role === 'SUPER_ADMIN' ? '⚡ Super Admin' : '🛡️ Admin'}
                      </span>
                    )}
                  </div>
                </div>
              </div>
              {/* Links */}
              <div className="py-1.5">
                <Link to="/profile" onClick={() => setUserMenuOpen(false)}
                  className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 hover:text-primary transition-colors group">
                  <div className="w-8 h-8 rounded-lg bg-gray-100 group-hover:bg-primary/10 flex items-center justify-center transition-colors">
                    <Settings size={15} className="text-gray-500 group-hover:text-primary" />
                  </div>
                  <span>My Profile</span>
                </Link>
                <Link to="/orders" onClick={() => setUserMenuOpen(false)}
                  className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 hover:text-primary transition-colors group">
                  <div className="w-8 h-8 rounded-lg bg-gray-100 group-hover:bg-primary/10 flex items-center justify-center transition-colors">
                    <Package size={15} className="text-gray-500 group-hover:text-primary" />
                  </div>
                  <span>My Orders</span>
                </Link>
                <Link to="/wishlist" onClick={() => setUserMenuOpen(false)}
                  className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 hover:text-primary transition-colors group">
                  <div className="w-8 h-8 rounded-lg bg-gray-100 group-hover:bg-primary/10 flex items-center justify-center transition-colors">
                    <Heart size={15} className="text-gray-500 group-hover:text-primary" />
                  </div>
                  <span>Wishlist</span>
                </Link>
                {['ADMIN', 'SUPER_ADMIN'].includes(user.role) && (
                  <>
                    <div className="mx-4 my-1.5 border-t border-gray-100" />
                    <Link to="/admin" onClick={() => setUserMenuOpen(false)}
                      className="flex items-center gap-3 px-4 py-2.5 text-sm text-primary font-medium hover:bg-primary/5 transition-colors group">
                      <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                        <Settings size={15} className="text-primary" />
                      </div>
                      <span>Admin Panel</span>
                    </Link>
                  </>
                )}
                <div className="mx-4 my-1.5 border-t border-gray-100" />
                <button onClick={() => { logout(); setUserMenuOpen(false); }}
                  className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-red-500 hover:bg-red-50 transition-colors group">
                  <div className="w-8 h-8 rounded-lg bg-red-50 group-hover:bg-red-100 flex items-center justify-center transition-colors">
                    <LogOut size={15} className="text-red-400" />
                  </div>
                  <span>Sign Out</span>
                </button>
              </div>
            </div>
          </div>
        </>,
        document.body
      )}
    </header>
  );
}
