// -------------------------------------
// ADAPTIVE ENGINE (LEVEL 1)
// -------------------------------------

/*
  الهدف:
  - قراءة قرارات المستخدم
  - استخراج السلوك
  - تعديل النظام (بدون كسر المنطق الأصلي)
*/

/* =====================================
   ANALYZE USER BEHAVIOR
===================================== */

export function analyzeBehavior(decisions = []) {
  const stats = new Map();

  for (const d of decisions) {
    if (!d || !d.productId) continue;

    const s = stats.get(d.productId) || {
      BUY: 0,
      IGNORE: 0,
      WATCH: 0
    };

    if (d.action === "BUY") s.BUY++;
    if (d.action === "IGNORE") s.IGNORE++;
    if (d.action === "WATCH") s.WATCH++;

    stats.set(d.productId, s);
  }

  return stats;
}

/* =====================================
   DECISION BIAS
===================================== */

function getBias(s) {
  if (!s) return 0;

  const total = s.BUY + s.IGNORE + s.WATCH;
  if (total === 0) return 0;

  const buyRate = s.BUY / total;
  const ignoreRate = s.IGNORE / total;

  // bias range: -1 → +1
  return buyRate - ignoreRate;
}

/* =====================================
   ADAPT CONFIDENCE
===================================== */

function adaptConfidence(base, bias) {
  if (bias > 0.4) {
    if (base === "WEAK") return "MEDIUM";
    if (base === "MEDIUM") return "STRONG";
  }

  if (bias < -0.4) {
    if (base === "STRONG") return "MEDIUM";
    if (base === "MEDIUM") return "WEAK";
  }

  return base;
}

/* =====================================
   ADAPT SUGGESTION
===================================== */

function adaptSuggestion(suggestion, bias) {
  if (!suggestion) return suggestion;

  if (bias > 0.5) {
    return {
      ...suggestion,
      min: Math.max(1, suggestion.min),
      max: Math.max(suggestion.max, suggestion.min + 2),
      note: "User prefers buying"
    };
  }

  if (bias < -0.5) {
    return null; // suppress buying suggestion
  }

  return suggestion;
}

/* =====================================
   MAIN ADAPT FUNCTION
===================================== */

export function applyAdaptive({
  productId,
  baseConfidence,
  suggestion,
  behaviorMap
}) {
  const stats = behaviorMap.get(productId);
  const bias = getBias(stats);

  const newConfidence = adaptConfidence(baseConfidence, bias);
  const newSuggestion = adaptSuggestion(suggestion, bias);

  return {
    confidence: newConfidence,
    suggestion: newSuggestion,
    bias
  };
}
