"use client";
import { UIShell } from "@/components/layout/UIShell";
import { BaseEnergyChart } from "@/components/charts/BaseEnergyChart";
import { Fuel, BarChart } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { energyApi } from "@/api/client";

export default function FuturesPage() {
  const { data: futures, isLoading } = useQuery({
    queryKey: ['summary-futures'],
    queryFn: () => energyApi.getFuturesSummary(),
  });

  const kpis = futures || {};

  return (
    <UIShell title="Futures, Fuels & Spreads" isPremium={true}>
      <div className="space-y-6">

        {/* Forward Curves Section */}
        <div className="bg-white rounded-xl p-8 border border-slate-200 shadow-sm">
           <div className="flex items-center justify-between mb-8">
              <div>
                 <h2 className="text-xl font-bold text-slate-900 tracking-tight">Power Forward Curves</h2>
                 <p className="text-xs text-slate-500 font-medium">DE-LU Base/Peak Delivery Benchmark</p>
              </div>
           </div>

           <div className="h-[400px] flex items-center justify-center">
              <div className="text-center">
                 <p className="text-slate-400 text-sm font-medium">Forward curve data not yet available in the database.</p>
                 <p className="text-slate-300 text-xs mt-2">Once futures/forward datasets are scraped, charts will render automatically.</p>
              </div>
           </div>
        </div>

        {/* Spreads & Fuels Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
           {/* Fuels Table */}
           <div className="bg-slate-900 rounded-xl p-8 text-white border border-slate-800 shadow-2xl">
              <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-6 flex items-center gap-2">
                 <Fuel className="w-4 h-4 text-[#2563eb]" /> Fuel Benchmarks
              </h3>
               <div className="space-y-4">
                  <FuelRow label="CO2 EUA" value={kpis.co2?.value} unit="€/t" delta={kpis.co2?.delta} />
                  <FuelRow label="Coal API2" value={kpis.coal?.value} unit="$/t" delta={kpis.coal?.delta} />
                  <FuelRow label="Brent Crude" value={kpis.brent?.value} unit="$/bbl" delta={kpis.brent?.delta} />
               </div>
           </div>

           {/* Spread Analysis */}
           <div className="bg-white rounded-xl p-8 border border-slate-200 shadow-sm">
              <h3 className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-6 flex items-center gap-2">
                 <BarChart className="w-4 h-4 text-slate-400" /> Spark & Dark Spreads
              </h3>
              <div className="flex items-center justify-center py-10">
                 <div className="text-center">
                    <p className="text-slate-400 text-sm font-medium">Spread calculations require futures data.</p>
                    <p className="text-slate-300 text-xs mt-2">Will be computed once gas/power forward datasets are loaded.</p>
                 </div>
              </div>
           </div>
        </div>

      </div>
    </UIShell>
  );
}

function FuelRow({ label, value, unit, delta }: any) {
  return (
    <div className="flex items-center justify-between p-4 bg-white/5 rounded-lg border border-white/5">
       <span className="text-sm font-medium text-slate-300">{label}</span>
       <div className="flex items-center gap-4">
          {delta && <span className="text-[10px] font-bold text-emerald-400">{delta}</span>}
          <span className="font-mono font-bold text-[#2563eb]">
            {value != null ? `${Number(value).toFixed(2)}` : '—'}{' '}
            <span className="text-[10px] text-slate-500">{unit}</span>
          </span>
       </div>
    </div>
  );
}
