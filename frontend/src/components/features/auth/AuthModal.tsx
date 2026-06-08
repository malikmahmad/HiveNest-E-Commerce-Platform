import { useState } from 'react';
import { X, Eye, EyeOff, Loader2, ArrowLeft, Mail, CheckCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { useUIStore } from '../../../store';
import { useAuth } from '../../../hooks';
import { authAPI } from '../../../services/api';

type Tab = 'login' | 'register' | 'forgot';

export default function AuthModal() {
  const { authModalTab, closeAuthModal } = useUIStore();
  const navigate = useNavigate();
  const [tab, setTab] = useState<Tab>(authModalTab);
  const [showPass, setShowPass] = useState(false);
  const [showRegPass, setShowRegPass] = useState(false);
  const [forgotEmail, setForgotEmail] = useState('');
  const [forgotSent, setForgotSent] = useState(false);
  const [forgotLoading, setForgotLoading] = useState(false);
  const [loginData, setLoginData] = useState({ email: '', password: '' });
  const [registerData, setRegisterData] = useState({ name: '', email: '', password: '' });
  const { login, register, isLoggingIn, isRegistering } = useAuth();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await login(loginData);
      closeAuthModal();
      navigate('/');
    } catch {
      // error handled in hook
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await register(registerData);
      toast.success(`Welcome to HiveNest, ${registerData.name}! 🎉`);
      closeAuthModal();
      navigate('/');
    } catch {
      // error handled in hook
    }
  };

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setForgotLoading(true);
    try {
      await authAPI.forgotPassword(forgotEmail);
      setForgotSent(true);
    } catch {
      toast.error('Something went wrong. Please try again.');
    } finally {
      setForgotLoading(false);
    }
  };

  const inputClass = "w-full px-4 py-3 border border-gray-200 rounded-xl text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/10 transition-all";

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
        onClick={closeAuthModal}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          transition={{ type: 'spring', damping: 25, stiffness: 300 }}
          onClick={(e) => e.stopPropagation()}
          className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden"
        >
          {/* Header */}
          <div className="bg-gradient-to-r from-primary to-rose-500 p-6 text-white relative">
            <button
              onClick={closeAuthModal}
              className="absolute top-4 right-4 p-1.5 hover:bg-white/20 rounded-lg transition-colors"
            >
              <X size={18} />
            </button>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">
                <span className="text-xl">🐝</span>
              </div>
              <div>
                <h2 className="text-xl font-bold">HiveNest</h2>
                <p className="text-sm text-white/80">
                  {tab === 'login' ? 'Welcome back! Sign in to continue' :
                   tab === 'register' ? 'Create your free account today' :
                   'Reset your password'}
                </p>
              </div>
            </div>
          </div>

          {/* Tabs — only for login/register */}
          {tab !== 'forgot' && (
            <div className="flex border-b border-gray-100">
              {(['login', 'register'] as const).map((t) => (
                <button
                  key={t}
                  onClick={() => setTab(t)}
                  className={`flex-1 py-3.5 text-sm font-semibold capitalize transition-colors border-b-2 ${
                    tab === t ? 'border-primary text-primary' : 'border-transparent text-gray-400 hover:text-gray-600'
                  }`}
                >
                  {t === 'login' ? '🔐 Login' : '✨ Sign Up'}
                </button>
              ))}
            </div>
          )}

          <div className="p-6">
            <AnimatePresence mode="wait">

              {/* ── LOGIN ── */}
              {tab === 'login' && (
                <motion.form
                  key="login"
                  initial={{ opacity: 0, x: -15 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 15 }}
                  onSubmit={handleLogin}
                  className="space-y-4"
                >
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">Email Address</label>
                    <input
                      type="email"
                      required
                      value={loginData.email}
                      onChange={(e) => setLoginData({ ...loginData, email: e.target.value })}
                      placeholder="your@email.com"
                      className={inputClass}
                    />
                  </div>
                  <div>
                    <div className="flex justify-between items-center mb-1.5">
                      <label className="text-sm font-medium text-gray-700">Password</label>
                      <button
                        type="button"
                        onClick={() => setTab('forgot')}
                        className="text-xs text-primary hover:underline font-medium"
                      >
                        Forgot password?
                      </button>
                    </div>
                    <div className="relative">
                      <input
                        type={showPass ? 'text' : 'password'}
                        required
                        value={loginData.password}
                        onChange={(e) => setLoginData({ ...loginData, password: e.target.value })}
                        placeholder="Enter your password"
                        className={`${inputClass} pr-11`}
                      />
                      <button
                        type="button"
                        onClick={() => setShowPass(!showPass)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                      >
                        {showPass ? <EyeOff size={17} /> : <Eye size={17} />}
                      </button>
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={isLoggingIn}
                    className="w-full bg-primary text-white py-3.5 rounded-xl text-sm font-bold hover:bg-rose-500 transition-colors disabled:opacity-70 flex items-center justify-center gap-2 shadow-lg shadow-primary/25 mt-2"
                  >
                    {isLoggingIn
                      ? <><Loader2 size={16} className="animate-spin" /> Signing in...</>
                      : '🔐 Sign In'}
                  </button>

                  <p className="text-center text-sm text-gray-500 pt-1">
                    Don't have an account?{' '}
                    <button
                      type="button"
                      onClick={() => setTab('register')}
                      className="text-primary font-semibold hover:underline"
                    >
                      Sign up free
                    </button>
                  </p>
                </motion.form>
              )}

              {/* ── REGISTER ── */}
              {tab === 'register' && (
                <motion.form
                  key="register"
                  initial={{ opacity: 0, x: 15 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -15 }}
                  onSubmit={handleRegister}
                  className="space-y-4"
                >
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">Full Name</label>
                    <input
                      type="text"
                      required
                      minLength={2}
                      value={registerData.name}
                      onChange={(e) => setRegisterData({ ...registerData, name: e.target.value })}
                      placeholder="Your full name"
                      className={inputClass}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">Email Address</label>
                    <input
                      type="email"
                      required
                      value={registerData.email}
                      onChange={(e) => setRegisterData({ ...registerData, email: e.target.value })}
                      placeholder="your@email.com"
                      className={inputClass}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">Password</label>
                    <div className="relative">
                      <input
                        type={showRegPass ? 'text' : 'password'}
                        required
                        minLength={8}
                        value={registerData.password}
                        onChange={(e) => setRegisterData({ ...registerData, password: e.target.value })}
                        placeholder="Min 8 chars, 1 uppercase, 1 number"
                        className={`${inputClass} pr-11`}
                      />
                      <button
                        type="button"
                        onClick={() => setShowRegPass(!showRegPass)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                      >
                        {showRegPass ? <EyeOff size={17} /> : <Eye size={17} />}
                      </button>
                    </div>
                    <div className="flex gap-2 mt-2">
                      {[
                        { label: '8+ chars', ok: registerData.password.length >= 8 },
                        { label: 'Uppercase', ok: /[A-Z]/.test(registerData.password) },
                        { label: 'Number', ok: /[0-9]/.test(registerData.password) },
                      ].map(({ label, ok }) => (
                        <span key={label} className={`text-xs px-2 py-0.5 rounded-full font-medium transition-colors ${ok ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-400'}`}>
                          {ok ? '✓' : '○'} {label}
                        </span>
                      ))}
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={isRegistering}
                    className="w-full bg-primary text-white py-3.5 rounded-xl text-sm font-bold hover:bg-rose-500 transition-colors disabled:opacity-70 flex items-center justify-center gap-2 shadow-lg shadow-primary/25 mt-2"
                  >
                    {isRegistering
                      ? <><Loader2 size={16} className="animate-spin" /> Creating account...</>
                      : '✨ Create Account'}
                  </button>

                  <p className="text-center text-xs text-gray-400 pt-1">
                    By signing up, you agree to our Terms of Service & Privacy Policy.
                  </p>

                  <p className="text-center text-sm text-gray-500">
                    Already have an account?{' '}
                    <button
                      type="button"
                      onClick={() => setTab('login')}
                      className="text-primary font-semibold hover:underline"
                    >
                      Sign in
                    </button>
                  </p>
                </motion.form>
              )}

              {/* ── FORGOT PASSWORD ── */}
              {tab === 'forgot' && (
                <motion.div
                  key="forgot"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                >
                  <button
                    onClick={() => { setTab('login'); setForgotSent(false); setForgotEmail(''); }}
                    className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-primary mb-5 transition-colors"
                  >
                    <ArrowLeft size={15} /> Back to login
                  </button>

                  {forgotSent ? (
                    <div className="text-center py-4">
                      <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <CheckCircle size={32} className="text-green-500" />
                      </div>
                      <h3 className="text-lg font-bold text-gray-900 mb-2">Check Your Email!</h3>
                      <p className="text-sm text-gray-500 mb-1">
                        We've sent a password reset link to
                      </p>
                      <p className="text-sm font-semibold text-primary mb-4">{forgotEmail}</p>
                      <p className="text-xs text-gray-400">
                        Didn't receive it? Check your spam folder or{' '}
                        <button
                          onClick={() => setForgotSent(false)}
                          className="text-primary hover:underline"
                        >
                          try again
                        </button>
                      </p>
                    </div>
                  ) : (
                    <form onSubmit={handleForgotPassword} className="space-y-4">
                      <div className="text-center mb-5">
                        <div className="w-14 h-14 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-3">
                          <Mail size={24} className="text-primary" />
                        </div>
                        <h3 className="text-lg font-bold text-gray-900">Forgot Password?</h3>
                        <p className="text-sm text-gray-500 mt-1">
                          Enter your email and we'll send you a reset link.
                        </p>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1.5">Email Address</label>
                        <input
                          type="email"
                          required
                          value={forgotEmail}
                          onChange={(e) => setForgotEmail(e.target.value)}
                          placeholder="your@email.com"
                          className={inputClass}
                        />
                      </div>
                      <button
                        type="submit"
                        disabled={forgotLoading}
                        className="w-full bg-primary text-white py-3.5 rounded-xl text-sm font-bold hover:bg-rose-500 transition-colors disabled:opacity-70 flex items-center justify-center gap-2 shadow-lg shadow-primary/25"
                      >
                        {forgotLoading
                          ? <><Loader2 size={16} className="animate-spin" /> Sending...</>
                          : '📧 Send Reset Link'}
                      </button>
                    </form>
                  )}
                </motion.div>
              )}

            </AnimatePresence>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
