import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

export interface ActivePatient {
  id: string;
  full_name: string;
  email: string;
  phone?: string;
  rut_or_dni?: string;
  avatar_url?: string;
  birth_date?: string;
  gender?: string;
  medical_conditions?: string[];
  allergies?: string[];
  emergency_contact?: {
    name: string;
    phone: string;
    relationship: string;
  };
  role?: string;
  tenant_id?: string;
  [key: string]: any;
}

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

  /** Tenant branding colors */
  tenantColors: { primary: string; secondary?: string } | null;
  setTenantColors: (colors: { primary: string; secondary?: string } | null) => void;

  // Global Patient State for Active Consultations
  activePatient: ActivePatient | null;
  setActivePatient: (patient: ActivePatient | null) => void;
  clearActivePatient: () => void;

  // Recent patients history
  recentPatients: ActivePatient[];
  addRecentPatient: (patient: ActivePatient) => void;
  clearRecentPatients: () => void;
}

export const useAppStore = create<AppState>()(
  persist(
    (set, get) => ({
      tenantSlug: null,
      setTenantSlug: (slug) => set({ tenantSlug: slug }),

      sidebarOpen: true,
      toggleSidebar: () => set((state) => ({ sidebarOpen: !state.sidebarOpen })),

      theme: 'dark',
      toggleTheme: () =>
        set((state) => ({ theme: state.theme === 'dark' ? 'light' : 'dark' })),

      tenantColors: null,
      setTenantColors: (colors) => set({ tenantColors: colors }),

      activePatient: null,
      setActivePatient: (patient) => {
        set({ activePatient: patient });
        if (patient) {
          get().addRecentPatient(patient);
          window.dispatchEvent(
            new CustomEvent('kinesys_active_patient_changed', { detail: { patient } })
          );
        } else {
          window.dispatchEvent(
            new CustomEvent('kinesys_active_patient_changed', { detail: { patient: null } })
          );
        }
      },
      clearActivePatient: () => {
        set({ activePatient: null });
        window.dispatchEvent(
          new CustomEvent('kinesys_active_patient_changed', { detail: { patient: null } })
        );
      },

      recentPatients: [],
      addRecentPatient: (patient) => {
        if (!patient || !patient.id) return;
        set((state) => {
          const filtered = state.recentPatients.filter((p) => p.id !== patient.id);
          return {
            recentPatients: [patient, ...filtered].slice(0, 6),
          };
        });
      },
      clearRecentPatients: () => set({ recentPatients: [] }),
    }),
    {
      name: 'kinesys_app_active_patient_store',
      storage: createJSONStorage(() => sessionStorage),
    }
  )
);
