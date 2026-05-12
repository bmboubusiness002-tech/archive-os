// -------------------------------------
// CREATE PURCHASE (FINAL STABLE + COST FIX)
// -------------------------------------

import { openDB, withTransaction } from "../../infra/db/db.js";
import { StockRepo } from "../../domain/stock/stock.repo.js";
import { LedgerRepo } from "../../domain/ledger/ledger.repo.js";
import { ProductRepo } from "../../domain/product/product.repo.js"; // 🔥 NEW
import { createStockMovement } from "../../domain/stock/stock.model.js";
import { ACCOUNTS, createEntry } from "../../core/ledger/ledger-engine.js";
import { StockBalanceRepo } from "../../domain/stock/stock.balance.repo.js";
import { StockBalanceService } from "../../domain/stock/stock.balance.service.js";
import { publish } from "../../core/realtime/eventBus.js";
import { EVENTS } from "../../core/realtime/events.js";

export async function createPurchase(input) {
  const { items = [], operationId } = input;

  // -------------------------------------
  // VALIDATION
  // -------------------------------------
  if (!operationId) throw new Error("operationId required");
  if (!Array.isArray(items) || items.length === 0) {
    throw new Error("items required");
  }

  const db = await openDB();

  const stockRepo = new StockRepo();
  const ledgerRepo = new LedgerRepo();
  const balanceRepo = new StockBalanceRepo();
  const balanceService = new StockBalanceService(balanceRepo);
  const productRepo = new ProductRepo(); // 🔥 NEW

  // -------------------------------------
  // IDEMPOTENCY CHECK
  // -------------------------------------
  const existing = await ledgerRepo.findByOperation(db, operationId);
  if (existing.length > 0) {
    console.warn("⚠️ Duplicate purchase prevented:", operationId);
    return { status: "duplicate", entries: existing };
  }

  // -------------------------------------
  // BUILD DATA
  // -------------------------------------
  let total = 0;

  const movements = items.map(item => {
    const qty = Number(item.qty || 0);
    const cost = Number(item.cost || 0);

    if (!item.productId) throw new Error("productId required");
    if (qty <= 0) throw new Error("qty must be > 0");

    total += cost * qty;

    return createStockMovement({
      id: crypto.randomUUID(),
      productId: item.productId,
      quantity: qty,
      type: "IN",
      referenceId: operationId,
      referenceType: "purchase",
      createdAt: Date.now()
    });
  });

  const entry = createEntry({
    debitAccount: ACCOUNTS.INVENTORY,
    creditAccount: ACCOUNTS.CASH,
    amount: total,
    source: "purchase",
    sourceId: operationId,
    operationId
  });

  // -------------------------------------
  // TRANSACTION (ledger + movements)
  // -------------------------------------
  await withTransaction(
    db,
    ["stock_movements", "ledger_entries"],
    (db) => {
      stockRepo.bulkPut(db, movements);
      ledgerRepo.bulkPut(db, [entry]);
    }
  );

  // -------------------------------------
  // STOCK BALANCE
  // -------------------------------------
  for (const item of items) {
    await balanceService.increase(
      db,
      item.productId,
      Number(item.qty)
    );
  }

  // -------------------------------------
  // 🔥 COST PRICE UPDATE (CRITICAL FIX)
  // -------------------------------------
  for (const item of items) {
    const cost = Number(item.cost || 0);

    if (cost > 0) {
      await productRepo.update(db, item.productId, {
        cost_price: cost,
        updatedAt: Date.now()
      });
    }
  }

  // -------------------------------------
  // EVENTS
  // -------------------------------------
  publish(EVENTS.STOCK_CHANGED);

  return {
    status: "success",
    total,
    items: items.length
  };
}
