"use client";
import { Search } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useAppStore } from '@/store/useAppStore';
import { useAuthProfile } from '@/hooks/useAuthProfile';
import { UserButton } from '@clerk/nextjs';

export function Topbar() {
  const router = useRouter();
  const { 
    displayTimezone, setDisplayTimezone, 
    isSyncActive, setSyncActive,
    resolution, setResolution 
  } = useAppStore();

  const { data: profile, isLoading } = useAuthProfile();

  return (
    <header className="h-14 border-b border-slate-200 bg-white px-4 flex items-center justify-between sticky top-0 z-10">
      <div className="flex w-full items-center justify-between">
        <div className="flex-1 flex" />
        {/* Command Palette Trigger */}
        <button className="hidden md:flex items-center gap-2 text-sm text-slate-500 bg-white px-3 py-1.5 rounded-md border border-slate-200 hover:border-slate-300 w-64 justify-between shadow-sm">
          <span className="flex items-center gap-2"><Search className="w-4 h-4" /> Search...</span>
          <kbd className="text-xs font-mono bg-slate-50 px-1.5 py-0.5 rounded border border-slate-200">Ctrl K</kbd>
        </button>

        <div className="flex-1 flex items-center justify-end gap-4 pr-2">
           {/* Resolution Switcher (Spec MS-FE-005 Section C) */}
           <div className="flex items-center bg-slate-100 p-0.5 rounded-lg border border-slate-200">
              <button 
                onClick={() => setResolution('15m')}
                className={`px-2 py-1 text-[10px] font-bold rounded transition-all ${
                  resolution === '15m' ? 'bg-white shadow-sm text-slate-800' : 'text-slate-400 hover:text-slate-600'
                }`}
              >
                15m
              </button>
              <button 
                onClick={() => setResolution('1h')}
                className={`px-2 py-1 text-[10px] font-bold rounded transition-all ${
                  resolution === '1h' ? 'bg-white shadow-sm text-slate-800' : 'text-slate-400 hover:text-slate-600'
                }`}
              >
                1h
              </button>
           </div>

          {/* Sync Tooltips Toggle */}
          <button 
            onClick={() => setSyncActive(!isSyncActive)}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-md border text-[11px] font-bold transition-all ${
              isSyncActive 
              ? 'bg-blue-50 border-blue-600 text-blue-700' 
              : 'bg-white border-slate-200 text-slate-500 hover:bg-slate-50'
            }`}
          >
            <div className={`w-1.5 h-1.5 rounded-full ${isSyncActive ? 'bg-blue-600' : 'bg-slate-300'}`} />
            SYNC TOOLTIPS
          </button>

          <select 
            value={displayTimezone}
            onChange={(e) => setDisplayTimezone(e.target.value)}
            className="text-[11px] bg-white border border-slate-200 rounded-md px-2 py-1.5 text-slate-700 outline-none focus:ring-2 focus:ring-blue-500/20 font-medium tracking-tight shadow-sm"
          >
            <option value="Europe/Berlin">CET / CEST</option>
            <option value="Europe/London">UK TIME</option>
            <option value="UTC">UTC ZONE</option>
          </select>

          {/* Plan-driven UI */}
          {!isLoading && profile && profile.plan !== 'free' && profile.plan !== 'guest' && (
            <span className="bg-slate-100 text-slate-700 px-3 py-1.5 rounded-md text-[11px] font-bold uppercase tracking-wider border border-slate-200">
              {profile.plan}
            </span>
          )}
          {(!profile || profile.plan === 'free' || profile.plan === 'guest') && (
            <button 
              onClick={() => router.push('/settings?tab=billing')}
              className="bg-blue-600 border border-blue-700 text-white px-4 py-1.5 rounded-md text-[11px] font-bold hover:bg-blue-700 transition-colors shadow-sm whitespace-nowrap uppercase tracking-wider"
            >
              Upgrade Now
            </button>
          )}

          <UserButton appearance={{ elements: { avatarBox: "h-8 w-8 rounded-xl border border-slate-200" } }} />
        </div>
      </div>
    </header>
  );
}
