// -------------------------------------
// TREND ENGINE (PRO)
// -------------------------------------

import { buildReport } from "./report.engine.js";

// -------------------------------------

function splitByMonths(entries) {
  const map = {};

  for (const e of entries) {
    const d = new Date(e.createdAt);
    const key = `${d.getFullYear()}-${d.getMonth() + 1}`;

    if (!map[key]) map[key] = [];
    map[key].push(e);
  }

  return Object.entries(map)
    .map(([k, v]) => ({ period: k, entries: v }))
    .sort((a, b) => a.period.localeCompare(b.period));
}

// -------------------------------------

export function buildTrends(entries = []) {
  const months = splitByMonths(entries);

  const results = [];

  for (let i = 0; i < months.length; i++) {
    const current = months[i];
    const prev = months[i - 1];

    const currentReport = buildReport(current.entries);
    const prevReport = prev ? buildReport(prev.entries) : null;

    const growth = prevReport
      ? percentChange(prevReport.global.netProfit, currentReport.global.netProfit)
      : 0;

    results.push({
      period: current.period,
      revenue: currentReport.global.revenue,
      profit: currentReport.global.netProfit,
      cash: currentReport.global.netCash,
      growth,
      direction: detectDirection(growth)
    });
  }

  return results;
}

// -------------------------------------

function percentChange(oldVal, newVal) {
  if (!oldVal) return 0;
  return ((newVal - oldVal) / oldVal) * 100;
}

// -------------------------------------

function detectDirection(growth) {
  if (growth > 10) return "UP";
  if (growth < -10) return "DOWN";
  return "STABLE";
}
