import { BaseEnergyChart } from '../BaseEnergyChart';
import { WidgetHeader } from '../WidgetHeader';
import { getEnergyColor, transformToECharts } from '@/utils/chartHelpers';

interface DualAxisProps {
  title: string;
  nameBar: string;
  nameLine: string;
  dataBar: [number, number][];
  dataLine: [number, number][];
  isPremium?: boolean;
  isLoading?: boolean;
}

export function DualAxisBarLineChart({ title, nameBar, nameLine, dataBar, dataLine, isPremium, isLoading }: DualAxisProps) {
  const colorBar = getEnergyColor(nameBar);
  const colorLine = getEnergyColor(nameLine);

  const options = {
    grid: { top: 30, right: 50, bottom: 40, left: 50, containLabel: true },
    tooltip: { trigger: 'axis' },
    legend: { 
      show: true, 
      top: 0, 
      icon: 'roundRect', 
      textStyle: { color: '#64748b', fontSize: 10, fontWeight: 'bold' } 
    },
    xAxis: { type: 'time', axisLabel: { fontSize: 10, color: '#94a3b8' } },
    yAxis: [
      { 
        type: 'value', 
        name: 'Volume',
        nameTextStyle: { fontSize: 10, color: '#94a3b8' },
        position: 'left', 
        axisLabel: { fontSize: 10, color: '#94a3b8' }, 
        splitLine: { lineStyle: { type: 'dashed', color: '#f1f5f9' } } 
      },
      { 
        type: 'value', 
        position: 'right', 
        axisLabel: { fontSize: 10, color: '#94a3b8' }, 
        splitLine: { show: false } 
      }
    ],
    series: [
      {
        name: nameBar,
        type: 'bar',
        yAxisIndex: 0,
        itemStyle: { 
            borderRadius: [4, 4, 0, 0],
            color: colorBar,
            opacity: 0.8
        },
        data: transformToECharts(dataBar),
      },
      {
        name: nameLine,
        type: 'line',
        yAxisIndex: 1,
        smooth: true,
        lineStyle: { width: 3, color: colorLine },
        showSymbol: false,
        data: transformToECharts(dataLine),
      }
    ]
  };

  return (
    <div className="w-full flex-1 flex flex-col bg-white rounded-xl p-2">
      <WidgetHeader title={title} isPremium={isPremium} />
      <BaseEnergyChart options={options} height={260} isLoading={isLoading} />
    </div>
  );
}
