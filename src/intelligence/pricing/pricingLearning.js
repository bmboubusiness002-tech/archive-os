// -------------------------------------
// Pricing Learning (SMART MEMORY)
// -------------------------------------

import { loadPricingMemory } from "./pricingMemory.repo.js";

// -------------------------------------
export function getLearningSignals(productId) {
  try {
    const memory = loadPricingMemory();
    const m = memory?.[productId];

    if (!m || m.attempts === 0) {
      return {
        successRate: null,
        avgAcceptedPrice: null,
        volatility: null
      };
    }

    const avg =
      m.successes > 0
        ? m.totalAcceptedPrice / m.successes
        : null;

    return {
      successRate: safeDivide(m.successes, m.attempts),
      avgAcceptedPrice: avg,
      volatility: computeVolatility(m.lastPrices || [])
    };
  } catch (e) {
    console.warn("⚠️ Learning fallback", e);
    return {
      successRate: null,
      avgAcceptedPrice: null,
      volatility: null
    };
  }
}

// -------------------------------------
function computeVolatility(arr) {
  if (!arr || arr.length < 2) return null;

  const avg = arr.reduce((a, b) => a + b, 0) / arr.length;

  const variance =
    arr.reduce((sum, v) => sum + Math.pow(v - avg, 2), 0) /
    arr.length;

  return Math.sqrt(variance);
}

// -------------------------------------
function safeDivide(a, b) {
  if (!b) return null;
  return a / b;
}
