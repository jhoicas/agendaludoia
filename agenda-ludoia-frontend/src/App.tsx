import { QueryProvider } from './app/providers/QueryProvider';
import { AuthProvider } from './app/providers/AuthProvider';
import { SupabaseProvider } from './app/providers/SupabaseProvider';
import { AppRouter } from './app/router/AppRouter';
import './index.css';

/**
 * Root application component for AgendaLudoia.
 * Wraps the app with all necessary providers:
 * - SupabaseProvider: Supabase client context
 * - AuthProvider: Authentication state management
 * - QueryProvider: React Query data fetching
 */
function App() {
  return (
    <SupabaseProvider>
      <AuthProvider>
        <QueryProvider>
          <AppRouter />
        </QueryProvider>
      </AuthProvider>
    </SupabaseProvider>
  );
}

export default App;
