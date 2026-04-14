"use client";
import React from 'react';
import { Lock } from 'lucide-react';

interface UIShellProps {
  title: string;
  isPremium?: boolean;
  /** Optional type hint passed by shell pages: "coming_soon" | "premium" */
  type?: "coming_soon" | "premium" | string;
}

export function UIShell({ title, isPremium = false }: UIShellProps) {
  return (
    <div className="p-6 h-full flex flex-col relative overflow-hidden bg-slate-50">
      {/* Header Skeleton */}
      <div className="mb-8 flex items-center justify-between">
        <div className="space-y-2">
          <div className="h-8 w-64 bg-slate-200 rounded-lg " />
          <div className="h-4 w-96 bg-slate-200 rounded-lg  opacity-60" />
        </div>
        <div className="h-10 w-32 bg-slate-200 rounded-xl " />
      </div>

      {/* Grid Skeleton */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 opacity-40">
        {[...Array(6)].map((_, i) => (
          <div key={i} className="bg-white border border-slate-200 rounded-lg p-6 h-64 flex flex-col gap-4 shadow-sm">
             <div className="h-6 w-1/3 bg-slate-100 rounded-md" />
             <div className="flex-1 bg-slate-50/50 rounded-lg border border-dashed border-slate-200" />
          </div>
        ))}
      </div>

      {/* Overlay Badge */}
      <div className="absolute inset-0 flex items-center justify-center z-10 backdrop-blur-[2px] bg-slate-100/50">
        <div className="bg-white text-slate-900 px-8 py-6 rounded-xl shadow-sm flex flex-col items-center border border-slate-200 max-w-sm text-center">
          <div className="w-16 h-16 bg-blue-50 rounded-full flex items-center justify-center mb-4 border border-blue-100">
            <Lock className="w-8 h-8 text-blue-600" />
          </div>
          <h3 className="text-xl font-bold mb-2 tracking-tight uppercase text-slate-800">{title}</h3>
          <p className="text-slate-500 text-sm mb-6 px-4">
            {isPremium 
              ? "This advanced analytical module is available for Professional and Enterprise tiers." 
              : "This operational app is currently in development for the MVP Phase 2 rollout."}
          </p>
          <button className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-lg text-sm transition-colors shadow-sm">
             {isPremium ? "UPGRADE TO UNLOCK" : "VIEW ROADMAP"}
          </button>
        </div>
      </div>
    </div>
  );
}

export function CustomDashboardShell() {
  return (
    <div className="p-6 h-full flex flex-col bg-slate-50">
       <div className="mb-8">
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Custom Dashboards (Beta)</h1>
          <p className="text-sm text-slate-600">Configure your energy monitoring grid with zero-code JSON widgets.</p>
       </div>
       
       <div className="flex-1 border-2 border-dashed border-slate-300 rounded-lg flex items-center justify-center bg-white group hover:bg-slate-50 hover:border-blue-400 transition-all cursor-pointer">
          <div className="flex flex-col items-center gap-4">
             <div className="w-16 h-16 bg-slate-100 rounded-lg shadow-sm flex items-center justify-center text-slate-400 group-hover:text-blue-600 group-hover:bg-blue-50 transition-all">
                <span className="text-4xl font-light">+</span>
             </div>
             <p className="font-bold text-slate-500 group-hover:text-slate-700 tracking-widest uppercase text-xs">Add First Widget</p>
             <div className="px-3 py-1 bg-slate-100 border border-slate-200 rounded-md text-[10px] font-bold text-slate-500">JSON BUILDER COMING SOON</div>
          </div>
       </div>
    </div>
  );
}
