// LoginPage.tsx
import { useEffect } from 'react';
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { Eye, EyeOff, Loader2 } from 'lucide-react';
import { useAuth } from '../hooks';
import { useAuthStore } from '../store';

export default function LoginPage() {
  const [form, setForm] = useState({ email: '', password: '' });
  const [showPass, setShowPass] = useState(false);
  const { login, isLoggingIn } = useAuth();
  const { isAuthenticated } = useAuthStore();
  const navigate = useNavigate();

  // Already logged in → redirect to home
  useEffect(() => {
    if (isAuthenticated) navigate('/', { replace: true });
  }, [isAuthenticated, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await login(form);
      navigate('/', { replace: true });
    } catch {
      // error shown by hook
    }
  };

  return (
    <>
      <Helmet><title>Login — HiveNest</title></Helmet>
      <div className="min-h-[70vh] flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-md">
          <div className="text-center mb-8">
            <Link to="/" className="text-3xl font-bold">Hive<span className="text-primary">Nest</span></Link>
            <h1 className="text-xl font-bold text-gray-900 mt-4">Welcome back</h1>
            <p className="text-gray-500 text-sm mt-1">Login to your account to continue</p>
          </div>
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-8">
            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Email</label>
                <input type="email" required value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })}
                  placeholder="your@email.com" autoComplete="email" className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/10 transition-all" />
              </div>
              <div>
                <div className="flex justify-between mb-1.5">
                  <label className="text-sm font-medium text-gray-700">Password</label>
                  <Link to="/forgot-password" className="text-xs text-primary hover:underline">Forgot password?</Link>
                </div>
                <div className="relative">
                  <input type={showPass ? 'text' : 'password'} required value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })}
                    placeholder="Your password" autoComplete="current-password" className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/10 pr-12 transition-all" />
                  <button type="button" onClick={() => setShowPass(!showPass)} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                    {showPass ? <Eye size={16} /> : <EyeOff size={16} />}
                  </button>
                </div>
              </div>
              <button type="submit" disabled={isLoggingIn} className="w-full bg-primary text-white py-3.5 rounded-xl font-semibold flex items-center justify-center gap-2 hover:bg-primary-dark transition-colors disabled:opacity-60">
                {isLoggingIn ? <><Loader2 size={16} className="animate-spin" /> Logging in...</> : 'Login'}
              </button>
            </form>
            <p className="text-center text-sm text-gray-500 mt-5">
              Don't have an account? <Link to="/register" className="text-primary font-medium hover:underline">Sign up free</Link>
            </p>
          </div>
        </div>
      </div>
    </>
  );
}
