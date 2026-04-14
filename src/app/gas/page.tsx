import { UIShell } from "@/components/layout/UIShell";
import { BaseEnergyChart } from "@/components/charts/BaseEnergyChart";
import { Flame, Droplets, ArrowUpRight, ArrowDownRight, Activity } from "lucide-react";

export default function GasPage() {
  return (
    <UIShell title="Natural Gas Markets" isPremium={true}>
      <div className="space-y-6">
        {/* KPI Row */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <KPICard title="TTF Month-Ahead" value="28.42" unit="€/MWh" delta="+1.2%" isUp={true} icon={<Flame className="w-5 h-5 text-orange-500" />} />
          <KPICard title="EU Storage" value="64.12" unit="%" delta="-0.4%" isUp={false} icon={<Droplets className="w-5 h-5 text-blue-500" />} />
          <KPICard title="LNG Imports" value="3.2" unit="Bcm/wk" delta="+4.1%" isUp={true} icon={<Activity className="w-5 h-5 text-emerald-500" />} />
          <KPICard title="Net Withdrawal" value="420" unit="GWh/d" delta="Stable" isUp={null} icon={<ArrowUpRight className="w-5 h-5 text-slate-400" />} />
        </div>

        {/* Main Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Storage Inventory */}
          <div className="lg:col-span-2 bg-white rounded-xl p-6 border border-slate-200 shadow-sm">
            <div className="flex items-center justify-between mb-6">
               <h3 className="font-bold text-slate-900">EU Storage Inventory (Aggregated)</h3>
               <div className="flex gap-2">
                  <span className="px-2 py-1 bg-slate-100 text-slate-500 rounded text-[10px] font-bold">LST 5Y AVG</span>
                  <span className="px-2 py-1 bg-blue-100 text-blue-600 rounded text-[10px] font-bold">2024 ACTUAL</span>
               </div>
            </div>
            <div className="h-[350px]">
               <BaseEnergyChart 
                 height="100%"
                 options={{
                   color: ['#e2e8f0', '#3b82f6'],
                   tooltip: { trigger: 'axis' },
                   xAxis: { type: 'category', data: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'] },
                   yAxis: { type: 'value', min: 0, max: 100 },
                   series: [
                     { name: '5Y Average', type: 'line', smooth: true, data: [80, 65, 50, 40, 45, 55, 65, 75, 85, 95, 98, 90], lineStyle: { type: 'dashed' } },
                     { name: '2024 Actual', type: 'line', smooth: true, areaStyle: { opacity: 0.1 }, data: [85, 70, 64, 58, 62, 68, 72, 78, 82, 88, 92, 85] }
                   ]
                 }}
               />
            </div>
          </div>

          {/* Flow Balance */}
          <div className="bg-slate-900 rounded-xl p-6 border border-slate-800 shadow-sm text-white">
             <h3 className="font-bold text-sm mb-6 uppercase tracking-widest text-[#2563eb]">Regional Flow Balance</h3>
             <div className="space-y-6">
                <FlowItem label="Norway -> DE" value="142.5" capacity="160" color="#2563eb" />
                <FlowItem label="LNG (France)" value="82.1" capacity="120" color="#3b82f6" />
                <FlowItem label="Algeria -> IT" value="55.4" capacity="80" color="#10b981" />
                <FlowItem label="UK -> BE" value="12.0" capacity="45" color="#f59e0b" />
             </div>
             <div className="mt-8 pt-6 border-t border-white/10">
                <p className="text-[10px] text-slate-500 uppercase font-bold tracking-tighter">Market Sentiment</p>
                <div className="flex items-center gap-2 mt-2">
                   <div className="flex-1 h-1.5 bg-slate-800 rounded-full overflow-hidden">
                      <div className="w-[70%] h-full bg-emerald-500" />
                   </div>
                   <span className="text-xs font-bold text-emerald-400">BULLISH</span>
                </div>
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
        <span className="text-2xl font-black text-slate-900">{value}</span>
        <span className="text-xs font-bold text-slate-500">{unit}</span>
      </div>
    </div>
  );
}

function FlowItem({ label, value, capacity, color }: any) {
  const percent = (parseFloat(value) / parseFloat(capacity)) * 100;
  return (
    <div className="space-y-2">
       <div className="flex justify-between items-center text-xs">
          <span className="font-bold text-slate-300">{label}</span>
          <span className="font-mono text-[10px]" style={{ color }}>{value} <span className="opacity-40">mcm/d</span></span>
       </div>
       <div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
          <div className="h-full transition-all duration-1000" style={{ width: `${percent}%`, backgroundColor: color }} />
       </div>
    </div>
  );
}
