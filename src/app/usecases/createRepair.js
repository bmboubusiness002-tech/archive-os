import { openDB, withTransaction } from "../../infra/db/db.js"
import { RepairRepo } from "../../domain/repair/repair.repo.js"
import { createRepairOrder } from "../../domain/repair/repair.model.js"
import { StockRepo } from "../../domain/stock/stock.repo.js"
import { LedgerRepo } from "../../domain/ledger/ledger.repo.js"
import { createStockMovement } from "../../domain/stock/stock.model.js"
import { ACCOUNTS, createEntry } from "../../core/ledger/ledger-engine.js"

// 🔥 CONTROL
import { assertStockAvailable } from "../../core/control/control.engine.js"

export async function createRepair(input) {
  const db = await openDB()

  const repairRepo = new RepairRepo()
  const stockRepo = new StockRepo()
  const ledgerRepo = new LedgerRepo()

  const repair = createRepairOrder({
    ...input,
    parts: input.parts || []
  })

  // 🔥 stock map
  const stockBalance = await stockRepo.getBalanceMap(db)

  const movements = []

  // ----------------------
  // 🔥 CONTROL: STOCK
  // ----------------------
  for (const part of repair.parts) {
    assertStockAvailable(stockBalance, part.productId, part.qty)
  }

  // ----------------------
  // Parts consumption
  // ----------------------
  for (const part of repair.parts) {
    movements.push(
      createStockMovement({
        productId: part.productId,
        quantity: -part.qty,
        type: "out",
        referenceId: repair.id,
        referenceType: "repair"
      })
    )
  }

  // ----------------------
  // Ledger
  // ----------------------
  const entries = []

  if (repair.price > 0) {
    entries.push(
      createEntry({
        debitAccount: ACCOUNTS.CASH,
        creditAccount: ACCOUNTS.REVENUE,
        amount: repair.price,
        source: "repair",
        sourceId: repair.id,
        operationId: "repair-" + repair.id
      })
    )
  }

  // ----------------------
  // Transaction
  // ----------------------
  await withTransaction(
    db,
    ["repairs", "stock_movements", "ledger_entries"],
    (tx) => {
      repairRepo.put(tx, repair)
      stockRepo.bulkPut(tx, movements)
      ledgerRepo.bulkPut(tx, entries)
    }
  )

  return {
    status: "success",
    repair,
    entries
  }
}
