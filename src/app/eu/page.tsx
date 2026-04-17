"use client";

import { MasterEUTable } from "@/components/dashboard/MasterEUTable";
import { ComboAreaLineChart } from "@/components/charts/templates/ComboAreaLineChart";
import { DualAxisBarLineChart } from "@/components/charts/templates/DualAxisBarLineChart";
import { StackedAreaChart } from "@/components/charts/templates/StackedAreaChart";
import { CountryHeatmapGrid } from "@/components/maps/CountryHeatmapGrid";
import { Layers, Activity, TrendingUp } from 'lucide-react';
import { useQuery } from "@tanstack/react-query";
import { energyApi } from "@/api/client";
import { useLiveEnergyData } from "@/hooks/useLiveEnergyData";
import { useMemo } from "react";

// Real dataset IDs from data_types table — spot prices per country
const EU_SPOT_IDS = ["2", "3", "4", "5", "6"]; // AT, BE, CH, FR, NL spot

export default function EUOverviewPage() {
  const { data, isLoading } = useLiveEnergyData(EU_SPOT_IDS);
  const results = data?.results || {};

  const { data: catalogData } = useQuery({
    queryKey: ['catalog-stats'],
    queryFn: () => energyApi.getCatalog(),
  });

  // Merge all spot series into one averaged chart
  const avgSpotData = useMemo(() => {
    const allSeries = EU_SPOT_IDS.map(id => results[id]?.data || []).filter(d => d.length > 0);
    if (allSeries.length === 0) return [];
    // Use first series timestamps, average all values at each point
    return allSeries[0].map((point: [number, number], i: number) => {
      const ts = point[0];
      const vals = allSeries.map(s => s[i]?.[1]).filter((v: any) => v != null);
      const avg = vals.length > 0 ? vals.reduce((a: number, b: number) => a + b, 0) / vals.length : null;
      return [ts, avg];
    });
  }, [results]);

  const totalDatasets = Array.isArray(catalogData) ? catalogData.length : (catalogData?.total ?? 0);

  return (
    <div className="p-4 md:p-6 h-full flex flex-col mx-auto w-full max-w-[1800px] overflow-y-auto">
      <div className="mb-6 flex items-center justify-between">
        <div>
           <h1 className="text-2xl md:text-4xl font-bold text-slate-900 tracking-tight">Europe (EU27) Macro Overview</h1>
           <p className="text-slate-500 flex items-center gap-2"><Activity className="w-4 h-4 text-[#2563eb]" /> Cross-border spot convergence and regional stability matrix.</p>
        </div>
        <div className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 rounded-lg shadow-sm text-xs font-bold text-slate-600">
           <Layers className="w-4 h-4 text-slate-400" /> ACTIVE DATASETS: {totalDatasets || '...'}
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
           <div className="grid grid-cols-2 md:grid-cols-3 gap-3 h-[450px]">
              <CountryHeatmapGrid metric="Spot Today" label="Spot Price" unit="€/MWh" />
              <CountryHeatmapGrid metric="Intraday" label="Intraday" unit="€/MWh" />
              <CountryHeatmapGrid metric="Imbalance" label="Imbalance" unit="€/MWh" />
              <CountryHeatmapGrid metric="Load Index" label="Demand" unit="MW" />
              <CountryHeatmapGrid metric="Main Source" label="Source Mix" unit="€/MWh" />
              <CountryHeatmapGrid metric="Regional Heatmap" label="Regional" unit="€/MWh" />
           </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6 pb-20">
        <div className="h-[300px]">
           <ComboAreaLineChart
              title="EU Avg Spot Price (CWE Region)"
              nameArea="EU Avg" nameLine="AT Spot"
              dataArea={avgSpotData}
              dataLine={results["2"]?.data || []}
              isLoading={isLoading}
           />
        </div>
        <div className="h-[300px]">
           <DualAxisBarLineChart
              title="BE vs NL Spot Comparison"
              nameBar="BE Spot" nameLine="NL Spot"
              dataBar={results["3"]?.data || []}
              dataLine={results["6"]?.data || []}
              isLoading={isLoading}
           />
        </div>
        <div className="h-[300px]">
           <StackedAreaChart
              title="CWE Spot Prices by Country"
              series={[
                  {name: 'FR Spot', data: results["5"]?.data || []},
                  {name: 'CH Spot', data: results["4"]?.data || []},
              ]}
              isLoading={isLoading}
           />
        </div>
      </div>
    </div>
  );
}
