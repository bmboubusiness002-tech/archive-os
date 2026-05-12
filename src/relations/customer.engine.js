// -------------------------------------
// CUSTOMER ENGINE (LEDGER-BASED SAFE)
// -------------------------------------

import { ACCOUNTS } from "../accounting/chartOfAccounts.js";

// -------------------------------------

export function buildCustomerState(entries = []) {
  if (!Array.isArray(entries)) {
    console.error("❌ buildCustomerState: entries must be array");
    return emptyState();
  }

  let totalSpent = 0;
  let totalPaid = 0;
  let debt = 0;

  for (const e of entries) {
    if (!e) continue;

    const amount = Number(e.amount) || 0;
    if (amount <= 0) continue;

    // -----------------------------
    // Revenue (customer spent)
    // -----------------------------
    if (e.creditAccount === ACCOUNTS.REVENUE) {
      totalSpent += amount;
    }

    // -----------------------------
    // Cash payments
    // -----------------------------
    if (e.debitAccount === ACCOUNTS.CASH) {
      totalPaid += amount;
    }

    // -----------------------------
    // Accounts Receivable (debt)
    // -----------------------------
    if (e.debitAccount === ACCOUNTS.ACCOUNTS_RECEIVABLE) {
      debt += amount;
    }

    if (e.creditAccount === ACCOUNTS.ACCOUNTS_RECEIVABLE) {
      debt -= amount;
    }
  }

  const balance = totalSpent - totalPaid;

  return {
    totalSpent,
    totalPaid,
    debt,
    balance,
    status: classifyCustomer({ totalSpent, debt })
  };
}

// -------------------------------------

function classifyCustomer({ totalSpent = 0, debt = 0 }) {
  if (debt > 100000) return "RISKY";
  if (totalSpent > 500000) return "VIP";
  if (totalSpent > 0) return "ACTIVE";
  return "NEW";
}

// -------------------------------------

function emptyState() {
  return {
    totalSpent: 0,
    totalPaid: 0,
    debt: 0,
    balance: 0,
    status: "NEW"
  };
}