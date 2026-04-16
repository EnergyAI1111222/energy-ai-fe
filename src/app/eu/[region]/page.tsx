"use client";
import React from 'react';
import { ComboAreaLineChart } from "@/components/charts/templates/ComboAreaLineChart";
import { StackedAreaChart } from "@/components/charts/templates/StackedAreaChart";
import { NodalMap } from "@/components/maps/NodalMap";
import { Map, Info, Zap, Download, Loader2 } from 'lucide-react';
import Link from 'next/link';
import { useQuery } from '@tanstack/react-query';
import { energyApi } from '@/api/client';

const COUNTRY_NAMES: Record<string, string> = {
  DE: 'Germany', FR: 'France', NL: 'Netherlands', BE: 'Belgium',
  AT: 'Austria', CH: 'Switzerland', UK: 'United Kingdom', EUX: 'EU Exchange',
};

export default function RegionDashboardPage(props: { params: Promise<{ region: string }> }) {
  const params = React.use(props.params);
  const regionName = (params.region || "").toUpperCase();

  const { data: euData, isLoading } = useQuery({
    queryKey: ['euTable'],
    queryFn: () => energyApi.getEuTable(),
    refetchInterval: 60000,
  });

  const mockTimeseries: [number, number][] = Array.from({ length: 48 }, (_, i) => {
    const d = new Date(); d.setHours(i % 24, 0, 0, 0);
    return [d.getTime(), Math.round(Math.random() * 80 + 20)];
  });

  // Use API data if available, else fallback to demo
  const regionCountries = React.useMemo(() => {
    const apiResults = euData?.results as Array<{ zone: string; spot_today: number | null; forecast: number | null }> | undefined;
    if (apiResults && apiResults.length > 0) {
      return apiResults.map(r => ({
        code: r.zone,
        name: COUNTRY_NAMES[r.zone] || r.zone,
        price: r.spot_today,
        intraday: r.forecast ?? (r.spot_today ? r.spot_today * 1.05 : null),
        delta: null,
        trend: 'up' as const,
      }));
    }
    // Fallback demo data
    return [
      { code: 'DE', name: 'Germany', price: null, intraday: null, delta: null, trend: 'up' as const },
      { code: 'FR', name: 'France', price: null, intraday: null, delta: null, trend: 'down' as const },
      { code: 'BE', name: 'Belgium', price: null, intraday: null, delta: null, trend: 'up' as const },
      { code: 'NL', name: 'Netherlands', price: null, intraday: null, delta: null, trend: 'up' as const },
      { code: 'CH', name: 'Switzerland', price: null, intraday: null, delta: null, trend: 'down' as const },
      { code: 'AT', name: 'Austria', price: null, intraday: null, delta: null, trend: 'up' as const },
    ];
  }, [euData]);

  return (
    <div className="p-4 md:p-6 flex flex-col mx-auto w-full max-w-[1700px] h-full overflow-y-auto">
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-[#2563eb]/10 text-[#2563eb] rounded-lg">
             <Map className="w-8 h-8" />
          </div>
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-slate-900 tracking-tight uppercase">{regionName} Region Overview</h1>
            <p className="text-slate-500 text-sm">Focuses on connectivity, transmission, and cross-border spot convergence.</p>
          </div>
        </div>
        <div className="flex items-center gap-2 text-xs font-bold bg-white border border-slate-200 px-4 py-2 rounded-xl shadow-sm">
           <Zap className="w-4 h-4 text-amber-500" /> TOTAL AREA DEMAND: 184.2 GW
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[450px,1fr] gap-6 mb-8">
         {/* Market Table */}
         <div className="bg-white border border-slate-200 rounded-lg shadow-sm overflow-hidden flex flex-col h-[450px]">
             <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
                <h3 className="font-bold text-slate-800 text-sm flex items-center gap-2">
                   <Zap className="w-4 h-4 text-slate-400" /> {regionName} Market Evaluation
                </h3>
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-none">
                  {isLoading ? 'Loading...' : 'Live'}
                </span>
             </div>
             <div className="flex-1 overflow-y-auto">
                <table className="w-full text-left">
                   <thead className="bg-slate-50 sticky top-0 z-10">
                      <tr>
                         <th className="px-4 py-3 text-[10px] font-bold text-slate-400 uppercase">Country</th>
                         <th className="px-4 py-3 text-[10px] font-bold text-slate-400 uppercase">Spot Price</th>
                         <th className="px-4 py-3 text-[10px] font-bold text-slate-400 uppercase">Intraday</th>
                         <th className="px-4 py-3 text-[10px] font-bold text-slate-400 uppercase">Delta</th>
                      </tr>
                   </thead>
                   <tbody className="divide-y divide-slate-100">
                      {isLoading ? (
                        <tr><td colSpan={4} className="px-4 py-8 text-center text-slate-400">
                          <Loader2 className="w-5 h-5 animate-spin mx-auto" />
                        </td></tr>
                      ) : regionCountries.map((c) => (
                         <tr key={c.code} className="hover:bg-slate-50/80 transition-colors group">
                            <td className="px-4 py-4">
                               <div className="flex items-center gap-3">
                                  <div className="w-8 h-8 rounded-full bg-slate-100 text-slate-600 font-bold text-xs flex items-center justify-center border border-slate-200 shadow-sm transition-all group-hover:scale-110 group-hover:shadow-md">
                                     {c.code}
                                  </div>
                                  <Link href={`/eu/${params.region}/${c.code.toLowerCase()}`} className="text-sm font-bold text-slate-700 hover:text-[#2563eb] transition-colors">{c.name}</Link>
                               </div>
                            </td>
                            <td className="px-4 py-4 text-sm font-mono text-slate-900 font-bold">
                              {c.price != null ? `€ ${c.price.toFixed(2)}` : '—'}
                            </td>
                            <td className="px-4 py-4 text-sm font-mono text-slate-500">
                              {c.intraday != null ? `€ ${c.intraday.toFixed(2)}` : '—'}
                            </td>
                            <td className="px-4 py-4">
                               <span className={`text-[11px] font-bold px-2 py-0.5 rounded flex items-center gap-1 w-max ${
                                  c.trend === 'up' ? 'bg-amber-50 text-amber-600' : 'bg-emerald-50 text-emerald-600'
                               }`}>
                                  {c.delta ?? '—'}
                               </span>
                            </td>
                         </tr>
                      ))}
                   </tbody>
                </table>
             </div>
             <div className="p-3 bg-slate-50/50 border-t border-slate-100 text-[10px] text-slate-400 text-center uppercase font-bold tracking-widest">
                Scroll to view more markets
             </div>
         </div>

         {/* Nodal Heatmap */}
         <div className="h-[450px] bg-white rounded-lg border border-slate-200 shadow-sm relative overflow-hidden group">
            <NodalMap mapType="heatmap" metric="Regional Pressure" />
            <div className="absolute top-4 left-6 z-10 flex flex-col gap-1 pointer-events-none">
                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest drop-shadow-sm">Spatial Interpolation</span>
                <h4 className="text-xl font-bold text-slate-900 uppercase tracking-tight drop-shadow-sm">{regionName} Intensity Matrix</h4>
            </div>
         </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-20">
         <div className="h-[340px]">
            <ComboAreaLineChart 
               title="Regional Prices Convergence (DA Average)" 
               nameArea={`${regionName} High`} nameLine={`${regionName} Low`}
               dataArea={mockTimeseries} dataLine={mockTimeseries.map(t => [t[0], (t[1] as number) * 0.7])}
            />
         </div>
         <div className="h-[340px]">
            <StackedAreaChart 
               title="Region Actual Renewable Generation (Wind + Solar)" 
               series={[
                  { name: 'Wind Offshore', data: mockTimeseries.map(t => [t[0], (t[1] as number) * 0.4]) },
                  { name: 'Wind Onshore', data: mockTimeseries.map(t => [t[0], (t[1] as number) * 0.6]) },
                  { name: 'Solar', data: mockTimeseries.map(t => [t[0], (t[1] as number) * 0.3]) },
               ]}
            />
         </div>
      </div>

      <div className="p-4 bg-[#f8fafc] border border-slate-200 rounded-xl flex items-center justify-between mb-20 italic text-slate-500 text-sm">
         <div className="flex items-center gap-3">
            <Info className="w-4 h-4 text-[#2563eb]" />
            <p>"Regional interconnection data (UMMs/Physical Flows) is being synced from Level 2 Nodal Matrix..."</p>
         </div>
         <button className="flex items-center gap-2 font-bold text-slate-400 hover:text-slate-600 transition-colors uppercase text-xs">
            <Download className="w-4 h-4" /> Download Full Region CSV
         </button>
      </div>
    </div>
  );
}
