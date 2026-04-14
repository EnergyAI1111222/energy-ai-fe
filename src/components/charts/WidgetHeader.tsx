"use client";
import React from 'react';
import { Maximize2, Download, Code2, Lock } from 'lucide-react';
import { TruncationBanner } from '@/components/shared/TruncationBanner';
import { useAppStore } from '@/store/useAppStore';
import { energyApi } from '@/api/client';

interface WidgetHeaderProps {
  title: string;
  datasetId?: string; // Optional identifier for API snippets
  isPremium?: boolean;
  isTruncated?: boolean;
  limitsApplied?: number;
}

import { ApiCodeModal } from '@/components/shared/ApiCodeModal';

export function WidgetHeader({ title, datasetId = "DEFAULT_CHART_ID", isPremium, isTruncated, limitsApplied }: WidgetHeaderProps) {
  const [isModalOpen, setIsModalOpen] = React.useState(false);
  const [isDownloading, setIsDownloading] = React.useState(false);
  const { from_utc, to_utc, resolution } = useAppStore();

  const handleDownloadCsv = async () => {
    if (!datasetId || datasetId === "DEFAULT_CHART_ID") return;
    try {
      setIsDownloading(true);
      // Fallbacks in case from_utc/to_utc aren't set in global store
      const end = to_utc || new Date().toISOString();
      const start = from_utc || new Date(Date.now() - 24 * 3600 * 1000).toISOString();
      
      const response = await energyApi.exportCsv(datasetId, start, end, resolution);
      
      // Prompt download
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `${datasetId}_${start}_to_${end}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (err) {
      console.error('Failed to download CSV', err);
      // Could trigger a toast here
    } finally {
      setIsDownloading(false);
    }
  };

  const handleFullscreen = (e: React.MouseEvent<HTMLButtonElement>) => {
    // Traverse up to find the widget container (BaseEnergyChart parent)
    const container = e.currentTarget.closest('.widget-container') || e.currentTarget.parentElement?.parentElement;
    if (container) {
      if (!document.fullscreenElement) {
        container.requestFullscreen().catch(err => {
          console.warn('Error attempting to enable fullscreen:', err.message);
        });
      } else {
        document.exitFullscreen();
      }
    }
  };

  return (
    <div className="flex items-center justify-between mb-3 relative z-10 px-1 font-sans">
      <div className="flex items-center gap-2">
        <h3 className="text-sm font-semibold text-slate-800 tracking-tight">{title}</h3>
        {isPremium && <Lock className="w-3 h-3 text-slate-400" />}
      </div>
      
      {isTruncated && limitsApplied && (
        <TruncationBanner appliedLimitDays={limitsApplied} />
      )}

      <div className="flex items-center gap-1.5 opacity-40 group-hover:opacity-100 transition-opacity">
        <button 
          onClick={() => setIsModalOpen(true)}
          className="p-1 hover:bg-slate-100 rounded text-slate-400 hover:text-slate-700 transition-colors" 
          title="View API Code"
        >
          <Code2 className="w-4 h-4" />
        </button>
        <button 
          onClick={handleDownloadCsv}
          disabled={isDownloading || datasetId === "DEFAULT_CHART_ID"}
          className={`p-1 rounded transition-colors ${isDownloading ? 'text-[#2563eb] ' : 'text-slate-400 hover:bg-slate-100 hover:text-slate-700'}`} 
          title="Download CSV"
        >
          <Download className="w-4 h-4" />
        </button>
        <button 
          onClick={handleFullscreen}
          className="p-1 hover:bg-slate-100 rounded text-slate-400 hover:text-slate-700 transition-colors" 
          title="Fullscreen"
        >
          <Maximize2 className="w-4 h-4" />
        </button>
      </div>

      <ApiCodeModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        datasetId={datasetId} 
      />
    </div>
  );
}
