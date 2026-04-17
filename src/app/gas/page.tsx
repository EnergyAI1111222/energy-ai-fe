"use client";
import { UIShell } from "@/components/layout/UIShell";
import { Flame, Droplets, ArrowUpRight, ArrowDownRight, Activity } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { energyApi } from "@/api/client";

export default function GasPage() {
  const { data: gasSummary, isLoading } = useQuery({
    queryKey: ['summary-gas'],
    queryFn: () => energyApi.getGasSummary(),
  });

  const kpis = gasSummary || {};

  return (
    <UIShell title="Natural Gas Markets" isPremium={true}>
      <div className="space-y-6">
        {/* KPI Row */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <KPICard title="TTF Month-Ahead" value={kpis.ttf?.value} unit="€/MWh" delta={kpis.ttf?.delta} isUp={kpis.ttf?.trend === 'up' ? true : kpis.ttf?.trend === 'down' ? false : null} icon={<Flame className="w-5 h-5 text-orange-500" />} />
          <KPICard title="EU Storage" value={kpis.storage?.value} unit="%" delta={kpis.storage?.delta} isUp={kpis.storage?.trend === 'up' ? true : kpis.storage?.trend === 'down' ? false : null} icon={<Droplets className="w-5 h-5 text-blue-500" />} />
          <KPICard title="LNG Imports" value={kpis.lng?.value} unit="Bcm/wk" delta={kpis.lng?.delta} isUp={kpis.lng?.trend === 'up' ? true : kpis.lng?.trend === 'down' ? false : null} icon={<Activity className="w-5 h-5 text-emerald-500" />} />
          <KPICard title="Net Withdrawal" value={kpis.net_withdrawal?.value} unit="GWh/d" delta={kpis.net_withdrawal?.delta} isUp={null} icon={<ArrowUpRight className="w-5 h-5 text-slate-400" />} />
        </div>

        {/* Main Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Storage Inventory */}
          <div className="lg:col-span-2 bg-white rounded-xl p-6 border border-slate-200 shadow-sm">
            <div className="flex items-center justify-between mb-6">
               <h3 className="font-bold text-slate-900">EU Storage Inventory (Aggregated)</h3>
            </div>
            <div className="h-[350px] flex items-center justify-center">
               <div className="text-center">
                  <p className="text-slate-400 text-sm font-medium">Storage inventory data not yet available.</p>
                  <p className="text-slate-300 text-xs mt-2">Will populate once gas storage datasets are scraped into the database.</p>
               </div>
            </div>
          </div>

          {/* Flow Balance */}
          <div className="bg-slate-900 rounded-xl p-6 border border-slate-800 shadow-sm text-white">
             <h3 className="font-bold text-sm mb-6 uppercase tracking-widest text-[#2563eb]">Regional Flow Balance</h3>
             <div className="py-10 text-center">
                <p className="text-slate-500 text-xs">Flow data not yet available.</p>
                <p className="text-slate-600 text-[10px] mt-2">Requires pipeline flow datasets to be loaded.</p>
             </div>
          </div>
        </div>
      </div>
    </UIShell>
  );
}

function KPICard({ title, value, unit, delta, isUp, icon }: any) {
  return (
    <div className="bg-white p-5 rounded-lg border border-slate-200 shadow-sm">
      <div className="flex items-center justify-between mb-3">
        <div className="p-2 bg-slate-50 rounded-lg">{icon}</div>
        {delta && (
          <div className={`flex items-center text-[10px] font-bold ${isUp === true ? 'text-emerald-600' : isUp === false ? 'text-red-600' : 'text-slate-400'}`}>
            {isUp === true ? <ArrowUpRight className="w-3 h-3" /> : isUp === false ? <ArrowDownRight className="w-3 h-3" /> : null}
            {delta}
          </div>
        )}
      </div>
      <h4 className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">{title}</h4>
      <div className="flex items-baseline gap-1 mt-1">
        <span className="text-2xl font-black text-slate-900">{value != null ? value : '—'}</span>
        <span className="text-xs font-bold text-slate-500">{unit}</span>
      </div>
    </div>
  );
}
