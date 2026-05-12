import { openDB, withTransaction } from "../../infra/db/db.js"
import { ExpenseRepo } from "../../domain/expense/expense.repo.js"
import { createExpense } from "../../domain/expense/expense.model.js"
import { LedgerRepo } from "../../domain/ledger/ledger.repo.js"
import { createEntry, ACCOUNTS } from "../../core/ledger/ledger-engine.js"

export async function createExpenseUseCase(input) {
  const db = await openDB()

  const repo = new ExpenseRepo()
  const ledgerRepo = new LedgerRepo()

  const expense = createExpense(input)

  // Ledger Entry
  const entry = createEntry({
    debitAccount: ACCOUNTS.EXPENSE,
    creditAccount: ACCOUNTS.CASH,
    amount: expense.amount,
    source: "expense",
    sourceId: expense.id,
    operationId: "expense-" + expense.id
  })

  await withTransaction(
    db,
    ["expenses", "ledger_entries"],
    (tx) => {
      repo.put(tx, expense)
      ledgerRepo.bulkPut(tx, [entry])
    }
  )

  return { status: "success", expense }
}
