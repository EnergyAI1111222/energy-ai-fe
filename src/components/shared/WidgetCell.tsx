"use client";
/**
 * <WidgetCell> — Per-widget partial-failure + truncation wrapper.
 *
 * Wraps any chart/widget cell with the resilience UI defined in MS-FE-002 + MS-FE-003:
 *
 *  - If every referenced dataset returned INSUFFICIENT_PERMISSIONS → render
 *    <WidgetErrorCard errorType="INSUFFICIENT_PERMISSIONS" /> instead of children.
 *  - If every referenced dataset returned a generic error → render the network
 *    error card.
 *  - If any referenced dataset returned `meta.limits_applied: true` → overlay
 *    a <TruncationBanner /> on top of the children, showing the applied window.
 *  - Otherwise renders children unchanged.
 *
 * Usage:
 *   <WidgetCell results={results} datasetIds={['2921', '46']}>
 *     <ComboAreaLineChart ... />
 *   </WidgetCell>
 */
import React from 'react';
import { TruncationBanner } from './TruncationBanner';
import { WidgetErrorCard } from './WidgetErrorCard';

interface BatchResultEntry {
  status?: 'success' | 'error';
  error_code?: string;
  data?: unknown;
  meta?: {
    limits_applied?: boolean;
    applied_limits?: {
      history_window?: string;
      forecast_horizon?: string;
    };
  };
}

interface WidgetCellProps {
  datasetIds?: string[];
  results?: Record<string, BatchResultEntry>;
  children: React.ReactNode;
}

function parseDays(window?: string): number | null {
  if (!window) return null;
  const m = window.match(/^(\d+)([dmy])$/);
  if (!m) return null;
  const n = Number(m[1]);
  switch (m[2]) {
    case 'd': return n;
    case 'm': return n * 30;
    case 'y': return n * 365;
    default:  return null;
  }
}

export function WidgetCell({ datasetIds = [], results = {}, children }: WidgetCellProps) {
  // Skip resilience logic when no datasets are wired (e.g. placeholder rows)
  if (datasetIds.length === 0) return <>{children}</>;

  const entries = datasetIds.map((id) => results[id]).filter(Boolean) as BatchResultEntry[];

  // Decide error state: only collapse to error card if EVERY entry errored.
  const errors = entries.filter((e) => e.status === 'error');
  if (entries.length > 0 && errors.length === entries.length) {
    const code = errors[0].error_code;
    if (code === 'INSUFFICIENT_PERMISSIONS' || code === 'FORBIDDEN') {
      return <WidgetErrorCard errorType="INSUFFICIENT_PERMISSIONS" />;
    }
    return <WidgetErrorCard errorType="UNKNOWN_ERROR" />;
  }

  // Detect truncation across any successful entry.
  let appliedDays: number | null = null;
  for (const e of entries) {
    if (e?.meta?.limits_applied) {
      const d = parseDays(e.meta.applied_limits?.history_window);
      if (d !== null && (appliedDays === null || d < appliedDays)) appliedDays = d;
    }
  }

  return (
    <div className="relative">
      {appliedDays !== null && <TruncationBanner appliedLimitDays={appliedDays} />}
      {children}
    </div>
  );
}
