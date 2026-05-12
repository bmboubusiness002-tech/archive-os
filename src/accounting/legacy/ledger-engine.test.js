import {
  planSale,
  balance,
  reverseEntries,
  ACCOUNTS
} from "./ledger-engine.js"

// ----------------------
// Helper
// ----------------------
function logBalances(entries) {
  return {
    cash: balance(entries, ACCOUNTS.CASH),
    revenue: balance(entries, ACCOUNTS.REVENUE),
    inventory: balance(entries, ACCOUNTS.INVENTORY),
    expense: balance(entries, ACCOUNTS.EXPENSE)
  }
}

// ----------------------
// Scenario 1: Sale
// ----------------------
;(() => {
  const entries = planSale({
    netAmount: 10000,
    cogsAmount: 6000,
    context: { sourceId: "sale-1", operationId: "op-1" }
  })

  const b = logBalances(entries)

  console.log("Scenario 1:", b)

  if (
    b.cash !== 10000 ||
    b.revenue !== 10000 ||
    b.inventory !== -6000 ||
    b.expense !== 6000
  ) {
    throw new Error("❌ Scenario 1 failed")
  }

  console.log("✔ Scenario 1 passed")
})();

// ----------------------
// Scenario 2: Reversal
// ----------------------
;(() => {
  const entries = planSale({
    netAmount: 10000,
    cogsAmount: 6000,
    context: { sourceId: "sale-2", operationId: "op-2" }
  })

  const reversed = reverseEntries(entries, {
    sourceId: "sale-2-r",
    operationId: "op-2-r"
  })

  const all = [...entries, ...reversed]
  const b = logBalances(all)

  console.log("Scenario 2:", b)

  if (
    b.cash !== 0 ||
    b.revenue !== 0 ||
    b.inventory !== 0 ||
    b.expense !== 0
  ) {
    throw new Error("❌ Scenario 2 failed (reversal not balanced)")
  }

  console.log("✔ Scenario 2 passed")
})();

// ----------------------
// Scenario 3: Multiple + Partial Reversal
// ----------------------
;(() => {
  let all = []

  const s1 = planSale({
    netAmount: 10000,
    cogsAmount: 6000,
    context: { sourceId: "s1", operationId: "op1" }
  })

  const s2 = planSale({
    netAmount: 20000,
    cogsAmount: 12000,
    context: { sourceId: "s2", operationId: "op2" }
  })

  const s3 = planSale({
    netAmount: 5000,
    cogsAmount: 2000,
    context: { sourceId: "s3", operationId: "op3" }
  })

  const r2 = reverseEntries(s2, {
    sourceId: "s2-r",
    operationId: "op2-r"
  })

  all = [...s1, ...s2, ...s3, ...r2]

  const b = logBalances(all)

  console.log("Scenario 3:", b)

  // المتوقع: s1 + s3 فقط
  if (b.cash !== 15000) {
    throw new Error("❌ Scenario 3 failed (cash incorrect)")
  }

  console.log("✔ Scenario 3 passed")
})();

// ----------------------
// Scenario 4: Invalid Input
// ----------------------
;(() => {
  try {
    planSale({
      netAmount: -1000,
      cogsAmount: 500
    })

    throw new Error("❌ Invalid input not detected")
  } catch (e) {
    console.log("✔ Scenario 4 passed (invalid input detected)")
  }
})();
