import { ThemeProvider } from './app/providers/ThemeProvider';
import { I18nProvider } from './app/providers/I18nProvider';
import { QueryProvider } from './app/providers/QueryProvider';
import { AuthProvider } from './app/providers/AuthProvider';
import { SupabaseProvider } from './app/providers/SupabaseProvider';
import { AppRouter } from './app/router/AppRouter';
import './index.css';

/**
 * Root application component for AgendaLudoia.
 * Wraps the app with all necessary providers.
 */
function App() {
  return (
    <ThemeProvider>
      <I18nProvider>
        <SupabaseProvider>
          <AuthProvider>
            <QueryProvider>
              <AppRouter />
            </QueryProvider>
          </AuthProvider>
        </SupabaseProvider>
      </I18nProvider>
    </ThemeProvider>
  );
}

export default App;
