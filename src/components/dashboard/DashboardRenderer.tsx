"use client";
/**
 * DashboardRenderer — JSON-to-React Dashboard-as-Code engine.
 *
 * MS-API-008 + MS-FE-005: Takes a DashboardDefinition JSON (from /v1/dashboard_templates)
 * and renders a responsive grid of widgets using the existing chart templates.
 *
 * Widget type → Component mapping:
 *   LineChart               → ComboAreaLineChart (line-only mode)
 *   ComboAreaLineChart      → ComboAreaLineChart
 *   DualAxisBarLineChart    → DualAxisBarLineChart
 *   StackedAreaChart        → StackedAreaChart
 *   StackedColumnPlusLineChart → StackedColumnPlusLineChart
 *   GroupedColumnsChart     → GroupedColumnsChart
 *   SnapshotCurveChart      → SnapshotCurveChart
 *   NodalMap                → NodalMap (lazy-loaded)
 *   KPICard                 → KPICard
 *   DataTable               → MasterEUTable
 */
import React, { useMemo } from "react";
import dynamic from "next/dynamic";
import { ComboAreaLineChart } from "@/components/charts/templates/ComboAreaLineChart";
import { StackedAreaChart } from "@/components/charts/templates/StackedAreaChart";
import { DualAxisBarLineChart } from "@/components/charts/templates/DualAxisBarLineChart";
import { StackedColumnPlusLineChart } from "@/components/charts/templates/StackedColumnPlusLineChart";
import { GroupedColumnsChart } from "@/components/charts/templates/GroupedColumnsChart";
import { SnapshotCurveChart } from "@/components/charts/templates/SnapshotCurveChart";
import { KPICard } from "@/components/dashboard/KPICard";
import { MasterEUTable } from "@/components/dashboard/MasterEUTable";
import { WidgetCell } from "@/components/shared/WidgetCell";
import { WidgetActions } from "@/components/shared/WidgetActions";
import { useLiveEnergyData } from "@/hooks/useLiveEnergyData";

const NodalMap = dynamic(
  () =>
    import("@/components/maps/NodalMap").then((m) => ({
      default: m.NodalMap,
    })),
  {
    ssr: false,
    loading: () => (
      <div className="w-full h-full bg-slate-900 rounded-xl  min-h-[300px]" />
    ),
  }
);

// ── Types matching backend DashboardDefinition ───────────────────────────────

interface WidgetDef {
  widget_id: string;
  widget_type: string;
  title: string;
  dataset_ids: string[];
  grid_position?: { row?: number; col?: number; rowSpan?: number; colSpan?: number };
  visual_overrides?: Record<string, unknown>;
  options?: Record<string, unknown>;
}

interface DashboardDef {
  dashboard_id: string;
  title: string;
  description?: string;
  layout: string;
  columns: number;
  time_state?: string;
  widgets: WidgetDef[];
  metadata?: Record<string, unknown>;
}

interface DashboardRendererProps {
  dashboard: DashboardDef;
}

// ── Helpers ──────────────────────────────────────────────────────────────────

function getSeriesFromResults(
  results: Record<string, any>,
  ids: string[]
): [number, number][] {
  for (const id of ids) {
    const r = results[id];
    if (r?.status === "success" && Array.isArray(r.data) && r.data.length > 0) {
      return r.data;
    }
  }
  return [];
}

// ── Widget Renderer ──────────────────────────────────────────────────────────

