"use client";
import React, { useMemo } from 'react';
import dynamic from 'next/dynamic';
import { useQuery } from '@tanstack/react-query';
import { TimeStateTabs } from "@/components/dashboard/TimeStateTabs";
import { KPICard } from "@/components/dashboard/KPICard";
import { ComboAreaLineChart } from "@/components/charts/templates/ComboAreaLineChart";
import { StackedAreaChart } from "@/components/charts/templates/StackedAreaChart";
import { DualAxisBarLineChart } from "@/components/charts/templates/DualAxisBarLineChart";
import { useLiveEnergyData } from '@/hooks/useLiveEnergyData';
import { energyApi } from '@/api/client';
import { Download, Zap, Activity } from 'lucide-react';
import { WidgetCell } from '@/components/shared/WidgetCell';
import { WidgetActions } from '@/components/shared/WidgetActions';

// Lazy-load Deck.gl/Mapbox — keeps them OUT of the main JS bundle (~3MB saving)
const NodalMap = dynamic(
  () => import('@/components/maps/NodalMap').then(m => ({ default: m.NodalMap })),
  { ssr: false, loading: () => <div className="w-full h-full bg-slate-900 rounded-xl  min-h-[300px]" /> }
);

// ── Country → Dataset ID mapping ──────────────────────────────────────────────
// Dataset IDs are the api_id (integer) from the legacy data_types table.
// Only include IDs that have actual data in api_data_timeseries / api_data_1h.
// Verify via: SELECT d.api_id, d.data_name, d.country_code, d.group_organization
//              FROM data_types d JOIN api_data_1h t ON t.file_id = d.api_id
//              GROUP BY d.api_id
const COUNTRY_DATASETS: Record<string, {
  spot_price?: string[];
  intraday?: string[];
  load_actual?: string[];
  wind_actual?: string[];
  solar_actual?: string[];
  hydro?: string[];
  imbalance?: string[];
  flows?: string[];
  production?: string[];
  umms?: string[];
  redispatch?: string[];
}> = {
  // DE: spot api_id=1 has no data yet scraped; use intraday=9 for now
  de: {
    spot_price: ['9'],   // pr de id wavg (intraday as proxy) - api_id=1 spot has no rows yet
    intraday:   ['10'],  // pr de id full
    imbalance:  ['89'],  // pr de imb afrr energy wavg down
  },
  fr: {
    spot_price: ['5'],   // pr fr spot epex
    intraday:   ['46'],  // pr fr id wavg
  },
  nl: {
    spot_price: ['6'],   // pr nl spot epex
    intraday:   ['64'],  // pr nl id wavg
  },
  be: {
    spot_price: ['3'],   // pr be spot epex
    intraday:   ['60'],  // pr be id wavg
  },
  at: {
    spot_price: ['2'],   // pr at spot epex
    intraday:   ['28'],  // pr at id wavg
  },
  ch: {
    spot_price: ['4'],   // pr ch spot epex
    intraday:   ['56'],  // pr ch id wavg
  },
};

// Helper: extract [[ts_unix, value]] array from batch results
function getSeriesData(results: Record<string, any>, ids: string[] = []): [number, number][] {
  for (const id of ids) {
    const r = results[id];
    if (r?.status === 'success' && Array.isArray(r.data) && r.data.length > 0) {
      return r.data;
    }
  }
  return [];
}

