// -------------------------------------
// FINANCIAL ENGINE (FINAL FIXED)
// -------------------------------------

import { ACCOUNTS } from "../../core/ledger/ledger-engine.js";

// -------------------------------------
// MAIN ENTRY
// -------------------------------------
export function buildFinancialIntelligence(entries = []) {
  const pnl = computePnL(entries);
  const cash = computeCashFlow(entries);
  const signals = detectSignals({ pnl, cash });

  return {
    pnl,
    cash,
    signals
  };
}

// -------------------------------------
// P&L ENGINE (FIXED)
// -------------------------------------
function computePnL(entries) {
  let revenue = 0;
  let cogs = 0;
  let expenses = 0;

  for (const e of entries) {
    const amount = safe(e.amount);

    // -----------------------------
    // REVENUE
    // -----------------------------
    if (e.creditAccount === ACCOUNTS.REVENUE) {
      revenue += amount;
    }

    // -----------------------------
    // COGS (🔥 FIX)
    // -----------------------------
    // بعض الأنظمة تسجل COGS كـ debit أو عبر type
    if (
      e.debitAccount === ACCOUNTS.COGS ||
      e.type === "COGS"
    ) {
      cogs += amount;
    }

    // -----------------------------
    // EXPENSES (🔥 FIX)
    // -----------------------------
    if (
      e.debitAccount === ACCOUNTS.EXPENSE &&
      e.type !== "COGS" // ❗ منع خلط COGS مع المصاريف
    ) {
      expenses += amount;
    }
  }

  const grossProfit = revenue - cogs;
  const netProfit = grossProfit - expenses;

  return {
    revenue,
    cogs,
    expenses,
    grossProfit,
    netProfit,
    margin: revenue > 0 ? (netProfit / revenue) * 100 : 0
  };
}

// -------------------------------------
// CASH FLOW ENGINE (STABLE)
// -------------------------------------
function computeCashFlow(entries) {
  let cashIn = 0;
  let cashOut = 0;

  for (const e of entries) {
    const amount = safe(e.amount);

    if (e.debitAccount === ACCOUNTS.CASH) {
      cashIn += amount;
    }

    if (e.creditAccount === ACCOUNTS.CASH) {
      cashOut += amount;
    }
  }

  return {
    cashIn,
    cashOut,
    net: cashIn - cashOut
  };
}

// -------------------------------------
// SIGNAL ENGINE
// -------------------------------------
function detectSignals({ pnl, cash }) {
  const signals = [];

  if (pnl.netProfit < 0) {
    signals.push("❌ Business losing money");
  }

  if (cash.net < 0) {
    signals.push("⚠ Negative cash flow");
  }

  if (pnl.margin < 10) {
    signals.push("⚠ Low margin");
  }

  if (pnl.margin > 30) {
    signals.push("💰 Strong margin");
  }

  return signals;
}

// -------------------------------------
function safe(n) {
  return Number(n) || 0;
}
