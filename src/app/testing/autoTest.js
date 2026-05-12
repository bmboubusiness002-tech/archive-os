// -------------------------------------
// AutoTest v4.2 — Adaptive Human Agent
// -------------------------------------

import { createSale } from "../usecases/createSale.js";
import { createRepair } from "../usecases/createRepair.js";
import { createExpenseUseCase } from "../usecases/createExpense.js";

import { ProductService } from "../../domain/product/product.service.js";
import { openDB } from "../../infra/db/db.js";
import { LedgerRepo } from "../../domain/ledger/ledger.repo.js";
import { getDashboard } from "../../domain/reports/reports.service.js";
import { StockRepo } from "../../domain/stock/stock.repo.js";

// -------------------------------------
function rand(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function pick(arr) {
  return arr[rand(0, arr.length - 1)];
}

function now() {
  return new Date().toISOString();
}

// -------------------------------------
// 🧠 Adaptive Behavior Engine
// -------------------------------------
function createBehaviorProfile() {
  return {
    mode: pick(["greedy", "cautious", "random"]),
    success: 0,
    fail: 0
  };
}

function adaptBehavior(profile) {
  const total = profile.success + profile.fail;

  if (total < 5) return profile;

  const rate = profile.success / total;

  if (rate < 0.3) profile.mode = "cautious";
  if (rate > 0.7) profile.mode = "greedy";

  return profile;
}

// -------------------------------------
// MAIN
// -------------------------------------
export async function runAutoTest() {
  console.log("🧠 AutoTest v4.2 START (Adaptive Agent)");

  const report = {
    startedAt: now(),
    steps: [],
    errors: [],
    warnings: [],
    behaviorLog: [],
    metrics: {},
    diagnostics: {}
  };

  try {
    const productService = new ProductService();
    const products = await productService.getAll();

    if (!products.length) {
      throw new Error("No products found");
    }

    const db = await openDB();
    const stockRepo = new StockRepo();

    let stockMap = await stockRepo.getBalanceMap(db);

    let behavior = createBehaviorProfile();
    report.behaviorLog.push(`Initial behavior: ${behavior.mode}`);

    // -------------------------------------
    // 1) HUMAN SALES (Adaptive)
    // -------------------------------------
    for (let i = 0; i < 15; i++) {
      try {
        behavior = adaptBehavior(behavior);

        const available = products.filter(p => (stockMap[p.id] || 0) > 0);

        if (!available.length) {
          report.warnings.push({
            type: "no_stock_global",
            msg: "No products left to sell"
          });
          break;
        }

        const p = pick(available);
        const stock = stockMap[p.id];

        let price = p.selling_price;

        if (behavior.mode === "greedy") price *= 1.2;
        if (behavior.mode === "cautious") price *= 0.9;

        const qty = rand(1, Math.min(3, stock));

        await createSale({
          items: [{ productId: p.id, qty, price }],
          operationId: "human-sale-" + Date.now() + "-" + i
        });

        // 🔥 update stock locally
        stockMap[p.id] -= qty;

        behavior.success++;
        report.steps.push("sale_ok");

      } catch (e) {
        behavior.fail++;

        report.warnings.push({
          type: "sale_fail",
          msg: e.message
        });
      }
    }

    // -------------------------------------
    // 2) INVALID SCENARIO
    // -------------------------------------
    try {
      await createSale({
        items: [{ productId: "invalid", qty: 1 }],
        operationId: "invalid-sale"
      });

      report.errors.push({
        type: "invalid_product_allowed"
      });

    } catch {
      report.steps.push("invalid_blocked");
    }

    // -------------------------------------
    // 3) REPAIRS
    // -------------------------------------
    for (let i = 0; i < 5; i++) {
      try {
        const p = pick(products);

        await createRepair({
          device: "Device " + i,
          issue: "Test",
          price: rand(50, 200),
          parts: [{ productId: p.id, qty: 1, cost: p.cost_price }],
          laborFee: rand(10, 50)
        });

        report.steps.push("repair_ok");

      } catch (e) {
        report.warnings.push({
          type: "repair_blocked",
          msg: e.message
        });
      }
    }

    // -------------------------------------
    // 4) EXPENSES (SAFE)
    // -------------------------------------
    for (let i = 0; i < 5; i++) {
      try {
        await createExpenseUseCase({
          amount: rand(-50, 300),
          category: "auto",
          note: "test"
        });

        report.steps.push("expense_ok");

      } catch (e) {
        report.warnings.push({
          type: "invalid_expense",
          msg: e.message
        });
      }
    }

    // -------------------------------------
    // 5) SYSTEM READ
    // -------------------------------------
    const ledgerRepo = new LedgerRepo();
    const entries = await ledgerRepo.getAll(db);
    const dashboard = getDashboard(entries);

    report.metrics = dashboard;

    // -------------------------------------
    // 6) THINK
    // -------------------------------------
    if (dashboard.profit < 0) {
      report.warnings.push({ type: "loss_detected" });
    }

    if (dashboard.cash < 100) {
      report.warnings.push({ type: "cash_low" });
    }

    report.diagnostics.behavior = behavior;
    report.finishedAt = now();

    console.log("🧠 FINAL REPORT:", report);

    return report;

  } catch (e) {
    console.error("❌ CRITICAL:", e);

    report.errors.push({
      type: "system_crash",
      msg: e.message,
      stack: e.stack
    });

    return report; // 🔥 لا تفقد البيانات
  }
}