export default function CountryDashboardPage(
  props: { params: Promise<{ region: string; country: string }> }
) {
  const params = React.use(props.params);
  const countryCode = (params.country || 'de').toLowerCase();
  const datasets = COUNTRY_DATASETS[countryCode] ?? COUNTRY_DATASETS['de'];

  // Flat list of all dataset IDs needed for this country page
  const allDatasetIds = useMemo(() =>
    [
      ...(datasets.spot_price ?? []),
      ...(datasets.intraday ?? []),
      ...(datasets.load_actual ?? []),
      ...(datasets.wind_actual ?? []),
      ...(datasets.solar_actual ?? []),
      ...(datasets.hydro ?? []),
      ...(datasets.imbalance ?? []),
      ...(datasets.flows ?? []),
      ...(datasets.production ?? []),
      ...(datasets.umms ?? []),
      ...(datasets.redispatch ?? []),
    ],
    [datasets]
  );

  // ── Real API calls ──────────────────────────────────────────────────────────
  const { data: batchData, isLoading: chartsLoading } = useLiveEnergyData(allDatasetIds);
  const results = batchData?.results ?? {};

  // KPI cards: poll every 3 min when on today/trends tab
  const { data: kpiData, isLoading: kpiLoading } = useQuery({
    queryKey: ['kpis', countryCode],
    queryFn: () => energyApi.getKpis(countryCode),
    refetchInterval: 180_000,
    refetchIntervalInBackground: false,
    retry: 1,
  });

  // ── Per-chart data extraction ───────────────────────────────────────────────
  const spotPriceData  = useMemo(() => getSeriesData(results, datasets.spot_price),  [results, datasets.spot_price]);
  const intradayData   = useMemo(() => getSeriesData(results, datasets.intraday),    [results, datasets.intraday]);
  const loadData       = useMemo(() => getSeriesData(results, datasets.load_actual), [results, datasets.load_actual]);
  const windData       = useMemo(() => getSeriesData(results, datasets.wind_actual), [results, datasets.wind_actual]);
  const solarData      = useMemo(() => getSeriesData(results, datasets.solar_actual),[results, datasets.solar_actual]);
  const hydroData      = useMemo(() => getSeriesData(results, datasets.hydro),       [results, datasets.hydro]);
  const imbalanceData  = useMemo(() => getSeriesData(results, datasets.imbalance),   [results, datasets.imbalance]);
  const flowsData      = useMemo(() => getSeriesData(results, datasets.flows),       [results, datasets.flows]);
  const productionData = useMemo(() => getSeriesData(results, datasets.production),  [results, datasets.production]);
  const ummsData       = useMemo(() => getSeriesData(results, datasets.umms),        [results, datasets.umms]);
  const redispatchData = useMemo(() => getSeriesData(results, datasets.redispatch),  [results, datasets.redispatch]);

  // ── KPI values (from /v1/summary/kpis API) ─────────────────────────────────
  const kpi = kpiData ?? {};
  const fmt  = (v: number | undefined, unit = '') =>
    v !== undefined ? `${v.toFixed(1)} ${unit}`.trim() : '—';

  // ── 11-row chart definitions ────────────────────────────────────────────────
  const chartRows = useMemo(() => [
    {
      id: 'prices',
      title: 'Row 1 — DA Price vs. Intraday vs. Imbalance',
      datasetIds: [...(datasets.spot_price ?? []), ...(datasets.intraday ?? [])],
      content: (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 min-h-[360px]">
          <ComboAreaLineChart
            title="DA Spot vs. Intraday (EUR/MWh)"
            nameArea="Day-Ahead"
            nameLine="Intraday"
            dataArea={spotPriceData}
            dataLine={intradayData}
            isLoading={chartsLoading}
          />
          <div className="bg-white rounded-lg border border-slate-200 overflow-hidden shadow-sm min-h-[300px]">
            <NodalMap mapType="heatmap" metric="Spot Today" />
          </div>
        </div>
      ),
    },
    {
      id: 'consumption',
      title: 'Row 2 — Consumption: Actual vs. Day-Ahead Forecast',
      datasetIds: [...(datasets.load_actual ?? [])],
      content: (
        <div className="h-[320px]">
          <ComboAreaLineChart
            title="Grid Consumption (MW)"
            nameArea="Actual"
            nameLine="DA Forecast"
            dataArea={loadData}
            dataLine={[]}
            isLoading={chartsLoading}
          />
        </div>
      ),
    },
    {
      id: 'imbalance',
      title: 'Row 3 — System Imbalance & Balancing Activations',
      datasetIds: [...(datasets.imbalance ?? [])],
      content: (
        <div className="h-[320px]">
          <DualAxisBarLineChart
            title="Net Imbalance (MW) vs. Imbalance Price (EUR/MWh)"
            nameBar="Imbalance MW"
            nameLine="Price"
            dataBar={imbalanceData}
            dataLine={[]}
            isLoading={chartsLoading}
          />
        </div>
      ),
    },
    {
      id: 'residual',
      title: 'Row 4 — Residual Load: DA vs. Actual',
      datasetIds: [...(datasets.load_actual ?? [])],
      content: (
        <div className="h-[320px]">
          <ComboAreaLineChart
            title="Residual Load (MW)"
            nameArea="Actual Residual"
            nameLine="DA Residual"
            dataArea={loadData}
            dataLine={[]}
            isLoading={chartsLoading}
          />
        </div>
      ),
    },
    {
      id: 'wind',
      title: 'Row 5 — Wind Generation: Actual vs. Day-Ahead',
      datasetIds: [...(datasets.wind_actual ?? [])],
      content: (
        <div className="h-[320px]">
          <ComboAreaLineChart
            title="Wind On/Offshore (MW)"
            nameArea="Actual Wind"
            nameLine="DA Forecast"
            dataArea={windData}
            dataLine={[]}
            isLoading={chartsLoading}
          />
        </div>
      ),
    },
    {
      id: 'solar',
      title: 'Row 6 — Solar Generation: Actual vs. Forecast',
      datasetIds: [...(datasets.solar_actual ?? [])],
      content: (
        <div className="h-[320px]">
          <ComboAreaLineChart
            title="Solar PV Output (MW)"
            nameArea="Actual Solar"
            nameLine="Forecast"
            dataArea={solarData}
            dataLine={[]}
            isLoading={chartsLoading}
          />
        </div>
      ),
    },
    {
      id: 'hydro',
      title: 'Row 7 — Hydrology: Reservoir, Pumped Storage, Run-of-River',
      datasetIds: [...(datasets.hydro ?? [])],
      content: (
        <div className="h-[320px]">
          <StackedAreaChart
            title="Hydro Generation Mix (MW)"
            series={[
              { name: 'Reservoir',      data: hydroData },
              { name: 'Pumped Storage', data: [] },
              { name: 'Run-of-River',   data: [] },
            ]}
            isLoading={chartsLoading}
          />
        </div>
      ),
    },
    {
      id: 'flows',
      title: 'Row 8 — Cross-Border Flows: Physical vs. Commercial',
      datasetIds: [...(datasets.flows ?? [])],
      content: (
        <div className="h-[320px]">
          <ComboAreaLineChart
            title="Exchange Flows (MW)"
            nameArea="Commercial Flow"
            nameLine="Physical Flow"
            dataArea={flowsData}
            dataLine={[]}
            isLoading={chartsLoading}
          />
        </div>
      ),
    },
    {
      id: 'mix',
      title: 'Row 9 — Total Production Mix by Source',
      datasetIds: [...(datasets.production ?? []), ...(datasets.wind_actual ?? []), ...(datasets.solar_actual ?? [])],
      content: (
        <div className="h-[320px]">
          <StackedAreaChart
            title="Aggregated Production Mix (MW)"
            series={[
              { name: 'Wind',    data: windData },
              { name: 'Solar',   data: solarData },
              { name: 'Hydro',   data: hydroData },
              { name: 'Other',   data: productionData },
            ]}
            isLoading={chartsLoading}
          />
        </div>
      ),
    },
    {
      id: 'umms',
      title: 'Row 10 — UMM Outages vs. Change to Yesterday',
      datasetIds: [...(datasets.umms ?? [])],
      content: (
        <div className="h-[320px]">
          <DualAxisBarLineChart
            title="Outage Volume (MW) vs. Delta (MW)"
            nameBar="Outages MW"
            nameLine="Δ to Yesterday"
            dataBar={ummsData}
            dataLine={[]}
            isLoading={chartsLoading}
          />
        </div>
      ),
    },
    {
      id: 'redispatch',
      title: 'Row 11 — Redispatch Volumes by TSO Control Area',
      datasetIds: [...(datasets.redispatch ?? [])],
      content: (
        <div className="h-[320px]">
          <StackedAreaChart
            title="Redispatch (MW)"
            series={[
              { name: 'TenneT',  data: redispatchData },
              { name: 'Amprion', data: [] },
              { name: 'TransnetBW', data: [] },
              { name: '50Hertz', data: [] },
            ]}
            isLoading={chartsLoading}
          />
        </div>
      ),
    },
  ], [
    spotPriceData, intradayData, loadData, windData, solarData,
    hydroData, imbalanceData, flowsData, productionData, ummsData,
    redispatchData, chartsLoading,
  ]);

  return (
    <div className="p-4 md:p-6 h-full flex flex-col max-w-[1700px] mx-auto w-full overflow-y-auto">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-6 gap-4">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <Activity className="w-4 h-4 text-[#2563eb]" />
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
              {params.region?.toUpperCase()} Region
            </span>
          </div>
          <h1 className="text-3xl md:text-4xl font-extrabold text-slate-900 tracking-tight">
            {countryCode.toUpperCase()}{' '}
            <span className="text-[#2563eb]">Dashboard</span>
          </h1>
          <p className="text-slate-500 font-mono text-[11px] mt-1 uppercase tracking-widest flex items-center gap-2">
            <Zap className="w-3 h-3 text-[#2563eb]" />
            Real-time Energy Intelligence
          </p>
        </div>
        <div className="flex items-center gap-3">
          <input
            type="date"
            defaultValue={new Date().toISOString().split('T')[0]}
            className="text-xs font-mono font-bold text-slate-700 border border-slate-200 rounded-xl px-4 py-2.5 outline-none focus:border-[#2563eb] transition-colors bg-white"
          />
          <button className="flex items-center gap-2 px-5 py-2.5 bg-slate-900 text-white rounded-xl text-xs font-bold hover:bg-[#2563eb] hover:text-slate-900 transition-all">
            <Download className="w-4 h-4" />
            REPORT
          </button>
        </div>
      </div>

      {/* Time State Tabs + Resolution Switcher */}
      <div className="mb-6">
        <TimeStateTabs />
      </div>

      {/* KPI Stat Cards — 7 cards per spec MS-FE-005 B */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-3 mb-10">
        <KPICard
          label="Current Load"
          value={kpi.current_load ? `${Number(kpi.current_load).toFixed(1)} MW` : '—'}
          deltaText={kpi.load_delta ?? '—'}
          deltaTrend={kpi.load_trend ?? 'neutral'}
          isLoading={kpiLoading}
        />
        <KPICard
          label="Residual Load"
          value={kpi.residual_load ? `${Number(kpi.residual_load).toFixed(1)} MW` : '—'}
          deltaText={kpi.residual_delta ?? '—'}
          deltaTrend={kpi.residual_trend ?? 'neutral'}
          isLoading={kpiLoading}
        />
        <KPICard
          label="Main Gen Source"
          value={kpi.main_source ?? '—'}
          deltaText={kpi.main_source_mw ? `${Number(kpi.main_source_mw).toFixed(0)} MW` : '—'}
          deltaTrend="neutral"
          isLoading={kpiLoading}
        />
        <KPICard
          label="System Imbalance"
          value={kpi.system_imbalance ? `${kpi.system_imbalance} MW` : '—'}
          deltaText={kpi.imbalance_status ?? '—'}
          deltaTrend={kpi.imbalance_trend ?? 'neutral'}
          isLoading={kpiLoading}
        />
        <KPICard
          label="Imbalance Price"
          value={kpi.imbalance_price ? `€ ${kpi.imbalance_price}` : '—'}
          deltaText={kpi.imbalance_price_delta ?? '—'}
          deltaTrend={kpi.imbalance_price_trend ?? 'neutral'}
          isLoading={kpiLoading}
        />
        <KPICard
          label="Intraday Price"
          value={kpi.intraday_price ? `€ ${kpi.intraday_price}` : '—'}
          deltaText={kpi.intraday_delta ?? '—'}
          deltaTrend={kpi.intraday_trend ?? 'neutral'}
          isLoading={kpiLoading}
        />
        <KPICard
          label="Grid Stability"
          value={kpi.grid_stability ?? 'STABLE'}
          deltaText={kpi.stability_note ?? 'Normal'}
          deltaTrend="neutral"
          isLoading={kpiLoading}
        />
      </div>

      {/* The 11-Row Chart Grid per spec MS-FE-005 C */}
      <div className="space-y-14 pb-24">
        {chartRows.map(row => (
          <div key={row.id} className="group relative">
            {/* Row header */}
            <div className="flex items-center justify-between mb-4 px-2">
              <div className="flex items-center gap-3">
                <div className="w-1.5 h-5 bg-slate-200 rounded-full group-hover:bg-[#2563eb] transition-all duration-300" />
                <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest group-hover:text-slate-700 transition-colors">
                  {row.title}
                </h3>
              </div>
              {/* Widget actions (fullscreen, download CSV, API code) */}
              <WidgetActions
                datasetIds={row.datasetIds}
                title={row.title}
                fullscreenContent={row.content}
              />
            </div>
            {/* Chart content with per-widget partial-failure + truncation handling */}
            <div className="rounded-lg border border-slate-100 bg-slate-50/30 p-2 group-hover:border-slate-200 transition-all duration-300">
              <div className="bg-white rounded-xl border border-slate-100 shadow-sm overflow-hidden">
                <div className="p-2">
                  <WidgetCell datasetIds={row.datasetIds} results={results}>
                    {row.content}
                  </WidgetCell>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
