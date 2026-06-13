import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { authAPI, cartAPI, wishlistAPI, productAPI, orderAPI, reviewAPI, couponAPI, blogAPI } from '../services/api';
import { useAuthStore, useCartStore, useWishlistStore } from '../store';
import type { ProductFilters } from '../types';

export const useAuth = () => {
  const { user, isAuthenticated, setAuth, clearAuth, updateUser } = useAuthStore();
  const queryClient = useQueryClient();

  const loginMutation = useMutation({
    mutationFn: (data: { email: string; password: string }) => authAPI.login(data),
    onSuccess: ({ data }) => {
      const user = data.data.user;
      // Ensure all required fields exist with safe defaults
      setAuth({
        id: user.id,
        name: user.name,
        email: user.email,
        avatar: user.avatar ?? undefined,
        role: user.role ?? 'USER',
        isEmailVerified: user.isEmailVerified ?? true,
      }, data.data.accessToken);
      queryClient.invalidateQueries({ queryKey: ['cart'] });
      queryClient.invalidateQueries({ queryKey: ['wishlist'] });
      toast.success(`Welcome back, ${user.name}!`);
    },
    onError: (err: any) => {
      const data = err.response?.data;
      const msg = typeof data === 'string' ? data : data?.message || 'Login failed';
      toast.error(msg);
    },
  });

  const registerMutation = useMutation({
    mutationFn: (data: { name: string; email: string; password: string }) => authAPI.register(data),
    onSuccess: ({ data }: any) => {
      if (data?.data?.accessToken && data?.data?.user) {
        const user = data.data.user;
        setAuth({
          id: user.id,
          name: user.name,
          email: user.email,
          avatar: user.avatar ?? undefined,
          role: user.role ?? 'USER',
          isEmailVerified: user.isEmailVerified ?? false,
        }, data.data.accessToken);
        queryClient.invalidateQueries({ queryKey: ['cart'] });
        queryClient.invalidateQueries({ queryKey: ['wishlist'] });
        toast.success(`Welcome to HiveNest, ${user.name}!`);
      } else {
        // Email verification required — don't auto-login
        toast.success('Account created! Please check your email to verify your account.');
      }
    },
    onError: (err: any) => {
      // Handle rate limit (plain text), Zod errors (array), or AppError (string)
      const data = err.response?.data;
      const msg = typeof data === 'string'
        ? data
        : data?.errors?.[0]?.message || data?.message || 'Registration failed';
      toast.error(msg);
    },
  });

  const googleLoginMutation = useMutation({
    mutationFn: (credential: string) => authAPI.googleLogin(credential),
    onSuccess: ({ data }) => {
      const user = data.data.user;
      setAuth({
        id: user.id,
        name: user.name,
        email: user.email,
        avatar: user.avatar ?? undefined,
        role: user.role ?? 'USER',
        isEmailVerified: user.isEmailVerified ?? true,
      }, data.data.accessToken);
      toast.success(`Welcome, ${user.name}!`);
    },
    onError: (err: any) => toast.error(err.response?.data?.message || 'Google login failed'),
  });

  const logoutMutation = useMutation({
    mutationFn: () => authAPI.logout(),
    onSuccess: () => {
      clearAuth();
      queryClient.clear();
      toast.success('Logged out successfully');
    },
  });

  const updateProfileMutation = useMutation({
    mutationFn: (data: object) => authAPI.updateProfile(data),
    onSuccess: ({ data }) => { updateUser(data.data); toast.success('Profile updated'); },
    onError: (err: any) => toast.error(err.response?.data?.message || 'Update failed'),
  });

  return {
    user, isAuthenticated,
    login: loginMutation.mutateAsync,
    register: registerMutation.mutateAsync,
    googleLogin: googleLoginMutation.mutateAsync,
    logout: logoutMutation.mutate,
    updateProfile: updateProfileMutation.mutateAsync,
    isLoggingIn: loginMutation.isPending,
    isRegistering: registerMutation.isPending,
  };
};

export const useCart = () => {
  const { isAuthenticated } = useAuthStore();
  const { setCart, items, subtotal, count, openCart } = useCartStore();
  const queryClient = useQueryClient();

  const { isLoading } = useQuery({
    queryKey: ['cart'],
    queryFn: () => cartAPI.get().then((r) => { setCart(r.data.data.items, r.data.data.subtotal); return r.data.data; }),
    enabled: isAuthenticated,
    staleTime: 1000 * 60,
  });

  const addMutation = useMutation({
    mutationFn: (data: { productId: string; variantId?: string; quantity: number }) => cartAPI.add(data),
    onSuccess: ({ data }) => {
      setCart(data.data.items || items, data.data.subtotal || subtotal);
      queryClient.invalidateQueries({ queryKey: ['cart'] });
      openCart();
      toast.success('Added to cart!');
    },
    onError: (err: any) => toast.error(err.response?.data?.message || 'Failed to add'),
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, quantity }: { id: string; quantity: number }) => cartAPI.update(id, quantity),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['cart'] }),
  });

  const removeMutation = useMutation({
    mutationFn: (id: string) => cartAPI.remove(id),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['cart'] }); toast.success('Removed from cart'); },
  });

  const clearMutation = useMutation({
    mutationFn: () => cartAPI.clear(),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['cart'] }); },
  });

  return {
    items, subtotal, count, isLoading,
    addToCart: addMutation.mutateAsync,
    updateItem: updateMutation.mutate,
    removeItem: removeMutation.mutate,
    clearCart: clearMutation.mutate,
    isAdding: addMutation.isPending,
  };
};

