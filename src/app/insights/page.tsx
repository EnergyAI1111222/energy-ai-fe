import { UIShell } from "@/components/layout/UIShell";
import { Newspaper, Send, TrendingUp, AlertCircle, MessageSquare } from "lucide-react";

export default function InsightsPage() {
  return (
    <UIShell title="Insights & Market Intelligence" isPremium={true}>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* News Feed */}
        <div className="lg:col-span-2 space-y-4">
           <InsightCard 
             category="MARKET VOLATILITY" 
             time="2m ago" 
             title="TTF Spot prices surge 4% following outage at Kollsnes processing plant."
             impact="HIGH"
             impactColor="text-red-500"
             content="Supply constraints in the North Sea are driving short-term bullish sentiment. Traders are pricing in additional risk for the Q1 winter window."
           />
           <InsightCard 
             category="RENEWABLES" 
             time="45m ago" 
             title="German wind output expected to hit record 48GW this weekend."
             impact="NEUTRAL"
             impactColor="text-blue-500"
             content="Exceptional weather conditions across Lower Saxony. Negative pricing likely in the Day-Ahead auction for Sunday delivery."
           />
           <InsightCard 
             category="REGULATORY" 
             time="3h ago" 
             title="ACER releases new guidance on cross-border capacity allocation."
             impact="LOW"
             impactColor="text-emerald-500"
             content="Minimal immediate impact on NTC values, but long-term structural changes to flow-based domain calculations expected."
           />
        </div>

        {/* Sidebar: Sentiment & AI Summary */}
        <div className="space-y-6">
           <div className="bg-slate-900 rounded-xl p-6 text-white border border-slate-800 shadow-2xl">
              <div className="flex items-center gap-2 mb-6">
                 <div className="bg-[#2563eb]/20 p-2 rounded-lg">
                    <TrendingUp className="w-4 h-4 text-[#2563eb]" />
                 </div>
                 <h3 className="text-xs font-bold uppercase tracking-widest">Market Sentiment</h3>
              </div>
              <div className="flex flex-col items-center py-4">
                 <div className="text-5xl font-black text-[#2563eb] mb-2">72</div>
                 <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Bullish Momentum</div>
                 <div className="w-full h-1.5 bg-slate-800 rounded-full mt-6 overflow-hidden">
                    <div className="w-[72%] h-full bg-[#2563eb]" />
                 </div>
              </div>
           </div>

           <div className="bg-white rounded-xl p-6 border border-slate-200 shadow-sm">
              <h3 className="text-xs font-bold text-slate-900 uppercase tracking-widest mb-6 flex items-center gap-2">
                 <MessageSquare className="w-4 h-4 text-slate-400" /> AI Daily Brief
              </h3>
              <p className="text-xs text-slate-600 leading-relaxed mb-4">
                 Overall market remains <strong>tight</strong> due to geopolitical tensions. While renewables are assisting, the gas-to-power switching remains at a high threshold.
              </p>
              <button className="w-full py-3 bg-slate-50 text-slate-900 rounded-lg text-[10px] font-bold flex items-center justify-center gap-2 hover:bg-slate-100 transition-all border border-slate-100">
                 DOWNLOAD FULL REPORT <Send className="w-3 h-3" />
              </button>
           </div>
        </div>

      </div>
    </UIShell>
  );
}

function InsightCard({ category, time, title, impact, impactColor, content }: any) {
  return (
    <div className="bg-white rounded-xl p-6 border border-slate-100 shadow-sm hover:shadow-md transition-all group">
       <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
             <span className="px-2.5 py-1 bg-slate-900 text-white rounded-lg text-[9px] font-bold tracking-widest">{category}</span>
             <span className="text-[10px] font-medium text-slate-400">{time}</span>
          </div>
          <div className={`text-[10px] font-black uppercase tracking-widest ${impactColor}`}>
             IMPACT: {impact}
          </div>
       </div>
       <h3 className="text-lg font-bold text-slate-900 leading-tight mb-3 group-hover:text-[#2563eb] transition-colors">{title}</h3>
       <p className="text-xs text-slate-500 leading-relaxed">{content}</p>
    </div>
  );
}
