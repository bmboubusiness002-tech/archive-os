// -------------------------------------
// ACCOUNTING ENGINE (DOUBLE ENTRY VALIDATION)
// -------------------------------------

import { COA } from "./chartOfAccounts.js";

// -------------------------------------

export function validateEntries(entries = []) {
  if (!entries.length) {
    throw new Error("No ledger entries");
  }

  let totalDebit = 0;
  let totalCredit = 0;

  for (const e of entries) {
    if (!e.debitAccount || !e.creditAccount) {
      throw new Error("Missing account");
    }

    if (!COA[e.debitAccount]) {
      throw new Error(`Invalid debit account: ${e.debitAccount}`);
    }

    if (!COA[e.creditAccount]) {
      throw new Error(`Invalid credit account: ${e.creditAccount}`);
    }

    const amount = Number(e.amount || 0);

    if (amount <= 0) {
      throw new Error("Invalid amount");
    }

    totalDebit += amount;
    totalCredit += amount;
  }

  // -------------------------------------
  // DOUBLE ENTRY RULE
  // -------------------------------------

  if (totalDebit !== totalCredit) {
    throw new Error("Ledger not balanced (Dr ≠ Cr)");
  }

  return true;
}
