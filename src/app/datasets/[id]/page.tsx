"use client";
import React from 'react';
import { BaseEnergyChart } from '@/components/charts/BaseEnergyChart';
import { ApiCodeModal } from '@/components/shared/ApiCodeModal';
import { ArrowLeft, Tag, Clock, Copy, Check, Lock, Database, TrendingUp } from 'lucide-react';
import Link from 'next/link';

const MOCK_DATASETS: Record<string, any> = {
  'DE_SPOT_PRICE': {
    name: 'Germany Day-Ahead Spot Price (DE)',
    dataset_id: 'DE_SPOT_PRICE',
    api_identifier: 'power.de.spot.price',
    dataset_type: 'timeseries_curve',
    unit_verbose: 'Euros per Megawatt-hour',
    ai_expert_note: 'Prices often turn negative during periods of high renewable feed-in and low demand. Watch wind and solar actuals as primary drivers.',
    access: 'basic',
    region: 'CWE',
    source: 'ENTSO-E',
    update_freq: '900s (15 min)',
    visual_config: { chart_type: 'line', color_token: 'primary-teal' },
    primary_driver_dataset_ids: ['DE_WIND_ACTUAL', 'DE_SOLAR_ACTUAL'],
    context_driver_dataset_ids: ['DE_INSTALLED_CAPACITY'],
  },
  'FR_LOAD_FC': {
    name: 'France Load Forecast (TSO)',
    dataset_id: 'FR_LOAD_FC',
    api_identifier: 'power.fr.load.forecast',
    dataset_type: 'timeseries_curve',
    unit_verbose: 'Megawatts',
    ai_expert_note: 'French load peaks in winter due to electric heating. RTE publishes updates every 30 minutes.',
    access: 'hobby',
    region: 'CWE',
    source: 'RTE',
    update_freq: '1800s (30 min)',
    visual_config: { chart_type: 'area', color_token: 'secondary-blue' },
    primary_driver_dataset_ids: ['FR_TEMPERATURE'],
    context_driver_dataset_ids: [],
  },
};

