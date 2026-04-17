"use client";
import { Star, Database, Plus } from "lucide-react";
import Link from "next/link";

export default function MyGridPage() {
  return (
    <div className="p-6 space-y-6 bg-slate-50 min-h-full">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">My Grid Status</h1>
          <p className="text-sm text-slate-500">Personalized monitoring of your bookmarked energy assets.</p>
        </div>
        <Link href="/catalog" className="flex items-center gap-2 px-4 py-2 bg-slate-900 text-white rounded-xl text-xs font-bold hover:bg-[#2563eb] transition-all">
          <Plus className="w-4 h-4" /> Add Assets
        </Link>
      </div>

      <div className="flex flex-col items-center justify-center py-32 bg-white rounded-3xl border border-slate-200 shadow-sm border-dashed">
         <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mb-6">
            <Star className="w-8 h-8 text-slate-200" />
         </div>
         <h3 className="text-lg font-bold text-slate-900 mb-2">No Bookmarked Assets</h3>
         <p className="text-sm text-slate-400 max-w-sm text-center px-6">
            You haven't added any datasets to your personal monitoring grid yet. 
            Once added, they will appear here with real-time health indicators.
         </p>
         <Link href="/catalog" className="mt-8 flex items-center gap-2 px-6 py-3 bg-white border border-slate-200 rounded-2xl text-sm font-bold text-slate-700 hover:border-[#2563eb] hover:text-[#2563eb] transition-all">
            <Database className="w-4 h-4" /> Open Catalog
         </Link>
      </div>
    </div>
  );
}
