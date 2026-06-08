import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { useMutation } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { authAPI } from '../services/api';
import { Loader2, CheckCircle, XCircle, Eye, EyeOff } from 'lucide-react';

// ─── Reset Password ───────────────────────────────────────────
export function ResetPassword() {
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const [form, setForm] = useState({ password: '', confirm: '' });
  const [showPass, setShowPass] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const token = params.get('token') || '';

  const mutation = useMutation({
    mutationFn: () => authAPI.resetPassword({ token, password: form.password }),
    onSuccess: () => { toast.success('Password reset! Please login.'); navigate('/login'); },
    onError: (err: any) => toast.error(err.response?.data?.message || 'Reset failed'),
  });

  return (
    <>
      <Helmet><title>Reset Password — HiveNest</title></Helmet>
      <div className="min-h-[70vh] flex items-center justify-center px-4">
        <div className="w-full max-w-md bg-white rounded-2xl border border-gray-100 shadow-sm p-8">
          <h1 className="text-xl font-bold text-gray-900 mb-2 text-center">Set New Password</h1>
          <form onSubmit={(e) => { e.preventDefault(); if (form.password !== form.confirm) { toast.error('Passwords don\'t match'); return; } mutation.mutate(); }} className="space-y-5 mt-6">
            {/* New Password */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">New Password</label>
              <div className="relative">
                <input
                  type={showPass ? 'text' : 'password'}
                  required
                  minLength={8}
                  value={form.password}
                  onChange={(e) => setForm({ ...form, password: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/10 pr-12 transition-all"
                />
                <button type="button" onClick={() => setShowPass(!showPass)} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                  {showPass ? <Eye size={16} /> : <EyeOff size={16} />}
                </button>
              </div>
            </div>
            {/* Confirm Password */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Confirm Password</label>
              <div className="relative">
                <input
                  type={showConfirm ? 'text' : 'password'}
                  required
                  minLength={8}
                  value={form.confirm}
                  onChange={(e) => setForm({ ...form, confirm: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/10 pr-12 transition-all"
                />
                <button type="button" onClick={() => setShowConfirm(!showConfirm)} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                  {showConfirm ? <Eye size={16} /> : <EyeOff size={16} />}
                </button>
              </div>
            </div>
            <button type="submit" disabled={mutation.isPending} className="w-full bg-primary text-white py-3.5 rounded-xl font-semibold flex items-center justify-center gap-2 hover:bg-primary-dark transition-colors disabled:opacity-60">
              {mutation.isPending ? <><Loader2 size={16} className="animate-spin" /> Resetting...</> : 'Reset Password'}
            </button>
          </form>
        </div>
      </div>
    </>
  );
}
export default ResetPassword;