export default function DatasetDetailPage(props: { params: Promise<{ id: string }> }) {
  const params = React.use(props.params);
  const dataset = MOCK_DATASETS[params.id] ?? {
    name: `Dataset: ${params.id}`,
    dataset_id: params.id,
    api_identifier: params.id.toLowerCase().replace(/_/g, '.'),
    dataset_type: 'timeseries_curve',
    unit_verbose: 'Unit',
    ai_expert_note: 'No additional context available.',
    access: 'basic',
    region: 'EU',
    source: 'ENTSO-E',
    update_freq: '900s',
    visual_config: { chart_type: 'line' },
    primary_driver_dataset_ids: [],
    context_driver_dataset_ids: [],
  };

  const [isApiModalOpen, setIsApiModalOpen] = React.useState(false);
  const [copied, setCopied] = React.useState(false);

  const previewData = Array.from({ length: 48 }, (_, i) => [
    Date.now() - (48 - i) * 3600000,
    Math.round(Math.random() * 60 + 20),
  ]);

  const copyId = () => {
    navigator.clipboard.writeText(dataset.dataset_id);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const isPremium = dataset.access !== 'basic';

  return (
    <div className="p-4 md:p-6 max-w-[1400px] mx-auto w-full h-full overflow-y-auto">
      {/* Back */}
      <Link href="/catalog" className="inline-flex items-center gap-2 text-sm text-slate-500 hover:text-slate-800 mb-6 transition-colors">
        <ArrowLeft className="w-4 h-4" /> Back to Catalog
      </Link>

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-start justify-between gap-6 mb-8">
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-2">
            <span className="px-2 py-1 bg-slate-100 text-slate-600 rounded text-xs font-bold uppercase tracking-tight">
              {dataset.dataset_type.replace('_', ' ')}
            </span>
            <span className="px-2 py-1 bg-emerald-50 text-emerald-600 rounded text-xs font-bold border border-emerald-100">
              LIVE
            </span>
            {isPremium && (
              <span className="flex items-center gap-1 px-2 py-1 bg-amber-50 text-amber-600 rounded text-xs font-bold border border-amber-100">
                <Lock className="w-3 h-3" /> PREMIUM
              </span>
            )}
          </div>
          <h1 className="text-2xl md:text-3xl font-bold text-slate-900 tracking-tight mb-2">{dataset.name}</h1>

          {/* dataset_id pill */}
          <button
            onClick={copyId}
            className="inline-flex items-center gap-2 px-3 py-1.5 bg-slate-900 text-slate-200 rounded-lg text-xs font-mono hover:bg-slate-800 transition-colors"
          >
            <Database className="w-3 h-3 text-slate-400" />
            {dataset.dataset_id}
            {copied ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3 text-slate-400" />}
          </button>
        </div>

        <div className="flex gap-3">
          <button
            onClick={() => setIsApiModalOpen(true)}
            className="px-5 py-2.5 border border-slate-200 bg-white text-slate-700 rounded-xl text-sm font-bold hover:border-[#2563eb] transition-all shadow-sm"
          >
            &lt;/&gt; View API Code
          </button>
          <button
            onClick={() => {
              const snippet = JSON.stringify({ dataset_id: dataset.dataset_id, type: dataset.dataset_type }, null, 2);
              navigator.clipboard.writeText(snippet);
            }}
            className="px-5 py-2.5 bg-slate-900 text-white rounded-xl text-sm font-bold hover:bg-[#2563eb] hover:text-slate-900 transition-all shadow-sm"
          >
            + Add to Dashboard
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        {/* Metadata */}
        <div className="lg:col-span-1 space-y-4">
          <div className="bg-white border border-slate-200 rounded-lg p-5 shadow-sm">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4">Metadata</h3>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-slate-500">Unit</span>
                <span className="font-bold text-slate-800 font-mono text-right">{dataset.unit_verbose}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Source</span>
                <span className="font-bold text-slate-800">{dataset.source}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Region</span>
                <span className="font-bold text-slate-800">{dataset.region}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-500">Update Freq.</span>
                <span className="flex items-center gap-1 font-bold text-slate-800">
                  <Clock className="w-3 h-3 text-[#2563eb]" /> {dataset.update_freq}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-500">Access Tier</span>
                <span className="flex items-center gap-1 font-bold text-slate-700 uppercase text-xs">
                  <Tag className="w-3 h-3 text-[#2563eb]" /> {dataset.access}
                </span>
              </div>
            </div>
          </div>

          {/* AI Expert Note */}
          <div className="bg-slate-900 text-white rounded-lg p-5 border border-slate-800">
            <h3 className="text-xs font-bold text-[#2563eb] uppercase tracking-widest mb-3">AI Expert Note</h3>
            <p className="text-sm text-slate-300 leading-relaxed italic">"{dataset.ai_expert_note}"</p>
          </div>

          {/* Drivers */}
          {dataset.primary_driver_dataset_ids.length > 0 && (
            <div className="bg-white border border-slate-200 rounded-lg p-5 shadow-sm">
              <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-3 flex items-center gap-2">
                <TrendingUp className="w-3 h-3" /> Primary Drivers
              </h3>
              <div className="space-y-2">
                {dataset.primary_driver_dataset_ids.map((d: string) => (
                  <Link key={d} href={`/datasets/${d}`} className="block px-3 py-2 bg-slate-50 rounded-lg text-xs font-mono text-slate-700 hover:bg-[#2563eb]/10 hover:text-[#2563eb] transition-colors">
                    {d}
                  </Link>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Preview Chart */}
        <div className="lg:col-span-2">
          <div className="bg-white border border-slate-200 rounded-lg p-5 shadow-sm h-full flex flex-col">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-emerald-400 " />
                <h3 className="text-xs font-bold text-slate-500 uppercase tracking-widest">Safe Exploration Preview</h3>
              </div>
              <span className="text-[10px] text-slate-400 font-mono bg-slate-50 px-2 py-1 rounded border border-slate-100">
                Downsampled · Last 48h
              </span>
            </div>
            <div className="flex-1 min-h-[300px]">
              <BaseEnergyChart
                height="100%"
                options={{
                  color: ['#2563eb'],
                  grid: { top: 20, bottom: 40, left: 50, right: 20 },
                  xAxis: { type: 'time' },
                  yAxis: {
                    type: 'value',
                    splitLine: { lineStyle: { type: 'dashed', color: '#e2e8f0' } },
                    axisLabel: { fontSize: 10 },
                  },
                  series: [{
                    type: 'line',
                    smooth: true,
                    areaStyle: { opacity: 0.08 },
                    showSymbol: false,
                    lineStyle: { width: 2 },
                    data: previewData,
                  }],
                }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Raw Data Table */}
      <div className="bg-white border border-slate-200 rounded-lg shadow-sm overflow-hidden mb-20">
        <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
          <h3 className="font-bold text-slate-800 text-sm">Raw Data Preview</h3>
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Last 10 records</span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 text-[11px] font-bold text-slate-400 uppercase tracking-wide">
              <tr>
                <th className="px-5 py-3 text-left">Timestamp (UTC)</th>
                <th className="px-5 py-3 text-right">{dataset.unit_verbose}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {previewData.slice(-10).map(([ts, val]: any, i: number) => (
                <tr key={i} className="hover:bg-slate-50/50 transition-colors">
                  <td className="px-5 py-3 font-mono text-slate-500 text-xs">
                    {new Date(ts).toISOString().replace('T', ' ').slice(0, 19)} UTC
                  </td>
                  <td className="px-5 py-3 text-right font-mono font-bold text-slate-800">{val}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <ApiCodeModal isOpen={isApiModalOpen} onClose={() => setIsApiModalOpen(false)} datasetId={dataset.dataset_id} />
    </div>
  );
}
