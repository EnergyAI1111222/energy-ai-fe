import React from 'react';
import { AlertCircle, Lock } from 'lucide-react';

interface WidgetErrorCardProps {
  errorType: 'INSUFFICIENT_PERMISSIONS' | 'NETWORK_ERROR' | 'UNKNOWN_ERROR';
}

export function WidgetErrorCard({ errorType }: WidgetErrorCardProps) {
  if (errorType === 'INSUFFICIENT_PERMISSIONS') {
    return (
      <div className="w-full h-full min-h-[200px] flex flex-col items-center justify-center bg-slate-50 border border-slate-200 rounded-lg p-4 text-center">
        <Lock className="w-8 h-8 text-indigo-500 mb-3" />
        <h4 className="font-semibold text-slate-800 text-sm mb-1">Premium Dataset</h4>
        <p className="text-xs text-slate-500 mb-4 max-w-[200px]">Upgrade to view this specific widget. The rest of the dashboard remains unaffected.</p>
        <button className="text-sm font-medium text-[#2563eb] bg-[#0f172a] px-4 py-2 rounded shadow hover:opacity-90">
          Upgrade to view
        </button>
      </div>
    );
  }

  return (
    <div className="w-full h-full min-h-[200px] flex flex-col items-center justify-center bg-slate-50 border border-slate-200 rounded-lg p-4 text-center">
      <AlertCircle className="w-8 h-8 text-rose-500 mb-2" />
      <h4 className="font-semibold text-slate-800 text-sm mb-1">Data Unavailable</h4>
      <p className="text-xs text-slate-500">Could not load this widget data at this time.</p>
    </div>
  );
}
