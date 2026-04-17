"use client";
import React from 'react';
import { useHeatmapData } from '@/hooks/useHeatmapData';
import { useRouter } from 'next/navigation';

const COUNTRY_FLAGS: Record<string, string> = {
  DE: '🇩🇪', FR: '🇫🇷', NL: '🇳🇱', BE: '🇧🇪', AT: '🇦🇹', CH: '🇨🇭',
  IT: '🇮🇹', ES: '🇪🇸', PL: '🇵🇱', CZ: '🇨🇿', SE: '🇸🇪', NO: '🇳🇴',
  FI: '🇫🇮', DK: '🇩🇰', UK: '🇬🇧', HU: '🇭🇺', RO: '🇷🇴', BG: '🇧🇬',
  GR: '🇬🇷', HR: '🇭🇷', SI: '🇸🇮', SK: '🇸🇰', PT: '🇵🇹', IE: '🇮🇪',
  EE: '🇪🇪', LV: '🇱🇻', LT: '🇱🇹', LU: '🇱🇺',
};

function getHeatColor(value: number, min: number, max: number): string {
  const range = max - min || 1;
  const ratio = Math.max(0, Math.min(1, (value - min) / range));
  if (ratio < 0.33) return 'bg-emerald-50 border-emerald-200 text-emerald-700';
  if (ratio < 0.66) return 'bg-amber-50 border-amber-200 text-amber-700';
  return 'bg-rose-50 border-rose-200 text-rose-700';
}

interface Props {
  metric: string;
  label: string;
  unit?: string;
}

export function CountryHeatmapGrid({ metric, label, unit = '€/MWh' }: Props) {
  const { data: heatmapData, isLoading } = useHeatmapData(metric);
  const router = useRouter();

  const entries = React.useMemo(() => {
    if (!heatmapData || typeof heatmapData !== 'object') return [];
    return Object.entries(heatmapData)
      .map(([code, val]) => ({ code: code.toUpperCase(), value: val as number }))
      .filter(e => e.value != null)
      .sort((a, b) => b.value - a.value);
  }, [heatmapData]);

  const min = entries.length > 0 ? Math.min(...entries.map(e => e.value)) : 0;
  const max = entries.length > 0 ? Math.max(...entries.map(e => e.value)) : 100;

  if (isLoading) {
    return (
      <div className="h-full flex items-center justify-center bg-slate-50 rounded-lg">
        <div className="w-4 h-4 border-2 border-[#2563eb] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (entries.length === 0) {
    return (
      <div className="h-full flex flex-col items-center justify-center bg-slate-50 rounded-lg border border-slate-100 p-3">
        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest text-center">{label}</p>
        <p className="text-[9px] text-slate-300 mt-1">No data available</p>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col bg-white rounded-lg border border-slate-200 overflow-hidden">
      <div className="px-3 py-2 border-b border-slate-100 bg-slate-50/50 flex items-center justify-between">
        <span className="text-[10px] font-bold text-slate-600 uppercase tracking-widest">{label}</span>
        <span className="text-[9px] font-mono text-slate-400">{unit}</span>
      </div>
      <div className="flex-1 overflow-y-auto p-2 grid grid-cols-2 gap-1.5 auto-rows-min">
        {entries.map(({ code, value }) => (
          <button
            key={code}
            onClick={() => router.push(`/eu/cwe/${code.toLowerCase()}`)}
            className={`flex items-center justify-between px-2 py-1.5 rounded-md border text-left transition-all hover:scale-[1.02] ${getHeatColor(value, min, max)}`}
          >
            <span className="text-[11px] font-bold flex items-center gap-1">
              <span className="text-xs">{COUNTRY_FLAGS[code] || ''}</span>
              {code}
            </span>
            <span className="text-[11px] font-mono font-bold">{value.toFixed(1)}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
