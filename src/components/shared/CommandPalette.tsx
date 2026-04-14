"use client";
import React, { useState, useEffect, useCallback } from 'react';
import { Search, Command, Map, Box, Info, X, Zap, ArrowRight } from 'lucide-react';
import { useRouter } from 'next/navigation';

export function CommandPalette() {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [items, setItems] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
      e.preventDefault();
      setIsOpen(true);
    }
    if (e.key === 'Escape') {
      setIsOpen(false);
    }
  }, []);

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  // Static navigation items
  const STATIC_LINKS = [
    { id: 'eu', name: 'Europe Overview', icon: <Map className="w-4 h-4" />, category: 'Dashboards', href: '/eu' },
    { id: 'cat', name: 'Data Catalog Explorer', icon: <Search className="w-4 h-4" />, category: 'Tools', href: '/catalog' },
    { id: 'pic', name: 'Picasso (Merit Orders)', icon: <Zap className="w-4 h-4" />, category: 'Apps', href: '/picasso' },
  ];

  const fetchSuggestions = useCallback(async (query: string) => {
    if (query.length < 2) {
      setItems(STATIC_LINKS);
      return;
    }
    
    setIsLoading(true);
    try {
      const { energyApi } = await import('@/api/client');
      const results = await energyApi.suggest(query);
      
      const dynamicItems = results.map((r: any) => ({
        id: r.dataset_id,
        name: r.name,
        icon: r.dataset_type === 'snapshot_curve' ? <Zap className="w-4 h-4" /> : <Box className="w-4 h-4" />,
        category: 'Datasets',
        href: `/datasets/${r.dataset_id}`
      }));
      
      setItems([...STATIC_LINKS.filter(l => l.name.toLowerCase().includes(query.toLowerCase())), ...dynamicItems]);
    } catch (err) {
      console.error("Suggest failed", err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchSuggestions(search);
    }, 200);
    return () => clearTimeout(timer);
  }, [search, fetchSuggestions]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-start justify-center pt-[15vh]">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-slate-900/40 backdrop-blur-[2px]" 
        onClick={() => setIsOpen(false)} 
      />
      
      {/* Search Content */}
      <div className="relative w-full max-w-2xl bg-white rounded-lg shadow-2xl border border-slate-200 overflow-hidden animate-in fade-in zoom-in duration-200">
        <div className="flex items-center px-4 py-4 border-b border-slate-100">
           <Search className="w-5 h-5 text-slate-400 mr-4" />
           <input 
             autoFocus
             type="text" 
             placeholder="Jump to a dashboard, app, or dataset id..."
             className="flex-1 bg-transparent border-none outline-none text-lg text-slate-800 placeholder:text-slate-400"
             value={search}
             onChange={(e) => setSearch(e.target.value)}
           />
           <div className="flex items-center gap-2 px-2 py-1 bg-slate-100 rounded text-[10px] font-bold text-slate-400 uppercase">
              ESC TO CLOSE
           </div>
        </div>

        <div className="max-h-[60vh] overflow-y-auto p-2">
           {items.length > 0 ? (
              (Object.entries(
               items.reduce((acc, item: any) => {
                 if (!acc[item.category]) acc[item.category] = [];
                 acc[item.category].push(item);
                 return acc;
               }, {} as Record<string, any[]>)
             ) as [string, any[]][]).map(([category, categoryItems]) => (
                <div key={category} className="mb-2 last:mb-0">
                  <h4 className="px-3 py-2 text-[10px] font-bold text-slate-400 uppercase tracking-widest">{category}</h4>
                  {categoryItems.map(item => (
                    <button
                      key={item.id}
                      onClick={() => {
                        router.push(item.href);
                        setIsOpen(false);
                      }}
                      className="w-full flex items-center justify-between px-3 py-3 rounded-xl hover:bg-slate-50 transition-colors group"
                    >
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-slate-100 text-slate-500 rounded-lg group-hover:bg-[#2563eb]/10 group-hover:text-[#2563eb] transition-colors">
                          {item.icon}
                        </div>
                        <span className="text-sm font-semibold text-slate-700 group-hover:text-slate-900">{item.name}</span>
                      </div>
                      <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                         <span className="text-[10px] font-bold text-slate-400">JUMP TO</span>
                         <ArrowRight className="w-3 h-3 text-[#2563eb]" />
                      </div>
                    </button>
                  ))}
                </div>
             ))
           ) : (
             <div className="py-12 text-center text-slate-400">
                <Info className="w-12 h-12 mx-auto mb-4 opacity-20" />
                <p className="font-semibold italic">No results found for "{search}"</p>
             </div>
           )}
        </div>

        <div className="bg-slate-50 p-4 border-t border-slate-100 flex items-center justify-between">
           <div className="flex items-center gap-4 text-[10px] font-bold text-slate-400 uppercase tracking-tighter">
              <span className="flex items-center gap-1"><Command className="w-3 h-3" /> ENTER</span> - Open
              <span className="flex items-center gap-1"><Command className="w-3 h-3" /> ↑ ↓</span> - Navigate
           </div>
           <div className="text-[10px] font-bold text-slate-400 italic">
              Try searching for "Germany" or "Spot"
           </div>
        </div>
      </div>
    </div>
  );
}
