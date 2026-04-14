import { useQuery } from '@tanstack/react-query';
import { apiClient } from '@/api/client';

export function useHeatmapData(metric: string, date?: string) {
  return useQuery({
    queryKey: ['heatmap', metric, date],
    queryFn: async () => {
      const { data } = await apiClient.get('/maps/heatmap', {
        params: { metric, date }
      });
      return data;
    },
    staleTime: 300000, // 5 minutes cache
  });
}
