"use client";
import { UIShell } from "@/components/layout/UIShell";
import { BaseEnergyChart } from "@/components/charts/BaseEnergyChart";
import { Users, UserMinus, Percent, MapPin, BarChart3 } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { energyApi } from "@/api/client";

export default function RetailPage() {
  const { data: retailSummary } = useQuery({
    queryKey: ['summary-retail'],
    queryFn: () => energyApi.getRetailSummary(),
  });

  const kpis = retailSummary || {};

  return (
    <UIShell title="Retail Propensity & Churn" isPremium={true}>
      <div className="space-y-6">
        {/* Top KPI Row */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
           <RetailStat cardTitle="Total Portfolio" value={kpis.household_price?.value ? (kpis.household_price.value * 1000).toLocaleString() : "..."} subValue="+12k this month" icon={<Users className="w-5 h-5 text-blue-500" />} />
           <RetailStat cardTitle="Average Churn" value="8.4%" subValue="-1.2% vs Q3" icon={<UserMinus className="w-5 h-5 text-red-500" />} />
           <RetailStat cardTitle="Smart Meter Pen." value="42%" subValue="Target: 60% by 2025" icon={<Percent className="w-5 h-5 text-emerald-500" />} />
           <RetailStat cardTitle="Avg. Margin" value="€142" subValue="Per customer / year" icon={<BarChart3 className="w-5 h-5 text-[#2563eb]" />} />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
           {/* Churn Propensity by Region */}
           <div className="bg-white rounded-xl p-6 border border-slate-200 shadow-sm">
              <h3 className="font-bold text-slate-900 mb-6 flex items-center gap-2">
                 <MapPin className="w-5 h-5 text-[#2563eb]" /> Churn Risk by Region
              </h3>
              <div className="space-y-4">
                 <RegionRiskItem region="Bavaria" risk="Low" probability={12} color="bg-emerald-500" />
                 <RegionRiskItem region="Berlin" risk="High" probability={68} color="bg-red-500" />
                 <RegionRiskItem region="NRW" risk="Medium" probability={42} color="bg-amber-500" />
                 <RegionRiskItem region="Hamburg" risk="Low" probability={18} color="bg-emerald-500" />
              </div>
           </div>

           {/* Conversion Trends */}
           <div className="bg-white rounded-xl p-6 border border-slate-200 shadow-sm">
              <h3 className="font-bold text-slate-900 mb-6">Dynamic Tariff Adoption Trend</h3>
              <div className="h-[250px]">
                 <BaseEnergyChart 
                   height="100%"
                   options={{
                      color: ['#2563eb'],
                      xAxis: { type: 'category', data: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'] },
                      yAxis: { type: 'value' },
                      series: [{
                        type: 'bar',
                        barWidth: '40%',
                        data: [1200, 1800, 2600, 3100, 4800, 7200],
                        itemStyle: { borderRadius: [8, 8, 0, 0] }
                      }]
                   }}
                 />
              </div>
           </div>
        </div>
      </div>
    </UIShell>
  );
}

function RetailStat({ cardTitle, value, subValue, icon }: any) {
  return (
    <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm transition-all hover:border-[#2563eb]/30">
       <div className="flex justify-between items-start mb-4">
          <div className="p-2 bg-slate-50 rounded-xl">{icon}</div>
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">REAL-TIME</span>
       </div>
       <h4 className="text-xs font-bold text-slate-500 uppercase tracking-tight mb-1">{cardTitle}</h4>
       <p className="text-3xl font-black text-slate-900">{value}</p>
       <p className="text-[10px] font-bold text-slate-400 mt-2">{subValue}</p>
    </div>
  );
}

function RegionRiskItem({ region, risk, probability, color }: any) {
  return (
    <div className="flex items-center gap-4">
       <div className="w-20 text-xs font-bold text-slate-600">{region}</div>
       <div className="flex-1 h-2 bg-slate-100 rounded-full overflow-hidden">
          <div className={`h-full ${color} transition-all duration-1000`} style={{ width: `${probability}%` }} />
       </div>
       <div className="text-[10px] font-mono font-bold w-12 text-right">
          {risk}
       </div>
    </div>
  );
}
