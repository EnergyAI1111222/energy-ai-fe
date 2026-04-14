import React from 'react';
import { Lock } from 'lucide-react';

interface PremiumIndicatorProps {
  label?: string;
}

export function PremiumIndicator({ label = "Premium feature" }: PremiumIndicatorProps) {
  return (
    <div className="inline-flex items-center gap-1.5 px-2 py-1 rounded-md bg-slate-100 border border-slate-200 text-slate-500 text-xs font-medium" title={label}>
      <Lock className="w-3 h-3" />
      <span>Basic limit</span>
    </div>
  );
}
