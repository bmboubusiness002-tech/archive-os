// -------------------------------------
// MULTI PAYMENT LEDGER ENGINE (SAFE)
// -------------------------------------

// ❌ REMOVED (causes crash)
// import { ACCOUNTS } from "../core/ledger/ledger-engine.js";

// ✅ TEMP LOCAL ACCOUNTS (SAFE STUB)
const ACCOUNTS = {
  CASH: "CASH",
  ACCOUNTS_RECEIVABLE: "ACCOUNTS_RECEIVABLE",
  REVENUE: "REVENUE"
};

// -------------------------------------

export function buildPaymentEntries({
  payments = [],
  customer = null,
  operationId,
  sourceId,
  createdAt
}) {
  const entries = [];

  for (const p of payments) {
    const amount = Number(p.amount || 0);
    if (!amount || amount <= 0) continue;

    let debitAccount = null;

    // -----------------------------
    // METHOD MAPPING
    // -----------------------------

    if (p.method === "cash") {
      debitAccount = ACCOUNTS.CASH;

    } else if (p.method === "card") {
      // لاحقًا: BANK
      debitAccount = ACCOUNTS.CASH;

    } else if (p.method === "credit") {
      debitAccount = ACCOUNTS.ACCOUNTS_RECEIVABLE;

    } else {
      console.warn("⚠️ Unknown payment method:", p.method);
      continue;
    }

    // -----------------------------
    // ENTRY
    // -----------------------------

    try {
      entries.push({
        id: crypto.randomUUID(),

        type: "PAYMENT",

        debitAccount,
        creditAccount: ACCOUNTS.REVENUE,

        amount,

        customerId: customer?.id || null,
        operationId,

        source: "payment",
        sourceId,

        createdAt
      });

    } catch (err) {
      console.error("❌ Failed to build payment entry:", err);
    }
  }

  return entries;
}
export function createCustomerPayment(opts) { return buildPaymentEntries(opts || {}); }
