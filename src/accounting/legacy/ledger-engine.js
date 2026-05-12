// -------------------------------------
// Ledger Engine (Clean Production Version)
// -------------------------------------

// ----------------------
// ID Generator (Browser + Node safe)
// ----------------------
function generateId() {
  if (typeof crypto !== "undefined" && crypto.randomUUID) {
    return crypto.randomUUID()
  }

  return "id-" + Math.random().toString(36).substring(2) + Date.now()
}

// ----------------------
// Accounts
// ----------------------
export const ACCOUNTS = {
  CASH: "cash",
  INVENTORY: "inventory",
  REVENUE: "revenue",
  EXPENSE: "expense",
  RECEIVABLE: "receivable"
}

// ----------------------
// Account Types
// ----------------------
export const ACCOUNT_TYPES = {
  [ACCOUNTS.CASH]: "asset",
  [ACCOUNTS.INVENTORY]: "asset",
  [ACCOUNTS.REVENUE]: "income",
  [ACCOUNTS.EXPENSE]: "expense",
  [ACCOUNTS.RECEIVABLE]: "asset"
}

// ----------------------
// Entry Factory
// ----------------------
export function createEntry(base) {
  return {
    id: generateId(),
    debitAccount: base.debitAccount,
    creditAccount: base.creditAccount,
    amount: base.amount,
    source: base.source,
    sourceId: base.sourceId,
    operationId: base.operationId,
    createdAt: base.createdAt || Date.now(),
    meta: base.meta || {}
  }
}

// ----------------------
// Validate Entry
// ----------------------
export function validateEntry(e) {
  if (!e) throw new Error("Entry required")

  if (!e.id) throw new Error("Missing id")

  if (!e.debitAccount || !e.creditAccount)
    throw new Error("Accounts required")

  if (e.debitAccount === e.creditAccount)
    throw new Error("Same account")

  if (!ACCOUNT_TYPES[e.debitAccount] || !ACCOUNT_TYPES[e.creditAccount])
    throw new Error("Unknown account")

  if (!Number.isInteger(e.amount) || e.amount <= 0)
    throw new Error("Invalid amount")

  return true
}

// ----------------------
// Validate Batch
// ----------------------
export function validateEntries(entries) {
  if (!Array.isArray(entries) || entries.length === 0)
    throw new Error("Entries required")

  for (const e of entries) {
    validateEntry(e)
  }

  // safeguard (future-proof)
  let debit = 0
  let credit = 0

  for (const e of entries) {
    debit += e.amount
    credit += e.amount
  }

  if (debit !== credit) {
    throw new Error("Unbalanced batch")
  }

  return true
}

// ----------------------
// Plan Sale (Balanced)
// ----------------------
export function planSale({ netAmount, cogsAmount, items = [], context = {} }) {
  if (!Number.isInteger(netAmount) || netAmount <= 0)
    throw new Error("Invalid netAmount")

  if (!Number.isInteger(cogsAmount) || cogsAmount < 0)
    throw new Error("Invalid cogsAmount")

  const base = {
    source: context.source || "sale",
    sourceId: context.sourceId,
    operationId: context.operationId,
    createdAt: context.createdAt || Date.now()
  }

  const entries = []

  // 1) Cash → Revenue
  entries.push(createEntry({
    ...base,
    debitAccount: ACCOUNTS.CASH,
    creditAccount: ACCOUNTS.REVENUE,
    amount: netAmount
  }))

  // 2) COGS (Expense → Inventory)
  if (cogsAmount > 0) {
    if (items.length > 0) {
      for (const item of items) {
        if (!Number.isInteger(item.cogsAmount))
          throw new Error("Invalid item cogsAmount")

        entries.push(createEntry({
          ...base,
          debitAccount: ACCOUNTS.EXPENSE,
          creditAccount: ACCOUNTS.INVENTORY,
          amount: item.cogsAmount,
          meta: {
            productId: item.productId,
            qty: item.qty
          }
        }))
      }
    } else {
      entries.push(createEntry({
        ...base,
        debitAccount: ACCOUNTS.EXPENSE,
        creditAccount: ACCOUNTS.INVENTORY,
        amount: cogsAmount
      }))
    }
  }

  validateEntries(entries)
  return entries
}

// ----------------------
// Balance (Type-aware)
// ----------------------
export function balance(entries, accountId) {
  const type = ACCOUNT_TYPES[accountId]
  if (!type) throw new Error("Unknown account")

  let bal = 0

  for (const e of entries) {
    if (e.debitAccount === accountId) {
      bal += (type === "asset" || type === "expense")
        ? e.amount
        : -e.amount
    }

    if (e.creditAccount === accountId) {
      bal += (type === "asset" || type === "expense")
        ? -e.amount
        : e.amount
    }
  }

  return bal
}

// ----------------------
// Reverse Entry
// ----------------------
export function reverseEntry(entry, context = {}) {
  validateEntry(entry)

  return createEntry({
    debitAccount: entry.creditAccount,
    creditAccount: entry.debitAccount,
    amount: entry.amount,
    source: context.source || "reversal",
    sourceId: context.sourceId,
    operationId: context.operationId,
    createdAt: Date.now(),
    meta: {
      reversedFrom: entry.id
    }
  })
}

// ----------------------
// Reverse Batch
// ----------------------
export function reverseEntries(entries, context = {}) {
  return entries.map(e => reverseEntry(e, context))
}
