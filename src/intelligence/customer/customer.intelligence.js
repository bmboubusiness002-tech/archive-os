// -------------------------------------
// CUSTOMER INTELLIGENCE
// -------------------------------------

export function analyzeCustomer(state) {
  const signals = [];

  if (state.debt > 100000) {
    signals.push("⚠ High debt");
  }

  if (state.totalSpent > 500000) {
    signals.push("💰 VIP customer");
  }

  if (state.debt > state.totalSpent * 0.5) {
    signals.push("⚠ Risk of non-payment");
  }

  return signals;
}
