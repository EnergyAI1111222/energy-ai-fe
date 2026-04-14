"use client";
import React from 'react';
import { X, Copy, Terminal, Check, Info } from 'lucide-react';

interface ApiCodeModalProps {
  datasetId: string;
  isOpen: boolean;
  onClose: () => void;
}

export function ApiCodeModal({ datasetId, isOpen, onClose }: ApiCodeModalProps) {
  const [copied, setCopied] = React.useState(false);

  if (!isOpen) return null;

  const pythonCode = `import requests
import json

url = "https://api.oeda.io/v1/series/batch"
payload = {
    "dataset_ids": ["${datasetId}"],
    "from_utc": "2024-03-24T00:00:00Z",
    "to_utc": "2024-03-25T23:59:59Z",
    "resolution": "15m"
}
headers = {"Authorization": "Bearer YOUR_API_KEY"}

response = requests.post(url, json=payload, headers=headers)
data = response.json()
print(data)`;

  const curlCode = `curl -X POST "https://api.oeda.io/v1/series/batch" \\
     -H "Authorization: Bearer YOUR_API_KEY" \\
     -H "Content-Type: application/json" \\
     -d '{
       "dataset_ids": ["${datasetId}"],
       "resolution": "1h"
     }'`;

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 md:p-8">
      <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={onClose} />
      
      <div className="relative w-full max-w-2xl bg-white rounded-lg shadow-2xl overflow-hidden flex flex-col max-h-[80vh]">
        <div className="bg-slate-900 px-6 py-4 flex items-center justify-between">
           <div className="flex items-center gap-3">
              <div className="p-2 bg-[#2563eb]/20 rounded-lg">
                <Terminal className="w-5 h-5 text-[#2563eb]" />
              </div>
              <div>
                <h3 className="text-white font-bold leading-tight">API Snippet: {datasetId}</h3>
                <p className="text-slate-400 text-[11px] uppercase tracking-widest font-bold">Production Access</p>
              </div>
           </div>
           <button onClick={onClose} className="text-slate-400 hover:text-white transition-colors">
              <X className="w-6 h-6" />
           </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6 bg-slate-50">
           <div className="mb-8">
              <div className="flex items-center justify-between mb-2">
                 <label className="text-xs font-bold text-slate-500 uppercase tracking-widest flex items-center gap-2">
                    <span className="w-4 h-4 bg-yellow-400 rounded-full flex items-center justify-center text-[10px] text-slate-900">py</span>
                    Python (Requests)
                 </label>
                 <button 
                  onClick={() => copyToClipboard(pythonCode)}
                  className="flex items-center gap-2 text-xs font-bold bg-white border border-slate-200 px-2 py-1 rounded hover:bg-slate-50 transition-colors"
                 >
                    {copied ? <Check className="w-3 h-3 text-emerald-500" /> : <Copy className="w-3 h-3 text-slate-400" />}
                    {copied ? 'COPIED' : 'COPY'}
                 </button>
              </div>
              <pre className="bg-slate-900 text-slate-200 p-4 rounded-xl font-mono text-sm overflow-x-auto shadow-inner">
                 <code>{pythonCode}</code>
              </pre>
           </div>

           <div>
              <div className="flex items-center justify-between mb-2">
                 <label className="text-xs font-bold text-slate-500 uppercase tracking-widest flex items-center gap-2">
                    <span className="w-4 h-4 bg-slate-200 rounded-full flex items-center justify-center text-[10px] text-slate-900">#</span>
                    cURL / Shell
                 </label>
                 <button 
                  onClick={() => copyToClipboard(curlCode)}
                  className="flex items-center gap-2 text-xs font-bold bg-white border border-slate-200 px-2 py-1 rounded hover:bg-slate-50 transition-colors"
                 >
                    {copied ? <Check className="w-3 h-3 text-emerald-500" /> : <Copy className="w-3 h-3 text-slate-400" />}
                    {copied ? 'COPIED' : 'COPY'}
                 </button>
              </div>
              <pre className="bg-slate-900 text-slate-200 p-4 rounded-xl font-mono text-sm overflow-x-auto shadow-inner">
                 <code>{curlCode}</code>
              </pre>
           </div>
        </div>

        <div className="p-4 bg-white border-t border-slate-200 flex items-center justify-center text-[10px] items-center gap-2 text-slate-400 font-bold uppercase tracking-widest">
           <Info className="w-4 h-4 text-[#2563eb]" />
           API Keys can be generated in your <a href="/settings" className="underline hover:text-slate-600">Settings Page</a>
        </div>
      </div>
    </div>
  );
}
