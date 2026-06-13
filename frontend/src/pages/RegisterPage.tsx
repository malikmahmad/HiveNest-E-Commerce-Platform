import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { Loader2, Eye, EyeOff } from 'lucide-react';
import toast from 'react-hot-toast';
import { useAuth } from '../hooks';
import { useAuthStore } from '../store';

export default function RegisterPage() {
  const [form, setForm] = useState({ name: '', email: '', password: '' });
  const [showPass, setShowPass] = useState(false);
  const { register, isRegistering } = useAuth();
  const { isAuthenticated } = useAuthStore();
  const navigate = useNavigate();

  // Already logged in → redirect to home
  useEffect(() => {
    if (isAuthenticated) navigate('/', { replace: true });
  }, [isAuthenticated, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const allPassed = form.password.length >= 8 && /[A-Z]/.test(form.password) && /[0-9]/.test(form.password);
    if (!allPassed) { toast.error('Password does not meet requirements'); return; }
    try {
      await register(form);
      navigate('/', { replace: true });
    } catch {
      // error shown by hook
    }
  };

  return (
    <>
      <Helmet><title>HiveNest</title></Helmet>
      <div className="min-h-[70vh] flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-md">
          <div className="text-center mb-8">
            <Link to="/" className="text-3xl font-bold">Hive<span className="text-primary">Nest</span></Link>
            <h1 className="text-xl font-bold text-gray-900 mt-4">Create your account</h1>
            <p className="text-gray-500 text-sm mt-1">Join thousands of happy shoppers</p>
          </div>
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-8">
            <form onSubmit={handleSubmit} className="space-y-5">
              {[
                { key: 'name', label: 'Full Name', type: 'text', placeholder: 'Your full name' },
                { key: 'email', label: 'Email', type: 'email', placeholder: 'your@email.com' },
              ].map(({ key, label, type, placeholder }) => (
                <div key={key}>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">{label}</label>
                  <input type={type} required value={(form as any)[key]} onChange={(e) => setForm({ ...form, [key]: e.target.value })}
                    placeholder={placeholder} className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/10 transition-all" />
                </div>
              ))}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Password</label>
                <div className="relative">
                  <input type={showPass ? 'text' : 'password'} required minLength={8} value={form.password}
                    onChange={(e) => setForm({ ...form, password: e.target.value })}
                    placeholder="Min 8 chars, 1 uppercase, 1 number"
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/10 pr-12 transition-all" />
                  <button type="button" onClick={() => setShowPass(!showPass)} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400">
                    {showPass ? <Eye size={16} /> : <EyeOff size={16} />}
                  </button>
                </div>
                <div className="flex gap-2 mt-2">
                  {[
                    { label: '8+ chars', ok: form.password.length >= 8 },
                    { label: 'Uppercase', ok: /[A-Z]/.test(form.password) },
                    { label: 'Number', ok: /[0-9]/.test(form.password) },
                  ].map(({ label, ok }) => (
                    <span key={label} className={`text-xs px-2 py-0.5 rounded-full font-medium transition-colors ${ok ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-400'}`}>
                      {ok ? '✓' : '○'} {label}
                    </span>
                  ))}
                </div>
              </div>
              <button type="submit" disabled={isRegistering || form.password.length < 8 || !/[A-Z]/.test(form.password) || !/[0-9]/.test(form.password)}
                className="w-full bg-primary text-white py-3.5 rounded-xl font-semibold flex items-center justify-center gap-2 hover:bg-primary-dark transition-colors disabled:opacity-50 disabled:cursor-not-allowed mt-2">
                {isRegistering ? <><Loader2 size={16} className="animate-spin" /> Creating...</> : '✨ Create Account'}
              </button>
            </form>
            <p className="text-center text-sm text-gray-500 mt-5">
              Already have an account? <Link to="/login" className="text-primary font-medium hover:underline">Login</Link>
            </p>
          </div>
        </div>
      </div>
    </>
  );
}
