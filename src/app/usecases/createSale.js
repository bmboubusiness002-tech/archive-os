// -------------------------------------
// CREATE SALE (V9 FINAL - LOCK + AUDIT + COA)
// -------------------------------------

import { openDB, withTransaction } from "../infra/db/db.js";

import { LedgerRepo } from "../domain/ledger/ledger.repo.js";
import { SaleRepo } from "../domain/sale/sale.repo.js";
import { ProductRepo } from "../domain/product/product.repo.js";

import { StockBalanceRepo } from "../domain/stock/stock.balance.repo.js";
import { StockBalanceService } from "../domain/stock/stock.balance.service.js";

import { resolveAccountId } from "../core/accounting/account.service.js";

import { publish } from "../core/realtime/eventBus.js";
import { EVENTS } from "../core/realtime/events.js";

import { ACCOUNTS } from "../core/ledger/ledger-engine.js";
import { runOrchestrator } from "../core/orchestrator/intelligence.orchestrator.js";

import { createReceipt } from "./createReceipt.js";

// 🔥 NEW
import { isLocked } from "../core/accounting/period.lock.js";
import { logAction } from "../core/audit/audit.service.js";

// -------------------------------------

export async function createSale(input) {
  const {
    items = [],
    customer = null,
    payments = [],
    operationId = null
  } = input;

  // -------------------------------------
  // 🔒 PERIOD LOCK CHECK (NEW)
  // -------------------------------------

  const now = Date.now();

  if (await isLocked(now)) {
    throw new Error("Period is locked");
  }

  // -------------------------------------
  // VALIDATION
  // -------------------------------------

  if (!items.length) {
    throw new Error("No items in sale");
  }

  for (const i of items) {
    if (!i.qty || i.qty <= 0) {
      throw new Error("Invalid quantity");
    }
  }

  // -------------------------------------
  // INIT
  // -------------------------------------

  const db = await openDB();

  const ledgerRepo = new LedgerRepo();
  const saleRepo = new SaleRepo();
  const productRepo = new ProductRepo();

  const balanceRepo = new StockBalanceRepo();
  const balanceService = new StockBalanceService(balanceRepo);

  // -------------------------------------
  // BUILD SALE
  // -------------------------------------

  let total = 0;
  let cogs = 0;

  const enriched = [];

  for (const item of items) {
    const product = await productRepo.getById(db, item.productId);

    if (!product) {
      throw new Error(`Product not found: ${item.productId}`);
    }

    const price = Number(item.price ?? product.selling_price ?? 0);
    const cost = Number(product.cost_price ?? 0);

    total += price * item.qty;
    cogs += cost * item.qty;

    enriched.push({
      productId: item.productId,
      name: product.name,
      qty: item.qty,
      price,
      cost
    });
  }

  const createdAt = now;

  const sale = {
    id: crypto.randomUUID(),
    total,
    cogs,
    profit: total - cogs,
    items: enriched,
    customerId: customer?.id || null,
    operationId,
    createdAt
  };

  // -------------------------------------
  // 🔥 RESOLVE ACCOUNTS
  // -------------------------------------

  const CASH_ID = await resolveAccountId("cash");
  const REVENUE_ID = await resolveAccountId("revenue");
  const COGS_ID = await resolveAccountId("cogs");
  const INVENTORY_ID = await resolveAccountId("inventory");
  const AR_ID = await resolveAccountId("accounts_receivable");

  // -------------------------------------
  // ENTRIES
  // -------------------------------------

  const entries = [];

  for (const p of payments) {
    const amount = Number(p.amount || 0);
    if (!amount) continue;

    let debitAccountId;
    let debitAccount;

    if (p.method === "cash") {
      debitAccountId = CASH_ID;
      debitAccount = ACCOUNTS.CASH;
    } else if (p.method === "card") {
      debitAccountId = CASH_ID;
      debitAccount = ACCOUNTS.CASH;
    } else if (p.method === "credit") {
      debitAccountId = AR_ID;
      debitAccount = ACCOUNTS.ACCOUNTS_RECEIVABLE;
    } else {
      continue;
    }

    entries.push({
      id: crypto.randomUUID(),

      type: "PAYMENT",

      // NEW (COA)
      debitAccountId,
      creditAccountId: REVENUE_ID,

      // OLD (SAFE)
      debitAccount,
      creditAccount: ACCOUNTS.REVENUE,

      amount,

      customerId: customer?.id || null,
      operationId,

      source: "sale",
      sourceId: sale.id,

      createdAt
    });
  }

  // -------------------------------------
  // COGS ENTRY
  // -------------------------------------

  entries.push({
    id: crypto.randomUUID(),

    type: "COGS",

    debitAccountId: COGS_ID,
    creditAccountId: INVENTORY_ID,

    debitAccount: ACCOUNTS.COGS,
    creditAccount: ACCOUNTS.INVENTORY,

    amount: cogs,

    operationId,
    source: "sale",
    sourceId: sale.id,

    createdAt
  });

  // -------------------------------------
  // SAVE
  // -------------------------------------

  await withTransaction(db, ["sales", "ledger_entries"], (tx) => {
    saleRepo.put(tx, sale);
    ledgerRepo.bulkPut(tx, entries);
  });

  // -------------------------------------
  // STOCK UPDATE
  // -------------------------------------

  for (const item of enriched) {
    await balanceService.decrease(db, item.productId, item.qty);
  }

  // -------------------------------------
  // REALTIME
  // -------------------------------------

  publish(EVENTS.SALE_CREATED, { sale });
  publish(EVENTS.STOCK_UPDATED, { items: enriched });
  publish(EVENTS.CASH_UPDATED, { amount: total });

  // -------------------------------------
  // AI
  // -------------------------------------

  try {
    await runOrchestrator();
  } catch (e) {
    console.warn("AI failed:", e);
  }

  // -------------------------------------
  // RECEIPT
  // -------------------------------------

  await createReceipt({
    sale,
    customer,
    payments
  });

  // -------------------------------------
  // 🔍 AUDIT LOG (NEW)
  // -------------------------------------

  await logAction("SALE_CREATED", {
    saleId: sale.id,
    total: sale.total,
    items: sale.items.length,
    customerId: sale.customerId
  });

  return sale;
}
