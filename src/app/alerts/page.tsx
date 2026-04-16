"use client";
import React, { useState } from 'react';
import { UIShell } from "@/components/layout/UIShell";
import { Bell, BellOff, Settings, AlertCircle, Clock, Zap } from "lucide-react";

export default function AlertsPage() {
  const [alerts] = useState([
    { id: 1, title: 'Price Spike: DE-LU Spot', message: 'Current price €142.50 exceeds trigger of €80.00', time: '12m ago', severity: 'high' },
    { id: 2, title: 'Low Wind Output: North Sea', message: 'Production falling below 5GW baseline.', time: '45m ago', severity: 'medium' },
    { id: 3, title: 'Data Lag: Entso-E Actual Load', message: 'Update delay detected for Zone FR.', time: '2h ago', severity: 'low' },
  ]);

  return (
    <UIShell title="Threshold Alerts & Monitoring" isPremium={true}>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Active Alerts List */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between mb-2">
            <h2 className="text-sm font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
               <Bell className="w-4 h-4" /> Recent Triggers
            </h2>
            <button className="text-[10px] font-bold text-[#2563eb] hover:underline">Mark all as read</button>
          </div>

          <div className="space-y-3">
            {alerts.map(alert => (
              <div key={alert.id} className="bg-white rounded-xl p-5 border border-slate-200 shadow-sm hover:border-[#2563eb]/30 transition-all flex items-start gap-4">
                <div className={`p-2 rounded-lg ${
                  alert.severity === 'high' ? 'bg-red-50 text-red-500' :
                  alert.severity === 'medium' ? 'bg-amber-50 text-amber-500' :
                  'bg-blue-50 text-blue-500'
                }`}>
                  <AlertCircle className="w-5 h-5" />
                </div>
                <div className="flex-1">
                  <div className="flex justify-between items-start mb-1">
                    <h3 className="text-sm font-bold text-slate-900">{alert.title}</h3>
                    <span className="text-[10px] font-medium text-slate-400 flex items-center gap-1">
                      <Clock className="w-3 h-3" /> {alert.time}
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 leading-relaxed">{alert.message}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Configurations Sidebar */}
        <div className="space-y-6">
          <div className="bg-white rounded-xl p-6 border border-slate-200 shadow-sm">
             <div className="flex items-center justify-between mb-8">
               <h3 className="text-xs font-bold text-slate-900 uppercase tracking-widest flex items-center gap-2">
                 <Settings className="w-4 h-4 text-slate-400" /> Active Rules
               </h3>
               <button className="bg-slate-900 text-white p-1.5 rounded-lg hover:bg-[#2563eb] transition-all">
                 <Zap className="w-3.5 h-3.5" />
               </button>
             </div>
             
             <div className="space-y-4">
               <RuleItem label="Spot Price Alert" threshold="> 80 €" status="ACTIVE" checked={true} />
               <RuleItem label="Storage Delta" threshold="< -500 GWh" status="ACTIVE" checked={true} />
               <RuleItem label="Churn Probability" threshold="> 60%" status="PAUSED" checked={false} />
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

function RuleItem({ label, threshold, status, checked }: any) {
  return (
    <div className="flex items-center justify-between p-3 bg-slate-50 rounded-xl border border-slate-100">
      <div>
        <div className="text-[11px] font-bold text-slate-900 leading-none">{label}</div>
        <div className="text-[9px] text-slate-500 font-mono mt-1">{threshold}</div>
      </div>
      <div className={`text-[8px] font-black px-1.5 py-0.5 rounded-full border ${
        checked ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : 'bg-slate-200 text-slate-400 border-slate-200'
      }`}>
        {status}
      </div>
    </div>
  );
}
