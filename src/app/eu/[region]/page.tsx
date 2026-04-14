"use client";
import React from 'react';
import { ComboAreaLineChart } from "@/components/charts/templates/ComboAreaLineChart";
import { StackedAreaChart } from "@/components/charts/templates/StackedAreaChart";
import { NodalMap } from "@/components/maps/NodalMap";
import { Map, Info, Zap, Download } from 'lucide-react';
import Link from 'next/link';

export default function RegionDashboardPage(props: { params: Promise<{ region: string }> }) {
  const params = React.use(props.params);
  const regionName = (params.region || "").toUpperCase();

  const mockTimeseries: [number, number][] = Array.from({ length: 48 }, (_, i) => {
    const d = new Date(); d.setHours(i % 24, 0, 0, 0);
    return [d.getTime(), Math.round(Math.random() * 80 + 20)];
  });

  const regionCountries = [
    { code: 'DE', name: 'Germany', price: 68.42, delta: '+2.1%', trend: 'up' },
    { code: 'FR', name: 'France', price: 62.10, delta: '-4.1%', trend: 'down' },
    { code: 'BE', name: 'Belgium', price: 71.15, delta: '+8.2%', trend: 'up' },
    { code: 'NL', name: 'Netherlands', price: 69.90, delta: '+1.5%', trend: 'up' },
    { code: 'CH', name: 'Switzerland', price: 64.20, delta: '-1.0%', trend: 'down' },
    { code: 'AT', name: 'Austria', price: 67.50, delta: '+3.4%', trend: 'up' },
  ];

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
         {/* Top Left: Region Master Table */}
         <div className="bg-white border border-slate-200 rounded-lg shadow-sm overflow-hidden flex flex-col h-[450px]">
             <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
                <h3 className="font-bold text-slate-800 text-sm flex items-center gap-2">
                   <Zap className="w-4 h-4 text-slate-400" /> {regionName} Market Evaluation
                </h3>
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-none">Last 15m update</span>
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
                      {regionCountries.map((c) => (
                         <tr key={c.code} className="hover:bg-slate-50/80 transition-colors group">
                            <td className="px-4 py-4">
                               <div className="flex items-center gap-3">
                                  <div className="w-8 h-8 rounded-full bg-slate-100 text-slate-600 font-bold text-xs flex items-center justify-center border border-slate-200 shadow-sm transition-all group-hover:scale-110 group-hover:shadow-md">
                                     {c.code}
                                  </div>
                                  <Link href={`/eu/${params.region}/${c.code.toLowerCase()}`} className="text-sm font-bold text-slate-700 hover:text-[#2563eb] transition-colors">{c.name}</Link>
                               </div>
                            </td>
                            <td className="px-4 py-4 text-sm font-mono text-slate-900 font-bold">€ {c.price}</td>
                            <td className="px-4 py-4 text-sm font-mono text-slate-500">€ {(c.price * 1.05).toFixed(2)}</td>
                            <td className="px-4 py-4">
                               <span className={`text-[11px] font-bold px-2 py-0.5 rounded flex items-center gap-1 w-max ${
                                  c.trend === 'up' ? 'bg-amber-50 text-amber-600' : 'bg-emerald-50 text-emerald-600'
                               }`}>
                                  {c.delta}
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

         {/* Top Right: Regional Nodal Heatmap */}
         <div className="h-[450px] bg-white rounded-lg border border-slate-200 shadow-sm relative overflow-hidden group">
            <NodalMap mapType="heatmap" metric="Regional Pressure" />
            <div className="absolute top-4 left-6 z-10 flex flex-col gap-1 pointer-events-none">
                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest drop-shadow-sm">Spatial Interpolation</span>
                <h4 className="text-xl font-bold text-slate-900 uppercase tracking-tight drop-shadow-sm">{regionName} Intensity Matrix</h4>
            </div>
            <div className="absolute bottom-4 left-6 z-10 flex items-center gap-2">
                <div className="flex gap-1 items-center bg-white/95 border border-slate-200 border border-slate-200 px-3 py-1.5 rounded-full shadow-sm">
                   <div className="w-2 h-2 rounded-full bg-blue-500"></div>
                   <span className="text-[10px] font-bold text-slate-600 uppercase tracking-widest">Wind Pressure</span>
                </div>
                <div className="flex gap-1 items-center bg-white/95 border border-slate-200 border border-slate-200 px-3 py-1.5 rounded-full shadow-sm">
                   <div className="w-2 h-2 rounded-full bg-amber-500"></div>
                   <span className="text-[10px] font-bold text-slate-600 uppercase tracking-widest">Pricing Heat</span>
                </div>
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
