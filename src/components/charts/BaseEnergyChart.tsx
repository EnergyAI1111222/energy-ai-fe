"use client";

import React, { useMemo, useRef, useEffect, useState, useCallback } from 'react';
import ReactECharts from 'echarts-for-react';
import { useAppStore } from '@/store/useAppStore';
import { useTimeStateStore } from '@/store/useTimeStateStore';
import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import timezone from 'dayjs/plugin/timezone';
import { WidgetErrorCard } from '@/components/shared/WidgetErrorCard';
import { TruncationBanner } from '@/components/shared/TruncationBanner';

dayjs.extend(utc);
dayjs.extend(timezone);

interface BaseChartProps {
  options: any;
  height?: number | string;
  isLoading?: boolean;
  errorType?: 'INSUFFICIENT_PERMISSIONS' | 'NETWORK_ERROR' | 'UNKNOWN_ERROR';
  appliedLimitDays?: number;
}

export function BaseEnergyChart({ options, height = 300, isLoading, errorType, appliedLimitDays }: BaseChartProps) {
  const [isMounted, setIsMounted] = useState(false);
  const displayTimezone = useAppStore(state => state.displayTimezone);
  const isSyncActive = useAppStore(state => state.isSyncActive);
  const activeTab = useTimeStateStore(state => state.activeTab);

  const chartRef = useRef<any>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => { setIsMounted(true); }, []);

  // Single ResizeObserver per chart — no setTimeout hacks
  useEffect(() => {
    if (!containerRef.current || !isMounted) return;
    const ro = new ResizeObserver(() => {
      const instance = chartRef.current?.getEchartsInstance();
      if (instance && !instance.isDisposed()) instance.resize();
    });
    ro.observe(containerRef.current);
    return () => ro.disconnect();
  }, [isMounted]);

  const onChartReady = useCallback((instance: any) => {
    instance.group = isSyncActive ? 'dashboard-group' : '';
  }, [isSyncActive]);

  // DataZoom for History tab — slider + inside zoom per spec MS-FE-005
  const dataZoomConfig = useMemo(() => {
    if (activeTab !== 'history') return undefined;
    return [
      {
        type: 'slider',
        xAxisIndex: 0,
        start: 0,
        end: 100,
        height: 24,
        borderColor: '#e2e8f0',
        backgroundColor: '#f8fafc',
        fillerColor: 'rgba(0, 212, 255, 0.08)',
        handleStyle: { color: '#2563eb', borderColor: '#2563eb' },
        textStyle: { color: '#94a3b8', fontSize: 10 },
        dataBackground: {
          lineStyle: { color: '#cbd5e1' },
          areaStyle: { color: 'rgba(0, 212, 255, 0.05)' },
        },
      },
      {
        type: 'inside',
        xAxisIndex: 0,
        start: 0,
        end: 100,
        zoomOnMouseWheel: true,
        moveOnMouseMove: true,
      },
    ];
  }, [activeTab]);

  // Timezone interceptor: merges UTC→displayTimezone formatter without touching other options
  const tzOptions = useMemo(() => {
    try {
      return {
        ...options,
        ...(dataZoomConfig ? { dataZoom: dataZoomConfig } : {}),
        tooltip: {
          ...options?.tooltip,
          trigger: options?.tooltip?.trigger ?? 'axis',
          formatter: (params: any) => {
            if (!params?.length) return '';
            const firstVal = params[0].value;
            const rawMs = Array.isArray(firstVal) ? firstVal[0] : null;
            if (!rawMs) return 'No time data';
            const localTime = dayjs(rawMs).tz(displayTimezone).format('YYYY-MM-DD HH:mm');
            let tip = `<div style="font-size:11px;font-family:monospace;margin-bottom:4px;padding-bottom:4px;border-bottom:1px solid #e2e8f0"><b>${localTime}</b> <span style="opacity:.5">${displayTimezone}</span></div>`;
            params.forEach((p: any) => {
              const val = Array.isArray(p.value) ? p.value[1] : p.value;
              const formatted = (val !== null && val !== undefined)
                ? (typeof val === 'number' ? val.toFixed(2) : val)
                : 'N/A';
              tip += `<div style="font-size:11px;margin-top:3px;display:flex;align-items:center;gap:4px"><span style="display:inline-block;border-radius:50%;width:8px;height:8px;background:${p.color};flex-shrink:0"></span>${p.seriesName}: <b>${formatted}</b></div>`;
            });
            return tip;
          },
        },
        xAxis: Array.isArray(options?.xAxis)
          ? options.xAxis
          : {
              type: 'time',
              ...options?.xAxis,
              axisLabel: {
                ...options?.xAxis?.axisLabel,
                formatter: (value: number) =>
                  dayjs(value).tz(displayTimezone).format('HH:mm\nDD MMM'),
              },
            },
      };
    } catch {
      return options;
    }
  }, [options, displayTimezone, dataZoomConfig]);

  return (
    // CSS transition instead of framer-motion — zero JavaScript animation overhead
    <div className="w-full relative flex flex-col bg-white border border-slate-200 rounded-xl p-4 shadow-sm overflow-hidden min-h-[100px] transition-shadow duration-200 hover:shadow-md">
      {appliedLimitDays && <TruncationBanner appliedLimitDays={appliedLimitDays} />}

      {errorType ? (
        <div className="flex-1 w-full" style={{ height }}>
          <WidgetErrorCard errorType={errorType} />
        </div>
      ) : (
        <>
          {isLoading && (
            <div className="absolute inset-0 bg-white/70 z-10 flex items-center justify-center rounded-xl">
              <div className="w-7 h-7 border-2 border-[#2563eb] border-t-transparent rounded-full animate-spin" />
            </div>
          )}

          {!isMounted ? (
            <div className="flex-1 w-full bg-slate-50 rounded-lg " style={{ height }} />
          ) : (
            <div ref={containerRef} className="flex-1 w-full overflow-hidden" style={{ height }}>
              <ReactECharts
                ref={chartRef}
                option={tzOptions}
                style={{ height: '100%', width: '100%' }}
                notMerge={false}      // merge mode: only updates changed parts, no full redraw
                lazyUpdate={true}     // batch DOM updates for better performance
                opts={{ renderer: 'canvas' }}
                onChartReady={onChartReady}
              />
            </div>
          )}
        </>
      )}
    </div>
  );
}
