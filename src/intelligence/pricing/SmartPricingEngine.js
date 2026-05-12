// -------------------------------------
// Smart Pricing Engine (FINAL STABLE)
// -------------------------------------

import { computePricingSignals } from "./pricingSignals.js";
import { getLearningSignals } from "./pricingLearning.js";

// -------------------------------------
export function getPriceRecommendation({
  product,
  salesHistory = [],
  stock = {}
}) {
  try {
    if (!product) return fallback("Missing product");

    const cost = safe(product.cost_price);
    const current = safe(product.selling_price);

    if (cost <= 0) return fallback("Invalid cost");

    const signals = computePricingSignals({
      product,
      salesHistory,
      stock
    });

    const learning = getLearningSignals(product.id);

    // ----------------------
    // YOUR STYLE
    // ----------------------
    const currentMargin =
      current > 0 ? (current - cost) / current : 0.3;

    // ----------------------
    // RANGE
    // ----------------------
    let min = cost * 1.05;
    let max = cost * 2.5;

    if (currentMargin > 0.3) {
      min = Math.max(min, cost * 1.2);
      max = cost * 3;
    }

    if (learning.avgAcceptedPrice) {
      min = (min + learning.avgAcceptedPrice * 0.9) / 2;
      max = (max + learning.avgAcceptedPrice * 1.1) / 2;
    }

    // ----------------------
    // SIGNAL
    // ----------------------
    let signal = "NEUTRAL";
    let message = "Balanced";

    if (signals.totalSold > 10) {
      signal = "STRONG";
      message = "Sells fast";
    }

    if (signals.totalSold < 3) {
      signal = "WEAK";
      message = "Slow product";
    }

    if (learning.successRate !== null && learning.successRate < 0.3) {
      signal = "REJECTED";
      message = "Customers resist price";
    }

    return {
      currentPrice: current,
      minPrice: round(min),
      maxPrice: round(max),
      suggestion: round((min + max) / 2),
      signal,
      confidence: computeConfidence(signals, learning),
      insight: buildInsight({
        cost,
        current,
        learning,
        signals,
        message
      })
    };
  } catch (e) {
    console.error("PricingEngine error", e);
    return fallback("Engine failure");
  }
}

// -------------------------------------
function buildInsight({ cost, current, learning, signals, message }) {
  const parts = [];

  parts.push(`Cost:${round(cost)}`);
  parts.push(`Current:${round(current)}`);

  if (signals.totalSold !== undefined) {
    parts.push(`Sold:${signals.totalSold}`);
  }

  if (learning.avgAcceptedPrice) {
    parts.push(`Market:${round(learning.avgAcceptedPrice)}`);
  }

  parts.push(message);

  return parts.join(" | ");
}

// -------------------------------------
function computeConfidence(signals, learning) {
  if (learning.successRate !== null && signals.totalSold > 10) return "HIGH";
  if (signals.totalSold > 5) return "MEDIUM";
  return "LOW";
}

// -------------------------------------
function safe(n) {
  return Number(n) || 0;
}

function round(n) {
  return Math.round(n * 100) / 100;
}

// -------------------------------------
function fallback(reason) {
  return {
    currentPrice: null,
    minPrice: null,
    maxPrice: null,
    suggestion: null,
    signal: "UNKNOWN",
    confidence: "LOW",
    insight: reason
  };
}
