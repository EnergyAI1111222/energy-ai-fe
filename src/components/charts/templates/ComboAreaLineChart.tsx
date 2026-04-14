import { BaseEnergyChart } from '../BaseEnergyChart';
import { WidgetHeader } from '../WidgetHeader';
import { getEnergyColor, transformToECharts } from '@/utils/chartHelpers';

interface ComboAreaLineProps {
  title: string;
  nameArea: string;
  nameLine: string;
  dataArea: [number, number][];
  dataLine: [number, number][];
  isPremium?: boolean;
  isLoading?: boolean;
}

export function ComboAreaLineChart({ title, nameArea, nameLine, dataArea, dataLine, isPremium, isLoading }: ComboAreaLineProps) {
  const colorArea = getEnergyColor(nameArea);
  const colorLine = getEnergyColor(nameLine);

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
    xAxis: { type: 'time', axisLabel: { fontSize: 10, color: '#94a3b8' } },
    yAxis: { 
      type: 'value', 
      position: 'right',
      axisLabel: { fontSize: 10, color: '#94a3b8' }, 
      splitLine: { lineStyle: { type: 'dashed', color: '#f1f5f9' } } 
    },
    series: [
      {
        name: nameArea,
        type: 'line',
        smooth: true,
        areaStyle: { 
            opacity: 0.2, 
            color: {
                type: 'linear', x: 0, y: 0, x2: 0, y2: 1,
                colorStops: [{ offset: 0, color: colorArea }, { offset: 1, color: 'transparent' }]
            }
        },
        lineStyle: { width: 0 },
        showSymbol: false,
        data: transformToECharts(dataArea),
      },
      {
        name: nameLine,
        type: 'line',
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
