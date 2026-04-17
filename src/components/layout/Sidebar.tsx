"use client";
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  BarChart2, Columns, TrendingUp, Zap, Scale, Flame, Map, ShoppingCart, 
  Search, Trophy, Lightbulb, Bell, Download, Star, Settings, ExternalLink,
  ChevronRight, Lock
} from 'lucide-react';

const CATEGORIES = [
  {
    title: "Main Apps",
    items: [
      { name: 'Dashboards', href: '/eu', icon: BarChart2, active: true },
      { name: 'Custom Dashboards', href: '/custom-dashboards', icon: Columns }, 
      { name: 'Futures, Fuels & Spreads', href: '/futures', icon: TrendingUp }, 
      { name: 'Picasso', href: '/picasso', icon: Zap }, // Active
      { name: 'Imbalance Capacity', href: '/imbalance-capacity', icon: Scale }, 
      { name: 'Gas', href: '/gas', icon: Flame }, 
      { name: 'Nodal Analyse', href: '/nodal-analyse', icon: Map }, 
      { name: 'Retail', href: '/retail', icon: ShoppingCart }, 
    ]
  },
  {
    title: "Data & Tools",
    items: [
      { name: 'Data Catalog', href: '/catalog', icon: Search }, // Active
      { name: 'Record Tracker', href: '/record-tracker', icon: Trophy },
      { name: 'Insights', href: '/insights', icon: Lightbulb },
      { name: 'Alerts', href: '/alerts', icon: Bell },
      { name: 'Export Data', href: '/export-data', icon: Download }, // Active
    ]
  },
  {
    title: "Utilities & User",
    items: [
      { name: 'My Grid Status', href: '/my-grid', icon: Star },
      { name: 'Settings', href: '/settings', icon: Settings },
    ]
  }
];

function NavLink({ item }: { item: any }) {
  const pathname = usePathname();
  const isActive = pathname.startsWith(item.href);
  const Icon = item.icon;

  return (
    <Link 
      href={item.href} 
      className={`flex items-center justify-between px-3 py-2 text-sm font-medium rounded-md transition-all group ${
        isActive 
        ? 'bg-blue-50 text-blue-700' 
        : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
      }`}
    >
      <div className="flex items-center gap-3">
        <Icon className={`w-4 h-4 ${isActive ? 'text-blue-600' : 'text-slate-400 group-hover:text-slate-600'}`} />
        <span className="tracking-tight">{item.name}</span>
        {item.shell && (
           <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-full bg-slate-100 text-slate-500 uppercase tracking-tighter border border-slate-200">Shell</span>
        )}
      </div>
      {item.shell && <Lock className="w-3 h-3 text-slate-300" />}
    </Link>
  );
}

export function Sidebar() {
  return (
    <div className="w-68 bg-white border-r border-slate-200 text-slate-900 flex flex-col h-full relative z-20">
      <div className="p-6 border-b border-slate-200 flex items-center justify-between">
        <h1 className="font-bold text-xl tracking-tighter flex items-center gap-3">
          <div className="w-4 h-4 bg-blue-600 rounded-sm" />
          <span className="uppercase font-extrabold tracking-tight text-slate-900 text-sm sm:text-base">OpenEnergyData</span>
        </h1>
      </div>
      
      <div className="flex-1 overflow-y-auto pt-4 pb-10 px-3 space-y-8 scrollbar-hide">
        {CATEGORIES.map((cat) => (
          <div key={cat.title}>
            <h2 className="px-3 text-[10px] font-bold text-slate-500 uppercase tracking-[0.2em] mb-3">{cat.title}</h2>
            <div className="space-y-1">
              {cat.items.map((item) => <NavLink key={item.name} item={item} />)}
            </div>
          </div>
        ))}

        <div className="px-3 pt-4 border-t border-slate-200 space-y-4">
           <Link href="/settings?tab=billing" className="block p-4 bg-white border border-slate-200 rounded-lg hover:border-blue-300 hover:shadow-sm transition-all group overflow-hidden relative">
              <p className="text-[10px] font-bold text-blue-600 uppercase tracking-widest mb-1">Standard Plan</p>
              <h4 className="text-sm font-bold text-slate-900 flex items-center justify-between">
                 Upgrade Now <ChevronRight className="w-4 h-4 text-blue-600 group-hover:translate-x-1 transition-transform" />
              </h4>
           </Link>

           <div className="space-y-4 text-[11px] font-bold text-slate-500 uppercase tracking-widest px-1">
              <p className="hover:text-slate-800 cursor-pointer transition-colors flex items-center justify-between">Documentation <ExternalLink className="w-3 h-3" /></p>
              <p className="hover:text-slate-800 cursor-pointer transition-colors">Pricing</p>
              <p className="hover:text-slate-800 cursor-pointer transition-colors">Contact</p>
              <div className="h-4" />
              <p className="hover:text-slate-800 cursor-pointer transition-colors flex items-center justify-between border-t border-slate-200 pt-4">
                 Jump to...
                 <kbd className="text-[9px] bg-slate-100 px-1 py-0.5 rounded border border-slate-200 uppercase font-mono">Ctrl K</kbd>
              </p>
              <p className="hover:text-slate-800 cursor-pointer transition-colors flex items-center justify-between">
                 All Apps
                 <ChevronRight className="w-3 h-3 text-slate-400" />
               </p>
           </div>
        </div>
      </div>

      <div className="p-4 border-t border-slate-200 bg-slate-50">
         <div className="flex items-center gap-3 p-2 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer border border-transparent hover:border-slate-200">
            <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center font-bold text-xs border border-blue-200">
               JD
            </div>
            <div className="flex-1 min-w-0">
               <p className="text-xs font-bold text-slate-900 truncate">John Doe</p>
               <p className="text-[10px] text-slate-500 truncate font-mono">PRO ACCESS</p>
            </div>
            <Settings className="w-4 h-4 text-slate-400" />
         </div>
      </div>
    </div>
  );
}
