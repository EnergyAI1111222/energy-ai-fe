"use client";
import React, { useState } from 'react';
import { UIShell } from "@/components/layout/UIShell";
import { Download, Database, Filter, FileText, CheckCircle2 } from "lucide-react";
import { useQuery } from '@tanstack/react-query';
import { energyApi } from '@/api/client';

export default function ExportDataPage() {
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const { data: catalogData } = useQuery({
    queryKey: ['export-catalog'],
    queryFn: () => energyApi.getCatalog()
  });

  const datasets = catalogData?.results || [];

  const toggleSelect = (id: string) => {
    setSelectedIds(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);
  };

  return (
    <UIShell title="Export Energy Data" isPremium={true}>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Selection Area */}
        <div className="lg:col-span-2 space-y-6 text-slate-900">
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
              <h3 className="text-xs font-bold text-slate-900 uppercase tracking-widest flex items-center gap-2">
                <Database className="w-4 h-4 text-[#2563eb]" /> Select Datasets for Export
              </h3>
              <div className="px-3 py-1 bg-blue-50 text-[#2563eb] rounded-lg text-[10px] font-bold uppercase">
                {selectedIds.length} Selected
              </div>
            </div>
            
            <div className="max-h-[600px] overflow-y-auto">
              <table className="w-full text-left">
                <thead className="bg-slate-50/30 sticky top-0 z-10 backdrop-blur">
                  <tr>
                    <th className="px-6 py-3 text-[10px] font-bold text-slate-400 uppercase">Dataset</th>
                    <th className="px-6 py-3 text-[10px] font-bold text-slate-400 uppercase">Region</th>
                    <th className="px-6 py-3 text-[10px] font-bold text-slate-400 uppercase text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {datasets.map((d: any) => (
                    <tr key={d.dataset_id} className={`hover:bg-slate-50 transition-colors ${selectedIds.includes(d.dataset_id) ? 'bg-blue-50/30' : ''}`}>
                      <td className="px-6 py-4">
                        <div className="text-sm font-bold text-slate-900">{d.name}</div>
                        <div className="text-[10px] text-slate-400 font-mono italic">{d.dataset_id}</div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-xs font-medium text-slate-600 uppercase">{d.country_code}</span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <button 
                          onClick={() => toggleSelect(d.dataset_id)}
                          className={`p-2 rounded-lg transition-all ${selectedIds.includes(d.dataset_id) ? 'bg-[#2563eb] text-white shadow-lg' : 'bg-slate-100 text-slate-400 hover:bg-slate-200'}`}
                        >
                          <CheckCircle2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Configuration & Export Sidebar */}
        <div className="space-y-6">
          <div className="bg-slate-900 text-white p-6 rounded-xl border border-slate-800 shadow-2xl">
            <h3 className="text-xs font-bold uppercase tracking-widest mb-6 flex items-center gap-2">
              <Filter className="w-4 h-4 text-[#2563eb]" /> Export Format
            </h3>
            
            <div className="space-y-4">
              <div className="p-4 bg-slate-800/50 rounded-xl border border-white/5 cursor-pointer hover:border-[#2563eb]/50 transition-all flex items-center justify-between group">
                <div className="flex items-center gap-3">
                  <FileText className="w-5 h-5 text-slate-400 group-hover:text-[#2563eb]" />
                  <div>
                    <div className="text-sm font-bold">CSV Format</div>
                    <div className="text-[10px] text-slate-500">Industry standard flat file</div>
                  </div>
                </div>
                <div className="w-4 h-4 rounded-full border-2 border-[#2563eb] bg-[#2563eb]" />
              </div>

              <div className="p-4 bg-slate-800/50 rounded-xl border border-white/5 cursor-pointer hover:border-[#2563eb]/50 transition-all flex items-center justify-between group opacity-50">
                <div className="flex items-center gap-3">
                  <Database className="w-5 h-5 text-slate-400" />
                  <div>
                    <div className="text-sm font-bold">JSON Matrix</div>
                    <div className="text-[10px] text-slate-500">Coming soon</div>
                  </div>
                </div>
                <div className="w-4 h-4 rounded-full border-2 border-slate-700" />
              </div>
            </div>

            <button className="w-full mt-10 py-4 bg-[#2563eb] text-black rounded-xl font-black text-xs uppercase tracking-widest shadow-xl shadow-blue-500/10 hover:shadow-blue-500/20 active:scale-[0.98] transition-all flex items-center justify-center gap-2">
              START BATCH EXPORT <Download className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </UIShell>
  );
}
