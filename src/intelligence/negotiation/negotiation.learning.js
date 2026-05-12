// -------------------------------------
// NEGOTIATION LEARNING (FROM MEMORY)
// -------------------------------------

import { loadPricingMemory } from "../pricing/pricingMemory.repo.js";

export function getNegotiationProfile(productId) {
  try {
    const memory = loadPricingMemory();
    const m = memory?.[productId];

    if (!m || m.attempts === 0) {
      return {
        acceptanceRate: null,
        avgAcceptedPrice: null,
        resistanceLevel: "UNKNOWN"
      };
    }

    const rate = m.successes / m.attempts;

    let resistance = "MEDIUM";

    if (rate < 0.3) resistance = "HIGH";
    if (rate > 0.7) resistance = "LOW";

    return {
      acceptanceRate: rate,
      avgAcceptedPrice:
        m.successes > 0 ? m.totalAcceptedPrice / m.successes : null,
      resistanceLevel: resistance
    };

  } catch (e) {
    return {
      acceptanceRate: null,
      avgAcceptedPrice: null,
      resistanceLevel: "UNKNOWN"
    };
  }
}
