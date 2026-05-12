// -------------------------------------
// NEGOTIATION RULES (TRADER LOGIC)
// -------------------------------------

export function evaluateDeal({ cost, price, profile }) {
  const profit = price - cost;
  const margin = price > 0 ? profit / price : 0;

  let decision = "ACCEPTABLE";
  let advice = "Sell";

  // -------------------------------------
  // Loss
  // -------------------------------------
  if (profit <= 0) {
    return {
      decision: "LOSS",
      advice: "Do not sell",
      score: 0
    };
  }

  // -------------------------------------
  // Weak margin
  // -------------------------------------
  if (margin < 0.1) {
    decision = "WEAK";
    advice = "Increase price";
  }

  // -------------------------------------
  // Resistance logic
  // -------------------------------------
  if (profile.resistanceLevel === "HIGH") {
    decision = "RISKY";
    advice = "Lower price slightly";
  }

  if (profile.resistanceLevel === "LOW") {
    advice = "You can push higher price";
  }

  return {
    decision,
    advice,
    score: margin
  };
}
