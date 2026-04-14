"use client";
/**
 * <WidgetActions> — Standard 3-button widget header actions per MS-FE-003.
 *
 *   1. </> View API Code     → opens <ApiCodeModal>
 *   2. ↓  Download CSV       → calls energyApi.exportCsv() against the first datasetId
 *   3. ⛶  Fullscreen         → portal-style overlay rendering the children at full size
 *
 * Designed to be drop-in for any widget that knows its primary datasetId(s).
 *
 * The Fullscreen overlay simply re-mounts the children inside a fixed-position
 * container — works for any chart that respects its parent's dimensions.
 */
import React from 'react';
import { createPortal } from 'react-dom';
import { Terminal, Download, Maximize2, X, Loader2 } from 'lucide-react';
import { ApiCodeModal } from './ApiCodeModal';
import { energyApi } from '@/api/client';
import { useTimeStateStore } from '@/store/useTimeStateStore';

interface WidgetActionsProps {
  datasetIds?: string[];
  fullscreenContent?: React.ReactNode;
  title?: string;
}

function isoFromState(activeTab: string, historyDateRange: [Date, Date] | null) {
  const now = new Date();
  const todayStart = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()));
  const todayEnd = new Date(todayStart); todayEnd.setUTCDate(todayEnd.getUTCDate() + 1);

  if (activeTab === 'history' && historyDateRange) {
    return { from_utc: historyDateRange[0].toISOString(), to_utc: historyDateRange[1].toISOString() };
  }
  if (activeTab === 'forecast') {
    const to = new Date(todayEnd); to.setUTCDate(to.getUTCDate() + 2);
    return { from_utc: todayStart.toISOString(), to_utc: to.toISOString() };
  }
  if (activeTab === 'trends') {
    const from = new Date(todayStart); from.setUTCDate(from.getUTCDate() - 1);
    const to = new Date(todayEnd); to.setUTCDate(to.getUTCDate() + 1);
    return { from_utc: from.toISOString(), to_utc: to.toISOString() };
  }
  return { from_utc: todayStart.toISOString(), to_utc: todayEnd.toISOString() };
}

export function WidgetActions({ datasetIds = [], fullscreenContent, title }: WidgetActionsProps) {
  const [apiOpen, setApiOpen] = React.useState(false);
  const [fsOpen, setFsOpen] = React.useState(false);
  const [downloading, setDownloading] = React.useState(false);
  const { activeTab, historyDateRange, resolution } = useTimeStateStore();

  const primaryId = datasetIds[0];
  const disabled = !primaryId;

  async function handleDownload() {
    if (!primaryId || downloading) return;
    setDownloading(true);
    try {
      const { from_utc, to_utc } = isoFromState(activeTab, historyDateRange);
      const res = await energyApi.exportCsv(primaryId, from_utc, to_utc, resolution);
      const blob = new Blob([res.data], { type: 'text/csv' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${primaryId}_${from_utc.slice(0, 10)}_${to_utc.slice(0, 10)}.csv`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error('[WidgetActions] CSV export failed', err);
    } finally {
      setDownloading(false);
    }
  }

  const btn =
    'p-1.5 bg-white text-slate-400 rounded-lg border border-slate-200 hover:text-[#2563eb] hover:border-[#2563eb] transition-all disabled:opacity-40 disabled:cursor-not-allowed';

  return (
    <>
      <div className="flex gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
        <button title="View API Code" disabled={disabled} className={btn} onClick={() => setApiOpen(true)}>
          <Terminal className="w-3.5 h-3.5" />
        </button>
        <button title="Download CSV" disabled={disabled || downloading} className={btn} onClick={handleDownload}>
          {downloading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Download className="w-3.5 h-3.5" />}
        </button>
        <button title="Fullscreen" disabled={!fullscreenContent} className={btn} onClick={() => setFsOpen(true)}>
          <Maximize2 className="w-3.5 h-3.5" />
        </button>
      </div>

      {primaryId && <ApiCodeModal datasetId={primaryId} isOpen={apiOpen} onClose={() => setApiOpen(false)} />}

      {fsOpen && fullscreenContent && typeof window !== 'undefined' &&
        createPortal(
          <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex flex-col p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-white font-bold text-sm uppercase tracking-widest">{title ?? 'Widget'}</h3>
              <button onClick={() => setFsOpen(false)} className="p-2 bg-white/10 text-white rounded-lg hover:bg-white/20">
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="flex-1 min-h-0 bg-white rounded-lg overflow-hidden p-4">{fullscreenContent}</div>
          </div>,
          document.body,
        )}
    </>
  );
}
