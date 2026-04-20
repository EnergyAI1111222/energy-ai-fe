"use client";
import React, { useState, useMemo, useCallback, useRef, useEffect } from 'react';
import DeckGL from '@deck.gl/react';
import { GeoJsonLayer } from '@deck.gl/layers';
import { HeatmapLayer } from '@deck.gl/aggregation-layers';

import { useTimeStateStore } from '@/store/useTimeStateStore';
import { useAppStore } from '@/store/useAppStore';
import { Play, Pause, SkipBack, SkipForward } from 'lucide-react';

const INITIAL_VIEW_STATE = {
  longitude: 10.45, 
  latitude: 51.16,
  zoom: 4,
  pitch: 0,
  bearing: 0
};

const MAPBOX_ACCESS_TOKEN = process.env.NEXT_PUBLIC_MAPBOX_TOKEN || 'pk.eyJ1IjoiZHVtbXkiLCJhIjoiY2x0bWFwYm94dG9rZW4xMjM0NTY3In0.dummy';

interface NodalMapProps {
  mapType: 'eu_polygon' | 'heatmap';
  metric?: string;
  data?: any;
  height?: string | number;
}

import { useHeatmapData } from '@/hooks/useHeatmapData';
import { useNodalMatrix, useEuPolygons } from '@/hooks/useNodalMatrix';
import { useInView } from 'react-intersection-observer';
import { useRouter } from 'next/navigation';

// Color Scale Helper (Electric Teal Scale)
const getColor = (value: number, max: number = 100): [number, number, number, number] => {
  const ratio = Math.min(value / max, 1);
  return [
    Math.round(15 + ratio * (0 - 15)),   // R
    Math.round(23 + ratio * (212 - 23)), // G
    Math.round(42 + ratio * (255 - 42)), // B
    180                                   // A
  ];
};

// Center coordinates for EU Countries
const COUNTRY_COORDS: Record<string, [number, number]> = {
  DE: [10.45, 51.16],
  FR: [2.21, 46.22],
  NL: [5.29, 52.13],
  BE: [4.46, 50.50],
  AT: [14.55, 47.51],
  CH: [8.22, 46.81],
  IT: [12.56, 41.87],
  ES: [-3.74, 40.46],
  UK: [-3.43, 55.37],
  PL: [19.14, 51.91],
  CZ: [15.47, 49.81],
  SE: [18.64, 60.12],
  NO: [8.46, 60.47],
  FI: [25.74, 61.92],
  DK: [9.50, 56.26],
};

