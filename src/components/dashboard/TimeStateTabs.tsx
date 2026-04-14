"use client";
import React from 'react';
import { useTimeStateStore, TimeTabType } from '@/store/useTimeStateStore';
import { Calendar } from 'lucide-react';

const TABS: { id: TimeTabType; label: string; desc: string }[] = [
  { id: 'today',    label: 'Today',       desc: '00:00 – 23:59' },
  { id: 'trends',   label: '3-Day',       desc: 'T-1 / Today / T+1' },
  { id: 'forecast', label: 'Forecast',    desc: 'Today + 2 days' },
  { id: 'history',  label: 'History',     desc: 'Custom range' },
];

export function TimeStateTabs() {
  const { activeTab, setActiveTab, resolution, setResolution, historyDateRange, setHistoryDateRange } = useTimeStateStore();

  const handleTabChange = (tab: TimeTabType) => {
    setActiveTab(tab);
    // Reset history range when switching away from history tab
    if (tab !== 'history' && historyDateRange) {
      setHistoryDateRange(null);
    }
  };

  // Default history range: last 14 days
  const defaultFrom = React.useMemo(() => {
    const d = new Date(); d.setUTCDate(d.getUTCDate() - 14);
    return d.toISOString().split('T')[0];
  }, []);
  const defaultTo = new Date().toISOString().split('T')[0];

  return (
    <div className="flex flex-col md:flex-row md:items-center gap-3 bg-white border border-slate-200 rounded-xl p-2 shadow-sm">
      {/* Tab buttons */}
      <div className="flex gap-1 overflow-x-auto">
        {TABS.map(tab => (
          <button
            key={tab.id}
            onClick={() => handleTabChange(tab.id)}
            title={tab.desc}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors whitespace-nowrap flex flex-col items-start ${
              activeTab === tab.id
                ? 'bg-slate-900 text-white shadow'
                : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
            }`}
          >
            <span>{tab.label}</span>
            {activeTab === tab.id && (
              <span className={`text-[9px] font-normal mt-0.5 ${
                activeTab === tab.id ? 'text-slate-400' : 'text-slate-400'
              }`}>{tab.desc}</span>
            )}
          </button>
        ))}
      </div>

      {/* History date range picker — only visible when history tab is active */}
      {activeTab === 'history' && (
        <div className="flex items-center gap-2 px-2 py-1 bg-slate-50 rounded-lg border border-slate-200">
          <Calendar className="w-3.5 h-3.5 text-slate-400 shrink-0" />
          <input
            type="date"
            defaultValue={historyDateRange ? historyDateRange[0].toISOString().split('T')[0] : defaultFrom}
            onChange={e => {
              const from = new Date(e.target.value);
              const to = historyDateRange ? historyDateRange[1] : new Date();
              if (!isNaN(from.getTime())) setHistoryDateRange([from, to]);
            }}
            className="text-xs font-mono text-slate-700 bg-transparent outline-none cursor-pointer"
          />
          <span className="text-slate-300 text-xs">→</span>
          <input
            type="date"
            defaultValue={historyDateRange ? historyDateRange[1].toISOString().split('T')[0] : defaultTo}
            onChange={e => {
              const to = new Date(e.target.value);
              const from = historyDateRange ? historyDateRange[0] : new Date(defaultFrom);
              if (!isNaN(to.getTime())) setHistoryDateRange([from, to]);
            }}
            className="text-xs font-mono text-slate-700 bg-transparent outline-none cursor-pointer"
          />
        </div>
      )}

      {/* Resolution switcher */}
      <div className="flex items-center gap-3 px-2 ml-auto">
        <span className="text-xs font-medium text-slate-500 hidden md:inline">Resolution</span>
        <div className="flex bg-slate-100 rounded-lg p-1 border border-slate-200">
          <button
            onClick={() => setResolution('15m')}
            className={`px-3 py-1 rounded-md text-xs font-bold transition-colors ${
              resolution === '15m' ? 'bg-white shadow text-[#2563eb]' : 'text-slate-500 hover:text-slate-700'
            }`}
          >
            15m
          </button>
          <button
            onClick={() => setResolution('1h')}
            className={`px-3 py-1 rounded-md text-xs font-bold transition-colors ${
              resolution === '1h' ? 'bg-white shadow text-[#2563eb]' : 'text-slate-500 hover:text-slate-700'
            }`}
          >
            1h
          </button>
        </div>
      </div>
    </div>
  );
}
