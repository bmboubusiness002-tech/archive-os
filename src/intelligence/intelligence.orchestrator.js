// -------------------------------------
// CENTRAL ORCHESTRATOR (BRAIN V4)
// -------------------------------------

import { openDB } from "../../infra/db/db.js";

import { LedgerRepo } from "../../domain/ledger/ledger.repo.js";
import { SaleRepo } from "../../domain/sale/sale.repo.js";
import { StockRepo } from "../../domain/stock/stock.repo.js";

import { buildFinancialIntelligence } from "../../intelligence/finance/financial.engine.js";
import { buildInventoryIntelligence } from "../../intelligence/inventory/inventory.engine.js";

import { buildForecast } from "../forecast/forecast.engine.js";

import { runDecisionEngine } from "../decision/decision.engine.js";
import { runStrategyEngine } from "../strategy/strategy.engine.js";

import { buildInsights } from "../intelligence/insight.engine.js";
import { explainActions } from "../explain/explain.engine.js";

import { buildConfidence } from "../confidence/confidence.engine.js";
import { getProfile } from "../learning/learning.engine.js";

// 🧠 MEMORY
import { recordSnapshot } from "../memory/memory.engine.js";

/* ================= LOAD ================= */

async function loadData() {
  const db = await openDB();

  const ledgerRepo = new LedgerRepo();
  const saleRepo = new SaleRepo();
  const stockRepo = new StockRepo();

  const [entries, sales, stockMovements] = await Promise.all([
    ledgerRepo.getAll(db).catch(() => []),
    saleRepo.getAll(db).catch(() => []),
    stockRepo.getAll(db).catch(() => [])
  ]);

  return { entries, sales, stockMovements };
}

/* ================= MAIN ================= */

export async function runOrchestrator() {
  try {
    const { entries, sales, stockMovements } = await loadData();

    /* ================= FINANCE ================= */
    const finance = buildFinancialIntelligence(entries);

    /* ================= INVENTORY ================= */
    const inventory = buildInventoryIntelligence({
      sales,
      stockMovements,
      purchases: []
    });

    /* ================= TIME SERIES ================= */
    const revenueSeries = sales.map(s => s.total || 0);

    /* ================= FORECAST ================= */
    const forecast = buildForecast(revenueSeries);

    /* ================= INSIGHTS ================= */
    const insights = buildInsights({
      forecast: forecast.next || [],
      history: revenueSeries,
      finance
    });

    /* ================= PROFILE ================= */
    const profile = getProfile();

    /* ================= CONFIDENCE ================= */
    const confidence = buildConfidence({
      history: revenueSeries,
      forecast: forecast.next || []
    });

    /* ================= SIGNALS ================= */
    const signals = {
      finance,
      inventory,
      forecast,
      insights,
      profile,
      confidence
    };

    /* ================= DECISION ================= */
    const decisions = runDecisionEngine(signals);

    /* ================= STRATEGY ================= */
    const rawActions = runStrategyEngine(decisions, signals);

    /* ================= EXPLAIN ================= */
    const actions = explainActions(rawActions, insights);

    /* ================= MEMORY (CRITICAL) ================= */
    await recordSnapshot({
      signals,
      decisions,
      actions,
      insights,
      confidence
    });

    /* ================= FINAL ================= */
    return {
      signals,
      decisions,
      actions,
      insights,
      forecast,
      confidence
    };

  } catch (err) {
    console.error("❌ ORCHESTRATOR FAILED:", err);

    return {
      signals: {},
      decisions: [],
      actions: [],
      insights: {},
      forecast: {},
      confidence: { score: 0, level: "UNKNOWN" }
    };
  }
}
