// -------------------------------------
// CONFIDENCE ENGINE
// -------------------------------------

/*
الهدف:
- قياس جودة التوقع
- إعطاء Confidence Score (0 → 1)
*/

function safe(n, d = 0) {
  const x = Number(n);
  return isFinite(x) ? x : d;
}

function mean(arr) {
  if (!arr.length) return 0;
  return arr.reduce((a, b) => a + b, 0) / arr.length;
}

function variance(arr) {
  const m = mean(arr);
  return mean(arr.map(x => (x - m) ** 2));
}

function normalize(v, max) {
  if (!max) return 0;
  return Math.min(1, v / max);
}

/* ================= MAIN ================= */

export function buildConfidence({ history = [], forecast = [] }) {
  if (!history.length || !forecast.length) {
    return {
      score: 0.5,
      level: "UNKNOWN"
    };
  }

  const histVar = variance(history);
  const forecastVar = variance(forecast);

  // instability penalty
  const instability = normalize(histVar + forecastVar, 100000);

  // trend consistency
  const trend = forecast[forecast.length - 1] - forecast[0];
  const trendStrength = Math.abs(trend) / (mean(forecast) || 1);

  // final score
  let score = 1 - instability;

  // penalize chaotic behavior
  if (trendStrength > 1) score *= 0.7;

  score = Math.max(0, Math.min(1, score));

  let level = "LOW";
  if (score > 0.75) level = "HIGH";
  else if (score > 0.5) level = "MEDIUM";

  return {
    score,
    level,
    instability,
    trendStrength
  };
}
