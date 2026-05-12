// -------------------------------------
// BUY LIST ENGINE (FINAL CORE)
// -------------------------------------

/*
  الهدف:
  - تحويل (analysis + suggestion + strategy + profile)
    إلى قائمة شراء واضحة
*/

function safe(n, d = 0) {
  const x = Number(n);
  return isFinite(x) ? x : d;
}

function computeQty(suggestion, strategy) {
  if (!suggestion) return 0;

  // إذا الحالة عاجلة → خذ max
  if (strategy.action === "BUY_NOW") return suggestion.max;

  // إذا قريب → وسط
  if (strategy.action === "BUY_SOON") {
    return Math.ceil((suggestion.min + suggestion.max) / 2);
  }

  // إذا فقط تحضير → min
  if (strategy.action === "PREPARE") return suggestion.min;

  return 0;
}

function buildReason(strategy, profile) {
  const reasons = [];

  if (strategy.action === "BUY_NOW") {
    reasons.push("Stock critical");
  }

  if (strategy.action === "BUY_SOON") {
    reasons.push("Stock will deplete soon");
  }

  if (strategy.action === "PREPARE") {
    reasons.push("Prepare supplier");
  }

  if (profile?.confidenceBoost > 0.3) {
    reasons.push("User prefers buying early");
  }

  return reasons.join(" • ");
}

/* =====================================
   MAIN
===================================== */

export function buildBuyList(items = [], profile) {
  const list = [];

  for (const it of items) {
    const { productId, name, suggestion, strategy } = it;

    if (!strategy || strategy.action === "HOLD") continue;

    const qty = computeQty(suggestion, strategy);

    if (!qty) continue;

    list.push({
      productId,
      name,
      qty,
      urgency: strategy.urgency,
      action: strategy.action,
      reason: buildReason(strategy, profile)
    });
  }

  // sort by urgency
  list.sort((a, b) => {
    const order = { HIGH: 0, MEDIUM: 1, LOW: 2 };
    return (order[a.urgency] || 9) - (order[b.urgency] || 9);
  });

  return list;
}
