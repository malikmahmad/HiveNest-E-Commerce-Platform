import { useEffect, useState } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { ChevronUp } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import Header from './Header';
import Footer from './Footer';
import CartDrawer from '../features/cart/CartDrawer';
import AuthModal from '../features/auth/AuthModal';
import SearchModal from '../features/search/SearchModal';
import { useUIStore, useCartStore } from '../../store';

export default function Layout() {
  const { pathname } = useLocation();
  const { isSearchOpen, isAuthModalOpen } = useUIStore();
  const { isOpen: isCartOpen } = useCartStore();
  const [showScrollTop, setShowScrollTop] = useState(false);

  // Scroll to top on route change
  useEffect(() => { window.scrollTo({ top: 0, behavior: 'smooth' }); }, [pathname]);

  // Show scroll-to-top button after scrolling down 400px
  useEffect(() => {
    const handleScroll = () => setShowScrollTop(window.scrollY > 400);
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Lock body scroll when drawers open
  useEffect(() => {
    const locked = isCartOpen || isSearchOpen || isAuthModalOpen;
    document.body.style.overflow = locked ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [isCartOpen, isSearchOpen, isAuthModalOpen]);

  return (
    <div className="flex flex-col min-h-screen bg-white">
      <Header />
      <main className="flex-1">
        <Outlet />
      </main>
      <Footer />
      <CartDrawer />
      {isAuthModalOpen && <AuthModal />}
      {isSearchOpen && <SearchModal />}

      {/* Scroll to Top Button */}
      <AnimatePresence>
        {showScrollTop && (
          <motion.button
            initial={{ opacity: 0, scale: 0.5, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.5, y: 20 }}
            transition={{ duration: 0.2 }}
            onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
            className="fixed bottom-6 right-6 z-[199] w-12 h-12 bg-primary text-white rounded-full shadow-lg shadow-primary/40 flex items-center justify-center hover:bg-primary-dark hover:scale-110 transition-all duration-200"
            aria-label="Scroll to top"
          >
            <ChevronUp size={22} strokeWidth={2.5} />
          </motion.button>
        )}
      </AnimatePresence>
    </div>
  );
}
