"use client";
import { UIShell } from "@/components/layout/UIShell";
import { useQuery } from "@tanstack/react-query";
import { energyApi } from "@/api/client";
import { Database, Clock, RefreshCcw } from "lucide-react";

export default function RecordTrackerPage() {
  const { data: recordLog, isLoading } = useQuery({
    queryKey: ['record-log'],
    queryFn: () => energyApi.getCatalog(), // fallback to catalog for now, can be specific log later
  });

  return (
    <UIShell title="Record Tracker & Data Updates" isPremium={true}>
      <div className="space-y-6">
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
            <div className="flex items-center gap-3">
              <Database className="w-5 h-5 text-[#2563eb]" />
              <h2 className="font-bold text-slate-900">Ingestion Audit Log</h2>
            </div>
            <button className="flex items-center gap-2 px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-[10px] font-bold text-slate-600 hover:bg-slate-50 transition-all">
              <RefreshCcw className="w-3 h-3" /> Refresh Auto-Feed
            </button>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50/30">
                  <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest border-b border-slate-100">Dataset Name</th>
                  <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest border-b border-slate-100">Frequency</th>
                  <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest border-b border-slate-100">Last Point</th>
                  <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest border-b border-slate-100">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {recordLog?.results?.map((record: any) => (
                  <tr key={record.dataset_id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="font-bold text-sm text-slate-900">{record.name}</div>
                      <div className="text-[10px] text-slate-400 font-mono mt-0.5">{record.dataset_id}</div>
                    </td>
                    <td className="px-6 py-4 text-xs font-medium text-slate-600 capitalize">{record.frequency || '15m'}</td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2 text-xs font-bold text-slate-700">
                        <Clock className="w-3.5 h-3.5 text-slate-400" />
                        {record.last_updated_utc ? new Date(record.last_updated_utc).toLocaleString() : '—'}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-tighter shadow-sm border ${
                        record.is_active
                          ? 'bg-emerald-500/10 text-emerald-600 border-emerald-500/10'
                          : 'bg-slate-100 text-slate-400 border-slate-200'
                      }`}>
                        {record.is_active ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </UIShell>
  );
}
