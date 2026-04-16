"use client";

import { useLiveEnergyData } from "@/hooks/useLiveEnergyData";
import { MasterEUTable } from "@/components/dashboard/MasterEUTable";
import { ComboAreaLineChart } from "@/components/charts/templates/ComboAreaLineChart";
import { DualAxisBarLineChart } from "@/components/charts/templates/DualAxisBarLineChart";
import { StackedAreaChart } from "@/components/charts/templates/StackedAreaChart";
import { NodalMap } from "@/components/maps/NodalMap";
import { Layers, Activity, TrendingUp } from 'lucide-react';
import { useQuery } from "@tanstack/react-query";
import { energyApi } from "@/api/client";

export default function EUOverviewPage() {
  // Mapping real dataset IDs from our Catalog
  const datasetIds = ["2921", "378", "375", "2619"]; 
  const { data, isLoading } = useLiveEnergyData(datasetIds);
  const results = data?.results || {};

  // Fetch real count from catalog
  const { data: catalogData } = useQuery({
    queryKey: ['catalog-stats'],
    queryFn: () => energyApi.getCatalog(),
  });

  return (
    <div className="p-4 md:p-6 h-full flex flex-col mx-auto w-full max-w-[1800px] overflow-y-auto">
      <div className="mb-6 flex items-center justify-between">
        <div>
           <h1 className="text-2xl md:text-4xl font-bold text-slate-900 tracking-tight">Europe (EU27) Macro Overview</h1>
           <p className="text-slate-500 flex items-center gap-2"><Activity className="w-4 h-4 text-[#2563eb]" /> Cross-border spot convergence and regional stability matrix.</p>
        </div>
        <div className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 rounded-lg shadow-sm text-xs font-bold text-slate-600">
           <Layers className="w-4 h-4 text-slate-400" /> ACTIVE DATASETS: {catalogData?.total ?? '...'}
        </div>
      </div>

      {/* Top Grid: Master Table vs Maps Grid */}
      <div className="grid grid-cols-1 xl:grid-cols-[1fr_750px] gap-6 mb-8 items-start">
        <div className="bg-white rounded-xl border border-slate-100 shadow-sm overflow-hidden">
           <MasterEUTable />
        </div>
        
        <div className="flex flex-col gap-3">
           <div className="p-3 bg-slate-900 rounded-lg border border-slate-800 text-white flex items-center justify-between">
              <h4 className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Regional Polygon Heatmaps (Daily Averages)</h4>
              <TrendingUp className="w-4 h-4 text-[#2563eb]" />
           </div>
           {/* The 6-Map Grid required by Spec Level 1 Section B */}
           <div className="grid grid-cols-2 md:grid-cols-3 gap-3 h-[450px]">
              <div className="relative rounded-lg overflow-hidden border border-slate-200 group">
                 <NodalMap mapType="eu_polygon" metric="Spot Today" height={210} />
                 <span className="absolute bottom-2 left-3 text-[10px] font-bold bg-white/95 border border-slate-200 px-2 py-0.5 rounded shadow-sm text-slate-700">1. SPOT €</span>
              </div>
              <div className="relative rounded-lg overflow-hidden border border-slate-200">
                 <NodalMap mapType="eu_polygon" metric="Main Source" height={210} />
                 <span className="absolute bottom-2 left-3 text-[10px] font-bold bg-white/95 border border-slate-200 px-2 py-0.5 rounded shadow-sm text-slate-700">2. SOURCE TYPE</span>
              </div>
              <div className="relative rounded-lg overflow-hidden border border-slate-200">
                 <NodalMap mapType="eu_polygon" metric="Load Index" height={210} />
                 <span className="absolute bottom-2 left-3 text-[10px] font-bold bg-white/95 border border-slate-200 px-2 py-0.5 rounded shadow-sm text-slate-700">3. DEMAND</span>
              </div>
              <div className="relative rounded-lg overflow-hidden border border-slate-200">
                 <NodalMap mapType="eu_polygon" metric="Wind Cap." height={210} />
                 <span className="absolute bottom-2 left-3 text-[10px] font-bold bg-white/95 border border-slate-200 px-2 py-0.5 rounded shadow-sm text-slate-700">4. WIND OUTPUT</span>
              </div>
              <div className="relative rounded-lg overflow-hidden border border-slate-200">
                 <NodalMap mapType="eu_polygon" metric="Solar Cap." height={210} />
                 <span className="absolute bottom-2 left-3 text-[10px] font-bold bg-white/95 border border-slate-200 px-2 py-0.5 rounded shadow-sm text-slate-700">5. SOLAR OUTPUT</span>
              </div>
              <div className="relative rounded-lg overflow-hidden border border-slate-200">
                 <NodalMap mapType="eu_polygon" metric="Hydro Share" height={210} />
                 <span className="absolute bottom-2 left-3 text-[10px] font-bold bg-white/95 border border-slate-200 px-2 py-0.5 rounded shadow-sm text-slate-700">6. HYDRO RESERV.</span>
              </div>
           </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6 pb-20">
        <div className="h-[300px]">
           <ComboAreaLineChart 
              title="Avg Spot Prices per Region (CWE/Nordic/Iberia)" 
              nameArea="EU Avg" nameLine="Target Region"
              dataArea={results["2921"]?.data || []} 
              dataLine={results["2921"]?.data || []}
              isLoading={isLoading}
           />
        </div>
        <div className="h-[300px]">
           <DualAxisBarLineChart 
              title="EU Aggregate Renewable Generation" 
              nameBar="Wind Volume" nameLine="IGCC Volume"
              dataBar={results["378"]?.data || []} 
              dataLine={results["375"]?.data || []}
              isLoading={isLoading}
           />
        </div>
        <div className="h-[300px]">
           <StackedAreaChart 
              title="Aggregated EU Production by Source" 
              series={[
                  {name: 'Nuclear', data: results["2619"]?.data || []},
                  {name: 'Coal', data: results["378"]?.data || []},
              ]}
              isLoading={isLoading}
           />
        </div>
      </div>
    </div>
  );
}
