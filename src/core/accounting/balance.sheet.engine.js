// -------------------------------------
// BALANCE SHEET ENGINE
// -------------------------------------

import { resolveAccount } from "./account.lookup.js";

// -------------------------------------

export async function buildBalanceSheet(entries = []) {
  const assets = {};
  const liabilities = {};
  const equity = {};

  for (const e of entries) {
    const amount = Number(e.amount || 0);

    const debitAcc = await resolveAccount(e, "debit");
    const creditAcc = await resolveAccount(e, "credit");

    // -----------------------------
    // DEBIT SIDE
    // -----------------------------
    if (debitAcc) {
      apply(debitAcc, amount, true);
    }

    // -----------------------------
    // CREDIT SIDE
    // -----------------------------
    if (creditAcc) {
      apply(creditAcc, amount, false);
    }
  }

  // -------------------------------------

  function apply(account, amount, isDebit) {
    const target =
      account.type === "asset"
        ? assets
        : account.type === "liability"
        ? liabilities
        : account.type === "equity"
        ? equity
        : null;

    if (!target) return;

    if (!target[account.name]) {
      target[account.name] = 0;
    }

    // rules
    if (account.type === "asset") {
      target[account.name] += isDebit ? amount : -amount;
    } else {
      // liability + equity
      target[account.name] += isDebit ? -amount : amount;
    }
  }

  // -------------------------------------

  return {
    assets,
    liabilities,
    equity,

    totalAssets: sum(assets),
    totalLiabilities: sum(liabilities),
    totalEquity: sum(equity)
  };
}

// -------------------------------------

function sum(obj) {
  return Object.values(obj).reduce((s, v) => s + v, 0);
}
