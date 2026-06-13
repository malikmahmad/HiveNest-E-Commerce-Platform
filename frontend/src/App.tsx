import { Suspense, lazy, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from 'react-hot-toast';
import { HelmetProvider } from 'react-helmet-async';
import { useAuthStore } from './store';
import Layout from './components/layout/Layout';
import AdminLayout from './components/layout/AdminLayout';
import LoadingSpinner from './components/ui/LoadingSpinner';
import { authAPI } from './services/api';

const HomePage        = lazy(() => import('./pages/HomePage'));
const ProductsPage    = lazy(() => import('./pages/ProductsPage'));
const ProductDetail   = lazy(() => import('./pages/ProductDetail'));
const CartPage        = lazy(() => import('./pages/CartPage'));
const WishlistPage    = lazy(() => import('./pages/WishlistPage'));
const CheckoutPage    = lazy(() => import('./pages/CheckoutPage'));
const OrdersPage      = lazy(() => import('./pages/OrdersPage'));
const OrderDetail     = lazy(() => import('./pages/OrderDetail'));
const ProfilePage     = lazy(() => import('./pages/ProfilePage'));
const BlogPage        = lazy(() => import('./pages/BlogPage'));
const BlogDetail      = lazy(() => import('./pages/BlogDetail'));
const LoginPage       = lazy(() => import('./pages/LoginPage'));
const RegisterPage    = lazy(() => import('./pages/RegisterPage'));
const ForgotPassword  = lazy(() => import('./pages/ForgotPassword'));
const ResetPassword   = lazy(() => import('./pages/ResetPassword'));
const VerifyEmail     = lazy(() => import('./pages/VerifyEmail'));
const NotFound        = lazy(() => import('./pages/NotFound'));

const AdminDashboard  = lazy(() => import('./pages/admin/Dashboard'));
const AdminProducts   = lazy(() => import('./pages/admin/Products'));
const AdminOrders     = lazy(() => import('./pages/admin/Orders'));
const AdminUsers      = lazy(() => import('./pages/admin/Users'));
const AdminCategories = lazy(() => import('./pages/admin/Categories'));
const AdminBlogs      = lazy(() => import('./pages/admin/Blogs'));
const AdminCoupons    = lazy(() => import('./pages/admin/Coupons'));
const AdminInventory  = lazy(() => import('./pages/admin/Inventory'));

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
      staleTime: 1000 * 60 * 5,
    },
  },
});

const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { isAuthenticated } = useAuthStore();
  return isAuthenticated ? <>{children}</> : <Navigate to="/login" replace />;
};

const AdminRoute = ({ children }: { children: React.ReactNode }) => {
  const { user, isAuthenticated } = useAuthStore();
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  if (!['ADMIN', 'SUPER_ADMIN'].includes(user?.role || '')) return <Navigate to="/" replace />;
  return <>{children}</>;
};

const GuestRoute = ({ children }: { children: React.ReactNode }) => {
  const { isAuthenticated } = useAuthStore();
  return isAuthenticated ? <Navigate to="/" replace /> : <>{children}</>;
};

export default function App() {
  const { isAuthenticated, setAuth } = useAuthStore();

  useEffect(() => {
    const token = localStorage.getItem('accessToken');
    if (isAuthenticated && token) {
      authAPI.getMe()
        .then(({ data }) => { setAuth(data.data, token); })
        .catch(() => {});
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <HelmetProvider>
      <QueryClientProvider client={queryClient}>
        <BrowserRouter>
          <Suspense fallback={<LoadingSpinner fullScreen />}>
            <Routes>
              <Route element={<Layout />}>
                <Route path="/" element={<HomePage />} />
                <Route path="/products" element={<ProductsPage />} />
                <Route path="/products/:slug" element={<ProductDetail />} />
                <Route path="/category/:slug" element={<ProductsPage />} />
                <Route path="/blog" element={<BlogPage />} />
                <Route path="/blog/:slug" element={<BlogDetail />} />
                <Route path="/cart" element={<CartPage />} />
                <Route path="/wishlist" element={<WishlistPage />} />
                <Route path="/login" element={<GuestRoute><LoginPage /></GuestRoute>} />
                <Route path="/register" element={<GuestRoute><RegisterPage /></GuestRoute>} />
                <Route path="/forgot-password" element={<GuestRoute><ForgotPassword /></GuestRoute>} />
                <Route path="/reset-password" element={<ResetPassword />} />
                <Route path="/verify-email" element={<VerifyEmail />} />
                <Route path="/checkout" element={<ProtectedRoute><CheckoutPage /></ProtectedRoute>} />
                <Route path="/orders" element={<ProtectedRoute><OrdersPage /></ProtectedRoute>} />
                <Route path="/orders/:id" element={<ProtectedRoute><OrderDetail /></ProtectedRoute>} />
                <Route path="/profile" element={<ProtectedRoute><ProfilePage /></ProtectedRoute>} />
                <Route path="*" element={<NotFound />} />
              </Route>
              <Route path="/admin" element={<AdminRoute><AdminLayout /></AdminRoute>}>
                <Route index element={<AdminDashboard />} />
                <Route path="products" element={<AdminProducts />} />
                <Route path="orders" element={<AdminOrders />} />
                <Route path="users" element={<AdminUsers />} />
                <Route path="categories" element={<AdminCategories />} />
                <Route path="blogs" element={<AdminBlogs />} />
                <Route path="coupons" element={<AdminCoupons />} />
                <Route path="inventory" element={<AdminInventory />} />
              </Route>
            </Routes>
          </Suspense>

          <Toaster
            position="bottom-right"
            toastOptions={{
              duration: 3000,
              style: { fontFamily: 'Poppins, sans-serif', fontSize: '14px', borderRadius: '8px' },
              success: { iconTheme: { primary: '#ff4785', secondary: '#fff' } },
            }}
          />
        </BrowserRouter>
      </QueryClientProvider>
    </HelmetProvider>
  );
}
