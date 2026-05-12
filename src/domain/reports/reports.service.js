// -------------------------------------
// Reports Service (ULTRA FINAL - PRODUCTION SAFE + OPTIMIZED)
// -------------------------------------

import { ACCOUNTS } from "../../core/ledger/ledger-engine.js";
import { analyzeCashFlow, generateAlerts } from "./cash.intelligence.js";
import { generateDecisions } from "./decision.engine.js";
import { generateMarginInsights } from "../product/intelligence/margin.engine.js";
import { SaleRepo } from "../sale/sale.repo.js";

/* =====================================
   HELPERS
===================================== */

function sumByAccount(entries = [], account, type) {
  if (!account || !Array.isArray(entries)) return 0;

  let total = 0;

  for (const e of entries) {
    if (!e) continue;

    const amount = Number(e.amount) || 0;

    if (type === "credit" && e.creditAccount === account) total += amount;
    if (type === "debit" && e.debitAccount === account) total += amount;
  }

  return total;
}

/* =====================================
   PROFIT
===================================== */

export function getProfit(entries = []) {
  const revenue = sumByAccount(entries, ACCOUNTS.REVENUE, "credit");
  const expense = sumByAccount(entries, ACCOUNTS.EXPENSE, "debit");

  return {
    revenue,
    expense,
    profit: revenue - expense
  };
}

/* =====================================
   CASH BALANCE
===================================== */

export function getCashBalance(entries = []) {
  if (!Array.isArray(entries)) return 0;

  let balance = 0;

  for (const e of entries) {
    if (!e) continue;

    const amount = Number(e.amount) || 0;

    if (e.debitAccount === ACCOUNTS.CASH) balance += amount;
    if (e.creditAccount === ACCOUNTS.CASH) balance -= amount;
  }

  return balance;
}

/* =====================================
   SAFE EXECUTION
===================================== */

function safeExecute(fn, fallback, label) {
  try {
    const result = fn();
    return result ?? fallback;
  } catch (err) {
    console.warn(`⚠️ ${label} failed:`, err);
    return fallback;
  }
}

/* =====================================
   DEFAULTS
===================================== */

const DEFAULT_CASHFLOW = Object.freeze({
  cashIn: 0,
  cashOut: 0,
  net: 0
});

const DEFAULT_MARGIN = Object.freeze({
  products: [],
  best: [],
  worst: [],
  signals: [],
  metrics: {
    totalProfit: 0,
    avgMargin: 0
  }
});

/* =====================================
   SALES LOADER (SAFE + FAST)
===================================== */

async function loadSalesSafe(db) {
  try {
    if (!db || typeof db.transaction !== "function") return [];

    const repo = new SaleRepo();
    const sales = await repo.getAll(db);

    return Array.isArray(sales) ? sales : [];

  } catch (err) {
    console.warn("⚠️ Failed to load sales:", err);
    return [];
  }
}

/* =====================================
   ARG NORMALIZER
===================================== */

function normalizeArgs(dbOrEntries, maybeEntries) {
  let db = null;
  let entries = [];

  if (Array.isArray(dbOrEntries)) {
    entries = dbOrEntries;
  } else {
    db = dbOrEntries;
    entries = Array.isArray(maybeEntries) ? maybeEntries : [];
  }

  return { db, entries };
}

/* =====================================
   DASHBOARD (FINAL INTELLIGENCE CORE)
===================================== */

export async function getDashboard(dbOrEntries, maybeEntries) {
  const { db, entries } = normalizeArgs(dbOrEntries, maybeEntries);

  /* ---------- Core Finance ---------- */

  const { revenue, expense, profit } = getProfit(entries);
  const cash = getCashBalance(entries);

  /* ---------- Intelligence (Parallel) ---------- */

  const [cashFlow, alerts, decisions, sales] = await Promise.all([
    Promise.resolve(
      safeExecute(() => analyzeCashFlow(entries), DEFAULT_CASHFLOW, "CashFlow")
    ),
    Promise.resolve(
      safeExecute(() => generateAlerts({ cash, revenue, expense }), [], "Alerts")
    ),
    Promise.resolve(
      safeExecute(
        () => generateDecisions({ cash, revenue, expense }),
        [],
        "Decisions"
      )
    ),
    loadSalesSafe(db)
  ]);

  /* ---------- Margin ---------- */

  const margin = safeExecute(
    () => generateMarginInsights({ entries, sales }),
    DEFAULT_MARGIN,
    "Margin"
  );

  /* ---------- Output ---------- */

  return {
    revenue,
    expense,
    profit,
    cash,

    cashFlow,
    alerts,
    decisions,

    margin
  };
}
