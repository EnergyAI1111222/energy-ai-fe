"use client";
import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { energyApi } from '@/api/client';
import {
  Download, FileText, BarChart2, Clock, CheckCircle2,
  AlertCircle, ChevronDown, Calendar, Database, AlertTriangle
} from 'lucide-react';

interface ExportRecord {
  id: string;
  name: string;
  dataset: string;
  range: string;
  format: string;
  size: string;
  status: 'done' | 'failed';
  ts: string;
}

export default function ExportDataPage() {
  const [datasetId, setDatasetId] = React.useState('');
  const [fromDate, setFromDate] = React.useState(() => {
    const d = new Date(); d.setDate(d.getDate() - 7);
    return d.toISOString().split('T')[0];
  });
  const [toDate, setToDate] = React.useState(new Date().toISOString().split('T')[0]);
  const [resolution, setResolution] = React.useState<'1h' | '1d'>('1h');
  const [exporting, setExporting] = React.useState(false);
  const [exportDone, setExportDone] = React.useState(false);
  const [exportError, setExportError] = React.useState<string | null>(null);
  const [recentExports, setRecentExports] = React.useState<ExportRecord[]>([]);

  // Real catalog data for dataset selector
  const { data: catalogData, isLoading: catalogLoading } = useQuery({
    queryKey: ['catalog-export-list'],
    queryFn: () => energyApi.getCatalog(),
    staleTime: 5 * 60 * 1000,
  });

  const datasets = React.useMemo(() => {
    if (!catalogData || !Array.isArray(catalogData)) return [];
    return catalogData.slice(0, 100).map((d: any) => ({
      id: d.dataset_id,
      name: d.name ?? d.dataset_id,
      unit: d.unit_verbose ?? d.unit ?? '',
    }));
  }, [catalogData]);

  React.useEffect(() => {
    if (datasets.length > 0 && !datasetId) setDatasetId(datasets[0].id);
  }, [datasets, datasetId]);

  const selectedDataset = datasets.find(d => d.id === datasetId) ?? datasets[0];

  const estimatedRows = React.useMemo(() => {
    try {
      const diff = new Date(toDate).getTime() - new Date(fromDate).getTime();
      const hours = Math.floor(diff / 3_600_000);
      if (resolution === '1d') return `~${Math.floor(hours / 24).toLocaleString()} rows`;
      return hours > 0 ? `~${hours.toLocaleString()} rows` : '—';
    } catch { return '—'; }
  }, [fromDate, toDate, resolution]);

  const handleExport = async () => {
    if (!selectedDataset) return;
    setExporting(true);
    setExportDone(false);
    setExportError(null);

    try {
      const fromUtc = `${fromDate}T00:00:00Z`;
      const toUtc   = `${toDate}T23:59:59Z`;

      // Call real backend CSV endpoint
      const response = await energyApi.exportCsv(selectedDataset.id, fromUtc, toUtc, resolution);
      const blob = response.data instanceof Blob
        ? response.data
        : new Blob([response.data], { type: 'text/csv;charset=utf-8;' });

      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${selectedDataset.id}_${fromDate}_${toDate}.csv`;
      a.click();
      URL.revokeObjectURL(url);

      setRecentExports(prev => [{
        id: `exp_${Date.now()}`,
        name: `${selectedDataset.name} export`,
        dataset: selectedDataset.id,
        range: `${fromDate} → ${toDate}`,
        format: 'CSV',
        size: blob.size > 1024 ? `${(blob.size / 1024).toFixed(0)} KB` : `${blob.size} B`,
        status: 'done' as const,
        ts: 'Just now',
      }, ...prev].slice(0, 10));

      setExportDone(true);
      setTimeout(() => setExportDone(false), 3000);

    } catch (err: any) {
      const status = err?.response?.status;
      if (status === 413) {
        setExportError('Date range too large. Try a shorter range or switch to 1d resolution.');
      } else if (status === 403) {
        setExportError('Your plan does not allow exports. Upgrade to Professional.');
      } else {
        setExportError('Export failed. Please try again or check your date range.');
      }
      setRecentExports(prev => [{
        id: `exp_fail_${Date.now()}`,
        name: `${selectedDataset?.name ?? datasetId} export`,
        dataset: datasetId,
        range: `${fromDate} → ${toDate}`,
        format: 'CSV', size: '—', status: 'failed' as const, ts: 'Just now',
      }, ...prev].slice(0, 10));
    } finally {
      setExporting(false);
    }
  };

  return (
    <div className="p-4 md:p-6 max-w-[1200px] mx-auto w-full h-full overflow-y-auto">
      <div className="mb-8">
        <h1 className="text-2xl md:text-3xl font-bold text-slate-900 tracking-tight mb-1">Export Data Center</h1>
        <p className="text-sm text-slate-500">Download timeseries data as CSV. Graph exports route here pre-filled.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-5">
          <div className="bg-white border border-slate-200 rounded-lg shadow-sm overflow-hidden">
            <div className="px-5 py-4 border-b border-slate-100 flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-[#2563eb]/10 flex items-center justify-center">
                <Database className="w-4 h-4 text-[#2563eb]" />
              </div>
              <div>
                <h2 className="font-bold text-slate-800 text-sm">Dataset Export</h2>
                <p className="text-[11px] text-slate-400">Select a dataset and date range to download</p>
              </div>
            </div>
            <div className="p-5 space-y-4">
              {/* Dataset selector — real catalog API */}
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wide mb-1.5">
                  Dataset {catalogLoading && <span className="text-[#2563eb] ml-1 font-normal">Loading...</span>}
                </label>
                <div className="relative">
                  <select
                    value={datasetId}
                    onChange={e => setDatasetId(e.target.value)}
                    disabled={catalogLoading || datasets.length === 0}
                    className="w-full appearance-none bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm font-mono text-slate-800 pr-10 focus:outline-none focus:border-[#2563eb] transition-colors disabled:opacity-50"
                  >
                    {datasets.length === 0 && <option value="">No datasets available</option>}
                    {datasets.map(d => (
                      <option key={d.id} value={d.id}>
                        {d.id} — {d.name}{d.unit ? ` (${d.unit})` : ''}
                      </option>
                    ))}
                  </select>
                  <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wide mb-1.5">From</label>
                  <input type="date" value={fromDate} onChange={e => setFromDate(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm font-mono text-slate-800 focus:outline-none focus:border-[#2563eb] transition-colors" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wide mb-1.5">To</label>
                  <input type="date" value={toDate} onChange={e => setToDate(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm font-mono text-slate-800 focus:outline-none focus:border-[#2563eb] transition-colors" />
                </div>
              </div>

              <div className="flex items-center justify-between flex-wrap gap-3">
                <div className="flex gap-2">
                  {(['1h', '1d'] as const).map(r => (
                    <button key={r} onClick={() => setResolution(r)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors border ${
                        resolution === r ? 'bg-slate-900 text-white border-slate-900' : 'bg-white text-slate-600 border-slate-200 hover:border-slate-400'
                      }`}
                    >{r}</button>
                  ))}
                  <span className="px-3 py-1.5 rounded-lg text-xs font-bold border border-dashed border-slate-200 text-slate-300 cursor-not-allowed">JSON</span>
                  <span className="px-3 py-1.5 rounded-lg text-xs font-bold border border-dashed border-slate-200 text-slate-300 cursor-not-allowed">Parquet</span>
                </div>
                <span className="text-xs text-slate-400 font-mono">{estimatedRows} · UTC</span>
              </div>

              {exportError && (
                <div className="flex items-start gap-2 p-3 bg-red-50 border border-red-100 rounded-xl">
                  <AlertTriangle className="w-4 h-4 text-red-500 mt-0.5 shrink-0" />
                  <p className="text-xs text-red-600">{exportError}</p>
                </div>
              )}

              <div className="flex items-center gap-3 pt-1">
                <button onClick={handleExport} disabled={exporting || !selectedDataset}
                  className="flex items-center gap-2 px-5 py-2.5 bg-slate-900 text-white rounded-xl text-sm font-bold hover:bg-[#2563eb] hover:text-slate-900 transition-all shadow disabled:opacity-50 disabled:cursor-not-allowed">
                  {exporting ? (
                    <><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />Preparing...</>
                  ) : exportDone ? (
                    <><CheckCircle2 className="w-4 h-4 text-emerald-400" />Downloaded!</>
                  ) : (
                    <><Download className="w-4 h-4" />Download CSV</>
                  )}
                </button>
                <p className="text-[11px] text-slate-400">UTC timestamps · Max 50,000 rows</p>
              </div>
            </div>
          </div>

          <div className="bg-white border border-slate-200 rounded-lg shadow-sm overflow-hidden">
            <div className="px-5 py-4 border-b border-slate-100 flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-emerald-50 flex items-center justify-center">
                <BarChart2 className="w-4 h-4 text-emerald-500" />
              </div>
              <div>
                <h2 className="font-bold text-slate-800 text-sm">Graph Export</h2>
                <p className="text-[11px] text-slate-400">Export the exact view from any chart widget</p>
              </div>
            </div>
            <div className="p-5">
              <div className="bg-slate-50 rounded-xl p-4 border border-dashed border-slate-200 text-center">
                <BarChart2 className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                <p className="text-sm font-bold text-slate-500 mb-1">Open any dashboard chart</p>
                <p className="text-xs text-slate-400">Click the <span className="font-mono font-bold">↓ Download CSV</span> button in the widget header. The export will be pre-filled here automatically.</p>
              </div>
            </div>
          </div>
        </div>

        {/* Recent exports — session state */}
        <div className="lg:col-span-1">
          <div className="bg-white border border-slate-200 rounded-lg shadow-sm overflow-hidden sticky top-4">
            <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
              <h2 className="font-bold text-slate-800 text-sm">Recent Exports</h2>
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">This session</span>
            </div>
            <div className="divide-y divide-slate-50">
              {recentExports.length === 0 ? (
                <div className="px-5 py-8 text-center">
                  <Download className="w-6 h-6 text-slate-200 mx-auto mb-2" />
                  <p className="text-xs text-slate-400">No exports yet this session</p>
                </div>
              ) : recentExports.map(exp => (
                <div key={exp.id} className="px-5 py-3.5 hover:bg-slate-50/60 transition-colors">
                  <div className="flex items-start justify-between gap-2 mb-1">
                    <span className="text-xs font-bold text-slate-800 leading-tight truncate">{exp.name}</span>
                    {exp.status === 'done'
                      ? <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                      : <AlertCircle className="w-3.5 h-3.5 text-red-400 shrink-0 mt-0.5" />
                    }
                  </div>
                  <p className="text-[10px] font-mono text-slate-400 mb-1">{exp.dataset}</p>
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] text-slate-400 flex items-center gap-1">
                      <Calendar className="w-3 h-3" />{exp.range}
                    </span>
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] px-1.5 py-0.5 bg-slate-100 text-slate-500 rounded font-mono">{exp.format}</span>
                      {exp.size !== '—' && <span className="text-[10px] text-slate-400">{exp.size}</span>}
                    </div>
                  </div>
                  <span className="text-[10px] text-slate-300 mt-1 flex items-center gap-1">
                    <Clock className="w-2.5 h-2.5" />{exp.ts}
                  </span>
                </div>
              ))}
            </div>
            <div className="px-5 py-3 border-t border-slate-50">
              <p className="text-[10px] text-slate-300 text-center">Export history is local to this session</p>
            </div>
          </div>
        </div>
      </div>

      <div className="mt-6 bg-amber-50 border border-amber-100 rounded-lg p-4 flex items-start gap-3">
        <FileText className="w-4 h-4 text-amber-500 mt-0.5 shrink-0" />
        <div>
          <p className="text-xs font-bold text-amber-700 mb-0.5">Backend-Enforced Export Limits</p>
          <p className="text-xs text-amber-600">Sync exports are capped at <span className="font-bold">50,000 rows</span>. For larger datasets, upgrade to Professional for async jobs with no size limit.</p>
        </div>
      </div>
    </div>
  );
}
