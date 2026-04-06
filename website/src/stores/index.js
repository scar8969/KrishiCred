import { create } from 'zustand';
import { persist } from 'zustand/middleware';

// ============================================================
// AUTH STORE
// ============================================================
export const useAuthStore = create(
  persist(
    (set) => ({
      user: null,
      isAuthenticated: false,
      language: 'en',

      login: (user) => set({ user, isAuthenticated: true }),
      logout: () => set({ user: null, isAuthenticated: false }),
      setLanguage: (language) => set({ language }),
    }),
    { name: 'krishicred-auth' }
  )
);

// ============================================================
// FIRE STORE
// ============================================================
export const useFireStore = create((set, get) => ({
  fires: [],
  selectedFire: null,
  filters: {
    district: 'all',
    severity: 'all',
    status: 'all',
    dateRange: 'today',
  },
  stats: {
    total: 0,
    active: 0,
    resolved: 0,
    byDistrict: [],
  },

  setFires: (fires) => set({ fires }),
  setSelectedFire: (fire) => set({ selectedFire: fire }),
  setFilters: (filters) => set({ filters: { ...get().filters, ...filters } }),
  setStats: (stats) => set({ stats }),

  getFilteredFires: () => {
    const { fires, filters } = get();
    return fires.filter((fire) => {
      if (filters.district !== 'all' && fire.districtId !== filters.district) return false;
      if (filters.severity !== 'all' && fire.severity !== filters.severity) return false;
      if (filters.status !== 'all' && fire.status !== filters.status) return false;
      return true;
    });
  },
}));

// ============================================================
// MARKETPLACE STORE
// ============================================================
export const useMarketplaceStore = create((set) => ({
  listings: [],
  cart: [],
  filters: {
    minPrice: 0,
    maxPrice: 1000,
    minQuantity: 0,
    certification: 'all',
  },

  setListings: (listings) => set({ listings }),
  setFilters: (filters) => set((state) => ({ filters: { ...state.filters, ...filters } })),

  addToCart: (listing) => set((state) => {
    const exists = state.cart.find((item) => item.id === listing.id);
    if (exists) return state;
    return { cart: [...state.cart, { ...listing, quantity: listing.quantity }] };
  }),

  removeFromCart: (id) => set((state) => ({
    cart: state.cart.filter((item) => item.id !== id),
  })),

  clearCart: () => set({ cart: [] }),

  getTotalValue: () => {
    const { cart } = useMarketplaceStore.getState();
    return cart.reduce((sum, item) => sum + item.quantity * item.pricePerUnit, 0);
  },
}));

// ============================================================
// UI STORE
// ============================================================
export const useUIStore = create((set) => ({
  sidebarOpen: true,
  mobileMenuOpen: false,
  modalOpen: false,
  modalContent: null,
  toast: null,

  toggleSidebar: () => set((state) => ({ sidebarOpen: !state.sidebarOpen })),
  setSidebarOpen: (open) => set({ sidebarOpen: open }),

  toggleMobileMenu: () => set((state) => ({ mobileMenuOpen: !state.mobileMenuOpen })),
  setMobileMenuOpen: (open) => set({ mobileMenuOpen: open }),

  openModal: (content) => set({ modalOpen: true, modalContent: content }),
  closeModal: () => set({ modalOpen: false, modalContent: null }),

  showToast: (message, type = 'info') => set({ toast: { message, type } }),
  hideToast: () => set({ toast: null }),
}));

// ============================================================
// DEMO STORE
// ============================================================
export const useDemoStore = create((set) => ({
  currentStep: 1,
  selectedKhasra: '',
  selectedLanguage: 'pa',
  chatMessages: [],
  showCalculator: false,

  setCurrentStep: (step) => set({ currentStep: step }),
  setSelectedKhasra: (khasra) => set({ selectedKhasra: khasra }),
  setSelectedLanguage: (lang) => set({ selectedLanguage: lang }),

  addChatMessage: (message) => set((state) => ({
    chatMessages: [...state.chatMessages, message],
  })),

  resetChat: () => set({ chatMessages: [], currentStep: 1 }),

  setShowCalculator: (show) => set({ showCalculator: show }),
}));
