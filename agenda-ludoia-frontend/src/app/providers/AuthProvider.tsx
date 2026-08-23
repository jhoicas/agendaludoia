import React, { createContext, useContext, useEffect, useState } from 'react';
import type { Session, User } from '@supabase/supabase-js';
import { supabase } from '../../services/supabaseClient';

export type UserRole = 'super_admin' | 'clinic_admin' | 'physio' | 'patient';

interface AuthContextType {
  session: Session | null;
  user: User | null;
  role: UserRole;
  tenantId: string | null;
  loading: boolean;
  signInWithMagicLink: (email: string) => Promise<void>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  session: null,
  user: null,
  role: 'patient',
  tenantId: null,
  loading: true,
  signInWithMagicLink: async () => {},
  signOut: async () => {},
});

interface AuthProviderProps {
  children: React.ReactNode;
}

/**
 * Supabase Auth context provider con soporte para Claims JWT y Roles RBAC.
 */
export function AuthProvider({ children }: AuthProviderProps) {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [role, setRole] = useState<UserRole>('patient');
  const [tenantId, setTenantId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  // Extraer rol y claims del usuario o JWT de Supabase
  const extractUserClaims = (userObj: User | null) => {
    if (!userObj) {
      setRole('patient');
      setTenantId(null);
      return;
    }

    // Buscar rol en app_metadata o user_metadata (Claims Supabase)
    const userRole = (userObj.app_metadata?.role || userObj.user_metadata?.role || 'patient') as UserRole;
    const tId = (userObj.app_metadata?.tenant_id || userObj.user_metadata?.tenant_id || null) as string | null;

    setRole(userRole);
    setTenantId(tId);
  };

  useEffect(() => {
    // Obtener sesión inicial
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      extractUserClaims(session?.user ?? null);
      setLoading(false);
    });

    // Escuchar cambios de autenticación en tiempo real
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setSession(session);
        setUser(session?.user ?? null);
        extractUserClaims(session?.user ?? null);
        setLoading(false);
      }
    );

    return () => subscription.unsubscribe();
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
