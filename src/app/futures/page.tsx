"use client";
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
    <div className="p-6 space-y-6 bg-slate-50 min-h-full">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Futures, Fuels & Spreads</h1>
        <p className="text-sm text-slate-500">Global energy benchmarks and forward-looking price trajectories.</p>
      </div>

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
                 <p className="text-slate-400 text-sm font-medium">No active forward curve IDs found in database.</p>
                 <p className="text-slate-300 text-xs mt-2">Check 'Market Metadata' to verify futures dataset subscription status.</p>
              </div>
           </div>
        </div>

        {/* Spreads & Fuels Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
           {/* Fuels Table */}
           <div className="bg-slate-900 rounded-xl p-8 text-white border border-slate-800 shadow-2xl">
              <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-6 flex items-center gap-2">
                 <Fuel className="w-4 h-4 text-blue-500" /> Fuel Benchmarks
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
                    <p className="text-slate-400 text-sm font-medium">Waiting for spread modeling engine.</p>
                    <p className="text-slate-300 text-xs mt-2">Requires matched gas and power price IDs in same zone.</p>
                 </div>
              </div>
           </div>
        </div>

      </div>
    </div>
  );
}

function FuelRow({ label, value, unit, delta }: any) {
  return (
    <div className="flex items-center justify-between p-4 bg-white/5 rounded-lg border border-white/5">
       <span className="text-sm font-medium text-slate-300">{label}</span>
       <div className="flex items-center gap-4">
          {delta && <span className="text-[10px] font-bold text-emerald-400">{delta}</span>}
          <span className="font-mono font-bold text-blue-500">
            {value != null ? `${Number(value).toFixed(2)}` : '—'}{' '}
            <span className="text-[10px] text-slate-500">{unit}</span>
          </span>
       </div>
    </div>
  );
}
