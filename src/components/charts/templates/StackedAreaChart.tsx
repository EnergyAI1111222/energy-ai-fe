import { BaseEnergyChart } from '../BaseEnergyChart';
import { WidgetHeader } from '../WidgetHeader';
import { getEnergyColor, transformToECharts } from '@/utils/chartHelpers';

interface StackedAreaProps {
  title: string;
  series: { name: string; data: [number, number][] }[];
  isPremium?: boolean;
  isLoading?: boolean;
}

export function StackedAreaChart({ title, series, isPremium, isLoading }: StackedAreaProps) {
  const options = {
    grid: { top: 30, right: 15, bottom: 40, left: 50, containLabel: true },
    tooltip: { trigger: 'axis' },
    legend: { 
      show: true, 
      top: 0, 
      icon: 'roundRect', 
      itemWidth: 12, 
      itemHeight: 4,
      textStyle: { color: '#64748b', fontSize: 10, fontWeight: 'bold' }
    },
    xAxis: { 
      type: 'time', 
      axisLine: { lineStyle: { color: '#e2e8f0' } },
      axisLabel: { fontSize: 10, color: '#94a3b8' },
      splitLine: { show: false }
    },
    yAxis: { 
      type: 'value', 
      position: 'right', // Standard for energy dashboards
      axisLabel: { fontSize: 10, color: '#94a3b8' },
      splitLine: { lineStyle: { type: 'dashed', color: '#f1f5f9' } } 
    },
    series: series.map((s) => {
      const color = getEnergyColor(s.name);
      return {
        name: s.name,
        type: 'line',
        stack: 'total',
        step: 'end', // Correct for energy interval data
        smooth: false,
        lineStyle: { width: 1, color },
        areaStyle: {
          opacity: 0.8,
          color: {
            type: 'linear', x: 0, y: 0, x2: 0, y2: 1,
            colorStops: [
              { offset: 0, color: color }, 
              { offset: 1, color: `${color}00` } // Fade to transparent
            ]
          }
        },
        data: transformToECharts(s.data),
        showSymbol: false,
      };
    })
  };

  return (
    <div className="w-full flex-1 flex flex-col bg-white rounded-xl p-2">
      <WidgetHeader title={title} isPremium={isPremium} />
      <BaseEnergyChart options={options} height={260} isLoading={isLoading} />
    </div>
  );
}
