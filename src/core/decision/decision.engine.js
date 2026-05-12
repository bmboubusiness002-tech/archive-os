// -------------------------------------
// DECISION ENGINE (FULL + SAFE)
// -------------------------------------

function formatIssue(type, message) {
  return `${type} ${message}`;
}

/* ================= ITEM ================= */

export function analyzeItem(p = {}, qty = 1, price = null) {
  const selling = Number(price ?? p.selling_price ?? 0);
  const cost = Number(p.cost_price ?? p.cost ?? 0);
  const stock = Number(p.stock ?? p.quantity ?? 0);

  const profit = (selling - cost) * qty;
  const margin = selling ? (selling - cost) / selling : 0;

  let stockStatus = "OK";
  if (qty > stock) stockStatus = "BLOCKED";
  else if (stock - qty < 3) stockStatus = "LOW";

  let decision = "OK";
  if (profit <= 0) decision = "REJECT";
  else if (margin < 0.1) decision = "RISK";

  return {
    selling,
    cost,
    stock,
    profit,
    margin,
    stockStatus,
    decision
  };
}

/* ================= CART ================= */

export function analyzeCartDecision(cart = []) {
  let total = 0;
  let profit = 0;

  const issues = [];
  const actions = [];

  for (const i of cart) {
    const ref = i.ref || {};

    const m = analyzeItem(ref, i.qty, i.price);

    total += Number(i.price || 0) * Number(i.qty || 0);
    profit += m.profit;

    if (m.stockStatus === "BLOCKED") {
      issues.push(formatIssue("❌", `${i.name}: ${i.qty} > ${m.stock}`));
      actions.push(`Reduce ${i.name} to ${m.stock}`);
    }

    if (m.stockStatus === "LOW") {
      issues.push(formatIssue("⚠", `${i.name}: low stock (${m.stock})`));
    }

    if (m.decision === "REJECT") {
      issues.push(formatIssue("❌", `${i.name}: no profit`));
      actions.push(`Increase price for ${i.name}`);
    }

    if (m.decision === "RISK") {
      issues.push(formatIssue("⚠", `${i.name}: low margin`));
      actions.push(`Adjust price for ${i.name}`);
    }
  }

  let status = "OK";

  if (issues.some(i => i.startsWith("❌"))) status = "BLOCKED";
  else if (issues.length) status = "RISK";

  return {
    total,
    profit,
    issues,
    actions,
    status
  };
}

/* ================= SYSTEM (CRITICAL FIX) ================= */

export function runDecisionEngine(signals = {}) {
  const decisions = [];

  const { finance, inventory, forecast } = signals;

  // FORECAST
  if (forecast?.signal === "GROWTH") {
    decisions.push({ type: "BUY", priority: "HIGH", reason: "Demand increasing" });
  }

  if (forecast?.signal === "DECLINE") {
    decisions.push({ type: "STOP_BUY", priority: "HIGH", reason: "Demand decreasing" });
  }

  if (forecast?.signal === "VOLATILE") {
    decisions.push({ type: "WAIT", priority: "MEDIUM", reason: "Market unstable" });
  }

  // INVENTORY
  for (const item of inventory || []) {
    const qty = item.qty ?? item.stock ?? 0;

    if (qty <= 2) {
      decisions.push({
        type: "RESTOCK",
        productId: item.productId,
        priority: "HIGH",
        reason: "Critical stock"
      });
    } else if (qty < 5) {
      decisions.push({
        type: "RESTOCK",
        productId: item.productId,
        priority: "MEDIUM",
        reason: "Low stock"
      });
    }
  }

  // FINANCE
  const cash = finance?.cash?.net || 0;

  if (cash < 0) {
    decisions.push({
      type: "STOP_SPENDING",
      priority: "HIGH",
      reason: "Negative cash flow"
    });
  }

  if (cash > 1000) {
    decisions.push({
      type: "INVEST",
      priority: "LOW",
      reason: "Available capital"
    });
  }

  return decisions;
}
