import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface AppState {
  displayTimezone: string;
  isSyncActive: boolean;
  from_utc?: string;
  to_utc?: string;
  resolution: '15m' | '1h';
  
  setDisplayTimezone: (tz: string) => void;
  setSyncActive: (active: boolean) => void;
  setResolution: (res: '15m' | '1h') => void;
  setTimeWindow: (from?: string, to?: string) => void;
}

export const useAppStore = create<AppState>()(
  persist(
    (set) => ({
      displayTimezone: 'Europe/Berlin', 
      isSyncActive: true,
      resolution: '1h',
      from_utc: undefined, // Defaults to last 24h at API level
      to_utc: undefined,
      
      setDisplayTimezone: (tz) => set({ displayTimezone: tz }),
      setSyncActive: (active) => set({ isSyncActive: active }),
      setResolution: (res) => set({ resolution: res }),
      setTimeWindow: (from, to) => set({ from_utc: from, to_utc: to }),
    }),
    {
      name: 'energy-ai-storage',
    }
  )
);
