import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';

export default function NotFound() {
  return (
    <>
      <Helmet><title>HiveNest - Premium E-Commerce Website</title></Helmet>
      <div className="min-h-[70vh] flex flex-col items-center justify-center px-4 text-center">
        <p className="text-8xl font-black text-gray-100 mb-2">404</p>
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Page not found</h1>
        <p className="text-gray-500 mb-8">The page you're looking for doesn't exist or has been moved.</p>
        <div className="flex gap-3">
          <Link to="/" className="bg-primary text-white px-6 py-3 rounded-xl font-medium hover:bg-primary-dark transition-colors">Go Home</Link>
          <Link to="/products" className="border border-gray-200 px-6 py-3 rounded-xl font-medium hover:border-primary text-gray-600 transition-colors">Browse Products</Link>
        </div>
      </div>
    </>
  );
}

