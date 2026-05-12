// -------------------------------------
// UX SIGNALS (STATE EXTRACTION)
// -------------------------------------

export function extractUXSignals({ dashboard, pos = {}, context = {} }) {
  const signals = [];

  // -------------------------------------
  // Cash Risk
  // -------------------------------------
  if (dashboard.cash < 0) {
    signals.push({
      type: "cash_negative",
      level: "critical"
    });
  }

  // -------------------------------------
  // Low Margin
  // -------------------------------------
  if (dashboard.margin?.metrics?.avgMargin < 15) {
    signals.push({
      type: "low_margin",
      level: "warning"
    });
  }

  // -------------------------------------
  // No Sales
  // -------------------------------------
  if (dashboard.revenue === 0) {
    signals.push({
      type: "no_sales",
      level: "warning"
    });
  }

  // -------------------------------------
  // POS Context
  // -------------------------------------
  if (pos.totalProfit < 0) {
    signals.push({
      type: "pos_loss",
      level: "critical"
    });
  }

  if (pos.total > 0 && pos.totalProfit < pos.total * 0.1) {
    signals.push({
      type: "pos_low_margin",
      level: "warning"
    });
  }

  return signals;
}
