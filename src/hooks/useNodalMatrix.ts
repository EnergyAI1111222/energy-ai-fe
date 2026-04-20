import { useQuery } from '@tanstack/react-query';
import { apiClient } from '@/api/client';

export type NodalMatrix = Record<string, Array<number | null>>;

export function useNodalMatrix(metric: string, date?: string) {
  return useQuery<NodalMatrix>({
    queryKey: ['nodal-matrix', metric, date ?? 'latest'],
    queryFn: async () => {
      const { data } = await apiClient.get('/nodal/heatmap-matrix', {
        params: { metric, date },
      });
      return data as NodalMatrix;
    },
    staleTime: 300_000,
  });
}

export function useEuPolygons() {
  return useQuery({
    queryKey: ['nodal-polygons'],
    queryFn: async () => {
      const { data } = await apiClient.get('/nodal/polygons');
      return data as { type: 'FeatureCollection'; features: any[] };
    },
    staleTime: 24 * 60 * 60 * 1000,
  });
}

export type EuDailyAverages = Record<string, Array<{ date: string; avg: number }>>;

export function useEuDailyAverages(metric: string, from?: string, to?: string) {
  return useQuery<EuDailyAverages>({
    queryKey: ['nodal-daily-avg', metric, from ?? '', to ?? ''],
    queryFn: async () => {
      const { data } = await apiClient.get('/nodal/eu-daily-averages', {
        params: { metric, from, to },
      });
      return data as EuDailyAverages;
    },
    staleTime: 5 * 60 * 1000,
  });
}
