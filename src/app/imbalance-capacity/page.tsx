"use client";
import { UIShell } from "@/components/layout/UIShell";
import { BaseEnergyChart } from "@/components/charts/BaseEnergyChart";
import { Zap, Gauge, Server, AlertTriangle, TrendingDown } from "lucide-react";
import { useLiveEnergyData } from "@/hooks/useLiveEnergyData";
import { useQuery } from "@tanstack/react-query";
import { energyApi } from "@/api/client";

export default function ImbalanceCapacityPage() {
  // Fetch DE imbalance datasets dynamically from catalog
  const { data: catalog } = useQuery({
    queryKey: ['catalog-for-country-de-imb'],
    queryFn: () => energyApi.getCatalogForCountry('DE'),
  });

  const imbalanceDatasets = catalog?.groups?.imbalance || [];
  // Pick first 3 imbalance datasets that have data
  const datasetIds = imbalanceDatasets.slice(0, 3).map((d: any) => d.dataset_id);
  const { data, isLoading } = useLiveEnergyData(datasetIds);
  const results = data?.results || {};

  // Latest values from first available datasets
  const getLatest = (id: string) => {
    const d = results[id]?.data;
    return d?.length > 0 ? d[d.length - 1][1] : null;
  };

  return (
    <UIShell title="System Imbalance & Capacity" isPremium={true}>
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">

        {/* Left Column: Real-time Frequency/Imbalance */}
        <div className="lg:col-span-3 space-y-6">
           <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <StatCard
                title="System Frequency"
                value={null}
                unit="Hz"
                status={null}
                color="text-slate-400"
                icon={<Gauge className="w-5 h-5" />}
              />
              <StatCard
                title="Net Imbalance"
                value={datasetIds[0] ? getLatest(datasetIds[0]) : null}
                unit="€/MWh"
                status={null}
                color="text-blue-500"
                icon={<TrendingDown className="w-5 h-5" />}
              />
              <StatCard
                title="Imbalance Energy"
                value={datasetIds[1] ? getLatest(datasetIds[1]) : null}
                unit="€/MWh"
                status={null}
                color="text-blue-500"
                icon={<Server className="w-5 h-5" />}
              />
           </div>

           <div className="bg-white rounded-xl p-6 border border-slate-200 shadow-sm">
              <div className="flex items-center justify-between mb-8">
                 <h3 className="font-bold text-slate-900 flex items-center gap-2">
                    <Zap className="w-5 h-5 text-amber-500 fill-current" /> aFRR Energy Price Timeline
                 </h3>
              </div>
              <div className="h-[400px]">
                 <BaseEnergyChart
                   height="100%"
                   options={{
                     color: ['#2563eb'],
                     tooltip: { trigger: 'axis' },
                     xAxis: { type: 'time' },
                     yAxis: { type: 'value', name: 'Price (€/MWh)' },
                     series: datasetIds.slice(0, 2).map((id: string, i: number) => ({
                       name: imbalanceDatasets[i]?.name?.slice(0, 30) || `Dataset ${id}`,
                       type: 'line',
                       smooth: true,
                       showSymbol: false,
                       data: results[id]?.data || [],
                     }))
                   }}
                 />
              </div>
           </div>
        </div>

        {/* Right Column */}
        <div className="space-y-6">
           <div className="bg-slate-900 rounded-xl p-6 border border-slate-800 shadow-sm text-white">
              <div className="flex items-center gap-2 mb-6">
                 <AlertTriangle className="w-5 h-5 text-amber-400" />
                 <h3 className="text-xs font-bold uppercase tracking-widest text-slate-400">System Status</h3>
              </div>

              <div className="space-y-4">
                 <div className="p-3 bg-white/5 border border-white/5 rounded-xl">
                    <p className="text-[10px] font-bold text-slate-300">Imbalance Datasets</p>
                    <p className="text-[11px] text-slate-500 mt-1">{imbalanceDatasets.length} datasets available for DE</p>
                 </div>
                 <div className="p-3 bg-white/5 border border-white/5 rounded-xl">
                    <p className="text-[10px] font-bold text-slate-300">Latest Update</p>
                    <p className="text-[11px] text-slate-500 mt-1">{imbalanceDatasets[0]?.latest_utc ?? 'No data yet'}</p>
                 </div>
              </div>
           </div>

           <div className="bg-white rounded-xl p-6 border border-slate-200 shadow-sm">
              <h3 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-4">Available Metrics</h3>
              <div className="space-y-3">
                 {imbalanceDatasets.slice(0, 5).map((d: any) => (
                    <div key={d.dataset_id} className="flex justify-between items-center bg-slate-50 p-3 rounded-xl">
                       <span className="text-[10px] font-bold text-slate-600 truncate pr-2">{d.name?.slice(0, 35)}</span>
                       <span className="text-[9px] font-mono text-slate-400">{d.row_count} pts</span>
                    </div>
                 ))}
                 {imbalanceDatasets.length === 0 && (
                    <p className="text-xs text-slate-400 text-center py-4">No imbalance data loaded yet</p>
                 )}
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
          {status && <span className={`text-[9px] font-bold uppercase tracking-widest ${color}`}>{status}</span>}
       </div>
       <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-tight">{title}</h4>
       <div className="flex items-baseline gap-1">
          <span className="text-2xl font-black text-slate-900">{value != null ? Number(value).toFixed(2) : '—'}</span>
          <span className="text-xs font-bold text-slate-500">{unit}</span>
       </div>
    </div>
  );
}
