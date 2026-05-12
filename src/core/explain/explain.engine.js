// -------------------------------------
// EXPLAIN ENGINE (WHY + ADVICE)
// -------------------------------------

/*
الهدف:
- تحويل actions الخام إلى:
  ✔ مفهومة
  ✔ مفسرة
  ✔ قابلة للتنفيذ بشريًا
*/

/* ================= HELPERS ================= */

function getTitle(action) {
  switch (action.type) {
    case "PURCHASE":
      return "🛒 Purchase Recommendation";

    case "ALERT":
      return "⚠ Risk Alert";

    case "MONITOR":
      return "👁 Monitor";

    default:
      return "Action";
  }
}

function getAdvice(action, insights) {
  const state = insights?.state;

  if (action.type === "PURCHASE") {
    if (state === "GROWTH") return "Demand is increasing — consider buying early.";
    if (state === "VOLATILE") return "Market unstable — buy in small batches.";
    if (state === "DECLINE") return "Demand falling — avoid overstock.";
    return "Evaluate supplier and negotiate price.";
  }

  if (action.type === "ALERT") {
    if (state === "VOLATILE") return "Wait before making big decisions.";
    if (state === "DECLINE") return "Reduce risk exposure.";
    return "Monitor situation carefully.";
  }

  if (action.type === "MONITOR") {
    return "No immediate action required.";
  }

  return "";
}

/* ================= MAIN ================= */

export function explainActions(actions = [], insights = {}) {
  return actions.map(action => ({
    ...action,

    // 🧠 Title
    title: getTitle(action),

    // 🧠 Message
    message: action.message || action.payload?.reason || "System recommendation",

    // 🧠 Advice (context aware)
    advice: getAdvice(action, insights)
  }));
}
