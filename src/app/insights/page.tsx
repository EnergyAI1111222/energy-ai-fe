"use client";
import { UIShell } from "@/components/layout/UIShell";
import { Newspaper, TrendingUp, MessageSquare, ExternalLink } from "lucide-react";

export default function InsightsPage() {
  return (
    <div className="p-6 space-y-6 bg-slate-50 min-h-full overflow-y-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Market Intelligence & Insights</h1>
        <p className="text-sm text-slate-500">AI-driven summaries and trend analysis from production benchmarks.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* ... existing ... */}
        <div className="lg:col-span-2 space-y-4">
           <div className="bg-white rounded-xl p-8 border border-slate-100 shadow-sm text-center py-20">
              <Newspaper className="w-12 h-12 text-slate-200 mx-auto mb-4" />
              <h3 className="text-lg font-bold text-slate-700 mb-2">Market Intelligence Feed</h3>
              <p className="text-sm text-slate-400 max-w-md mx-auto">
                Insights and market reports will appear here once the AI analysis pipeline is connected to live data sources.
              </p>
           </div>
        </div>

        {/* Sidebar: Sentiment & AI Summary */}
        <div className="space-y-6">
           <div className="bg-slate-900 rounded-xl p-6 text-white border border-slate-800 shadow-2xl">
              <div className="flex items-center gap-2 mb-6">
                 <div className="bg-[#2563eb]/20 p-2 rounded-lg">
                    <TrendingUp className="w-4 h-4 text-[#2563eb]" />
                 </div>
                 <h3 className="text-xs font-bold uppercase tracking-widest text-slate-400">Market Sentiment</h3>
              </div>
              <div className="flex flex-col items-center py-4">
                 <div className="text-5xl font-black text-slate-600 mb-2">—</div>
                 <div className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">No sentiment data yet</div>
                 <div className="w-full h-1.5 bg-slate-800 rounded-full mt-6 overflow-hidden">
                    <div className="w-0 h-full bg-[#2563eb]" />
                 </div>
              </div>
           </div>

           <div className="bg-white rounded-xl p-6 border border-slate-200 shadow-sm">
              <h3 className="text-xs font-bold text-slate-900 uppercase tracking-widest mb-6 flex items-center gap-2">
                 <MessageSquare className="w-4 h-4 text-[#2563eb]" /> AI Daily Brief
              </h3>
              <p className="text-xs text-slate-400 leading-relaxed mb-4">
                 AI-generated market summaries will appear here once the analysis pipeline is activated.
              </p>
              <button className="w-full py-3 bg-slate-50 text-slate-400 rounded-lg text-[10px] font-bold flex items-center justify-center gap-2 border border-slate-100 cursor-not-allowed">
                 NOT AVAILABLE YET <ExternalLink className="w-3 h-3" />
              </button>
           </div>
        </div>
      </div>
    </div>
  );
}
