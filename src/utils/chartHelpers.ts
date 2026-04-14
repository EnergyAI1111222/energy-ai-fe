/**
 * MS-FE-003: Standardized Energy Data Helpers.
 * Contains the canonical color palette and ECharts data transformers.
 */

export const ENERGY_COLORS: Record<string, string> = {
  // Production Sources
  'Nuclear': '#DC2626',
  'Wind': '#10B981',
  'Solar': '#F59E0B',
  'Hard Coal': '#475569',
  'Gas': '#6366F1',
  'Hydro': '#06B6D4',
  'Biomass': '#65A30D',
  'Lignite': '#78350F',
  'Oil': '#1F2937',
  
  // Imbalance / Market
  'Spot Price': '#2563eb', // Electric Teal
  'Futures': '#1d4ed8',
  'Negative Imbalance': '#F43F5E',
  'Positive Imbalance': '#10B981',
  
  // Defaults
  'default': '#94a3b8'
};

export function getEnergyColor(name: string): string {
  // Flexible lookup: "Wind Onshore" -> "Wind"
  for (const key in ENERGY_COLORS) {
    if (name.toLowerCase().includes(key.toLowerCase())) return ENERGY_COLORS[key];
  }
  return ENERGY_COLORS.default;
}

/**
 * Transforms Backend compact arrays [[ts, val], ...] to ECharts source data.
 */
export function transformToECharts(data: [number, number][]): any[] {
  if (!data) return [];
  // Backend gives [ts_seconds, val], ECharts needs [ts_ms, val]
  return data.map(point => [point[0] * 1000, point[1]]);
}
