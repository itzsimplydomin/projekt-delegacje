import { useQuery } from '@tanstack/react-query';
import { getDelegacje } from './client';
import type { Delegacja } from './types';

// prosty hook do pobierania listy delegacji
export const useDelegacje = () => {
  return useQuery<Delegacja[]>({
    queryKey: ['delegacje'],
    queryFn: getDelegacje,
  });
};