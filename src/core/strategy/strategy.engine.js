// -------------------------------------
// STRATEGY ENGINE V5 (FIXED + COMPATIBLE)
// -------------------------------------

/*
✔ FIX:
- restore buildStrategy (for UI usage)
- keep runStrategyEngine (orchestrator)
✔ ADD:
- tactical layer
- confidence aware
*/

/* ================= HELPERS ================= */

function safe(n, d = 0) {
  const x = Number(n);
  return isFinite(x) ? x : d;
}

function clamp(n, min, max) {
  return Math.max(min, Math.min(max, n));
}

/* ================= LEVEL 1 (IMPORTANT FIX) ================= */
/* THIS IS REQUIRED BY inventory.screen.js */

export function buildStrategy({ quantity, velocity, profile }) {
  const qty = safe(quantity);
  const vel = safe(velocity);

  const daysToZero = vel > 0 ? qty / vel : Infinity;

  let urgency = "LOW";
  if (daysToZero < 3) urgency = "HIGH";
  else if (daysToZero < 7) urgency = "MEDIUM";

  let action = "HOLD";

  if (daysToZero < 3) action = "BUY_NOW";
  else if (daysToZero < 7) action = "BUY_SOON";
  else if (daysToZero < 12) action = "PREPARE";

  return {
    daysToZero,
    urgency,
    action,
    note: `Stock covers ${daysToZero.toFixed(1)} days`
  };
}

/* ================= CONTEXT ================= */

function getConfidenceMode(confidence) {
  const s = safe(confidence?.score);

  if (s < 0.3) return "SAFE";
  if (s < 0.7) return "BALANCED";
  return "AGGRESSIVE";
}

function getMarketMode(insights) {
  const state = insights?.state || "";

  if (state.includes("VOLATILE")) return "RISK";
  if (state.includes("DOWN")) return "BEAR";
  if (state.includes("UP")) return "BULL";

  return "NEUTRAL";
}

/* ================= TACTICAL ================= */

function buildTactic({ qty, confidenceMode, marketMode }) {
  let ratio = 1;

  if (confidenceMode === "SAFE") ratio = 0.2;
  else if (confidenceMode === "BALANCED") ratio = 0.5;
  else ratio = 1;

  if (marketMode === "RISK") ratio *= 0.5;
  if (marketMode === "BULL") ratio *= 1.2;

  const finalQty = Math.ceil(qty * ratio);

  let mode = "SCALE";
  if (ratio < 0.3) mode = "TEST";
  else if (ratio < 0.7) mode = "CONTROLLED";
  else mode = "AGGRESSIVE";

  return {
    mode,
    qty: finalQty,
    steps: buildSteps(mode)
  };
}

function buildSteps(mode) {
  if (mode === "TEST") {
    return [
      "Buy small quantity",
      "Test demand 1-3 days",
      "Monitor sales",
      "Expand if successful"
    ];
  }

  if (mode === "CONTROLLED") {
    return [
      "Buy moderate quantity",
      "Split into batches",
      "Observe market"
    ];
  }

  return [
    "Execute full purchase",
    "Optimize pricing",
    "Maximize profit"
  ];
}

/* ================= PRIORITY ================= */

function score(p) {
  if (p === "HIGH") return 3;
  if (p === "MEDIUM") return 2;
  return 1;
}

/* ================= LEVEL 2 (ORCHESTRATOR) ================= */

export function runStrategyEngine(decisions = [], signals = {}) {
  const actions = [];

  const {
    inventory = [],
    confidence = {},
    insights = {}
  } = signals;

  const confidenceMode = getConfidenceMode(confidence);
  const marketMode = getMarketMode(insights);

  const seen = new Set();

  for (const d of decisions) {
    if (!d || !d.type) continue;

    const key = `${d.type}_${d.productId || "GLOBAL"}`;
    if (seen.has(key)) continue;
    seen.add(key);

    /* ================= RESTOCK ================= */

    if (d.type === "RESTOCK") {
      const item = inventory.find(i => i.productId === d.productId) || {};

      const velocity = safe(item.sales?.velocity, 1);
      const baseQty = Math.ceil(velocity * 7);

      const tactic = buildTactic({
        qty: baseQty,
        confidenceMode,
        marketMode
      });

      actions.push({
        type: "SUGGEST_BUY",
        priority: "MEDIUM",
        score: score("MEDIUM"),
        message: `Restock ${d.productId}`,
        explanation: "Stock based on velocity",
        tactic
      });
    }

    /* ================= BUY ================= */

    if (d.type === "BUY") {
      const tactic = buildTactic({
        qty: 20,
        confidenceMode,
        marketMode
      });

      actions.push({
        type: "SUGGEST_BUY",
        priority: "MEDIUM",
        score: score("MEDIUM"),
        message: "Growth opportunity",
        explanation: "Demand signal",
        tactic
      });
    }

    /* ================= WAIT ================= */

    if (d.type === "WAIT") {
      actions.push({
        type: "ALERT",
        priority: "HIGH",
        score: 3,
        message: "Market unstable",
        explanation: "High volatility",
        tactic: {
          mode: "HOLD",
          qty: 0,
          steps: [
            "Pause buying",
            "Observe market",
            "Re-evaluate"
          ]
        }
      });
    }

    /* ================= INVEST ================= */

    if (d.type === "INVEST") {
      const tactic = buildTactic({
        qty: 100,
        confidenceMode,
        marketMode
      });

      actions.push({
        type: "SUGGEST_INVEST",
        priority: "LOW",
        score: 1,
        message: "Use excess cash",
        explanation: "Cash available",
        tactic
      });
    }
  }

  actions.sort((a, b) => b.score - a.score);

  if (!actions.length) {
    actions.push({
      type: "INFO",
      priority: "LOW",
      message: "System stable"
    });
  }

  return actions;
}
