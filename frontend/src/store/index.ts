import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface User {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  role: string;
  isEmailVerified: boolean;
}

export interface CartItem {
  id: string;
  productId: string;
  variantId?: string;
  quantity: number;
  product: {
    id: string;
    name: string;
    slug: string;
    price: number;
    comparePrice?: number;
    images: { url: string }[];
    inventory?: { stock: number };
  };
  variant?: { name: string; value: string };
}

export interface WishlistItem {
  id: string;
  productId: string;
  product: {
    id: string;
    name: string;
    slug: string;
    price: number;
    comparePrice?: number;
    avgRating: number;
    images: { url: string }[];
    category: { name: string; slug: string };
    inventory?: { stock: number };
  };
}

interface AuthState {
  user: User | null;
  accessToken: string | null;
  isAuthenticated: boolean;
  setAuth: (user: User, token: string) => void;
  clearAuth: () => void;
  updateUser: (user: Partial<User>) => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      accessToken: null,
      isAuthenticated: false,
      setAuth: (user, accessToken) => {
        localStorage.setItem('accessToken', accessToken);
        set({ user, accessToken, isAuthenticated: true });
      },
      clearAuth: () => {
        localStorage.removeItem('accessToken');
        set({ user: null, accessToken: null, isAuthenticated: false });
      },
      updateUser: (updates) =>
        set((state) => ({ user: state.user ? { ...state.user, ...updates } : null })),
    }),
    { name: 'hn-auth', partialize: (state) => ({ user: state.user, isAuthenticated: state.isAuthenticated, accessToken: state.accessToken }) }
  )
);

interface CartState {
  items: CartItem[];
  isOpen: boolean;
  subtotal: number;
  count: number;
  setCart: (items: CartItem[], subtotal: number) => void;
  openCart: () => void;
  closeCart: () => void;
  toggleCart: () => void;
  clear: () => void;
}

export const useCartStore = create<CartState>()((set) => ({
  items: [],
  isOpen: false,
  subtotal: 0,
  count: 0,
  setCart: (items, subtotal) =>
    set({ items, subtotal, count: items.reduce((s, i) => s + i.quantity, 0) }),
  openCart: () => set({ isOpen: true }),
  closeCart: () => set({ isOpen: false }),
  toggleCart: () => set((s) => ({ isOpen: !s.isOpen })),
  clear: () => set({ items: [], subtotal: 0, count: 0 }),
}));

interface WishlistState {
  items: WishlistItem[];
  productIds: Set<string>;
  setWishlist: (items: WishlistItem[]) => void;
  toggle: (productId: string) => void;
  isWishlisted: (productId: string) => boolean;
}

export const useWishlistStore = create<WishlistState>()((set, get) => ({
  items: [],
  productIds: new Set(),
  setWishlist: (items) =>
    set({ items, productIds: new Set(items.map((i) => i.productId)) }),
  toggle: (productId) =>
    set((state) => {
      const newIds = new Set(state.productIds);
      const newItems = [...state.items];
      if (newIds.has(productId)) {
        newIds.delete(productId);
        return { productIds: newIds, items: newItems.filter((i) => i.productId !== productId) };
      } else {
        newIds.add(productId);
        return { productIds: newIds };
      }
    }),
  isWishlisted: (productId) => get().productIds.has(productId),
}));

interface UIState {
  isSearchOpen: boolean;
  isMobileMenuOpen: boolean;
  isAuthModalOpen: boolean;
  authModalTab: 'login' | 'register';
  openSearch: () => void;
  closeSearch: () => void;
  openMobileMenu: () => void;
  closeMobileMenu: () => void;
  openAuthModal: (tab?: 'login' | 'register') => void;
  closeAuthModal: () => void;
}

export const useUIStore = create<UIState>()((set) => ({
  isSearchOpen: false,
  isMobileMenuOpen: false,
  isAuthModalOpen: false,
  authModalTab: 'login',
  openSearch: () => set({ isSearchOpen: true }),
  closeSearch: () => set({ isSearchOpen: false }),
  openMobileMenu: () => set({ isMobileMenuOpen: true }),
  closeMobileMenu: () => set({ isMobileMenuOpen: false }),
  openAuthModal: (tab = 'login') => set({ isAuthModalOpen: true, authModalTab: tab }),
  closeAuthModal: () => set({ isAuthModalOpen: false }),
}));
