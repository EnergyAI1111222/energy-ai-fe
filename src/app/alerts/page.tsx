"use client";
import React from 'react';
import { UIShell } from "@/components/layout/UIShell";
import { Bell, BellOff, Settings, Zap } from "lucide-react";

export default function AlertsPage() {
  return (
    <UIShell title="Threshold Alerts & Monitoring" isPremium={true}>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

        {/* Active Alerts List */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between mb-2">
            <h2 className="text-sm font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
               <Bell className="w-4 h-4" /> Recent Triggers
            </h2>
          </div>

          <div className="bg-white rounded-xl p-8 border border-slate-100 shadow-sm text-center py-20">
             <BellOff className="w-12 h-12 text-slate-200 mx-auto mb-4" />
             <h3 className="text-lg font-bold text-slate-700 mb-2">No Active Alerts</h3>
             <p className="text-sm text-slate-400 max-w-md mx-auto">
               Threshold alerts will appear here once alert rules are configured and connected to real-time data streams.
             </p>
          </div>
        </div>

        {/* Configurations Sidebar */}
        <div className="space-y-6">
          <div className="bg-white rounded-xl p-6 border border-slate-200 shadow-sm">
             <div className="flex items-center justify-between mb-8">
               <h3 className="text-xs font-bold text-slate-900 uppercase tracking-widest flex items-center gap-2">
                 <Settings className="w-4 h-4 text-slate-400" /> Alert Rules
               </h3>
               <button className="bg-slate-900 text-white p-1.5 rounded-lg hover:bg-[#2563eb] transition-all">
                 <Zap className="w-3.5 h-3.5" />
               </button>
             </div>

             <div className="text-center py-6">
                <p className="text-xs text-slate-400">No rules configured yet.</p>
                <p className="text-[10px] text-slate-300 mt-1">Use the + button to create a new alert rule.</p>
             </div>
          </div>

          <div className="bg-slate-50 rounded-xl p-6 border border-slate-100 flex flex-col items-center text-center">
             <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center mb-4 shadow-sm">
                <BellOff className="w-6 h-6 text-slate-300" />
             </div>
             <h4 className="text-xs font-bold text-slate-900 mb-1">No notification silence</h4>
             <p className="text-[10px] text-slate-400">All rules are operating within normal parameters.</p>
          </div>
        </div>
      </div>
    </UIShell>
  );
}
