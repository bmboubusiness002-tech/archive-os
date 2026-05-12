import { openDB, withTransaction } from "../../infra/db/db.js";
import { LedgerRepo } from "../../domain/ledger/ledger.repo.js";
import { SaleRepo } from "../../domain/sale/sale.repo.js";
import { StockRepo } from "../../domain/stock/stock.repo.js";
import { StockService } from "../../domain/stock/stock.service.js";
import { planSale } from "../../core/ledger/ledger-engine.js";

import { StockBalanceRepo } from "../../domain/stock/stock.balance.repo.js";
import { StockBalanceService } from "../../domain/stock/stock.balance.service.js";

// 🧠 NEW — Pricing Learning
import { updateProductMemory } from "../../intelligence/pricing/pricingMemory.repo.js";

export async function createSale(input) {
  const { items, total, cogs, operationId } = input;

  if (!operationId) throw new Error("operationId required");

  const db = await openDB();

  const ledgerRepo = new LedgerRepo();
  const saleRepo = new SaleRepo();
  const stockRepo = new StockRepo();
  const stockService = new StockService(stockRepo);

  const balanceRepo = new StockBalanceRepo();
  const balanceService = new StockBalanceService(balanceRepo);

  // 🛡️ Idempotency check
  const existing = await ledgerRepo.findByOperation(db, operationId);
  if (existing.length > 0) {
    return { status: "duplicate", entries: existing };
  }

  // 🔥 Stock Balance Update (pre-check + mutation)
  const balances = [];
  for (const item of items) {
    const updated = await balanceService.decrease(
      db,
      item.productId,
      item.qty
    );
    balances.push(updated);
  }

  // 🧾 Sale entity
  const sale = {
    id: crypto.randomUUID(),
    date: Date.now(),
    total,
    status: "completed",
    operationId
  };

  // 📒 Ledger entries
  const entries = planSale({
    netAmount: total,
    cogsAmount: cogs,
    context: {
      source: "sale",
      sourceId: sale.id,
      operationId
    }
  });

  // 📦 Stock movements (history)
  const movements = stockService.createSaleMovements(items, sale.id);

  // 💾 Transaction (atomic)
  await withTransaction(
    db,
    ["sales", "ledger_entries", "stock_movements", "stock_balance"],
    (tx) => {
      saleRepo.put(tx, sale);
      ledgerRepo.bulkPut(tx, entries);
      stockRepo.bulkPut(tx, movements);

      balances.forEach((b) => {
        balanceRepo.put(tx, b);
      });
    }
  );

  // 🧠 🔥 LEARNING LAYER (POST-COMMIT SAFE)
  try {
    for (const item of items) {
      // defensive: ensure price exists
      if (!item.productId || !item.price) continue;

      updateProductMemory(item.productId, {
        success: true,
        price: item.price
      });
    }
  } catch (e) {
    console.warn("Pricing learning failed (non-blocking):", e);
  }

  return { status: "success", sale, entries };
}
