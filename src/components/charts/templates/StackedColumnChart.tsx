"use client";

import React from "react";
import { BaseEnergyChart } from "../BaseEnergyChart";

interface Series {
  name: string;
  data: [number, number][];
  color?: string;
}

interface StackedColumnChartProps {
  title: string;
  series: Series[];
  unit?: string;
  height?: number;
  isLoading?: boolean;
}

export function StackedColumnChart({
  title,
  series,
  unit = "MW",
  height = 300,
  isLoading,
}: StackedColumnChartProps) {
  const colors = [
    "#2563eb", "#0088ff", "#6366f1", "#8b5cf6",
    "#a78bfa", "#34d399", "#f59e0b", "#f87171",
  ];

  const option = {
    color: colors,
    legend: {
      top: 8,
      right: 12,
      textStyle: { color: "#64748b", fontSize: 11, fontFamily: "JetBrains Mono" },
    },
    grid: { left: 60, right: 20, top: 48, bottom: 40 },
    tooltip: { trigger: "axis", axisPointer: { type: "shadow" } },
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
      stack: "total",
      data: s.data,
      itemStyle: { color: s.color || colors[i % colors.length], borderRadius: i === series.length - 1 ? [4, 4, 0, 0] : 0 },
      emphasis: { focus: "series" },
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
