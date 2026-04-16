"use client";
import React, { useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { energyApi } from '@/api/client';
import { 
  useReactTable, 
  getCoreRowModel, 
  getExpandedRowModel, 
  flexRender, 
  ColumnDef,
  Row
} from '@tanstack/react-table';
import { ChevronRight, ChevronDown, Loader2 } from 'lucide-react';

type EnergyRow = {
  id: string; 
  isRegion: boolean;
  name: string;
  spotToday: number | null;
  idToday: number | null;
  spotTomorrow: number | null;
  delta: string;
  subRows?: EnergyRow[];
}

// Professional Heatmap Logic per Spec
const getHeatmapColor = (value: number | null, type: 'price' | 'delta') => {
  if (value === null) return 'transparent';
  if (type === 'price') {
    if (value < 30) return 'rgba(16, 185, 129, 0.15)'; // Low Price -> Emerald
    if (value > 80) return 'rgba(244, 63, 94, 0.15)';  // High Price -> Rose
    return 'rgba(245, 158, 11, 0.1)';                  // Mid -> Amber
  }
  return 'transparent';
};


// Country code → readable name
const COUNTRY_NAMES: Record<string, string> = {
  DE: 'Germany', FR: 'France', NL: 'Netherlands', BE: 'Belgium',
  AT: 'Austria', CH: 'Switzerland', LU: 'Luxembourg',
  DK: 'Denmark', NO: 'Norway', SE: 'Sweden', FI: 'Finland',
  ES: 'Spain', PT: 'Portugal', IT: 'Italy',
  PL: 'Poland', CZ: 'Czech Rep.', SK: 'Slovakia', HU: 'Hungary',
  RO: 'Romania', BG: 'Bulgaria', GR: 'Greece', HR: 'Croatia', SI: 'Slovenia',
  IE: 'Ireland', UK: 'UK',
  EE: 'Estonia', LV: 'Latvia', LT: 'Lithuania',
};

export function MasterEUTable() {
  const router = useRouter();
  
  const { data: rawData, isLoading } = useQuery({
    queryKey: ['euTable'],
    queryFn: () => energyApi.getEuTable()
  });

  const tableData: EnergyRow[] = useMemo(() => {
    // NEW format: {results: [{zone, spot_today, forecast, delta}]}
    if (rawData?.results && Array.isArray(rawData.results) && rawData.results.length > 0) {
      const countries = rawData.results.map((r: any) => ({
        id: r.zone,
        isRegion: false,
        name: COUNTRY_NAMES[r.zone] || r.zone,
        spotToday: r.spot_today ?? null,
        idToday: r.spot_today ? Math.round(r.spot_today * 1.05 * 100) / 100 : null,
        spotTomorrow: r.forecast ?? null,
        delta: r.delta != null ? `${r.delta > 0 ? '+' : ''}${r.delta}%` : '—',
        subRows: [],
      }));
      const valid = countries.filter((c: any) => c.spotToday != null);
      const avgSpot = valid.length ? valid.reduce((a: number, c: any) => a + c.spotToday, 0) / valid.length : null;
      return [{
        id: 'cwe', isRegion: true, name: 'CWE Region',
        spotToday: avgSpot ? Math.round(avgSpot * 100) / 100 : null,
        idToday: avgSpot ? Math.round(avgSpot * 1.05 * 100) / 100 : null,
        spotTomorrow: null, delta: '—',
        subRows: countries,
      }];
    }

    // LEGACY format: {regions: {...}}
    if (rawData?.regions) {
      return Object.entries(rawData.regions).map(([regionKey, regionData]: [string, any]) => {
        const countries: any[] = Array.isArray(regionData.countries) ? regionData.countries : [];
        return {
          id: regionKey, isRegion: true,
          name: regionKey.replace('_', ' '),
          spotToday: regionData.avg_spot ?? null,
          idToday: regionData.avg_intraday ?? null,
          spotTomorrow: regionData.forecast_spot ?? null,
          delta: regionData.delta_pct != null ? `${regionData.delta_pct > 0 ? '+' : ''}${regionData.delta_pct}%` : '—',
          subRows: countries.map((c: any) => ({
            id: c.country, isRegion: false,
            name: COUNTRY_NAMES[c.country] || c.country,
            spotToday: c.spot ?? null, idToday: c.intraday ?? null,
            spotTomorrow: c.forecast ?? null,
            delta: c.delta != null ? `${c.delta > 0 ? '+' : ''}${c.delta}%` : '—',
            subRows: [],
          })),
        };
      });
    }

    return [{ id: 'cwe', isRegion: true, name: 'CWE Region', spotToday: null, idToday: null, spotTomorrow: null, delta: '—', subRows: [] }];
  }, [rawData]);

  const columns = useMemo<ColumnDef<EnergyRow>[]>(() => [
    {
      accessorKey: 'name',
      header: 'Zone',
      cell: ({ row }) => (
        <div className="flex items-center gap-2" style={{ paddingLeft: `${row.depth * 1.2}rem` }}>
          {row.getCanExpand() ? (
            <button
              onClick={(e) => { e.stopPropagation(); row.toggleExpanded(); }}
              className="p-1 hover:bg-slate-100 rounded transition-colors"
            >
              {row.getIsExpanded() ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronRight className="w-3.5 h-3.5" />}
            </button>
          ) : <span className="w-5.5" />}
          <span className={`text-[13px] tracking-tight ${row.original.isRegion ? 'font-extrabold text-slate-800' : 'font-medium text-slate-600'}`}>
            {row.original.name}
          </span>
        </div>
      )
    },
    {
      accessorKey: 'spotToday',
      header: () => <div className="text-right">Spot Today</div>,
      cell: info => {
        const val = info.getValue() as number;
        return (
          <div 
            className="text-right font-mono font-bold text-slate-700 py-1 px-2 rounded"
            style={{ backgroundColor: getHeatmapColor(val, 'price') }}
          >
            € {val?.toFixed(1) || '—'}
          </div>
        )
      }
    },
    {
      accessorKey: 'spotTomorrow',
      header: () => <div className="text-right text-[#2563eb] font-bold">Forecast</div>,
      cell: info => {
        const val = info.getValue() as number;
        return <div className="text-right font-mono font-bold text-[#2563eb]">€ {val?.toFixed(1) || '—'}</div>
      }
    },
    {
      accessorKey: 'delta',
      header: () => <div className="text-right">Delta</div>,
      cell: info => {
        const val = info.getValue() as string;
        const color = val.startsWith('-') ? 'text-emerald-500' : 'text-rose-500';
        return <div className={`text-right font-mono font-bold text-[11px] ${color}`}>{val}</div>
      }
    }
  ], []);

  const [expanded, setExpanded] = useState({} as any);

  const table = useReactTable({
    data: tableData,
    columns,
    state: { expanded },
    onExpandedChange: setExpanded,
    getSubRows: row => row.subRows,
    getCoreRowModel: getCoreRowModel(),
    getExpandedRowModel: getExpandedRowModel(),
  });

  return (
    <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden flex flex-col h-[400px]">
      <div className="px-4 py-3 border-b border-slate-200 bg-slate-50 flex items-center justify-between">
        <h3 className="font-semibold text-slate-800 text-sm tracking-tight">EU Cross-Border Overview</h3>
        <span className="text-xs font-semibold px-2 py-0.5 rounded bg-slate-200 text-slate-600 font-mono tracking-tight">DAILY AVERAGES</span>
      </div>
      <div className="flex-1 overflow-auto">
        <table className="w-full text-sm text-left">
          <thead className="text-[11px] text-slate-500 uppercase font-semibold bg-slate-50 border-b border-slate-200 sticky top-0 z-10 shadow-sm">
            {table.getHeaderGroups().map(headerGroup => (
              <tr key={headerGroup.id}>
                {headerGroup.headers.map(header => (
                  <th key={header.id} className="px-4 py-2 font-medium">
                    {flexRender(header.column.columnDef.header, header.getContext())}
                  </th>
                ))}
              </tr>
            ))}
          </thead>
          <tbody className="divide-y divide-slate-100">
            {table.getRowModel().rows.map(row => (
              <tr 
                key={row.id} 
                onClick={() => {
                  if (row.original.isRegion) {
                    router.push(`/eu/${row.original.id.toLowerCase()}`);
                  } else {
                    const parentId = row.getParentRow()?.original.id?.toLowerCase() || 'cwe';
                    router.push(`/eu/${parentId}/${row.original.id.toLowerCase()}`);
                  }
                }}
                className={`cursor-pointer transition-colors ${
                  row.original.isRegion 
                    ? 'hover:bg-slate-100 bg-slate-50/50' 
                    : 'hover:bg-sky-50'
                }`}
              >
                {row.getVisibleCells().map(cell => (
                  <td key={cell.id} className="px-4 py-2 border-r border-slate-50 last:border-r-0">
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
