import { BaseEnergyChart } from '../BaseEnergyChart';
import { WidgetHeader } from '../WidgetHeader';

export function SnapshotCurveChart({ title, data, units = "EUR/MWh", isPremium }: any) {
  // Data format expected: [[cum_mw, price], [cum_mw, price], ...]
  const options = {
    color: ['#2563eb'], // Teal for the curve
    grid: { top: 20, right: 20, bottom: 40, left: 60, containLabel: true },
    tooltip: {
      trigger: 'axis',
      axisPointer: { type: 'cross' },
      formatter: (params: any) => {
        const p = params[0];
        return `<div class="font-sans">
          <div class="text-xs text-slate-500 mb-1 font-bold">Auction Snapshot</div>
          <div class="flex justify-between gap-4">
            <span class="text-slate-600">Volume:</span>
            <span class="font-mono font-bold">${p.data[0]} MW</span>
          </div>
          <div class="flex justify-between gap-4">
            <span class="text-slate-600">Price:</span>
            <span class="font-mono font-bold">${p.data[1]} ${units}</span>
          </div>
        </div>`;
      }
    },
    xAxis: { 
      type: 'value', 
      name: 'Cumulative Volume (MW)', 
      nameLocation: 'middle', 
      nameGap: 25,
      splitLine: { lineStyle: { type: 'dashed', color: '#e2e8f0' } },
      axisLabel: { fontSize: 10, color: '#64748b' }
    },
    yAxis: { 
      type: 'value', 
      name: units,
      splitLine: { lineStyle: { type: 'dashed', color: '#e2e8f0' } },
      axisLabel: { fontSize: 10, color: '#64748b' }
    },
    series: [
      {
        name: 'Bid Curve',
        type: 'line',
        step: 'end', // Staircase effect
        data: data,
        areaStyle: { 
          color: {
            type: 'linear',
            x: 0, y: 0, x2: 0, y2: 1,
            colorStops: [{ offset: 0, color: '#2563eb15' }, { offset: 1, color: '#2563eb01' }]
          }
        },
        showSymbol: false,
        lineStyle: { width: 3, color: '#2563eb', cap: 'round' }
      }
    ]
  };

  return (
    <div className="w-full flex-1 flex flex-col">
      <WidgetHeader title={title} isPremium={isPremium} />
      <BaseEnergyChart options={options} height={280} />
    </div>
  );
}
