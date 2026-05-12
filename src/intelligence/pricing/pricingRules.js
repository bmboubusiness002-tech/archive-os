export function evaluatePricingRisk(signals) {
  const { avgMargin, totalSold } = signals;

  let risk = "NORMAL";
  let reason = [];

  if (avgMargin < 0.1) {
    risk = "UNDERPRICED";
    reason.push("Low margin");
  }

  if (totalSold < 3 && avgMargin > 0.4) {
    risk = "OVERPRICED";
    reason.push("High margin + low sales");
  }

  return { risk, reason };
}

export function computeAdaptiveMargin(signals) {
  const { avgMargin, totalSold } = signals;

  let margin = 0.25;

  if (totalSold > 10) margin += 0.05;
  if (avgMargin < 0.1) margin += 0.1;
  if (totalSold < 3) margin -= 0.05;

  return Math.max(0.1, margin);
}
