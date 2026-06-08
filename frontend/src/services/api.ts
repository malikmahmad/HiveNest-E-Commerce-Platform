import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || '/api/v1';

export const api = axios.create({
  baseURL: API_URL,
  withCredentials: true,
  headers: { 'Content-Type': 'application/json' },
});

// Request interceptor - attach access token
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('accessToken');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Response interceptor - auto refresh on 401
let isRefreshing = false;
let failedQueue: Array<{ resolve: (v: string) => void; reject: (e: unknown) => void }> = [];

const processQueue = (error: unknown, token: string | null = null) => {
  failedQueue.forEach((p) => (error ? p.reject(error) : p.resolve(token!)));
  failedQueue = [];
};

api.interceptors.response.use(
  (res) => res,
  async (error) => {
    const originalRequest = error.config;
    if (error.response?.status === 401 && !originalRequest._retry) {
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        }).then((token) => {
          originalRequest.headers.Authorization = `Bearer ${token}`;
          return api(originalRequest);
        });
      }
      originalRequest._retry = true;
      isRefreshing = true;
      try {
        const { data } = await axios.post(`${API_URL}/auth/refresh`, {}, { withCredentials: true });
        const { accessToken } = data.data;
        localStorage.setItem('accessToken', accessToken);
        processQueue(null, accessToken);
        originalRequest.headers.Authorization = `Bearer ${accessToken}`;
        return api(originalRequest);
      } catch (err) {
        processQueue(err, null);
        localStorage.removeItem('accessToken');
        window.location.href = '/login';
        return Promise.reject(err);
      } finally {
        isRefreshing = false;
      }
    }
    return Promise.reject(error);
  }
);

// ─── API SERVICES ─────────────────────────────────────────────

export const authAPI = {
  register: (data: object) => api.post('/auth/register', data),
  login: (data: object) => api.post('/auth/login', data),
  googleLogin: (credential: string) => api.post('/auth/google', { credential }),
  logout: () => api.post('/auth/logout'),
  getMe: () => api.get('/auth/me'),
  updateProfile: (data: object) => api.patch('/auth/me', data),
  addAddress: (data: object) => api.post('/auth/me/address', data),
  forgotPassword: (email: string) => api.post('/auth/forgot-password', { email }),
  resetPassword: (data: object) => api.post('/auth/reset-password', data),
  verifyEmail: (token: string) => api.get(`/auth/verify-email?token=${token}`),
};

export const productAPI = {
  getAll: (params?: object) => api.get('/products', { params }),
  getOne: (slug: string) => api.get(`/products/${slug}`),
  getHomeData: () => api.get('/products/home'),
  search: (q: string) => api.get('/products/search', { params: { q } }),
};

export const cartAPI = {
  get: () => api.get('/cart'),
  add: (data: object) => api.post('/cart', data),
  update: (id: string, quantity: number) => api.patch(`/cart/${id}`, { quantity }),
  remove: (id: string) => api.delete(`/cart/${id}`),
  clear: () => api.delete('/cart'),
};

export const wishlistAPI = {
  get: () => api.get('/wishlist'),
  toggle: (productId: string) => api.post('/wishlist/toggle', { productId }),
};

export const orderAPI = {
  getAll: (params?: object) => api.get('/orders', { params }),
  getOne: (id: string) => api.get(`/orders/${id}`),
  create: (data: object) => api.post('/orders', data),
  cancel: (id: string, reason?: string) => api.post(`/orders/${id}/cancel`, { reason }),
};

export const reviewAPI = {
  getByProduct: (productId: string, params?: object) => api.get(`/reviews/${productId}`, { params }),
  add: (data: object) => api.post('/reviews', data),
};

export const couponAPI = {
  validate: (code: string, subtotal: number) => api.post('/coupons/validate', { code, subtotal }),
};

export const blogAPI = {
  getAll: (params?: object) => api.get('/blogs', { params }),
  getOne: (slug: string) => api.get(`/blogs/${slug}`),
  getCategories: () => api.get('/blogs/categories'),
};

export const adminAPI = {
  getDashboard: () => api.get('/admin/dashboard'),
  getOrders: (params?: object) => api.get('/admin/orders', { params }),
  updateOrder: (id: string, data: object) => api.patch(`/admin/orders/${id}`, data),
  getUsers: (params?: object) => api.get('/admin/users', { params }),
  updateUser: (id: string, data: object) => api.patch(`/admin/users/${id}`, data),
  getCategories: () => api.get('/admin/categories'),
  createCategory: (data: object) => api.post('/admin/categories', data),
  updateCategory: (id: string, data: object) => api.patch(`/admin/categories/${id}`, data),
  deleteCategory: (id: string) => api.delete(`/admin/categories/${id}`),
  // Products
  createProduct: (data: object) => api.post('/products', data),
  updateProduct: (id: string, data: object) => api.patch(`/products/${id}`, data),
  deleteProduct: (id: string) => api.delete(`/products/${id}`),
  uploadImage: (file: File) => {
    const fd = new FormData();
    fd.append('image', file);
    return api.post('/upload/image', fd, { headers: { 'Content-Type': 'multipart/form-data' } });
  },
  getCoupons: () => api.get('/admin/coupons'),
  createCoupon: (data: object) => api.post('/admin/coupons', data),
  updateCoupon: (id: string, data: object) => api.patch(`/admin/coupons/${id}`, data),
  deleteCoupon: (id: string) => api.delete(`/admin/coupons/${id}`),
  getBlogs: (params?: object) => api.get('/admin/blogs', { params }),
  createBlog: (data: object) => api.post('/admin/blogs', data),
  updateBlog: (id: string, data: object) => api.patch(`/admin/blogs/${id}`, data),
  deleteBlog: (id: string) => api.delete(`/admin/blogs/${id}`),
  getInventory: () => api.get('/admin/inventory'),
  updateInventory: (productId: string, stock: number) => api.patch(`/admin/inventory/${productId}`, { stock }),
};
