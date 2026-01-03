import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getDelegacje, deleteDelegacja, updateDelegacja} from './client';
import type { Delegacja, DelegacjaCreate } from './types';
import { api } from './client';


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
    mutationFn: async (id: string) => {
      const response = await api.post(
        `/api/Delegacje/${id}/pdf`,
        null,
        { responseType: 'blob' }
      );
      return response.data as Blob;
    },
  });
};