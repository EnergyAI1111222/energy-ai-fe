import { create } from 'zustand';

export type TimeTabType = 'today' | 'trends' | 'forecast' | 'history';

interface TimeState {
  activeTab: TimeTabType;
  setActiveTab: (tab: TimeTabType) => void;
  // History tab ranges
  historyDateRange: [Date, Date] | null;
  setHistoryDateRange: (range: [Date, Date] | null) => void;
  // Global Resolution Switcher
  resolution: '15m' | '1h';
  setResolution: (res: '15m' | '1h') => void;
  // Time Scrubbing for Maps/Charts (0-95 for 15m intervals)
  selectedTimeSlot: number;
  setTimeSlot: (slot: number) => void;
}

export const useTimeStateStore = create<TimeState>((set) => ({
  activeTab: 'today',
  setActiveTab: (tab) => set({ activeTab: tab }),
  historyDateRange: null,
  setHistoryDateRange: (range) => set({ historyDateRange: range }),
  resolution: '15m',
  setResolution: (res) => set({ resolution: res }),
  selectedTimeSlot: 48, // Midpoint (noon)
  setTimeSlot: (slot) => set({ selectedTimeSlot: slot }),
}));
