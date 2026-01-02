import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getDelegacje, deleteDelegacja, updateDelegacja, generatePdf } from './client';
import type { Delegacja, DelegacjaCreate } from './types';

// istniejacy hook do pobierania delegacji
export const useDelegacje = () => {
  return useQuery<Delegacja[]>({
    queryKey: ['delegacje'],
    queryFn: getDelegacje,
  });
};

// nowe hooki
export const useDeleteDelegacja = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: deleteDelegacja,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['delegacje'] });
    },
  });
};

export const useUpdateDelegacja = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: Partial<DelegacjaCreate> }) =>
      updateDelegacja(id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['delegacje'] });
    },
  });
};

export const useGeneratePdf = () => {
  return useMutation({
    mutationFn: generatePdf,
  });
};