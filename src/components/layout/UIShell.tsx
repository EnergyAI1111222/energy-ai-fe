"use client";
import React from 'react';
import { Lock, Construction } from 'lucide-react';

interface UIShellProps {
  title: string;
  isPremium?: boolean;
  children?: React.ReactNode;
}

export function UIShell({ title, isPremium = false, children }: UIShellProps) {
  const isImplemented = !!children;

  return (
    <div className="flex flex-col h-full space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-extrabold tracking-tight text-slate-800">{title}</h2>
          <p className="text-slate-500 text-sm mt-1">
            {isImplemented 
              ? "Live energy analytics and diagnostic engine."
              : "This module is part of the Phase 2 roadmap."}
          </p>
        </div>
        
        <div className={`px-4 py-2 rounded-full flex items-center gap-2 border shadow-sm ${
          isPremium 
          ? 'bg-amber-50 border-amber-200 text-amber-700' 
          : 'bg-slate-100 border-slate-200 text-slate-600'
        }`}>
          {isPremium ? <Lock className="w-4 h-4" /> : <Construction className="w-4 h-4" />}
          <span className="text-xs font-bold uppercase tracking-widest">
            {isImplemented ? (isPremium ? 'Professional Access' : 'Standard Access') : (isPremium ? 'Premium Feature' : 'Coming Soon')}
          </span>
        </div>
      </div>

      {isImplemented ? (
        <div className="flex-1 animate-in fade-in slide-in-from-bottom-2 duration-500">
          {children}
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 opacity-40 select-none pointer-events-none filter blur-[2px]">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="h-64 bg-white rounded-xl border border-slate-200 shadow-sm p-6 flex flex-col space-y-4">
                <div className="flex items-center justify-between">
                   <div className="w-24 h-4 bg-slate-100 rounded-full" />
                   <div className="w-8 h-8 bg-slate-50 rounded-lg" />
                </div>
                <div className="flex-1 w-full bg-slate-50 rounded-lg relative overflow-hidden">
                   <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent -translate-x-full animate-[shimmer_2s_infinite]" />
                </div>
                <div className="space-y-2">
                   <div className="w-full h-3 bg-slate-100 rounded-full" />
                   <div className="w-2/3 h-3 bg-slate-50 rounded-full" />
                </div>
              </div>
            ))}
          </div>

          <div className="fixed inset-0 z-10 flex items-center justify-center p-6 pointer-events-none">
             <div className="max-w-md w-full bg-white/80 backdrop-blur-xl p-8 rounded-xl border border-white shadow-2xl pointer-events-auto text-center space-y-4 transform scale-110">
                <div className="w-20 h-20 bg-blue-600 rounded-[30px] mx-auto flex items-center justify-center shadow-sm transform -rotate-6">
                   <Construction className="w-10 h-10 text-white" />
                </div>
                <h3 className="text-xl font-bold text-slate-900 pt-2">Building the Future of Energy</h3>
                <p className="text-slate-500 text-sm leading-relaxed">
                   The <strong>{title}</strong> engine is currently under heavy development. 
                   This feature will be released in the upcoming Q3 infrastructure cycle.
                </p>
                <div className="pt-4 flex gap-3">
                   <button className="flex-1 px-6 py-3 bg-slate-900 text-white rounded-lg text-sm font-bold shadow-sm hover:bg-slate-800 transition-all">
                      Get Early Access
                   </button>
                   <button className="flex-1 px-6 py-3 bg-white text-slate-900 rounded-lg text-sm font-bold border border-slate-200 shadow-sm hover:bg-slate-50 transition-all">
                      Read Roadmap
                   </button>
                </div>
             </div>
          </div>
        </>
      )}
    </div>
  );
}
