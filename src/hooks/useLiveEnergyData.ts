import { useQuery } from '@tanstack/react-query';
import { useTimeStateStore } from '@/store/useTimeStateStore';
import { energyApi } from '@/api/client';
import { useMemo } from 'react';

// Per spec MS-FE-005 + Addendum section 2:
// Today/Trends: poll 180s when includes current time
// Forecast: poll 600s when includes current time
// History: no polling
function getTimeWindow(
  activeTab: string,
  historyDateRange: [Date, Date] | null,
  resolution: '15m' | '1h'
): { from_utc?: string; to_utc?: string; refetchInterval: number | false; resolution: string } {
  const now = new Date();
  const todayStart = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate(), 0, 0, 0, 0));
  const todayEnd   = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate(), 23, 59, 59, 999));

  switch (activeTab) {
    case 'today':
      // Use a 7-day lookback so latest available data shows even when today is empty.
      // Once live scrapers run daily, this can be narrowed back to single day.
      return {
        from_utc: new Date(todayStart.getTime() - 7 * 86400_000).toISOString(),
        to_utc: todayEnd.toISOString(),
        refetchInterval: 180_000,  // 3 min — per spec
        resolution: '1h',  // 1h for 7d window to stay performant
      };

    case 'trends': {
      // T-7 to Today (extended window to show available data)
      const from = new Date(todayStart); from.setUTCDate(from.getUTCDate() - 7);
      const to   = new Date(todayEnd);   to.setUTCDate(to.getUTCDate() + 1);
      return {
        from_utc: from.toISOString(),
        to_utc: to.toISOString(),
        refetchInterval: 180_000,  // 3 min — per spec
        resolution: '1h',
      };
    }

    case 'forecast': {
      // Last 3 days + 2 days ahead (stitched with forecast data if available)
      const from = new Date(todayStart); from.setUTCDate(from.getUTCDate() - 3);
      const to   = new Date(todayEnd);   to.setUTCDate(to.getUTCDate() + 2);
      return {
        from_utc: from.toISOString(),
        to_utc: to.toISOString(),
        refetchInterval: 600_000,  // 10 min — per spec
        resolution: '1h',
      };
    }

    case 'history': {
      if (historyDateRange) {
        const from = new Date(historyDateRange[0]);
        from.setUTCHours(0, 0, 0, 0);
        const to = new Date(historyDateRange[1]);
        to.setUTCHours(23, 59, 59, 999);

        // Per spec: > 3 months (90 days) → force server-side downsampling to 1d
        const diffDays = (to.getTime() - from.getTime()) / (1000 * 60 * 60 * 24);
        const effectiveResolution = diffDays > 90 ? '1d' : resolution;
        return {
          from_utc: from.toISOString(),
          to_utc: to.toISOString(),
          refetchInterval: false,  // No polling for history — per spec
          resolution: effectiveResolution,
        };
      }
      // Default history: last 30 days at 1h resolution
      const from = new Date(todayStart); from.setUTCDate(from.getUTCDate() - 30);
      return {
        from_utc: from.toISOString(),
        to_utc: todayEnd.toISOString(),
        refetchInterval: false,
        resolution: '1h',
      };
    }

    default:
      return { refetchInterval: false, resolution };
  }
}

export function useLiveEnergyData(datasetIds: string[]) {
  const { activeTab, historyDateRange, resolution } = useTimeStateStore();

  const timeWindow = useMemo(
    () => getTimeWindow(activeTab, historyDateRange, resolution),
    [activeTab, historyDateRange, resolution]
  );

  return useQuery({
    queryKey: ['energyBatch', datasetIds, timeWindow.from_utc, timeWindow.to_utc, timeWindow.resolution],
    queryFn: async () => {
      if (!datasetIds.length) return { results: {} };
      return energyApi.fetchBatch({
        datasets: datasetIds.map(id => ({ dataset_id: id })),
        from_utc: timeWindow.from_utc,
        to_utc: timeWindow.to_utc,
        resolution: timeWindow.resolution,
      });
    },
    refetchInterval: timeWindow.refetchInterval,
    refetchIntervalInBackground: false, // Per spec: pause polling when tab is not visible
    staleTime: 60_000,
    enabled: datasetIds.length > 0,
  });
}
