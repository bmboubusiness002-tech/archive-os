// -------------------------------------
// NEGOTIATION ENGINE (CORE)
// -------------------------------------

import { getNegotiationProfile } from "./negotiation.learning.js";
import { evaluateDeal } from "./negotiation.rules.js";

export function getNegotiationInsight({ product, price }) {
  try {
    if (!product) return fallback("No product");

    const cost = Number(product.cost_price) || 0;
    if (cost <= 0) return fallback("Invalid cost");

    const profile = getNegotiationProfile(product.id);

    const deal = evaluateDeal({
      cost,
      price,
      profile
    });

    const optimizedPrice = computeOptimizedPrice({
      cost,
      profile,
      current: price
    });

    return {
      decision: deal.decision,
      advice: deal.advice,
      confidence: computeConfidence(profile),
      optimizedPrice,
      insight: buildInsight({ cost, price, profile, deal })
    };

  } catch (e) {
    console.error("Negotiation error", e);
    return fallback("Engine failed");
  }
}

// -------------------------------------
function computeOptimizedPrice({ cost, profile, current }) {
  let target = current;

  if (profile.avgAcceptedPrice) {
    target = profile.avgAcceptedPrice;
  }

  // حماية الربح
  if (target < cost * 1.1) {
    target = cost * 1.1;
  }

  return round(target);
}

// -------------------------------------
function computeConfidence(profile) {
  if (profile.acceptanceRate === null) return "LOW";
  if (profile.acceptanceRate > 0.7) return "HIGH";
  if (profile.acceptanceRate > 0.4) return "MEDIUM";
  return "LOW";
}

// -------------------------------------
function buildInsight({ cost, price, profile, deal }) {
  const parts = [];

  parts.push(`Cost:${round(cost)}`);
  parts.push(`Price:${round(price)}`);

  if (profile.avgAcceptedPrice) {
    parts.push(`Market:${round(profile.avgAcceptedPrice)}`);
  }

  if (profile.acceptanceRate !== null) {
    parts.push(`Accept:${(profile.acceptanceRate * 100).toFixed(0)}%`);
  }

  parts.push(deal.advice);

  return parts.join(" | ");
}

// -------------------------------------
function round(n) {
  return Math.round(n * 100) / 100;
}

// -------------------------------------
function fallback(reason) {
  return {
    decision: "UNKNOWN",
    advice: reason,
    confidence: "LOW",
    optimizedPrice: null,
    insight: reason
  };
}
