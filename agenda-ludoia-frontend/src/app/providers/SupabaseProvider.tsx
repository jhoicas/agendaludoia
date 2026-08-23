import React, { createContext, useContext } from 'react';
import { supabase } from '../../services/supabaseClient';
import type { SupabaseClient } from '@supabase/supabase-js';

const SupabaseContext = createContext<SupabaseClient | null>(null);

interface SupabaseProviderProps {
  children: React.ReactNode;
}

/**
 * Provides the Supabase client instance via context.
 * Use this when components need direct access to the Supabase client
 * for database queries, realtime subscriptions, or storage operations.
 */
export function SupabaseProvider({ children }: SupabaseProviderProps) {
  return (
    <SupabaseContext.Provider value={supabase}>
      {children}
    </SupabaseContext.Provider>
  );
}

/**
 * Hook to access the Supabase client from context.
 */
export function useSupabase() {
  const client = useContext(SupabaseContext);
  if (!client) {
    throw new Error('useSupabase must be used within a SupabaseProvider');
  }
  return client;
}
