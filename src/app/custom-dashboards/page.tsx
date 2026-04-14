"use client";
import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { apiClient } from "@/api/client";
import { DashboardRenderer } from "@/components/dashboard/DashboardRenderer";
import { TimeStateTabs } from "@/components/dashboard/TimeStateTabs";
import { LayoutDashboard } from "lucide-react";

export default function CustomDashboardsPage() {
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const { data: templatesData, isLoading } = useQuery({
    queryKey: ["dashboard_templates"],
    queryFn: () => apiClient.get("/dashboard_templates").then((r: any) => r.data ?? r),
  });

  const templates = templatesData?.templates ?? [];
  const selected = templates.find((t: any) => t.dashboard_id === selectedId) ?? null;

  return (
    <div className="p-4 md:p-6 h-full flex flex-col max-w-[1700px] mx-auto w-full overflow-y-auto">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <LayoutDashboard className="w-5 h-5 text-[#2563eb]" />
        <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
          Dashboard-as-Code
        </h1>
      </div>

      {/* Template selector */}
      <div className="flex flex-wrap gap-2 mb-6">
        {isLoading && (
          <div className="text-xs text-slate-400 font-mono">Loading templates...</div>
        )}
        {templates.map((t: any) => (
          <button
            key={t.dashboard_id}
            onClick={() => setSelectedId(t.dashboard_id)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              selectedId === t.dashboard_id
                ? "bg-slate-900 text-white shadow"
                : "bg-white border border-slate-200 text-slate-600 hover:bg-slate-50"
            }`}
          >
            {t.title}
          </button>
        ))}
      </div>

      {/* Time controls */}
      {selected && (
        <div className="mb-6">
          <TimeStateTabs />
        </div>
      )}

      {/* Rendered dashboard */}
      {selected ? (
        <DashboardRenderer dashboard={selected} />
      ) : (
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <LayoutDashboard className="w-12 h-12 text-slate-300 mx-auto mb-4" />
            <p className="text-slate-400 text-sm font-medium">
              Select a dashboard template above to render it
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
