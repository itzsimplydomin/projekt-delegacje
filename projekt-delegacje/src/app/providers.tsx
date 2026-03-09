import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { type ReactNode, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthProvider } from '../auth/AuthContext';
import { removeToken } from '../api/client';

// ── QueryClient ───────────────────────────────────────────────────────────────

function QueryProvider({ children }: { children: ReactNode }) {
  const navigate = useNavigate();

  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            refetchOnWindowFocus: false,
            retry: (failureCount, error: unknown) => {
              // Nie ponawiaj przy błędach autoryzacji
              if (
                typeof error === 'object' &&
                error !== null &&
                'response' in error &&
                (error as { response?: { status?: number } }).response?.status === 401
              ) {
                return false;
              }
              return failureCount < 2;
            },
          },
        },
      }),
  );

  // Nasłuchuj na zdarzenie z interceptora axios (błąd 401)
  useEffect(() => {
    const handleUnauthorized = () => {
      removeToken();
      queryClient.clear();
      navigate('/', { replace: true });
    };

    window.addEventListener('auth:unauthorized', handleUnauthorized);
    return () => window.removeEventListener('auth:unauthorized', handleUnauthorized);
  }, [navigate, queryClient]);

  return (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
}

// ── Główny Provider ───────────────────────────────────────────────────────────

interface ProvidersProps {
  children: ReactNode;
}

export const Providers = ({ children }: ProvidersProps) => {
  return (
    <AuthProvider>
      <QueryProvider>{children}</QueryProvider>
    </AuthProvider>
  );
};