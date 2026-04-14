"use client";

import React from "react";
import { BaseEnergyChart } from "../BaseEnergyChart";

interface Series {
  name: string;
  data: [number, number][];
  color?: string;
}

interface StackedColumnPlusLineChartProps {
  title: string;
  /** Bar series — stacked on left Y-axis */
  barSeries: Series[];
  /** Line series — rendered on right Y-axis (e.g. total, price) */
  lineSeries: Series[];
  unitLeft?: string;
  unitRight?: string;
  height?: number;
  isLoading?: boolean;
}

/**
 * MS-FE-003: StackedColumnPlusLine
 * Stacked bars for generation/volume breakdown + overlay line for total/price.
 * Example: Production Mix by source (bars) + Total Net Position (line).
 */
export function StackedColumnPlusLineChart({
  title,
  barSeries,
  lineSeries,
  unitLeft = "MW",
  unitRight = "€/MWh",
  height = 300,
  isLoading,
}: StackedColumnPlusLineChartProps) {
  const barColors = [
    "#2563eb", "#0088ff", "#6366f1", "#8b5cf6",
    "#34d399", "#f59e0b", "#f87171", "#a78bfa",
  ];
  const lineColors = ["#f97316", "#ef4444", "#22c55e"];

  const option = {
    color: [...barColors, ...lineColors],
    legend: {
      top: 8,
      right: 12,
      textStyle: { color: "#64748b", fontSize: 11, fontFamily: "JetBrains Mono" },
    },
    grid: { left: 64, right: 64, top: 48, bottom: 40 },
    tooltip: { trigger: "axis", axisPointer: { type: "cross" } },
    xAxis: { type: "time" },
    yAxis: [
      {
        type: "value",
        name: unitLeft,
        nameTextStyle: { color: "#94a3b8", fontSize: 11 },
        axisLabel: { color: "#94a3b8", fontSize: 11, fontFamily: "JetBrains Mono" },
        splitLine: { lineStyle: { color: "#f1f5f9" } },
      },
      {
        type: "value",
        name: unitRight,
        nameTextStyle: { color: "#f97316", fontSize: 11 },
        axisLine: { lineStyle: { color: "#f97316" } },
        axisLabel: { color: "#f97316", fontSize: 11, fontFamily: "JetBrains Mono" },
        splitLine: { show: false },
      },
    ],
    series: [
      ...barSeries.map((s, i) => ({
        name: s.name,
        type: "bar",
        stack: "columns",
        yAxisIndex: 0,
        data: s.data,
        itemStyle: {
          color: s.color || barColors[i % barColors.length],
          borderRadius: i === barSeries.length - 1 ? [3, 3, 0, 0] : 0,
        },
        emphasis: { focus: "series" },
      })),
      ...lineSeries.map((s, i) => ({
        name: s.name,
        type: "line",
        yAxisIndex: 1,
        data: s.data,
        smooth: true,
        symbol: "none",
        lineStyle: { width: 2.5, color: s.color || lineColors[i % lineColors.length] },
        itemStyle: { color: s.color || lineColors[i % lineColors.length] },
        z: 10,
      })),
    ],
  };

  return (
    <div className="w-full h-full flex flex-col">
      <p className="text-xs font-bold text-slate-500 uppercase tracking-widest px-2 mb-2 font-mono">
        {title}
      </p>
      <div className="flex-1">
        <BaseEnergyChart options={option} height={height} isLoading={isLoading} />
      </div>
    </div>
  );
}
