import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { useMutation } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { authAPI } from '../services/api';
import { Loader2, CheckCircle } from 'lucide-react';

export default function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [sent, setSent] = useState(false);
  const mutation = useMutation({
    mutationFn: (e: string) => authAPI.forgotPassword(e),
    onSuccess: () => setSent(true),
    onError: () => setSent(true), // Don't reveal if email exists
  });

  return (
    <>
      <Helmet><title>HiveNest - Premium E-Commerce Website</title></Helmet>
      <div className="min-h-[70vh] flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-md">
          <div className="text-center mb-8">
            <Link to="/" className="text-3xl font-bold">Hive<span className="text-primary">Nest</span></Link>
            <h1 className="text-xl font-bold text-gray-900 mt-4">Reset Password</h1>
          </div>
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-8">
            {sent ? (
              <div className="text-center">
                <CheckCircle size={56} className="text-green-500 mx-auto mb-4" />
                <h2 className="font-bold text-lg text-gray-900 mb-2">Check your email</h2>
                <p className="text-sm text-gray-500 mb-5">If that email exists, we've sent a password reset link. Check your inbox and spam folder.</p>
                <Link to="/login" className="text-primary font-medium hover:underline text-sm">Back to Login</Link>
              </div>
            ) : (
              <form onSubmit={(e) => { e.preventDefault(); mutation.mutate(email); }} className="space-y-5">
                <p className="text-sm text-gray-500 -mt-2">Enter your email and we'll send you a reset link.</p>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Email Address</label>
                  <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)}
                    placeholder="your@email.com" className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/10 transition-all" />
                </div>
                <button type="submit" disabled={mutation.isPending} className="w-full bg-primary text-white py-3.5 rounded-xl font-semibold flex items-center justify-center gap-2 hover:bg-primary-dark transition-colors disabled:opacity-60">
                  {mutation.isPending ? <><Loader2 size={16} className="animate-spin" /> Sending...</> : 'Send Reset Link'}
                </button>
                <p className="text-center text-sm text-gray-500"><Link to="/login" className="text-primary hover:underline">Back to Login</Link></p>
              </form>
            )}
          </div>
        </div>
      </div>
    </>
  );
}

