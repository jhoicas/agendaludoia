/**
 * Global Zustand store for lightweight application state.
 * Heavy feature-specific state is managed within feature hooks.
 */
import { create } from 'zustand';

interface AppState {
  /** Current tenant slug from URL or session */
  tenantSlug: string | null;
  setTenantSlug: (slug: string) => void;

  /** Sidebar open/closed state */
  sidebarOpen: boolean;
  toggleSidebar: () => void;

  /** Theme preference */
  theme: 'light' | 'dark';
  toggleTheme: () => void;
}

export const useAppStore = create<AppState>((set) => ({
  tenantSlug: null,
  setTenantSlug: (slug) => set({ tenantSlug: slug }),

  sidebarOpen: true,
  toggleSidebar: () => set((state) => ({ sidebarOpen: !state.sidebarOpen })),

  theme: 'dark',
  toggleTheme: () =>
    set((state) => ({ theme: state.theme === 'dark' ? 'light' : 'dark' })),
}));
