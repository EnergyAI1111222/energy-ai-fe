import { UIShell } from "@/components/layout/UIShell";
import { BaseEnergyChart } from "@/components/charts/BaseEnergyChart";
import { TrendingUp, Coins, Fuel, BarChart } from "lucide-react";

export default function FuturesPage() {
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
              <div className="flex gap-2">
                 <div className="flex items-center gap-2 px-3 py-1.5 bg-slate-100 rounded-xl text-[10px] font-bold text-slate-600">
                    <div className="w-2 h-2 rounded-full bg-[#2563eb]" /> BASE
                 </div>
                 <div className="flex items-center gap-2 px-3 py-1.5 bg-slate-100 rounded-xl text-[10px] font-bold text-slate-600">
                    <div className="w-2 h-2 rounded-full bg-orange-400" /> PEAK
                 </div>
              </div>
           </div>
           
           <div className="h-[400px]">
              <BaseEnergyChart 
                 height="100%"
                 options={{
                    color: ['#2563eb', '#f97316'],
                    tooltip: { trigger: 'axis' },
                    xAxis: { 
                      type: 'category', 
                      data: ['Oct-24', 'Nov-24', 'Dec-24', 'Q1-25', 'Q2-25', 'Q3-25', 'Cal-26', 'Cal-27'],
                      axisLine: { lineStyle: { color: '#f1f5f9' } }
                    },
                    yAxis: { type: 'value', axisLabel: { formatter: '€{value}' } },
                    series: [
                       { name: 'Base', type: 'line', smooth: true, data: [82.5, 88.2, 94.1, 78.4, 72.0, 68.5, 92.0, 88.0] },
                       { name: 'Peak', type: 'line', smooth: true, data: [112.0, 125.4, 138.2, 105.1, 95.0, 88.2, 122.0, 115.0] }
                    ]
                 }}
              />
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
                 <FuelRow label="CO2 EUA Dec-24" value="68.42" unit="€/t" delta="+1.2%" />
                 <FuelRow label="Coal API2 Cal-25" value="112.50" unit="$/t" delta="-0.8%" />
                 <FuelRow label="Brent Crude" value="84.20" unit="$/bbl" delta="+0.4%" />
              </div>
           </div>

           {/* Spread Analysis */}
           <div className="bg-white rounded-xl p-8 border border-slate-200 shadow-sm">
              <h3 className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-6 flex items-center gap-2">
                 <BarChart className="w-4 h-4 text-slate-400" /> Spark & Dark Spreads
              </h3>
              <div className="flex items-center justify-center py-10">
                 <div className="relative w-48 h-48 flex items-center justify-center">
                    <svg className="w-full h-full transform -rotate-90">
                       <circle cx="96" cy="96" r="80" stroke="currentColor" strokeWidth="12" fill="transparent" className="text-slate-100" />
                       <circle cx="96" cy="96" r="80" stroke="currentColor" strokeWidth="12" fill="transparent" strokeDasharray="502" strokeDashoffset={502 * 0.3} className="text-[#2563eb]" />
                    </svg>
                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                       <span className="text-3xl font-black text-slate-900">32.40</span>
                       <span className="text-[10px] font-bold text-slate-400 uppercase">Spark Spread DE</span>
                    </div>
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
          <span className="text-[10px] font-bold text-emerald-400">{delta}</span>
          <span className="font-mono font-bold text-[#2563eb]">{value} <span className="text-[10px] text-slate-500">{unit}</span></span>
       </div>
    </div>
  );
}