export function NodalMap({ mapType, metric = 'Spot Today', data: externalData, height = 400 }: NodalMapProps) {
  const router = useRouter();
  const { selectedTimeSlot, setTimeSlot, activeTab } = useTimeStateStore();
  const [isMounted, setIsMounted] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const animFrameRef = useRef<number | null>(null);
  const lastFrameTimeRef = useRef<number>(0);

  const { data: heatmapData, isLoading: isHeatmapLoading } = useHeatmapData(metric);
  const { data: matrix } = useNodalMatrix(metric);
  const { data: polygonsFc } = useEuPolygons();
  const geoData = polygonsFc ?? null;

  // Per-slot snapshot: pick the current selectedTimeSlot value per zone,
  // falling back to the last non-null value in the day, then to the daily
  // heatmap value. This keeps the 96-slot slider visually responsive even
  // when individual slots are sparsely sampled.
  const slotHeatmap = useMemo(() => {
    if (!matrix) return heatmapData ?? null;
    const out: Record<string, number> = {};
    for (const [zone, slots] of Object.entries(matrix)) {
      const arr = slots as Array<number | null>;
      const v = arr[selectedTimeSlot];
      if (v != null) {
        out[zone] = v;
        continue;
      }
      const fallback = [...arr].reverse().find((x) => x != null);
      if (fallback != null) out[zone] = fallback as number;
      else if (heatmapData && heatmapData[zone] != null) out[zone] = heatmapData[zone] as number;
    }
    return out;
  }, [matrix, selectedTimeSlot, heatmapData]);

  // 96-slot auto-play animation (~250ms per slot = ~24s full cycle for smooth visual)
  const FRAME_INTERVAL_MS = 250;

  const stopPlayback = useCallback(() => {
    setIsPlaying(false);
    if (animFrameRef.current) {
      cancelAnimationFrame(animFrameRef.current);
      animFrameRef.current = null;
    }
  }, []);

  const animate = useCallback((timestamp: number) => {
    if (timestamp - lastFrameTimeRef.current >= FRAME_INTERVAL_MS) {
      lastFrameTimeRef.current = timestamp;
      const current = useTimeStateStore.getState().selectedTimeSlot;
      setTimeSlot((current + 1) % 96);
    }
    animFrameRef.current = requestAnimationFrame(animate);
  }, [setTimeSlot]);

  const startPlayback = useCallback(() => {
    setIsPlaying(true);
    lastFrameTimeRef.current = performance.now();
    animFrameRef.current = requestAnimationFrame(animate);
  }, [animate]);

  const togglePlayback = useCallback(() => {
    if (isPlaying) stopPlayback();
    else startPlayback();
  }, [isPlaying, stopPlayback, startPlayback]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    };
  }, []);

  // Intersection Observer
  const { ref, inView } = useInView({
    triggerOnce: true,
    threshold: 0.1,
  });

  React.useEffect(() => {
    setIsMounted(true);
  }, []);

  const layers = useMemo(() => {
    if (!inView) return [];
    
    const activeLayers: any[] = [];

    const activeHeatmap = slotHeatmap ?? heatmapData ?? null;

    // Layer 1: Base Heatmap (Demand/Spot)
    if (activeHeatmap) {
      const heatmapPoints = Object.entries(activeHeatmap).map(([code, val]) => {
        const coords = COUNTRY_COORDS[code.toUpperCase()] || [10, 50];
        return {
          coordinates: coords,
          weight: Math.abs(val as number)
        };
      });

      if (heatmapPoints.length > 0) {
        activeLayers.push(
          new HeatmapLayer({
            id: `heatmap-${metric}-${selectedTimeSlot}`,
            data: heatmapPoints,
            getPosition: (d: any) => d.coordinates,
            getWeight: (d: any) => d.weight,
            radiusPixels: 100,
            intensity: 1,
            threshold: 0.05
          })
        );
      }
    }

    // Layer 2: Country Polygons (GeoJSON)
    if (mapType === 'eu_polygon' && geoData) {
      activeLayers.push(
        new GeoJsonLayer({
          id: `geojson-${metric}-${selectedTimeSlot}`,
          data: geoData,
          stroked: true,
          filled: true,
          getFillColor: (f: any) => {
            const code = (f.properties.iso_a2 || f.properties.ISO_A2 || '').toUpperCase();
            const val = activeHeatmap ? activeHeatmap[code] : 0;
            return val ? getColor(val, 150) : [15, 23, 42, 40];
          },
          getLineColor: [37, 99, 235, 80],
          getLineWidth: 1,
          pickable: true,
          updateTriggers: {
            getFillColor: [activeHeatmap, selectedTimeSlot],
          },
          onClick: (info: any) => {
            const countryCode = (info.object?.properties?.iso_a2 || info.object?.properties?.ISO_A2 || '').toLowerCase();
            if (countryCode) router.push(`/eu/west/${countryCode}`);
          }
        })
      );
    }

    return activeLayers;
  }, [inView, mapType, geoData, slotHeatmap, heatmapData, metric, selectedTimeSlot, router]);

  if (!isMounted) return <div className="w-full bg-slate-900 rounded-xl " style={{ height }} />;

  return (
    <div ref={ref} className="relative w-full rounded-xl overflow-hidden shadow-sm border border-slate-200" style={{ height }}>
      <div className="absolute top-3 left-3 z-10 bg-white/95 backdrop-blur text-slate-800 px-2.5 py-1 rounded-lg text-[10px] font-bold border border-slate-200 shadow-sm flex items-center gap-2">
         <div className="w-1.5 h-1.5 rounded-full bg-[#2563eb]" />
         {metric.toUpperCase()} <span className="opacity-50 font-mono text-[8px] text-slate-500">| {activeTab.toUpperCase()}</span>
      </div>
      
      {inView ? (
        <DeckGL
          id={`deck-map-${metric.replace(/\s+/g, '-').toLowerCase()}`}
          initialViewState={INITIAL_VIEW_STATE}
          controller={{ dragRotate: false, scrollZoom: false }}
          layers={layers}
          useDevicePixels={false}
        />
      ) : (
        <div className="w-full h-full bg-slate-50 flex items-center justify-center">
            <div className="flex flex-col items-center gap-2">
               <div className="w-6 h-6 border-2 border-[#2563eb] border-t-transparent rounded-full animate-spin" />
               <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Waking GPU...</p>
            </div>
        </div>
      )}

      <div className="absolute bottom-4 left-4 right-4 z-10 bg-white/95 backdrop-blur border border-slate-200 rounded-xl p-3 flex flex-col gap-2 shadow-sm">
         <div className="flex items-center justify-between text-xs text-slate-500 font-mono mb-1 px-1">
            <span>00:00</span>
            <span className="font-bold text-[#2563eb] bg-blue-50 px-2 py-0.5 rounded">
              Slot {selectedTimeSlot + 1}/96 — {String(Math.floor(selectedTimeSlot / 4)).padStart(2, '0')}:{String((selectedTimeSlot % 4) * 15).padStart(2, '0')}
            </span>
            <span>23:45</span>
         </div>
         <div className="flex items-center gap-2">
            <button
              onClick={() => { stopPlayback(); setTimeSlot(Math.max(0, selectedTimeSlot - 1)); }}
              className="text-slate-400 hover:text-white bg-slate-800 p-1.5 rounded-full transition-colors"
              title="Previous slot"
            >
              <SkipBack className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={togglePlayback}
              className="text-[#2563eb] hover:text-white bg-slate-800 p-1.5 rounded-full transition-colors"
              title={isPlaying ? "Pause" : "Play"}
            >
              {isPlaying ? <Pause className="w-4 h-4 fill-current" /> : <Play className="w-4 h-4 fill-current" />}
            </button>
            <button
              onClick={() => { stopPlayback(); setTimeSlot(Math.min(95, selectedTimeSlot + 1)); }}
              className="text-slate-400 hover:text-white bg-slate-800 p-1.5 rounded-full transition-colors"
              title="Next slot"
            >
              <SkipForward className="w-3.5 h-3.5" />
            </button>
            <input
              type="range"
              min={0}
              max={95}
              value={selectedTimeSlot}
              onChange={(e) => { stopPlayback(); setTimeSlot(parseInt(e.target.value)); }}
              className="w-full accent-[#2563eb] bg-slate-700 h-1.5 rounded-lg appearance-none cursor-pointer"
            />
         </div>
      </div>
    </div>
  );
}
