// -------------------------------------
// MARGIN INTELLIGENCE ENGINE (FINAL + FIXED)
// -------------------------------------

import { analyzeMarginsFromSales } from "./margin.analyzer.js";
import { classifyMargin, detectSignals } from "./margin.rules.js";

// -------------------------------------
export function generateMarginInsights({ entries = [], sales = [] } = {}) {
  try {
    // 🔥 SOURCE = SALES (NOT LEDGER)
    const base = analyzeMarginsFromSales(sales);

    if (!Array.isArray(base) || base.length === 0) {
      return empty();
    }

    // -------------------------------------
    // Enrichment
    // -------------------------------------
    const enriched = base.map(p => {
      const classification = safe(() => classifyMargin(p), "unknown");
      const signals = safe(() => detectSignals(p), []);

      return {
        ...p,
        classification,
        signals
      };
    });

    // -------------------------------------
    // Ranking
    // -------------------------------------
    const best = [...enriched]
      .sort((a, b) => safeNumber(b.profit) - safeNumber(a.profit))
      .slice(0, 5);

    const worst = [...enriched]
      .sort((a, b) => safeNumber(a.avgMargin) - safeNumber(b.avgMargin))
      .slice(0, 5);

    // -------------------------------------
    // Metrics (🔥 FIX CRITICAL)
    // -------------------------------------
    const totalProfit = enriched.reduce(
      (sum, p) => sum + safeNumber(p.profit),
      0
    );

    const avgMargin =
      enriched.length > 0
        ? enriched.reduce((sum, p) => sum + safeNumber(p.avgMargin), 0) /
          enriched.length
        : 0;

    // -------------------------------------
    // Global Signals
    // -------------------------------------
    const globalSignals = [];

    if (avgMargin < 15) {
      globalSignals.push({
        type: "low_margin_global",
        msg: "⚠️ Overall margin is low"
      });
    }

    if (totalProfit < 0) {
      globalSignals.push({
        type: "loss_global",
        msg: "❌ Business losing money"
      });
    }

    // -------------------------------------
    return {
      products: enriched,
      best,
      worst,
      signals: globalSignals,
      metrics: {
        totalProfit,
        avgMargin
      }
    };
  } catch (err) {
    console.error("❌ Margin engine failed:", err);
    return empty();
  }
}

// -------------------------------------
// Helpers
// -------------------------------------
function safe(fn, fallback) {
  try {
    const r = fn();
    return r ?? fallback;
  } catch {
    return fallback;
  }
}

function safeNumber(n) {
  return Number(n) || 0;
}

// -------------------------------------
function empty() {
  return {
    products: [],
    best: [],
    worst: [],
    signals: [],
    metrics: {
      totalProfit: 0,
      avgMargin: 0
    }
  };
}
