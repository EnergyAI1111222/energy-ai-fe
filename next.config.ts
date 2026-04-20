import type { NextConfig } from "next";
import path from "path";

const nextConfig: NextConfig = {
  // Removed deprecated eslint and typescript config keys
  turbopack: {
    root: path.resolve(__dirname),
  },
  // Tree-shake large packages: only bundles symbols actually used.
  // Reduces initial JS size significantly (echarts ~1.5MB, deck.gl ~3MB, etc.)
  experimental: {
    optimizePackageImports: [
      'echarts',
      'echarts-for-react',
      'lucide-react',
      'framer-motion',
      '@deck.gl/core',
      '@deck.gl/react',
      '@deck.gl/layers',
      '@deck.gl/aggregation-layers',
      '@tanstack/react-query',
      '@tanstack/react-table',
    ],
  },
};

export default nextConfig;
