"use client";
import { UIShell } from "@/components/layout/UIShell";
import { BaseEnergyChart } from "@/components/charts/BaseEnergyChart";
import { Zap, Gauge, Server, AlertTriangle, TrendingDown } from "lucide-react";
import { useLiveEnergyData } from "@/hooks/useLiveEnergyData";

export default function ImbalanceCapacityPage() {
  // Mapping real dataset IDs for Imbalance (adjust as needed for your DB)
  const datasetIds = ["378", "375", "2619"]; 
  const { data, isLoading } = useLiveEnergyData(datasetIds);
  const results = data?.results || {};

  return (
    <UIShell title="System Imbalance & Capacity" isPremium={true}>
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        
        {/* Left Column: Real-time Frequency/Imbalance */}
        <div className="lg:col-span-3 space-y-6">
           <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <StatCard title="System Frequency" value={results["378"]?.data?.[results["378"]?.data?.length-1]?.[1] ?? "50.02"} unit="Hz" status="STABLE" color="text-emerald-500" icon={<Gauge className="w-5 h-5" />} />
              <StatCard title="Net Imbalance" value={results["375"]?.data?.[results["375"]?.data?.length-1]?.[1] ?? "-"} unit="MW" status="SHORT" color="text-red-500" icon={<TrendingDown className="w-5 h-5" />} />
              <StatCard title="Reserve Capacity" value={results["2619"]?.data?.[results["2619"]?.data?.length-1]?.[1] ?? "-"} unit="GW" status="ADEQUATE" color="text-blue-500" icon={<Server className="w-5 h-5" />} />
           </div>

           <div className="bg-white rounded-xl p-6 border border-slate-200 shadow-sm">
              <div className="flex items-center justify-between mb-8">
                 <h3 className="font-bold text-slate-900 flex items-center gap-2">
                    <Zap className="w-5 h-5 text-amber-500 fill-current" /> aFRR Merit Order Curve (Target)
                 </h3>
                 <div className="flex bg-slate-100 p-1 rounded-xl text-[10px] font-bold">
                    <button className="px-3 py-1.5 bg-white shadow-sm rounded-lg">POSITIVE</button>
                    <button className="px-3 py-1.5 text-slate-500">NEGATIVE</button>
                 </div>
              </div>
              <div className="h-[400px]">
                 <BaseEnergyChart 
                   height="100%"
                   options={{
                     color: ['#2563eb'],
                     tooltip: { trigger: 'axis' },
                     xAxis: { type: 'value', name: 'Cumulative Quantity (MW)', nameLocation: 'middle', nameGap: 30 },
                     yAxis: { type: 'value', name: 'Price (€/MWh)' },
                     series: [{
                       name: 'aFRR Bids',
                       type: 'line',
                       step: 'end',
                       areaStyle: { opacity: 0.1 },
                       data: [
                         [0, 15], [100, 22], [250, 45], [400, 85], [600, 120], [850, 250], [1000, 500]
                       ]
                     }]
                   }}
                 />
              </div>
           </div>
        </div>

        {/* Right Column: Alerts & Constraints */}
        <div className="space-y-6">
           <div className="bg-slate-900 rounded-xl p-6 border border-slate-800 shadow-sm text-white">
              <div className="flex items-center gap-2 mb-6">
                 <AlertTriangle className="w-5 h-5 text-amber-400" />
                 <h3 className="text-xs font-bold uppercase tracking-widest text-slate-400">Critical Constraints</h3>
              </div>
              
              <div className="space-y-4">
                 <ConstraintItem label="TenneT (DE) -> PSE (PL)" status="CONGESTED" load={98} />
                 <ConstraintItem label="Amprion (DE) Internal" status="NORMAL" load={42} />
                 <ConstraintItem label="NordLink (NO-DE)" status="MAINTENANCE" load={0} />
              </div>

              <div className="mt-8 p-4 bg-amber-500/10 border border-amber-500/20 rounded-lg">
                 <p className="text-[10px] font-bold text-amber-500 uppercase flex items-center gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-amber-500 " /> Grid Advisory
                 </p>
                 <p className="text-[11px] text-amber-200/80 mt-2 leading-relaxed">
                    High residual load expected in Zone DE-LU due to low wind forecast. Redispatch calls probable between 16:00 - 20:00 UTC.
                 </p>
              </div>
           </div>

           <div className="bg-white rounded-xl p-6 border border-slate-200 shadow-sm">
              <h3 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-4">Market State (PICASSO)</h3>
              <div className="space-y-3">
                 <div className="flex justify-between items-center bg-slate-50 p-3 rounded-xl">
                    <span className="text-xs font-bold text-slate-600">Clearing Price</span>
                    <span className="text-sm font-mono font-bold text-slate-900">42.50 €</span>
                 </div>
                 <div className="flex justify-between items-center bg-slate-50 p-3 rounded-xl">
                    <span className="text-xs font-bold text-slate-600">Active Bids</span>
                    <span className="text-sm font-mono font-bold text-slate-900">1,241</span>
                 </div>
              </div>
           </div>
        </div>

      </div>
    </UIShell>
  );
}

function StatCard({ title, value, unit, status, color, icon }: any) {
  return (
    <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
       <div className="flex items-center gap-3 mb-3">
          <div className="p-2 bg-slate-50 rounded-xl text-slate-400">{icon}</div>
          <span className={`text-[9px] font-bold uppercase tracking-widest ${color}`}>{status}</span>
       </div>
       <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-tight">{title}</h4>
       <div className="flex items-baseline gap-1">
          <span className="text-2xl font-black text-slate-900">{value}</span>
          <span className="text-xs font-bold text-slate-500">{unit}</span>
       </div>
    </div>
  );
}

function ConstraintItem({ label, status, load }: any) {
  return (
    <div className="space-y-2">
       <div className="flex justify-between items-center text-[11px]">
          <span className="font-bold text-slate-300">{label}</span>
          <span className={`font-bold ${status === 'CONGESTED' ? 'text-red-400' : 'text-slate-500'}`}>{status}</span>
       </div>
       <div className="h-1 bg-white/5 rounded-full overflow-hidden">
          <div className={`h-full transition-all duration-700 ${load > 90 ? 'bg-red-500' : 'bg-[#2563eb]'}`} style={{ width: `${load}%` }} />
       </div>
    </div>
  );
}
