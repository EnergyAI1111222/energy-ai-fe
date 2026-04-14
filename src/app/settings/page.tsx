"use client";
import React, { useEffect, useState, useCallback } from 'react';
import { useSearchParams } from 'next/navigation';
import { User, Key, BarChart2, FlaskConical, CreditCard, Copy, Check, Plus, Trash2, Eye, EyeOff, AlertTriangle, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { apiClient, setClerkContext } from '@/api/client';

const TABS = [
  { id: 'account', label: 'Account', icon: User },
  { id: 'api-keys', label: 'API Keys', icon: Key },
  { id: 'usage', label: 'Usage & Quota', icon: BarChart2 },
  { id: 'billing', label: 'Plan & Billing', icon: CreditCard },
  { id: 'labs', label: 'Labs', icon: FlaskConical },
];

function UsageBar({ label, used, total, unit }: { label: string; used: number; total: number; unit: string }) {
  const pct = total > 0 ? Math.min((used / total) * 100, 100) : 0;
  const color = pct > 80 ? 'bg-red-400' : pct > 60 ? 'bg-amber-400' : 'bg-[#2563eb]';
  return (
    <div>
      <div className="flex items-center justify-between mb-1.5">
        <span className="text-sm text-slate-600 font-bold">{label}</span>
        <span className="text-xs font-mono font-bold text-slate-700">{used.toLocaleString()} / {total.toLocaleString()} {unit}</span>
      </div>
      <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden border border-slate-200/50 p-[1px]">
        <motion.div 
          initial={{ width: 0 }}
          animate={{ width: `${pct}%` }}
          className={`h-full ${color} rounded-full transition-all shadow-sm`} 
        />
      </div>
      <p className="text-[10px] text-slate-400 mt-1 font-medium">{pct === 100 ? 'Limit Reached' : `${(100 - pct).toFixed(0)}% remaining this month`}</p>
    </div>
  );
}

function SettingsInner() {
  const searchParams = useSearchParams();
  const [tab, setTab] = useState(() => searchParams.get('tab') ?? 'account');
  const [loading, setLoading] = useState(true);
  const [me, setMe] = useState<any>(null);
  const [apiKeys, setApiKeys] = useState<any[]>([]);
  
  // UI states
  const [copied, setCopied] = useState<string | null>(null);
  const [showKey, setShowKey] = useState<string | null>(null);
  const [newKeyName, setNewKeyName] = useState('');
  const [creatingKey, setCreatingKey] = useState(false);
  const [latestRawKey, setLatestRawKey] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      const [meRes, keysRes] = await Promise.all([
        apiClient.get('/auth/me'),
        apiClient.get('/auth/api-keys')
      ]);
      setMe(meRes.data);
      setApiKeys(Array.isArray(keysRes.data) ? keysRes.data : []);
    } catch (err) {
      console.error("Failed to fetch settings data", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleCreateKey = async () => {
    if (!newKeyName) return;
    try {
      const res = await apiClient.post('/auth/api-keys', { name: newKeyName });
      setLatestRawKey(res.data.raw_key);
      setNewKeyName('');
      setCreatingKey(false);
      fetchData(); // Refresh list
    } catch (err) {
      alert("Failed to create key. Professional plan required?");
    }
  };

  const handleDeleteKey = async (id: number) => {
    if (!confirm("Revoke this API key? This action is permanent.")) return;
    try {
      await apiClient.delete(`/auth/api-keys/${id}`);
      fetchData();
    } catch (err) {
      console.error(err);
    }
  };

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopied(id);
    setTimeout(() => setCopied(null), 2000);
  };

  if (loading && !me) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center bg-white">
        <Loader2 className="w-10 h-10 text-[#2563eb] animate-spin mb-4" />
        <p className="text-slate-400 font-bold uppercase tracking-widest text-xs">Accessing Identity Vault...</p>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-10 max-w-[1000px] mx-auto w-full h-full overflow-y-auto bg-white">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Workspace Settings</h1>
        <p className="text-slate-500 mt-1">Configure your identity, access keys, and subscription preferences.</p>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-slate-100/80 rounded-lg p-1.5 mb-10 overflow-x-auto border border-slate-200/50 backdrop-blur-sm sticky top-0 z-20">
        {TABS.map(t => {
          const Icon = t.icon;
          return (
            <button
              key={t.id}
              onClick={() => { setTab(t.id); setLatestRawKey(null); }}
              className={`flex items-center gap-2.5 px-6 py-2.5 rounded-xl text-sm font-bold whitespace-nowrap transition-all ${
                tab === t.id ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-400 hover:text-slate-600'
              }`}
            >
              <Icon className="w-4 h-4" /> {t.label}
            </button>
          );
        })}
      </div>

      <AnimatePresence mode="wait">
        <motion.div
           key={tab}
           initial={{ opacity: 0, y: 10 }}
           animate={{ opacity: 1, y: 0 }}
           exit={{ opacity: 0, y: -10 }}
           transition={{ duration: 0.2 }}
        >
          {/* Account Tab */}
          {tab === 'account' && (
            <div className="space-y-6">
              <div className="bg-white border border-slate-200 rounded-xl p-8 shadow-sm">
                <h2 className="text-lg font-bold text-slate-900 mb-6 flex items-center gap-2">
                   <User className="w-5 h-5 text-[#2563eb]" /> Profile Information
                </h2>
                <div className="flex items-center gap-6 mb-10 p-6 bg-slate-50 rounded-xl border border-slate-100">
                  <div className="relative">
                    <div className="w-20 h-20 rounded-full bg-blue-600 flex items-center justify-center text-3xl font-bold text-white shadow-sm">
                      {me?.principal_id?.[0]?.toUpperCase() || 'U'}
                    </div>
                    <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-emerald-500 border-4 border-white rounded-full" />
                  </div>
                  <div>
                    <p className="text-xl font-bold text-slate-900">{me?.principal_id}</p>
                    <p className="text-sm text-slate-500 font-medium">Network Identifier: <span className="font-mono text-xs">{me?.principal_id}</span></p>
                    <div className="mt-2 flex items-center gap-2">
                       <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full border uppercase tracking-widest ${
                         me?.plan === 'professional' ? 'bg-[#2563eb]/10 text-[#2563eb] border-[#2563eb]/20' : 'bg-slate-100 text-slate-500 border-slate-200'
                       }`}>
                         {me?.plan} Plan
                       </span>
                    </div>
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2 px-1">Organization (B2B)</label>
                    <input disabled defaultValue="Unregistered Org" className="w-full bg-slate-50 border border-slate-200 rounded-lg px-5 py-3.5 text-sm text-slate-400 font-medium cursor-not-allowed" />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2 px-1">Region Override</label>
                    <input disabled defaultValue="Automatic (Latent)" className="w-full bg-slate-50 border border-slate-200 rounded-lg px-5 py-3.5 text-sm text-slate-400 font-medium cursor-not-allowed" />
                  </div>
                </div>
                <div className="mt-8 pt-8 border-t border-slate-100 flex gap-4">
                  <button className="px-8 py-3 bg-slate-900 text-white rounded-lg text-sm font-bold hover:bg-[#2563eb] hover:text-slate-900 transition-all shadow-sm active:scale-95">Update Profile</button>
                  <button className="px-8 py-3 border border-slate-200 text-slate-600 rounded-lg text-sm font-bold hover:bg-slate-50 transition-all active:scale-95">Log Out</button>
                </div>
              </div>

              <div className="bg-red-50/50 border border-red-100 rounded-xl p-8">
                <h3 className="font-bold text-red-700 mb-2 flex items-center gap-2"><AlertTriangle className="w-5 h-5" /> Danger Zone</h3>
                <p className="text-sm text-red-600/80 mb-6 font-medium">Permanently delete your workspace data, API keys, and credentials. This action is irreversible.</p>
                <button className="px-6 py-2.5 border-2 border-red-200 text-red-600 rounded-lg text-sm font-bold hover:bg-red-100/50 transition-all">Delete Account</button>
              </div>
            </div>
          )}

          {/* API Keys Tab */}
          {tab === 'api-keys' && (
            <div className="space-y-6">
              <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
                <div className="p-8 border-b border-slate-100 flex items-center justify-between">
                  <div>
                    <h2 className="text-lg font-bold text-slate-800">Programmatic Access</h2>
                    <p className="text-sm text-slate-400 mt-0.5">Manage keys for server-side OEDA API requests</p>
                  </div>
                  <button
                    onClick={() => { setCreatingKey(true); setLatestRawKey(null); }}
                    className="flex items-center gap-2 px-6 py-2.5 bg-slate-900 text-white rounded-lg text-sm font-bold hover:bg-[#2563eb] hover:text-slate-900 transition-all shadow-sm active:scale-95"
                  >
                    <Plus className="w-4 h-4" /> New Secret Key
                  </button>
                </div>

                {latestRawKey && (
                  <div className="mx-8 mt-6 p-6 bg-emerald-50 border-2 border-emerald-100 rounded-xl animate-in fade-in slide-in-from-top-4 duration-500">
                    <p className="text-xs font-bold text-emerald-800 mb-3 uppercase tracking-widest flex items-center gap-2">
                       <Check className="w-4 h-4" /> Key Created Successfully
                    </p>
                    <p className="text-[11px] text-emerald-700 mb-4 font-bold leading-tight">
                       WARNING: This is the ONLY time you can view this key. Copy it now and store it securely.
                    </p>
                    <div className="flex items-center gap-2 p-1 bg-white rounded-lg border border-emerald-200">
                       <code className="flex-1 px-4 py-2 font-mono text-sm text-emerald-900 truncate">{latestRawKey}</code>
                       <button 
                         onClick={() => copyToClipboard(latestRawKey, 'latest')}
                         className="p-3 bg-emerald-100 text-emerald-700 rounded-xl hover:bg-emerald-200 transition-all"
                       >
                         {copied === 'latest' ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                       </button>
                    </div>
                    <button onClick={() => setLatestRawKey(null)} className="mt-4 text-[10px] font-bold text-emerald-800 underline uppercase tracking-widest">I have copied my key</button>
                  </div>
                )}

                {creatingKey && (
                  <div className="p-8 bg-slate-50 border-b border-slate-100">
                    <p className="text-xs font-bold text-slate-700 mb-3 uppercase tracking-widest">Identify this key</p>
                    <div className="flex gap-3">
                      <input
                        autoFocus
                        value={newKeyName}
                        onChange={e => setNewKeyName(e.target.value)}
                        placeholder="e.g. My Backend Worker"
                        className="flex-1 bg-white border border-slate-200 rounded-lg px-5 py-3 text-sm focus:outline-none focus:border-[#2563eb] font-medium"
                      />
                      <button
                        onClick={handleCreateKey}
                        className="px-8 py-3 bg-slate-900 text-white rounded-lg text-xs font-bold shadow-sm"
                      >Create</button>
                      <button onClick={() => setCreatingKey(false)} className="px-5 py-3 text-slate-400 text-xs font-bold uppercase tracking-widest hover:text-slate-600 transition-colors">Cancel</button>
                    </div>
                  </div>
                )}

                <div className="divide-y divide-slate-50 p-4">
                  {apiKeys.length > 0 ? apiKeys.map(k => (
                    <div key={k.key_id} className="p-4 hover:bg-slate-50/50 rounded-lg transition-colors group">
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-3">
                          <div className="p-2.5 bg-slate-100 rounded-xl text-slate-500">
                             <Key className="w-4 h-4" />
                          </div>
                          <div>
                            <p className="font-bold text-slate-800 text-sm">{k.name}</p>
                            <p className="text-[10px] text-slate-400 font-medium">Generated {new Date(k.created_at_utc).toLocaleDateString()}</p>
                          </div>
                        </div>
                        <span className="text-[9px] font-bold bg-[#2563eb]/10 text-[#2563eb] px-2.5 py-1 rounded-full border border-[#2563eb]/20 uppercase tracking-widest">{k.plan}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <code className="flex-1 bg-slate-900 text-[#2563eb] text-xs font-mono px-4 py-2.5 rounded-xl border border-slate-800 tracking-tighter shadow-inner">
                          {showKey === k.key_id ? 'IDENT_REDACTED_SECURE' : k.key_prefix}
                        </code>
                        <button onClick={() => copyToClipboard(k.key_prefix, k.key_id.toString())} className="p-2.5 text-slate-400 hover:text-slate-700 bg-slate-50 rounded-xl border border-slate-100">
                          {copied === k.key_id.toString() ? <Check className="w-4 h-4 text-emerald-500" /> : <Copy className="w-4 h-4" />}
                        </button>
                        <button onClick={() => handleDeleteKey(k.key_id)} className="p-2.5 text-slate-300 hover:text-red-500 transition-colors bg-slate-50 rounded-xl border border-slate-100">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  )) : (
                    <div className="p-12 text-center text-slate-300">
                       <Key className="w-12 h-12 mx-auto mb-4 opacity-20" />
                       <p className="font-bold text-slate-400">No active secret keys found.</p>
                       <p className="text-xs text-slate-300 mt-1 max-w-[240px] mx-auto">Create a secret key to begin accessing OEDA via our Python SDK or REST API.</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Usage Tab */}
          {tab === 'usage' && (
            <div className="space-y-6">
              <div className="bg-white border border-slate-200 rounded-xl p-10 shadow-sm space-y-10">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-lg font-bold text-slate-800">Consumption Overview</h2>
                    <p className="text-sm text-slate-400">Monthly billing cycle usage tracking</p>
                  </div>
                  <span className="px-4 py-1.5 bg-slate-900 text-white rounded-full text-[10px] font-bold font-mono tracking-widest border border-slate-700 shadow-sm">
                    RESETS {me?.current_usage?.reset_date || 'N/A'}
                  </span>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                   <UsageBar 
                     label="REST API Requests" 
                     used={me?.current_usage?.api_requests || 0} 
                     total={me?.effective_limits?.monthly_api_requests || 1} 
                     unit="req" 
                   />
                   <UsageBar 
                     label="Nodal Data Points" 
                     used={me?.current_usage?.data_points || 0} 
                     total={me?.effective_limits?.monthly_data_points || 1} 
                     unit="pts" 
                   />
                   <UsageBar 
                     label="CSV Exports" 
                     used={me?.current_usage?.exports || 0} 
                     total={me?.effective_limits?.monthly_exports || 0} 
                     unit="exports" 
                   />
                   <div className="p-6 bg-slate-50 rounded-xl border border-slate-100 self-end">
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Forecast Horizon</p>
                      <p className="text-2xl font-bold text-slate-900 tracking-tight">+{me?.effective_limits?.forecast_horizon_hours || 0}h <span className="text-xs font-medium text-slate-400">UTC</span></p>
                   </div>
                </div>
              </div>

              {me?.plan === 'basic' && (
                <div className="bg-amber-50/50 border border-amber-100 rounded-xl p-8 flex gap-6 items-center shadow-sm">
                  <div className="w-14 h-14 rounded-xl bg-amber-100 flex items-center justify-center shrink-0">
                    <AlertTriangle className="w-7 h-7 text-amber-600" />
                  </div>
                  <div className="flex-1">
                    <p className="text-lg font-bold text-amber-900">Elevate your bandwidth</p>
                    <p className="text-sm text-amber-700 font-medium">You are approaching your basic usage limits. Professional plans offer 50M data points and full API access.</p>
                  </div>
                  <button className="px-8 py-3 bg-amber-600 text-white rounded-lg text-sm font-bold shadow-sm active:scale-95 transition-all">Upgrade Now</button>
                </div>
              )}
            </div>
          )}

          {/* Billing Tab */}
          {tab === 'billing' && (
            <div className="space-y-8">
              <div className="bg-white border border-slate-200 rounded-xl p-10 shadow-sm">
                <h2 className="text-lg font-bold text-slate-800 mb-2">Workspace Plan</h2>
                <p className="text-sm text-slate-400 mb-10">Manage your subscription and enterprise legal agreements.</p>
                
                <div className="p-8 bg-slate-50/50 rounded-xl border border-slate-100 mb-12 flex flex-col md:flex-row items-center justify-between gap-8 relative overflow-hidden group">
                  <div className="absolute top-0 right-0 p-12 bg-[#2563eb]/10 rounded-full blur-3xl group-hover:bg-[#2563eb]/20 transition-all duration-700" />
                  <div className="relative z-10">
                    <div className="flex items-center gap-3 mb-2 text-[#2563eb]">
                       <CreditCard className="w-5 h-5" />
                       <span className="text-[10px] font-bold uppercase tracking-widest">Active Subscription</span>
                    </div>
                    <p className="text-4xl font-bold text-slate-900 tracking-tighter capitalize">{me?.plan}</p>
                    <p className="text-slate-500 font-medium mt-1">OEDA Individual Workspace · Next billing: <span className="text-slate-900">Not Applicable</span></p>
                  </div>
                  <div className="relative z-10 text-center md:text-right">
                    <p className="text-5xl font-bold text-slate-900 tracking-tighter">€0<span className="text-xl font-medium text-slate-300">/mo</span></p>
                    <button disabled className="mt-4 px-8 py-3 bg-white border border-slate-200 text-slate-400 rounded-lg text-sm font-bold cursor-not-allowed">Stripe Portal Offline</button>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {[
                    { id: 'free',         name: 'Hobby', price: '€29', desc: '1-Year History · 100 exports/mo', perks: ['Full history', 'Unlimited charts'], active: me?.plan === 'free' || me?.plan === 'guest' },
                    { id: 'professional', name: 'Professional', price: '€89', desc: 'API Keys · 50M data points', perks: ['API Access', 'SDK Integrations'], active: me?.plan === 'professional' },
                    { id: 'enterprise',   name: 'Enterprise', price: 'Custom', desc: 'Raw Bids · Batch ETL', perks: ['SLAs', 'Team sharing'], active: me?.plan === 'enterprise' },
                  ].map(p => (
                    <div key={p.name} className={`p-8 rounded-xl border-2 transition-all relative ${p.active ? 'border-[#2563eb] bg-[#2563eb]/5' : 'border-slate-100 bg-white hover:border-slate-200 shadow-sm'}`}>
                      {p.active && <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-4 py-1.5 bg-[#2563eb] text-white text-[10px] font-bold rounded-full uppercase tracking-widest shadow-sm">Current</div>}
                      <p className="text-lg font-bold text-slate-900 mb-1">{p.name}</p>
                      <p className="text-3xl font-bold text-slate-900 tracking-tight">{p.price}<span className="text-xs font-normal text-slate-400">{p.price !== 'Custom' ? '/mo' : ''}</span></p>
                      <p className="text-xs text-slate-500 font-medium mt-3 mb-8 leading-relaxed">{p.desc}</p>
                      <div className="space-y-3 mb-10">
                         {p.perks.map(perk => (
                           <div key={perk} className="flex items-center gap-3 text-xs text-slate-700 font-medium">
                              <Check className="w-3.5 h-3.5 text-[#2563eb]" /> {perk}
                           </div>
                         ))}
                      </div>
                      <button 
                        onClick={() => {
                          if (p.active) return;
                          if (p.id === 'enterprise') {
                            alert("Please contact enterprise@openenergydata.io for custom onboarding.");
                            return;
                          }
                          // Dev simulation: Update local clerk context and refresh
                          setClerkContext({ userId: me?.principal_id || 'dev-user', plan: p.id });
                          fetchData();
                        }}
                        className={`w-full py-3.5 rounded-lg text-xs font-bold transition-all ${p.active ? 'bg-[#2563eb]/20 text-[#2563eb] cursor-default' : 'bg-slate-900 text-white hover:bg-[#2563eb] hover:text-slate-900 shadow-sm'}`}
                      >
                        {p.name === 'Enterprise' ? 'Contact Solutions' : p.active ? 'Current Plan' : 'Select Plan'}
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Labs Tab */}
          {tab === 'labs' && (
            <div className="bg-white border border-slate-200 rounded-xl p-10 shadow-sm">
                <div className="flex items-center gap-3 mb-2">
                  <FlaskConical className="w-6 h-6 text-[#2563eb]" />
                  <h2 className="text-xl font-bold text-slate-800">Kinetic Labs</h2>
                </div>
                <p className="text-sm text-slate-500 mb-10 pb-8 border-b border-slate-100 font-medium">Early access to experimental visualization and automation features. Proceed with caution.</p>
                
                <div className="space-y-4">
                  {[
                    { name: 'AI Chart Co-Pilot', desc: 'Natural language interface for complex multi-curve generation.', enabled: false },
                    { name: 'Nodal Flow Visualization', desc: 'Real-time Vector field rendering (WebGL2) for price gradients.', enabled: true },
                    { name: 'Cross-Curve Tooltips', desc: 'Synchronized crosshairs across all timeseries dashboard tiles.', enabled: true },
                    { name: 'Adaptive Dark Obsidian', desc: 'Full-workspace dark mode with high-contrast nodal markers.', enabled: false },
                  ].map(feat => (
                    <div key={feat.name} className="flex items-center justify-between p-6 bg-slate-50/50 rounded-xl border border-slate-100 hover:border-slate-200 transition-all">
                      <div className="flex-1 pr-10">
                        <p className="font-bold text-slate-800 text-sm mb-1">{feat.name}</p>
                        <p className="text-xs text-slate-500 font-medium leading-relaxed">{feat.desc}</p>
                      </div>
                      <button className={`relative shrink-0 w-14 h-8 rounded-full transition-all duration-300 ${feat.enabled ? 'bg-[#2563eb] shadow-sm shadow-[#2563eb]/20' : 'bg-slate-200'}`}>
                        <span className={`absolute top-1 w-6 h-6 bg-white rounded-full shadow-md transition-all duration-300 ${feat.enabled ? 'left-7' : 'left-1'}`} />
                      </button>
                    </div>
                  ))}
                </div>
            </div>
          )}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}

export default function SettingsPage() {
  return (
    <React.Suspense fallback={null}>
      <SettingsInner />
    </React.Suspense>
  );
}
