import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { type ReactNode, useState } from 'react';

// Provider dla React Query
interface ProvidersProps {
  children: ReactNode;
}

// Ustawienia i konfiguracja dostawców kontekstu
export const Providers = ({ children }: ProvidersProps) => {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            refetchOnWindowFocus: false,
          },
        },
      }),
  );

  // Zwracanie dostawcy kontekstu React Query
  return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>;
};
