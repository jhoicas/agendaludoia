import React, { createContext, useContext, useEffect, useState } from 'react';
import type { Session, User } from '@supabase/supabase-js';
import { supabase } from '../../services/supabaseClient';

export type UserRole = 'super_admin' | 'clinic_admin' | 'physio' | 'nutritionist' | 'general_doctor' | 'patient';

import type { Tenant } from '../../types';

interface AuthContextType {
  session: Session | null;
  user: (User & { full_name?: string; tenant_id?: string; license_number?: string; role?: string }) | null; // supabase user
  role: UserRole;
  fullName: string | null;
  tenantId: string | null;
  loading: boolean;
  signInWithMagicLink: (email: string) => Promise<void>;
  signOut: () => Promise<void>;
  tenant?: Tenant | null;
  availableUsers?: any[];
  setUserAndRole?: (user: any, role: string) => void;
  trialDaysLeft?: number;
  isTrialExpired?: boolean;
  updateTenant?: (tenant: any) => void;
}

const AuthContext = createContext<AuthContextType>({
  session: null,
  user: null,
  role: 'patient',
  fullName: null,
  tenantId: null,
  loading: true,
  signInWithMagicLink: async () => {},
  signOut: async () => {},
});

interface AuthProviderProps {
  children: React.ReactNode;
}

/**
 * Supabase Auth context provider con soporte para Claims JWT y Roles RBAC de public.users.
 */
export function AuthProvider({ children }: AuthProviderProps) {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [role, setRole] = useState<UserRole>('patient');
  const [fullName, setFullName] = useState<string | null>(null);
  const [tenantId, setTenantId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  // Extraer rol y perfil desde public.users en la BD
  const extractUserProfile = async (userObj: User | null) => {
    if (!userObj) {
      setRole('patient');
      setFullName(null);
      setTenantId(null);
      return;
    }

    try {
      const { data, error } = await supabase
        .from('users')
        .select('role, full_name, tenant_id')
        .eq('id', userObj.id)
        .single();

      if (error || !data) {
        if (error?.code === 'PGRST116') {
          // Ghost session, not found in public.users
          await supabase.auth.signOut();
          setUser(null);
          setRole('patient');
          setFullName(null);
          setTenantId(null);
          return;
        }
        
        // Fallback a los metadatos
        const metaRole = userObj.app_metadata?.role || userObj.user_metadata?.role;
        if (metaRole) {
          setRole(metaRole as UserRole);
        } else {
          setRole('pending' as any);
        }
        setFullName((userObj.user_metadata?.full_name || userObj.email) as string);
        setTenantId((userObj.app_metadata?.tenant_id || userObj.user_metadata?.tenant_id || null) as string | null);
      } else {
        setRole(data.role as UserRole);
        setFullName(data.full_name);
        setTenantId(data.tenant_id);
      }
    } catch (e: any) {
      console.error('Error fetching user profile:', e);
      if (e?.code === 'PGRST116') {
        await supabase.auth.signOut();
        setUser(null);
        setRole('patient');
        setFullName(null);
        setTenantId(null);
        return;
      }
      setRole('pending' as any);
    }
  };

  useEffect(() => {
    let mounted = true;

    // Obtener sesión inicial
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      if (!mounted) return;
      setSession(session);
      setUser(session?.user ?? null);
      await extractUserProfile(session?.user ?? null);
      setLoading(false);
    });

    // Escuchar cambios de autenticación en tiempo real
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (_event, session) => {
        if (!mounted) return;
        setLoading(true);
        setSession(session);
        setUser(session?.user ?? null);
        await extractUserProfile(session?.user ?? null);
        setLoading(false);
      }
    );

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  const signInWithMagicLink = async (email: string) => {
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        emailRedirectTo: `${window.location.origin}/dashboard`,
      },
    });

    if (error) throw error;
  };

  const signOut = async () => {
    await supabase.auth.signOut();
  };

  return (
    <AuthContext.Provider
      value={{
        session,
        user,
        role,
        fullName,
        tenantId,
        loading,
        signInWithMagicLink,
        signOut,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
