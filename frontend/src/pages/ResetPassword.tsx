import { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { useMutation } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { authAPI } from '../services/api';
import { Loader2, Eye, EyeOff } from 'lucide-react';

const checks = [
  { label: '8+ chars',  test: (p: string) => p.length >= 8 },
  { label: 'Uppercase', test: (p: string) => /[A-Z]/.test(p) },
  { label: 'Number',    test: (p: string) => /[0-9]/.test(p) },
];

export function ResetPassword() {
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const [form, setForm] = useState({ password: '', confirm: '' });
  const [showPass, setShowPass] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const token = params.get('token') || '';

  const allPassed = checks.every((c) => c.test(form.password));
  const confirmMatch = form.confirm.length > 0 && form.password === form.confirm;

  const mutation = useMutation({
    mutationFn: () => authAPI.resetPassword({ token, password: form.password }),
    onSuccess: () => { toast.success('Password reset! Please login.'); navigate('/login'); },
    onError: (err: any) => toast.error(err.response?.data?.message || 'Reset failed'),
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!allPassed) { toast.error('Password does not meet requirements'); return; }
    if (form.password !== form.confirm) { toast.error("Passwords don't match"); return; }
    mutation.mutate();
  };

  return (
    <>
      <Helmet><title>HiveNest</title></Helmet>
      <div className="min-h-[70vh] flex items-center justify-center px-4">
        <div className="w-full max-w-md bg-white rounded-2xl border border-gray-100 shadow-sm p-8">
          <h1 className="text-xl font-bold text-gray-900 mb-2 text-center">Set New Password</h1>
          <p className="text-center text-sm text-gray-500 mb-6">Choose a strong password for your account</p>

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* New Password */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">New Password</label>
              <div className="relative">
                <input
                  type={showPass ? 'text' : 'password'}
                  required
                  value={form.password}
                  onChange={(e) => setForm({ ...form, password: e.target.value })}
                  placeholder="Min 8 chars, 1 uppercase, 1 number"
                  className={`w-full px-4 py-3 border rounded-xl text-sm outline-none pr-12 transition-all
                    ${form.password.length > 0
                      ? allPassed
                        ? 'border-green-400 focus:ring-2 focus:ring-green-100'
                        : 'border-orange-300 focus:ring-2 focus:ring-orange-100'
                      : 'border-gray-200 focus:border-primary focus:ring-2 focus:ring-primary/10'
                    }`}
                />
                <button type="button" onClick={() => setShowPass(!showPass)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                  {showPass ? <Eye size={16} /> : <EyeOff size={16} />}
                </button>
              </div>

              {/* Live requirement indicators */}
              <div className="flex gap-2 mt-2">
                {checks.map(({ label, test }) => {
                  const ok = test(form.password);
                  return (
                    <span key={label}
                      className={`text-xs px-2 py-0.5 rounded-full font-medium transition-all duration-200
                        ${ok ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-400'}`}>
                      {ok ? '✓' : '○'} {label}
                    </span>
                  );
                })}
              </div>
            </div>

            {/* Confirm Password */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Confirm Password</label>
              <div className="relative">
                <input
                  type={showConfirm ? 'text' : 'password'}
                  required
                  value={form.confirm}
                  onChange={(e) => setForm({ ...form, confirm: e.target.value })}
                  placeholder="Repeat your password"
                  className={`w-full px-4 py-3 border rounded-xl text-sm outline-none pr-12 transition-all
                    ${form.confirm.length > 0
                      ? confirmMatch
                        ? 'border-green-400 focus:ring-2 focus:ring-green-100'
                        : 'border-red-300 focus:ring-2 focus:ring-red-100'
                      : 'border-gray-200 focus:border-primary focus:ring-2 focus:ring-primary/10'
                    }`}
                />
                <button type="button" onClick={() => setShowConfirm(!showConfirm)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                  {showConfirm ? <Eye size={16} /> : <EyeOff size={16} />}
                </button>
              </div>
              {/* Match hint */}
              {form.confirm.length > 0 && (
                <p className={`text-xs mt-1.5 font-medium transition-colors ${confirmMatch ? 'text-green-600' : 'text-red-500'}`}>
                  {confirmMatch ? '✓ Passwords match' : '✗ Passwords do not match'}
                </p>
              )}
            </div>

            <button
              type="submit"
              disabled={mutation.isPending || !allPassed || !confirmMatch}
              className="w-full bg-primary text-white py-3.5 rounded-xl font-semibold flex items-center justify-center gap-2
                hover:bg-primary-dark transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {mutation.isPending
                ? <><Loader2 size={16} className="animate-spin" /> Resetting...</>
                : 'Reset Password'}
            </button>
          </form>
        </div>
      </div>
    </>
  );
}

export default ResetPassword;
