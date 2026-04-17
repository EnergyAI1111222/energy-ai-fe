"use client";
import { UIShell } from "@/components/layout/UIShell";
import { Users, UserMinus, Percent, BarChart3 } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { energyApi } from "@/api/client";

export default function RetailPage() {
  const { data: retailSummary, isLoading } = useQuery({
    queryKey: ['summary-retail'],
    queryFn: () => energyApi.getRetailSummary(),
  });

  const kpis = retailSummary || {};

  return (
    <UIShell title="Retail Propensity & Churn" isPremium={true}>
      <div className="space-y-6">
        {/* Top KPI Row */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
           <RetailStat
             cardTitle="Household Price"
             value={kpis.household_price?.value != null ? `€${Number(kpis.household_price.value).toFixed(2)}` : '—'}
             subValue={kpis.household_price?.delta ?? 'No delta data'}
             icon={<Users className="w-5 h-5 text-blue-500" />}
           />
           <RetailStat
             cardTitle="Churn Rate"
             value={kpis.churn_rate?.value != null ? `${kpis.churn_rate.value}%` : '—'}
             subValue={kpis.churn_rate?.delta ?? 'No delta data'}
             icon={<UserMinus className="w-5 h-5 text-red-500" />}
           />
           <RetailStat
             cardTitle="Smart Meter Pen."
             value="—"
             subValue="Data not yet available"
             icon={<Percent className="w-5 h-5 text-emerald-500" />}
           />
           <RetailStat
             cardTitle="Avg. Margin"
             value="—"
             subValue="Data not yet available"
             icon={<BarChart3 className="w-5 h-5 text-[#2563eb]" />}
           />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
           {/* Churn by Region */}
           <div className="bg-white rounded-xl p-6 border border-slate-200 shadow-sm">
              <h3 className="font-bold text-slate-900 mb-6">Churn Risk by Region</h3>
              <div className="py-10 text-center">
                 <p className="text-slate-400 text-sm">Churn propensity data not yet available.</p>
                 <p className="text-slate-300 text-xs mt-2">Requires retail/CRM datasets to be loaded.</p>
              </div>
           </div>

           {/* Conversion Trends */}
           <div className="bg-white rounded-xl p-6 border border-slate-200 shadow-sm">
              <h3 className="font-bold text-slate-900 mb-6">Dynamic Tariff Adoption Trend</h3>
              <div className="py-10 text-center">
                 <p className="text-slate-400 text-sm">Tariff adoption data not yet available.</p>
                 <p className="text-slate-300 text-xs mt-2">Will populate from retail analytics pipeline.</p>
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
       </div>
       <h4 className="text-xs font-bold text-slate-500 uppercase tracking-tight mb-1">{cardTitle}</h4>
       <p className="text-3xl font-black text-slate-900">{value}</p>
       <p className="text-[10px] font-bold text-slate-400 mt-2">{subValue}</p>
    </div>
  );
}
