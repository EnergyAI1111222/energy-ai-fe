"use client";
import React, { useState, useEffect } from 'react';
import { energyApi } from '@/api/client';
import { useQuery } from '@tanstack/react-query';
import { 
  Search, Filter, Lock, Tag, Box, ArrowRight, Share2, Pin, 
  Calendar, History, RefreshCw, Database, Terminal, FileJson 
} from 'lucide-react';
import { BaseEnergyChart } from '@/components/charts/BaseEnergyChart';
import { motion, AnimatePresence } from 'framer-motion';

export function SchemaBrowser({ schema }: { schema: any }) {
  return (
    <div className="bg-slate-900 rounded-xl p-6 font-mono text-xs text-[#2563eb] overflow-y-auto max-h-[500px] border border-slate-800 shadow-inner">
       <div className="flex items-center gap-2 mb-4 pb-2 border-b border-white/5">
          <Terminal className="w-4 h-4" />
          <span className="uppercase font-bold tracking-widest opacity-50">JSON Schema Definition</span>
       </div>
       <pre className="leading-relaxed">
          {JSON.stringify(schema, null, 2)}
       </pre>
    </div>
  );
}

export default function CatalogPage() {
  const [search, setSearch] = useState("");
  const [selectedRegion, setSelectedRegion] = useState<string | null>(null);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [selectedMeta, setSelectedMeta] = useState<any>(null);
  
  const [isSnapshotMode, setIsSnapshotMode] = useState(false);
  const [selectedSnapshot, setSelectedSnapshot] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'preview' | 'schema'>('preview');

  // React Query for Catalog Search
  const { data: catalogData, isLoading: catalogLoading } = useQuery({
    queryKey: ['catalog', search, selectedRegion],
    queryFn: () => energyApi.searchCatalog({ q: search, region: selectedRegion || undefined })
  });

  const datasets = catalogData?.results || [];
  const facets = catalogData?.facets;

  // React Query for Snapshots
  const { data: snapshots } = useQuery({
    queryKey: ['snapshots', selectedId],
    queryFn: () => energyApi.getDatasetSnapshots(selectedId!),
    enabled: !!selectedId && selectedMeta?.is_forecast,
    staleTime: 600000
  });

  // React Query for Preview Data
  const { data: previewData, isLoading: previewLoading } = useQuery({
    queryKey: ['preview', selectedId, isSnapshotMode, selectedSnapshot],
    queryFn: () => isSnapshotMode && selectedSnapshot 
      ? energyApi.getForecastAsOf(selectedId!, selectedSnapshot)
      : energyApi.getForecastLatest(selectedId!),
    enabled: !!selectedId,
    staleTime: 30000
  });

  useEffect(() => {
    if (datasets.length > 0 && !selectedId) {
      setSelectedId(datasets[0].dataset_id);
      setSelectedMeta(datasets[0]);
    }
  }, [datasets, selectedId]);

  useEffect(() => {
     if (snapshots?.length > 0 && !selectedSnapshot) {
        setSelectedSnapshot(snapshots[0]);
     }
  }, [snapshots, selectedSnapshot]);

  return (
    <div className="h-full flex flex-col mx-auto w-full max-w-[1700px] overflow-hidden bg-white">
      {/* Header */}
      <div className="p-6 border-b border-slate-100 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight flex items-center gap-3">
             <Database className="w-6 h-6 text-[#2563eb]" /> OEDA Data Explorer
          </h1>
          <p className="text-slate-500 text-xs font-medium uppercase tracking-wider mt-1 opacity-70">METADATA DISCOVERY & SNAPSHOT BACKTESTING</p>
        </div>
        <div className="relative w-full md:w-96">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input 
              type="text" 
              placeholder="Search datasets, regions, sources..."
              className="w-full pl-10 pr-4 py-2.5 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2563eb]/20 bg-slate-50 text-sm font-medium transition-all"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
        </div>
      </div>

      <div className="flex-1 flex overflow-hidden">
        {/* Left Pane */}
        <div className="w-[400px] border-r border-slate-100 overflow-y-auto bg-slate-50/30 p-4">
           {facets && (
             <div className="mb-6">
                <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-3 flex items-center gap-2">
                   <Filter className="w-3 h-3" /> Regions
                </h4>
                <div className="flex flex-wrap gap-1.5">
                   <button 
                     onClick={() => setSelectedRegion(null)}
                     className={`px-3 py-1 rounded-full text-[11px] font-bold border transition-all ${!selectedRegion ? 'bg-slate-900 text-white border-slate-900' : 'bg-white text-slate-500 border-slate-200'}`}
                   >ALL</button>
                   {Object.keys(facets.region || {}).map(r => (
                     <button 
                       key={r}
                       onClick={() => setSelectedRegion(r)}
                       className={`px-3 py-1 rounded-full text-[11px] font-bold border transition-all ${selectedRegion === r ? 'bg-[#2563eb] text-white border-[#2563eb]' : 'bg-white text-slate-500 border-slate-200'}`}
                     >
                       {r} ({facets.region[r]})
                     </button>
                   ))}
                </div>
             </div>
           )}

           <div className="space-y-2.5 pb-20">
              <AnimatePresence mode="popLayout">
                {datasets.map((d: any, i: number) => (
                  <motion.div 
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.05 }}
                    key={d.dataset_id} 
                    onClick={() => { setSelectedId(d.dataset_id); setSelectedMeta(d); }}
                    className={`group p-4 rounded-xl border cursor-pointer transition-all ${
                      selectedId === d.dataset_id 
                      ? 'bg-white border-[#2563eb] shadow-sm shadow-[#2563eb]/5' 
                      : 'bg-white border-slate-200 hover:border-[#2563eb]'
                    }`}
                  >
                     <div className="flex items-center justify-between gap-2 mb-2">
                        <span className="px-2 py-0.5 bg-slate-100 text-slate-500 rounded text-[9px] font-bold uppercase tracking-tight flex items-center gap-1">
                           <Box className="w-2.5 h-2.5" /> {d.dataset_type}
                        </span>
                        {d.access_tier !== 'basic' && <Lock className="w-3 h-3 text-slate-400" />}
                     </div>
                     <h3 className="font-bold text-slate-900 text-sm leading-tight">{d.name}</h3>
                     <p className="text-[10px] font-mono text-slate-400 mt-1.5 uppercase">{d.dataset_id}</p>
                  </motion.div>
                ))}
              </AnimatePresence>
           </div>
        </div>

        {/* Right Pane */}
        <div className="flex-1 bg-white flex flex-col p-8 overflow-y-auto">
           {selectedMeta ? (
             <motion.div 
               key={selectedId}
               initial={{ opacity: 0, y: 20 }}
               animate={{ opacity: 1, y: 0 }}
               className="h-full flex flex-col"
             >
                <div className="flex items-center justify-between mb-8">
                   <div>
                     <h2 className="text-3xl font-bold text-slate-900 tracking-tight">{selectedMeta.name}</h2>
                     <div className="flex items-center gap-3 mt-2">
                        <span className={`px-2 py-1 rounded text-[10px] font-bold border ${selectedMeta.is_active ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : 'bg-red-50 text-red-600 border-red-100'}`}>
                          {selectedMeta.is_active ? 'ACTIVE' : 'INACTIVE'}
                        </span>
                        <span className="text-sm text-slate-400 font-mono">
                          {selectedMeta.region} | {selectedMeta.source} | {selectedMeta.unit_verbose}
                        </span>
                     </div>
                   </div>
                   
                    {/* Snapshot Controls */}
                   {selectedMeta.is_forecast && (
                     <div className="flex items-center bg-slate-100 p-1.5 rounded-lg border border-slate-200 gap-1">
                        <button 
                          onClick={() => { setIsSnapshotMode(false); setActiveTab('preview'); }}
                          className={`flex items-center gap-2 px-4 py-1.5 rounded-xl text-xs font-bold transition-all ${!isSnapshotMode && activeTab === 'preview' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500'}`}
                        >
                          <RefreshCw className="w-3.5 h-3.5" /> Latest
                        </button>
                        <button 
                          onClick={() => { setIsSnapshotMode(true); setActiveTab('preview'); }}
                          className={`flex items-center gap-2 px-4 py-1.5 rounded-xl text-xs font-bold transition-all ${isSnapshotMode && activeTab === 'preview' ? 'bg-[#2563eb] text-white shadow-sm' : 'text-slate-500'}`}
                        >
                          <History className="w-3.5 h-3.5" /> Snapshot
                        </button>
                        <div className="w-px h-4 bg-slate-200 mx-1" />
                        <button 
                          onClick={() => setActiveTab('schema')}
                          className={`flex items-center gap-2 px-4 py-1.5 rounded-xl text-xs font-bold transition-all ${activeTab === 'schema' ? 'bg-slate-900 text-white shadow-sm' : 'text-slate-500'}`}
                        >
                          <FileJson className="w-3.5 h-3.5" /> Schema
                        </button>
                     </div>
                   )}
                </div>

                {/* Main Preview Area */}
                <div className="flex-1 min-h-[450px] border border-slate-200 rounded-lg p-8 shadow-sm relative overflow-hidden bg-white">
                   {activeTab === 'preview' ? (
                     <>
                        <div className="absolute top-6 left-8 flex items-center justify-between w-[calc(100%-64px)] z-10">
                           <div className="flex items-center gap-2">
                              <div className={`w-2 h-2 rounded-full ${previewLoading ? 'bg-amber-400 ' : 'bg-[#2563eb]'}`}></div>
                              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">
                                {isSnapshotMode ? 'Time-Travel Backtest Preview' : 'Real-time Exploration'}
                              </span>
                           </div>

                           {isSnapshotMode && snapshots && snapshots.length > 0 && (
                             <div className="flex items-center gap-2 bg-slate-900 rounded-xl px-3 py-1.5 border border-slate-800">
                                <Calendar className="w-3.5 h-3.5 text-[#2563eb]" />
                                <select 
                                  className="bg-transparent text-white text-[11px] font-bold outline-none cursor-pointer"
                                  value={selectedSnapshot || ""}
                                  onChange={(e) => setSelectedSnapshot(e.target.value)}
                                >
                                  {snapshots.map((s: string) => (
                                    <option key={s} value={s} className="bg-slate-900 text-white">
                                      AS OF: {new Date(s).toLocaleString()}
                                    </option>
                                  ))}
                                </select>
                             </div>
                           )}
                        </div>
                        
                        <div className="h-full pt-10">
                           <BaseEnergyChart 
                             height="100%"
                             options={{
                               color: [isSnapshotMode ? '#ffbb00' : '#2563eb'],
                               grid: { top: 40, bottom: 40, left: 40, right: 20 },
                               tooltip: { trigger: 'axis' },
                               xAxis: { 
                                 type: 'time',
                                 axisLine: { lineStyle: { color: '#f1f5f9' } },
                                 splitLine: { show: false }
                               },
                               yAxis: { 
                                 type: 'value', 
                                 splitLine: { lineStyle: { type: 'dashed', color: '#f1f5f9' } },
                                 axisLabel: { color: '#94a3b8', fontSize: 10 }
                               },
                               series: [{
                                 name: selectedMeta.name,
                                 type: 'line', 
                                 smooth: true, 
                                 showSymbol: false,
                                 areaStyle: { 
                                   color: {
                                     type: 'linear', x: 0, y: 0, x2: 0, y2: 1,
                                     colorStops: [
                                       { offset: 0, color: isSnapshotMode ? 'rgba(255, 187, 0, 0.2)' : 'rgba(37, 99, 235, 0.2)' },
                                       { offset: 1, color: 'transparent' }
                                     ]
                                   }
                                 },
                                 data: previewData || []
                               }]
                             }} 
                           />
                        </div>
                     </>
                   ) : (
                     <SchemaBrowser schema={selectedMeta.metadata_schema} />
                   )}
                </div>

                <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6">
                   <div className="p-5 bg-slate-50 rounded-lg border border-slate-100">
                      <h4 className="font-bold text-slate-800 text-[10px] uppercase tracking-widest mb-3">AI Expert Note</h4>
                      <p className="text-xs text-slate-600 italic leading-relaxed">
                        {selectedMeta.ai_expert_note || "No expert notes available for this dataset."}
                      </p>
                   </div>
                   <div className="p-5 bg-slate-50 rounded-lg border border-slate-100">
                      <h4 className="font-bold text-slate-800 text-[10px] uppercase tracking-widest mb-3">Configuration</h4>
                      <div className="space-y-2">
                        <div className="flex justify-between items-center text-[11px]">
                          <span className="text-slate-400">Curve UUID</span>
                          <span className="font-mono text-slate-900">{selectedMeta.curve_uuid?.slice(0,8)}...</span>
                        </div>
                        <div className="flex justify-between items-center text-[11px]">
                          <span className="text-slate-400">Refresh Rate</span>
                          <span className="font-bold text-slate-900">{selectedMeta.update_frequency_seconds}s</span>
                        </div>
                      </div>
                   </div>
                   <div className="p-5 bg-slate-50 rounded-lg border border-slate-100">
                      <h4 className="font-bold text-slate-800 text-[10px] uppercase tracking-widest mb-3">Entitlements</h4>
                      <div className="flex items-center gap-2 mb-3">
                         <Tag className="w-4 h-4 text-[#2563eb]" />
                         <span className="text-xs font-bold text-slate-700 uppercase">{selectedMeta.access_tier} ACCESS</span>
                      </div>
                      <button className="w-full py-2 bg-blue-600 text-white rounded-md text-xs font-bold hover:bg-blue-700 transition-all shadow-sm">
                        Upgrade Tier
                      </button>
                   </div>
                </div>
             </motion.div>
           ) : (
             <div className="flex-1 flex flex-col items-center justify-center text-slate-300">
                <div className="w-20 h-20 rounded-full border-4 border-slate-100 border-t-[#2563eb] animate-spin mb-6" />
                <p className="text-lg font-bold">Initializing Data Engine...</p>
             </div>
           )}
        </div>
      </div>
    </div>
  );
}
