// -------------------------------------
// FORECAST ENGINE (PRO LEVEL)
// -------------------------------------

/*
  الهدف:
  - تحليل الاتجاه (trend)
  - قياس التذبذب (volatility)
  - توليد توقعات واقعية (next values)
  - إعطاء إشارة (signal)
*/

// ------------------ HELPERS ------------------

function safeArray(arr) {
  return Array.isArray(arr) ? arr : [];
}

function avg(arr) {
  if (!arr.length) return 0;
  return arr.reduce((a, b) => a + b, 0) / arr.length;
}

function slope(series) {
  if (series.length < 2) return 0;
  return series[series.length - 1] - series[series.length - 2];
}

function calcVolatility(series) {
  if (series.length < 3) return 0;

  let total = 0;

  for (let i = 1; i < series.length; i++) {
    total += Math.abs(series[i] - series[i - 1]);
  }

  return total / (series.length - 1);
}

// ------------------ CORE ------------------

export function buildForecast(inputSeries = []) {
  const series = safeArray(inputSeries).map(n => Number(n) || 0);

  // ------------------ EDGE CASE ------------------

  if (series.length < 3) {
    return {
      next: [],
      signal: "NO_DATA",
      meta: {
        trend: 0,
        volatility: 0
      }
    };
  }

  // ------------------ ANALYSIS ------------------

  const last = series[series.length - 1];

  const trend = slope(series);
  const volatility = calcVolatility(series);

  // smoothing (moving avg)
  const base =
    avg(series.slice(-3)) || last;

  // ------------------ FORECAST ------------------

  const next = [];

  let current = base;

  for (let i = 0; i < 5; i++) {
    // الاتجاه الأساسي
    current += trend;

    // ضجيج واقعي (controlled noise)
    const noise = (Math.random() - 0.5) * volatility;

    current += noise;

    next.push(Math.max(0, Math.round(current)));
  }

  // ------------------ SIGNAL ------------------

  let signal = "STABLE";

  if (trend > 0 && volatility < Math.abs(trend)) {
    signal = "GROWTH";
  }

  if (trend < 0 && Math.abs(trend) > volatility) {
    signal = "DECLINE";
  }

  if (volatility > Math.abs(trend) * 2) {
    signal = "VOLATILE";
  }

  // ------------------ OUTPUT ------------------

  return {
    next,
    signal,
    meta: {
      trend,
      volatility
    }
  };
}
