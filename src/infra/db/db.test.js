import { openDB, withTransaction } from "./db.js"
import { LedgerRepo } from "../../domain/ledger/ledger.repo.js"
import { planSale } from "../../core/ledger/ledger-engine.js"

;(async () => {
  const db = await openDB()
  const ledgerRepo = new LedgerRepo()

  const entries = planSale({
    netAmount: 10000,
    cogsAmount: 6000,
    context: {
      sourceId: "test-db",
      operationId: "op-db"
    }
  })

  await withTransaction(
    db,
    ["ledger_entries"],
    (tx) => {
      ledgerRepo.bulkPut(tx, entries)
    }
  )

  const result = await ledgerRepo.findByOperation(db, "op-db")

  console.log("DB Test:", result.length)

})()
