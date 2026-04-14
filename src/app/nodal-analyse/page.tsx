import { UIShell } from "@/components/layout/UIShell";
import { NodalMap } from "@/components/maps/NodalMap";
import { Info, Target, Zap } from "lucide-react";

export default function NodalAnalysePage() {
  return (
    <UIShell title="Nodal Analysis (WebGL 3D Maps)" isPremium={true}>
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Main Map Canvas */}
        <div className="lg:col-span-3 space-y-6">
           <div className="bg-white rounded-lg shadow-sm border border-slate-200 overflow-hidden">
             <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
               <div className="flex items-center gap-3">
                 <div className="bg-[#2563eb]/10 p-2 rounded-lg">
                   <Target className="w-5 h-5 text-[#2563eb]" />
                 </div>
                 <div>
                   <h2 className="text-sm font-bold text-slate-900 leading-none">European Grid Topology</h2>
                   <p className="text-[10px] text-slate-500 font-medium mt-1">Real-time demand & congestion hotspots</p>
                 </div>
               </div>
               <div className="flex items-center gap-2">
                 <select className="text-[10px] font-bold bg-white border border-slate-200 rounded-lg px-2 py-1 outline-none focus:ring-2 ring-[#2563eb]">
                   <option>Spot Today (Avg)</option>
                   <option>Demand Load</option>
                   <option>Wind Curtailment</option>
                 </select>
               </div>
             </div>
             <NodalMap mapType="eu_polygon" metric="Spot Today" height="calc(100vh - 280px)" />
           </div>
        </div>

        {/* Sidebar Controls */}
        <div className="space-y-6">
           <div className="bg-white rounded-lg p-5 shadow-sm border border-slate-200">
             <div className="flex items-center gap-2 mb-4">
                <Zap className="w-4 h-4 text-amber-400 fill-current" />
                <h3 className="text-xs font-bold text-slate-900 uppercase tracking-widest">Active Alerts</h3>
             </div>
             <div className="space-y-2">
                <div className="p-3 bg-red-50 border border-red-100 rounded-xl">
                   <p className="text-[10px] font-bold text-red-700">Congestion: TenneT DE-NL</p>
                   <p className="text-[9px] text-red-500 mt-0.5">Physical limit reached. Redispatch active.</p>
                </div>
                <div className="p-3 bg-blue-50 border border-blue-100 rounded-xl">
                   <p className="text-[10px] font-bold text-blue-700">Excess Wind: North Sea</p>
                   <p className="text-[9px] text-blue-500 mt-0.5">Negative pricing expected in Slot 42-48.</p>
                </div>
             </div>
           </div>

           <div className="bg-white rounded-lg p-5 shadow-sm border border-slate-200 text-slate-800">
              <div className="flex items-center gap-2 mb-3">
                 <Info className="w-4 h-4 text-[#2563eb]" />
                 <h3 className="text-xs font-bold uppercase tracking-widest text-slate-900">Layer Specs</h3>
              </div>
              <ul className="space-y-3">
                 <li className="flex items-center justify-between bg-slate-50 p-2 rounded-md border border-slate-100">
                    <span className="text-[10px] text-slate-500 font-medium">Resolution</span>
                    <span className="text-[10px] font-mono font-bold text-[#2563eb]">15 MIN</span>
                 </li>
                 <li className="flex items-center justify-between bg-slate-50 p-2 rounded-md border border-slate-100">
                    <span className="text-[10px] text-slate-500 font-medium">Total Nodes</span>
                    <span className="text-[10px] font-mono font-bold text-[#2563eb]">3,241</span>
                 </li>
                 <li className="flex items-center justify-between bg-slate-50 p-2 rounded-md border border-slate-100">
                    <span className="text-[10px] text-slate-500 font-medium">Latency</span>
                    <span className="text-[10px] font-mono font-bold text-[#2563eb]">420ms</span>
                 </li>
              </ul>
           </div>
        </div>
      </div>
    </UIShell>
  );
}
