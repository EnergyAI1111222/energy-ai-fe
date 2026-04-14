"use client";

import React from "react";
import { BaseEnergyChart } from "../BaseEnergyChart";

interface Series {
  name: string;
  data: [number, number][];
  color?: string;
}

interface GroupedColumnsChartProps {
  title: string;
  series: Series[];
  unit?: string;
  height?: number;
  isLoading?: boolean;
}

/**
 * MS-FE-003: GroupedColumns
 * Side-by-side (grouped) bars for comparing multiple datasets at each timestamp.
 * Example: Comparing Spot prices across DE, FR, NL, BE side by side.
 */
export function GroupedColumnsChart({
  title,
  series,
  unit = "€/MWh",
  height = 300,
  isLoading,
}: GroupedColumnsChartProps) {
  const colors = [
    "#2563eb", "#0088ff", "#6366f1", "#8b5cf6",
    "#34d399", "#f59e0b", "#f87171", "#a78bfa",
  ];

  const option = {
    color: colors,
    legend: {
      top: 8,
      right: 12,
      textStyle: { color: "#64748b", fontSize: 11, fontFamily: "JetBrains Mono" },
    },
    grid: { left: 60, right: 20, top: 48, bottom: 40 },
    tooltip: {
      trigger: "axis",
      axisPointer: { type: "shadow" },
    },
    xAxis: { type: "time" },
    yAxis: {
      type: "value",
      name: unit,
      nameTextStyle: { color: "#94a3b8", fontSize: 11 },
      axisLabel: { color: "#94a3b8", fontSize: 11, fontFamily: "JetBrains Mono" },
      splitLine: { lineStyle: { color: "#f1f5f9" } },
    },
    series: series.map((s, i) => ({
      name: s.name,
      type: "bar",
      // No stack — grouped side by side
      barGap: "10%",
      data: s.data,
      itemStyle: {
        color: s.color || colors[i % colors.length],
        borderRadius: [4, 4, 0, 0],
        opacity: 0.9,
      },
      emphasis: {
        focus: "series",
        itemStyle: { opacity: 1, shadowBlur: 10, shadowColor: s.color || colors[i % colors.length] },
      },
    })),
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
