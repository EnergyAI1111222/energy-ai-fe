import React from 'react';
import { AlertTriangle } from 'lucide-react';

interface TruncationBannerProps {
  appliedLimitDays: number;
}

export function TruncationBanner({ appliedLimitDays }: TruncationBannerProps) {
  return (
    <div className="absolute top-2 left-1/2 -translate-x-1/2 z-20 flex items-center gap-2 bg-amber-100/90 backdrop-blur-sm border border-amber-300 text-amber-800 px-3 py-1.5 rounded-full text-xs font-medium shadow-sm">
      <AlertTriangle className="w-4 h-4 text-amber-600" />
      <span>Showing last {appliedLimitDays} days.</span>
      <button className="underline decoration-amber-400 hover:text-amber-900 transition-colors ml-1 font-bold">
        Upgrade for full history
      </button>
    </div>
  );
}