export const useWishlist = () => {
  const { isAuthenticated } = useAuthStore();
  const { items, setWishlist, toggle, isWishlisted } = useWishlistStore();
  const queryClient = useQueryClient();

  useQuery({
    queryKey: ['wishlist'],
    queryFn: () => wishlistAPI.get().then((r) => { setWishlist(r.data.data); return r.data.data; }),
    enabled: isAuthenticated,
    staleTime: 1000 * 60 * 5,
  });

  const toggleMutation = useMutation({
    mutationFn: (productId: string) => wishlistAPI.toggle(productId),
    onSuccess: ({ data }, productId) => {
      toggle(productId);
      queryClient.invalidateQueries({ queryKey: ['wishlist'] });
      toast.success(data.data.wishlisted ? 'Added to wishlist' : 'Removed from wishlist');
    },
    onError: (err: any) => toast.error(err.response?.data?.message || 'Failed'),
  });

  return { items, isWishlisted, toggleWishlist: toggleMutation.mutate, count: items.length };
};

export const useProducts = (filters: ProductFilters = {}) => {
  return useQuery({
    queryKey: ['products', filters],
    queryFn: () => productAPI.getAll(filters).then((r) => r.data),
    staleTime: 1000 * 60 * 5,
    placeholderData: (prev) => prev,
  });
};

export const useProduct = (slug: string) => {
  return useQuery({
    queryKey: ['product', slug],
    queryFn: () => productAPI.getOne(slug).then((r) => r.data.data),
    enabled: !!slug,
    staleTime: 1000 * 60 * 10,
  });
};

export const useHomeData = () => {
  return useQuery({
    queryKey: ['home'],
    queryFn: () => productAPI.getHomeData().then((r) => r.data.data),
    staleTime: 1000 * 60 * 10,
  });
};

export const useSearch = (query: string) => {
  return useQuery({
    queryKey: ['search', query],
    queryFn: () => productAPI.search(query).then((r) => r.data.data),
    enabled: query.length > 1,
    staleTime: 1000 * 30,
  });
};

export const useOrders = (params?: object) => {
  return useQuery({
    queryKey: ['orders', params],
    queryFn: () => orderAPI.getAll(params).then((r) => r.data),
    staleTime: 1000 * 60,
  });
};

export const useOrder = (id: string) => {
  return useQuery({
    queryKey: ['order', id],
    queryFn: () => orderAPI.getOne(id).then((r) => r.data.data),
    enabled: !!id,
  });
};

export const useCreateOrder = () => {
  const queryClient = useQueryClient();
  const { clear } = useCartStore();
  return useMutation({
    mutationFn: (data: object) => orderAPI.create(data),
    onSuccess: ({ data }) => {
      queryClient.invalidateQueries({ queryKey: ['orders'] });
      queryClient.invalidateQueries({ queryKey: ['cart'] });
      clear();
      toast.success('Order placed successfully!');
      return data.data;
    },
    onError: (err: any) => toast.error(err.response?.data?.message || 'Order failed'),
  });
};

export const useCancelOrder = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, reason }: { id: string; reason?: string }) => orderAPI.cancel(id, reason),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['orders'] });
      toast.success('Order cancelled');
    },
    onError: (err: any) => toast.error(err.response?.data?.message || 'Cancellation failed'),
  });
};

export const useReviews = (productId: string, page = 1) => {
  return useQuery({
    queryKey: ['reviews', productId, page],
    queryFn: () => reviewAPI.getByProduct(productId, { page }).then((r) => r.data),
    enabled: !!productId,
  });
};

export const useAddReview = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: object) => reviewAPI.add(data),
    onSuccess: (_, variables: any) => {
      queryClient.invalidateQueries({ queryKey: ['reviews', variables.productId] });
      queryClient.invalidateQueries({ queryKey: ['product'] });
      toast.success('Review submitted!');
    },
    onError: (err: any) => toast.error(err.response?.data?.message || 'Review failed'),
  });
};

export const useValidateCoupon = () => {
  return useMutation({
    mutationFn: ({ code, subtotal }: { code: string; subtotal: number }) =>
      couponAPI.validate(code, subtotal).then((r) => r.data.data),
    onSuccess: (data) => toast.success(`Coupon applied! You save $${data.discount.toFixed(2)}`),
    onError: (err: any) => toast.error(err.response?.data?.message || 'Invalid coupon'),
  });
};

export const useBlogs = (params?: object) => {
  return useQuery({
    queryKey: ['blogs', params],
    queryFn: () => blogAPI.getAll(params).then((r) => r.data),
    staleTime: 1000 * 60 * 10,
  });
};

export const useBlog = (slug: string) => {
  return useQuery({
    queryKey: ['blog', slug],
    queryFn: () => blogAPI.getOne(slug).then((r) => r.data.data),
    enabled: !!slug,
  });
};

export const useBlogCategories = () => {
  return useQuery({
    queryKey: ['blogCategories'],
    queryFn: () => blogAPI.getCategories().then((r) => r.data.data),
    staleTime: 1000 * 60 * 30,
  });
};
