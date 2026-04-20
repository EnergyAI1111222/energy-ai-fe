"use client";
import React, { useState, useMemo } from 'react';
import { energyApi } from '@/api/client';
import { useQuery } from '@tanstack/react-query';
import {
  Plus, Layers, Settings2, Share2, Save, Play,
  Trash2, GripVertical, ChevronRight, Wand2, Database, Search, AlertCircle
} from 'lucide-react';
import { BaseEnergyChart } from '@/components/charts/BaseEnergyChart';
import { motion, Reorder } from 'framer-motion';

import { useLiveEnergyData } from '@/hooks/useLiveEnergyData';
import { compileFormula, applyFormula, type Series } from '@/utils/picassoFormula';

type PicassoLayer = {
  id: string;
  name: string;
  dataset_id: string;
  color: string;
  visible: boolean;
  order: number;
}

const LAYER_LETTERS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';

const labelFor = (idx: number) => LAYER_LETTERS[idx] ?? `V${idx + 1}`;

export default function PicassoPage() {
  const [layers, setLayers] = useState<PicassoLayer[]>([]);
  const [activeTab, setActiveTab] = useState<'catalog' | 'config'>('catalog');
  const [search, setSearch] = useState("");
  const [mode, setMode] = useState<'line' | 'stack' | 'delta'>('line');
  const [formula, setFormula] = useState<string>('A+B');

  const datasetIds = useMemo(() => layers.map(l => l.dataset_id), [layers]);
  const { data: liveData, isLoading: liveLoading } = useLiveEnergyData(datasetIds);
  const results = liveData?.results || {};

  // Compile the user formula. Errors surface as a visible badge instead of
  // throwing — so a half-typed expression doesn't break the canvas.
  const compiled = useMemo(() => {
    const src = formula.trim();
    if (!src) return { ok: false as const, error: 'Empty formula' };
    try {
      return { ok: true as const, fn: compileFormula(src) };
    } catch (e: any) {
      return { ok: false as const, error: e?.message || 'Invalid formula' };
    }
  }, [formula]);

  // Map A,B,C... → series data drawn from the live batch result, in layer order.
  const labelledSeries = useMemo<Record<string, Series>>(() => {
    const out: Record<string, Series> = {};
    layers.forEach((l, i) => {
      const data = (results[l.dataset_id]?.data || []) as Series;
      out[labelFor(i)] = data;
    });
    return out;
  }, [layers, results]);

  // Evaluate the formula across the union of series timestamps (forward-fill
  // per layer). Computed at the top level so we don't violate the rules of
  // hooks by calling useMemo inside a series-render callback.
  const formulaSeries = useMemo<Series>(() => {
    if (!compiled.ok) return [];
    const required = compiled.fn.vars;
    if (required.some(v => !labelledSeries[v] || !labelledSeries[v].length)) return [];
    return applyFormula(compiled.fn, labelledSeries);
  }, [compiled, labelledSeries]);

  const formulaPlaceholder = useMemo(() => {
    if (layers.length === 0) return 'Add layers to compose a formula (e.g. A+B)';
    if (layers.length === 1) return 'A';
    const labels = layers.map((_, i) => labelFor(i));
    return `${labels[0]}+${labels[1]}` + (layers.length > 2 ? ` (vars: ${labels.join(', ')})` : '');
  }, [layers]);

  const { data: suggestions } = useQuery({
    queryKey: ['catalog-suggest', search],
    queryFn: () => energyApi.suggest(search),
    enabled: search.length > 2
  });

  const addLayer = (dataset: any) => {
    const newLayer: PicassoLayer = {
      id: Math.random().toString(36).substr(2, 9),
      name: dataset.name,
      dataset_id: dataset.dataset_id,
      color: `#${Math.floor(Math.random()*16777215).toString(16)}`,
      visible: true,
      order: layers.length
    };
    setLayers([...layers, newLayer]);
  };

  const removeLayer = (id: string) => {
    setLayers(layers.filter(l => l.id !== id));
  };

  return (
    <div className="h-full flex flex-col mx-auto w-full max-w-[1800px] overflow-hidden bg-[#0A0F1E] text-white">
      {/* Premium Header */}
      <div className="h-16 border-b border-white/5 px-6 flex items-center justify-between bg-black/20 backdrop-blur-xl">
        <div className="flex items-center gap-4">
           <div className="p-2 bg-blue-600 rounded-xl shadow-[0_0_20px_#2563eb40]">
              <Wand2 className="w-5 h-5 text-black" />
           </div>
           <div>
              <h1 className="text-xl font-bold tracking-tight">Picasso Studio <span className="text-[10px] font-mono text-slate-500 ml-2 uppercase tracking-widest bg-slate-800 px-2 py-0.5 rounded">BETA</span></h1>
              <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Multi-Series Visual Calculation Engine</p>
           </div>
        </div>
        
        <div className="flex items-center gap-3">
           <button className="flex items-center gap-2 px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-bold transition-all transform hover:scale-105">
              <Share2 className="w-4 h-4" /> Share
           </button>
           <button className="flex items-center gap-2 px-6 py-2 bg-[#2563eb] hover:bg-[#00b8e6] text-black rounded-xl text-xs font-extrabold transition-all shadow-[0_0_20px_#2563eb30] transform active:scale-95">
              <Save className="w-4 h-4" /> Save Calculation
           </button>
        </div>
      </div>

      <div className="flex-1 flex overflow-hidden">
        {/* Left Sidebar: Assets & Layers */}
        <div className="w-[380px] border-r border-white/5 flex flex-col bg-black/40">
           <div className="flex border-b border-white/5">
              <button 
                onClick={() => setActiveTab('catalog')}
                className={`flex-1 py-4 text-[10px] font-bold uppercase tracking-widest transition-all ${activeTab === 'catalog' ? 'text-[#2563eb] border-b-2 border-[#2563eb] bg-[#2563eb]/5' : 'text-slate-500 hover:text-white'}`}
              >
                <div className="flex flex-col items-center gap-1">
                   <Database className="w-4 h-4" /> Assets
                </div>
              </button>
              <button 
                onClick={() => setActiveTab('config')}
                className={`flex-1 py-4 text-[10px] font-bold uppercase tracking-widest transition-all ${activeTab === 'config' ? 'text-[#2563eb] border-b-2 border-[#2563eb] bg-[#2563eb]/5' : 'text-slate-500 hover:text-white'}`}
              >
                <div className="flex flex-col items-center gap-1">
                   <Layers className="w-4 h-4" /> Composition
                </div>
              </button>
           </div>

           <div className="flex-1 overflow-y-auto p-4 custom-scrollbar">
              {activeTab === 'catalog' ? (
                <div className="space-y-6">
                   <div className="relative">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                      <input 
                        type="text" 
                        placeholder="Search Catalog Assets..."
                        className="w-full bg-slate-900 border border-white/5 rounded-xl pl-10 pr-4 py-2.5 text-xs text-white outline-none focus:ring-2 focus:ring-[#2563eb]/20 placeholder:text-slate-600 font-medium"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                      />
                   </div>
                   
                   <div className="space-y-2">
                      {suggestions?.map((s: any) => (
                        <div key={s.dataset_id} className="group p-3 bg-white/5 border border-white/5 rounded-xl hover:bg-white/10 hover:border-[#2563eb]/30 transition-all cursor-pointer flex items-center justify-between">
                           <div className="flex-1">
                              <h4 className="text-xs font-bold text-slate-200 group-hover:text-white truncate pr-2">{s.name}</h4>
                              <p className="text-[10px] font-mono text-slate-500 mt-1 uppercase">{s.source} | {s.region}</p>
                           </div>
                           <button 
                             onClick={() => addLayer(s)}
                             className="p-1.5 bg-slate-800 text-slate-400 rounded-lg hover:bg-[#2563eb] hover:text-black transition-all"
                           >
                             <Plus className="w-4 h-4" />
                           </button>
                        </div>
                      ))}
                      {!suggestions && (
                        <div className="py-20 text-center space-y-4">
                           <div className="w-12 h-12 bg-white/5 rounded-full flex items-center justify-center mx-auto">
                              <Plus className="w-6 h-6 text-slate-700" />
                           </div>
                           <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest leading-relaxed">Type to discover<br/>datasets to stack</p>
                        </div>
                      )}
                   </div>
                </div>
              ) : (
                <div className="space-y-4">
                   <Reorder.Group axis="y" values={layers} onReorder={setLayers} className="space-y-2">
                      {layers.map((layer, i) => (
                        <Reorder.Item
                          key={layer.id}
                          value={layer}
                          className="p-4 bg-slate-900/50 border border-white/5 rounded-lg flex items-center gap-4 group hover:border-white/10 transition-all active:scale-[0.98]"
                        >
                           <GripVertical className="w-4 h-4 text-slate-700 cursor-grab active:cursor-grabbing" />
                           <div className="w-7 h-7 rounded-md bg-[#2563eb]/10 border border-[#2563eb]/30 text-[#2563eb] flex items-center justify-center text-[11px] font-extrabold font-mono">
                              {labelFor(i)}
                           </div>
                           <div className="flex-1">
                              <div className="flex items-center gap-2 mb-1">
                                 <div className="w-2 h-2 rounded-full" style={{ backgroundColor: layer.color }} />
                                 <h4 className="text-xs font-bold text-slate-200 truncate">{layer.name}</h4>
                              </div>
                              <p className="text-[9px] font-mono text-slate-500 uppercase">{layer.dataset_id}</p>
                           </div>
                           <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                              <button className="p-1.5 text-slate-500 hover:text-white"><Settings2 className="w-4 h-4" /></button>
                              <button 
                                onClick={() => removeLayer(layer.id)}
                                className="p-1.5 text-slate-500 hover:text-rose-500 transition-colors"
                              ><Trash2 className="w-4 h-4" /></button>
                           </div>
                        </Reorder.Item>
                      ))}
                   </Reorder.Group>
                </div>
              )}
           </div>
        </div>

        {/* Center Canvas: Visual Output */}
        <div className="flex-1 bg-black p-8 flex flex-col overflow-hidden">
           <div className="flex-1 bg-slate-900/30 rounded-[48px] border border-white/5 p-12 shadow-[0_0_100px_rgba(0,0,0,0.5)] relative overflow-hidden group">
              <div className="absolute inset-0 bg-gradient-to-br from-[#2563eb]/2 to-transparent opacity-50" />
              
              <div className="relative h-full flex flex-col">
                 {/* Formula Engine bar */}
                 <div className="mb-6 flex items-center gap-3 bg-black/40 border border-white/5 rounded-xl px-4 py-3">
                    <div className="text-[10px] font-extrabold uppercase tracking-widest text-[#2563eb] font-mono shrink-0">ƒ(x) =</div>
                    <input
                      type="text"
                      value={formula}
                      onChange={(e) => setFormula(e.target.value)}
                      placeholder={formulaPlaceholder}
                      spellCheck={false}
                      className="flex-1 bg-transparent border-none outline-none text-white font-mono text-sm placeholder:text-slate-600"
                    />
                    <div className="text-[9px] font-mono text-slate-500 hidden md:block">
                      vars: {layers.length ? layers.map((_, i) => labelFor(i)).join(', ') : '—'} · fns: abs, min, max, avg, sum, pow
                    </div>
                    {compiled.ok ? (
                      <div className="text-[10px] font-bold uppercase tracking-widest px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 shrink-0">OK</div>
                    ) : (
                      <div className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-widest px-2 py-0.5 rounded bg-rose-500/10 text-rose-400 border border-rose-500/20 shrink-0" title={compiled.error}>
                         <AlertCircle className="w-3 h-3" /> {compiled.error}
                      </div>
                    )}
                 </div>

                 <div className="flex items-center justify-between mb-12">
                    <div className="flex items-center gap-3">
                       <div className="px-3 py-1 bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 rounded-full text-[10px] font-extrabold uppercase tracking-widest flex items-center gap-2">
                          <div className="w-1 h-1 bg-emerald-500 rounded-full " />
                          Live Preview
                       </div>
                       <h2 className="text-2xl font-bold tracking-tight text-white/90">Multi-Series Comparison</h2>
                    </div>
                     <div className="flex items-center bg-black/60 backdrop-blur border border-white/5 p-1.5 rounded-lg gap-1 shadow-2xl">
                        <button 
                          onClick={() => setMode('line')}
                          className={`px-4 py-1.5 rounded-xl text-[10px] font-bold transition-all ${mode === 'line' ? 'bg-[#2563eb] text-black' : 'text-slate-400 hover:text-white'}`}
                        >
                          Line
                        </button>
                        <button 
                          onClick={() => setMode('stack')}
                          className={`px-4 py-1.5 rounded-xl text-[10px] font-bold transition-all ${mode === 'stack' ? 'bg-[#2563eb] text-black' : 'text-slate-400 hover:text-white'}`}
                        >
                          Stack
                        </button>
                        <button 
                          onClick={() => setMode('delta')}
                          className={`px-4 py-1.5 rounded-xl text-[10px] font-bold transition-all ${mode === 'delta' ? 'bg-[#2563eb] text-black' : 'text-slate-400 hover:text-white'}`}
                        >
                          Delta
                        </button>
                     </div>
                 </div>

                 <div className="flex-1 pt-10">
                    <BaseEnergyChart 
                       height="100%"
                       options={{
                          grid: { top: 40, right: 30, bottom: 40, left: 60, containLabel: true },
                          tooltip: { trigger: 'axis', backgroundColor: 'rgba(15, 23, 42, 0.9)', borderColor: 'rgba(255,255,255,0.05)', textStyle: { color: '#fff' } },
                          xAxis: { 
                             type: 'time', 
                             axisLine: { lineStyle: { color: 'rgba(255,255,255,0.05)' } },
                             splitLine: { show: false }
                          },
                          yAxis: { 
                             type: 'value', 
                             axisLine: { show: false }, 
                             splitLine: { lineStyle: { color: 'rgba(255,255,255,0.02)', type: 'dashed' } },
                             axisLabel: { color: '#475569', fontSize: 10 }
                          },
                           series: [
                             ...layers.filter(l => l.visible).map((l, i) => ({
                               name: `${labelFor(i)} — ${l.name}`,
                               type: 'line',
                               color: l.color,
                               smooth: true,
                               stack: mode === 'stack' ? 'total' : undefined,
                               areaStyle: mode === 'stack' ? { opacity: 0.3 } : undefined,
                               showSymbol: false,
                               lineStyle: { width: 2.5, opacity: mode === 'delta' ? 0.3 : 1 },
                               data: results[l.dataset_id]?.data || []
                             })),
                             ...(compiled.ok && formulaSeries.length ? [{
                               name: `ƒ(${formula.trim()})`,
                               type: 'line',
                               color: '#00f2ff',
                               smooth: true,
                               showSymbol: false,
                               lineStyle: { width: 4, type: 'dashed', shadowBlur: 10, shadowColor: '#00f2ff' },
                               data: formulaSeries
                             }] : [])
                           ]
                       }}
                    />
                 </div>
              </div>
           </div>
        </div>
      </div>
    </div>
  );
}
