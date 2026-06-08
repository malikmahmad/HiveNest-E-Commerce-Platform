// AdminLayout.tsx
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { LayoutDashboard, Package, ShoppingCart, Users, Tag, BookOpen, Percent, Boxes, LogOut, Menu, X, ArrowLeft, Store } from 'lucide-react';
import { useState } from 'react';
import { useAuth } from '../../hooks';
import { useAuthStore } from '../../store';

const NAV = [
  { href: '/admin', icon: LayoutDashboard, label: 'Dashboard' },
  { href: '/admin/products', icon: Package, label: 'Products' },
  { href: '/admin/orders', icon: ShoppingCart, label: 'Orders' },
  { href: '/admin/users', icon: Users, label: 'Users' },
  { href: '/admin/categories', icon: Tag, label: 'Categories' },
  { href: '/admin/blogs', icon: BookOpen, label: 'Blogs' },
  { href: '/admin/coupons', icon: Percent, label: 'Coupons' },
  { href: '/admin/inventory', icon: Boxes, label: 'Inventory' },
];

export default function AdminLayout() {
  const { pathname } = useLocation();
  const { logout } = useAuth();
  const { user } = useAuthStore();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="flex h-screen bg-gray-100 overflow-hidden">
      {/* Sidebar */}
      <aside className={`${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0 fixed lg:static inset-y-0 left-0 z-50 w-64 bg-gray-900 text-white flex flex-col transition-transform duration-300`}>
        
        {/* Logo */}
        <div className="p-5 border-b border-white/10 flex items-center justify-between">
          <Link to="/admin" className="text-xl font-bold">
            Hive<span className="text-primary">Nest</span>
            <span className="text-xs bg-primary/20 text-primary px-2 py-0.5 rounded-full ml-1">Admin</span>
          </Link>
          <button onClick={() => setSidebarOpen(false)} className="lg:hidden"><X size={20} /></button>
        </div>

        {/* User info */}
        {user && (
          <div className="px-4 py-3 border-b border-white/10 flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-gradient-to-br from-primary to-rose-400 flex items-center justify-center text-white text-sm font-bold flex-shrink-0">
              {user.name.charAt(0).toUpperCase()}
            </div>
            <div className="min-w-0">
              <p className="text-sm font-semibold text-white truncate">{user.name}</p>
              <p className="text-xs text-gray-400 truncate">{user.role === 'SUPER_ADMIN' ? '⚡ Super Admin' : '🛡️ Admin'}</p>
            </div>
          </div>
        )}

        {/* Nav links */}
        <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
          {NAV.map(({ href, icon: Icon, label }) => (
            <Link
              key={href}
              to={href}
              onClick={() => setSidebarOpen(false)}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-colors ${
                pathname === href
                  ? 'bg-primary text-white shadow-md shadow-primary/30'
                  : 'text-gray-400 hover:bg-white/10 hover:text-white'
              }`}
            >
              <Icon size={18} /> {label}
            </Link>
          ))}
        </nav>

        {/* Bottom actions */}
        <div className="p-3 border-t border-white/10 space-y-1">
          {/* Back to Store */}
          <Link
            to="/"
            className="w-full flex items-center gap-3 px-4 py-3 text-sm text-gray-300 hover:text-white hover:bg-white/10 rounded-xl transition-colors"
          >
            <Store size={18} />
            <span>Back to Store</span>
            <ArrowLeft size={14} className="ml-auto opacity-50" />
          </Link>

          {/* Logout */}
          <button
            onClick={() => { logout(); navigate('/'); }}
            className="w-full flex items-center gap-3 px-4 py-3 text-sm text-gray-400 hover:text-red-400 hover:bg-red-400/10 rounded-xl transition-colors"
          >
            <LogOut size={18} />
            <span>Logout</span>
          </button>
        </div>
      </aside>

      {/* Main content */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Mobile topbar */}
        <header className="bg-white border-b border-gray-200 px-6 py-4 flex items-center gap-3 lg:hidden">
          <button onClick={() => setSidebarOpen(true)}><Menu size={22} /></button>
          <h1 className="font-bold text-gray-900">Admin Panel</h1>
          <Link to="/" className="ml-auto flex items-center gap-1.5 text-sm text-primary font-medium">
            <ArrowLeft size={16} /> Store
          </Link>
        </header>

        {/* Desktop topbar */}
        <header className="hidden lg:flex bg-white border-b border-gray-200 px-6 py-3.5 items-center justify-between">
          <div className="flex items-center gap-2 text-sm text-gray-500">
            <span className="font-medium text-gray-800">Admin Panel</span>
            <span>/</span>
            <span className="text-primary font-medium capitalize">
              {pathname === '/admin' ? 'Dashboard' : pathname.replace('/admin/', '')}
            </span>
          </div>
          <Link
            to="/"
            className="flex items-center gap-2 px-4 py-2 bg-gray-100 hover:bg-primary hover:text-white text-gray-700 rounded-xl text-sm font-medium transition-colors"
          >
            <Store size={16} />
            Back to Store
          </Link>
        </header>

        <main className="flex-1 overflow-y-auto p-6">
          <Outlet />
        </main>
      </div>

      {/* Mobile backdrop */}
      {sidebarOpen && (
        <div className="fixed inset-0 bg-black/40 z-40 lg:hidden" onClick={() => setSidebarOpen(false)} />
      )}
    </div>
  );
}
