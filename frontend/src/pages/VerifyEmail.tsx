import { useEffect, useState } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { CheckCircle, XCircle, Loader2 } from 'lucide-react';
import { authAPI } from '../services/api';

export default function VerifyEmail() {
  const [params] = useSearchParams();
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const token = params.get('token') || '';

  useEffect(() => {
    if (!token) { setStatus('error'); return; }
    authAPI.verifyEmail(token)
      .then(() => setStatus('success'))
      .catch(() => setStatus('error'));
  }, [token]);

  return (
    <>
      <Helmet><title>HiveNest - Premium E-Commerce Website</title></Helmet>
      <div className="min-h-[70vh] flex items-center justify-center px-4">
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-10 text-center max-w-md w-full">
          {status === 'loading' && <><Loader2 size={56} className="text-primary animate-spin mx-auto mb-4" /><h2 className="text-lg font-bold text-gray-900">Verifying your email...</h2></>}
          {status === 'success' && <><CheckCircle size={56} className="text-green-500 mx-auto mb-4" /><h2 className="text-xl font-bold text-gray-900 mb-2">Email Verified!</h2><p className="text-gray-500 text-sm mb-5">Your account is now active. You can login.</p><Link to="/login" className="bg-primary text-white px-8 py-3 rounded-xl font-medium hover:bg-primary-dark transition-colors">Login Now</Link></>}
          {status === 'error' && <><XCircle size={56} className="text-red-500 mx-auto mb-4" /><h2 className="text-xl font-bold text-gray-900 mb-2">Verification Failed</h2><p className="text-gray-500 text-sm mb-5">Invalid or expired verification link.</p><Link to="/" className="text-primary font-medium hover:underline">Go Home</Link></>}
        </div>
      </div>
    </>
  );
}

