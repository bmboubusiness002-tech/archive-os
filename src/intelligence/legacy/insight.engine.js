// -------------------------------------
// INSIGHT ENGINE (WHY / SIGNALS)
// -------------------------------------

function safe(n, d = 0) {
  const x = Number(n);
  return isFinite(x) ? x : d;
}

/* ========= TREND ========= */

function analyzeTrend(series = []) {
  if (!series.length) return { dir: "FLAT", change: 0 };

  const first = safe(series[0]);
  const last = safe(series[series.length - 1]);

  const change = first ? (last - first) / first : 0;

  let dir = "FLAT";
  if (change > 0.15) dir = "UP";
  else if (change < -0.15) dir = "DOWN";

  return { dir, change };
}

/* ========= VOLATILITY ========= */

function std(arr = []) {
  if (arr.length < 2) return 0;
  const mean = arr.reduce((a, b) => a + b, 0) / arr.length;
  const v =
    arr.reduce((s, x) => s + Math.pow(x - mean, 2), 0) / arr.length;
  return Math.sqrt(v);
}

/* ========= PEAK / DROP DETECTION ========= */

function detectSpikeDrop(series = []) {
  if (series.length < 3) return { spike: false, drop: false };

  const last = series[series.length - 1];
  const prev = series[series.length - 2];
  const prev2 = series[series.length - 3];

  const spike = prev > prev2 * 1.25;
  const drop = last < prev * 0.7;

  return { spike, drop };
}

/* ========= MAIN ========= */

export function buildInsights({
  forecast = [],
  history = [],
  finance = {}
}) {
  const trend = analyzeTrend(forecast);
  const volatility = std(history);
  const { spike, drop } = detectSpikeDrop(history);

  const insights = [];
  const reasons = [];
  const recommendations = [];

  /* ---- Reasons ---- */

  if (volatility > 50) {
    reasons.push("Sales variance is high");
    insights.push("Unstable demand pattern detected");
    recommendations.push("Avoid aggressive purchasing");
  }

  if (trend.dir === "DOWN") {
    reasons.push("Forecast shows decline");
    insights.push("Demand is decreasing");
    recommendations.push("Reduce stock exposure");
  }

  if (trend.dir === "UP") {
    reasons.push("Forecast shows growth");
    insights.push("Demand increasing");
    recommendations.push("Prepare inventory increase");
  }

  if (spike && drop) {
    reasons.push("Recent spike followed by sharp drop");
    insights.push("Market overreaction pattern");
    recommendations.push("Wait for stabilization before buying");
  }

  if (!reasons.length) {
    insights.push("Stable market conditions");
    recommendations.push("Maintain current strategy");
  }

  /* ---- State ---- */

  let state = "STABLE";
  if (volatility > 50) state = "VOLATILE";
  else if (trend.dir === "UP") state = "GROWTH";
  else if (trend.dir === "DOWN") state = "DECLINE";

  return {
    state,
    trend,
    volatility,
    insights,
    reasons,
    recommendations
  };
}
