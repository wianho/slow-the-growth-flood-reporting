import { useQuery } from '@tanstack/react-query';
import { getReports } from '../services/api';

export function useFloodReports() {
  return useQuery({
    queryKey: ['floodReports'],
    queryFn: () => getReports(),
    refetchInterval: 60000, // Refetch every minute
    staleTime: 30000, // Consider data stale after 30 seconds
  });
}