function RenderWidget({
  widget,
  results,
  isLoading,
}: {
  widget: WidgetDef;
  results: Record<string, any>;
  isLoading: boolean;
}) {
  const primaryData = useMemo(
    () => getSeriesFromResults(results, widget.dataset_ids.slice(0, 1)),
    [results, widget.dataset_ids]
  );
  const secondaryData = useMemo(
    () =>
      widget.dataset_ids.length > 1
        ? getSeriesFromResults(results, widget.dataset_ids.slice(1, 2))
        : [],
    [results, widget.dataset_ids]
  );

  switch (widget.widget_type) {
    case "LineChart":
      return (
        <ComboAreaLineChart
          title={widget.title}
          nameArea={widget.dataset_ids[0] ?? "Primary"}
          nameLine={widget.dataset_ids[1] ?? "Secondary"}
          dataArea={primaryData}
          dataLine={secondaryData}
          isLoading={isLoading}
        />
      );

    case "ComboAreaLineChart":
      return (
        <ComboAreaLineChart
          title={widget.title}
          nameArea={widget.dataset_ids[0] ?? "Actual"}
          nameLine={widget.dataset_ids[1] ?? "Forecast"}
          dataArea={primaryData}
          dataLine={secondaryData}
          isLoading={isLoading}
        />
      );

    case "DualAxisBarLineChart":
      return (
        <DualAxisBarLineChart
          title={widget.title}
          nameBar={widget.dataset_ids[0] ?? "Bar"}
          nameLine={widget.dataset_ids[1] ?? "Line"}
          dataBar={primaryData}
          dataLine={secondaryData}
          isLoading={isLoading}
        />
      );

    case "StackedAreaChart":
      return (
        <StackedAreaChart
          title={widget.title}
          series={widget.dataset_ids.map((id) => ({
            name: id,
            data: getSeriesFromResults(results, [id]),
          }))}
          isLoading={isLoading}
        />
      );

    case "StackedColumnPlusLineChart":
      return (
        <StackedColumnPlusLineChart
          title={widget.title}
          barSeries={widget.dataset_ids.slice(0, -1).map((id) => ({
            name: id,
            data: getSeriesFromResults(results, [id]),
          }))}
          lineSeries={[{
            name: widget.dataset_ids[widget.dataset_ids.length - 1] ?? "Line",
            data: getSeriesFromResults(
              results,
              widget.dataset_ids.slice(-1)
            ),
          }]}
          isLoading={isLoading}
        />
      );

    case "GroupedColumnsChart":
      return (
        <GroupedColumnsChart
          title={widget.title}
          series={widget.dataset_ids.map((id) => ({
            name: id,
            data: getSeriesFromResults(results, [id]),
          }))}
          isLoading={isLoading}
        />
      );

    case "SnapshotCurveChart":
      return (
        <SnapshotCurveChart
          title={widget.title}
          data={primaryData}
          isPremium
        />
      );

    case "NodalMap":
      return (
        <NodalMap
          mapType="heatmap"
          metric={widget.title}
          height={360}
        />
      );

    case "KPICard": {
      const latestVal = primaryData.length > 0 ? primaryData[primaryData.length - 1][1] : null;
      return (
        <KPICard
          label={widget.title}
          value={latestVal !== null ? `${latestVal.toFixed(1)}` : "—"}
          deltaText={latestVal !== null ? "Live" : "No Data"}
          deltaTrend="neutral"
          isLoading={isLoading}
        />
      );
    }

    case "DataTable":
      return <MasterEUTable />;

    default:
      return (
        <div className="flex items-center justify-center h-[200px] bg-slate-50 rounded-xl border border-dashed border-slate-300 text-slate-400 text-sm font-mono">
          Unknown widget: {widget.widget_type}
        </div>
      );
  }
}

// ── Main Component ───────────────────────────────────────────────────────────

export function DashboardRenderer({ dashboard }: DashboardRendererProps) {
  // Collect all dataset IDs across all widgets for a single batch fetch
  const allDatasetIds = useMemo(() => {
    const ids = new Set<string>();
    dashboard.widgets.forEach((w) => w.dataset_ids.forEach((id) => ids.add(id)));
    return Array.from(ids);
  }, [dashboard.widgets]);

  const { data: batchData, isLoading } = useLiveEnergyData(allDatasetIds);
  const results = batchData?.results ?? {};

  // Sort widgets by grid_position (row, then col)
  const sortedWidgets = useMemo(() => {
    return [...dashboard.widgets].sort((a, b) => {
      const ar = a.grid_position?.row ?? 0;
      const br = b.grid_position?.row ?? 0;
      if (ar !== br) return ar - br;
      return (a.grid_position?.col ?? 0) - (b.grid_position?.col ?? 0);
    });
  }, [dashboard.widgets]);

  // Group widgets into rows
  const rows = useMemo(() => {
    const rowMap = new Map<number, WidgetDef[]>();
    sortedWidgets.forEach((w) => {
      const r = w.grid_position?.row ?? 0;
      if (!rowMap.has(r)) rowMap.set(r, []);
      rowMap.get(r)!.push(w);
    });
    return Array.from(rowMap.entries()).sort((a, b) => a[0] - b[0]);
  }, [sortedWidgets]);

  return (
    <div className="space-y-6">
      {rows.map(([rowIdx, widgets]) => (
        <div
          key={rowIdx}
          className="grid gap-4"
          style={{
            gridTemplateColumns: `repeat(${dashboard.columns}, minmax(0, 1fr))`,
          }}
        >
          {widgets.map((widget) => {
            const colSpan = widget.grid_position?.colSpan ?? 1;
            return (
              <div
                key={widget.widget_id}
                className="group relative"
                style={{ gridColumn: `span ${Math.min(colSpan, dashboard.columns)}` }}
              >
                {/* Widget header with actions */}
                <div className="flex items-center justify-between mb-2 px-1">
                  <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest group-hover:text-slate-700 transition-colors">
                    {widget.title}
                  </h3>
                  <WidgetActions
                    datasetIds={widget.dataset_ids}
                    title={widget.title}
                  />
                </div>
                {/* Widget body with error/truncation handling */}
                <div className="rounded-xl border border-slate-100 bg-white shadow-sm overflow-hidden">
                  <div className="p-2">
                    <WidgetCell datasetIds={widget.dataset_ids} results={results}>
                      <div className="min-h-[280px]">
                        <RenderWidget
                          widget={widget}
                          results={results}
                          isLoading={isLoading}
                        />
                      </div>
                    </WidgetCell>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ))}
    </div>
  );
}
