// -------------------------------------
// UX ORCHESTRATION ENGINE (SAFE PRO)
// -------------------------------------

export function runUXOrchestrator({
  finance = {},
  inventory = [],
  pos = {}
} = {}) {
  try {
    const context = buildContext({ finance, inventory, pos });
    const triggers = buildTriggers(context);

    return { context, triggers };

  } catch (e) {
    console.warn("❌ UX Orchestrator crashed:", e);
    return { context: {}, triggers: [] };
  }
}

// -------------------------------------
// CONTEXT (SAFE)
// -------------------------------------
function buildContext({ finance, inventory, pos }) {
  return {
    lowCash: (finance?.cash?.net ?? 0) < 0,
    lowMargin: (finance?.pnl?.margin ?? 0) < 10,

    riskyProducts: (inventory || []).filter(p =>
      (p?.intelligence?.risk ?? "NORMAL") !== "NORMAL"
    ),

    fastProducts: (inventory || []).filter(p =>
      (p?.intelligence?.velocity ?? "") === "FAST"
    ),

    losingSale: (pos?.totalProfit ?? 0) < 0
  };
}

// -------------------------------------
// TRIGGERS (SAFE)
// -------------------------------------
function buildTriggers(ctx) {
  const triggers = [];

  if (ctx.lowCash) {
    triggers.push({
      type: "ALERT",
      level: "danger",
      message: "💸 Cash is negative"
    });
  }

  if (ctx.lowMargin) {
    triggers.push({
      type: "ALERT",
      level: "warning",
      message: "⚠ Low margin"
    });
  }

  if (ctx.losingSale) {
    triggers.push({
      type: "POS_WARNING",
      level: "danger",
      message: "❌ Selling at loss"
    });
  }

  if (ctx.riskyProducts.length > 0) {
    triggers.push({
      type: "INVENTORY",
      level: "warning",
      message: `⚠ ${ctx.riskyProducts.length} risky products`
    });
  }

  if (ctx.fastProducts.length > 0) {
    triggers.push({
      type: "HIGHLIGHT",
      level: "success",
      message: "🔥 Fast selling products"
    });
  }

  return triggers;
}
