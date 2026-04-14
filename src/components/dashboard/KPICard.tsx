import React from 'react';
import { ArrowUpRight, ArrowDownRight, Minus } from 'lucide-react';

interface KPICardProps {
  label: string;
  value: string;
  deltaText: string;
  deltaTrend: 'up' | 'down' | 'neutral';
  isLoading?: boolean;
}

export function KPICard({ label, value, deltaText, deltaTrend, isLoading }: KPICardProps) {
  return (
    <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm flex flex-col justify-between h-full group hover:border-[#2563eb] transition-colors relative">
        {isLoading && (
            <div className="absolute inset-0 bg-white/50 backdrop-blur-[1px] flex items-center justify-center z-10 rounded-xl">
               <div className="w-5 h-5 border-2 border-slate-300 border-t-[#2563eb] rounded-full animate-spin" />
            </div>
        )}
      <div className="text-[10px] sm:text-xs font-semibold uppercase tracking-wider text-slate-500 mb-2 truncate" title={label}>
        {label}
      </div>
      <div className="flex items-end justify-between mt-auto">
        <div className="text-lg sm:text-xl font-bold tracking-tight text-slate-900 font-mono">
          {value}
        </div>
        <div className={`flex items-center text-[10px] sm:text-xs font-medium ${
          deltaTrend === 'up' ? 'text-rose-500 bg-rose-50' : 
          deltaTrend === 'down' ? 'text-emerald-500 bg-emerald-50' : 
          'text-slate-500 bg-slate-50'
        } px-1.5 py-0.5 rounded-md`}>
          {deltaTrend === 'up' && <ArrowUpRight className="w-3 h-3 mr-0.5" />}
          {deltaTrend === 'down' && <ArrowDownRight className="w-3 h-3 mr-0.5" />}
          {deltaTrend === 'neutral' && <Minus className="w-3 h-3 mr-0.5" />}
          {deltaText}
        </div>
      </div>
    </div>
  );
}
