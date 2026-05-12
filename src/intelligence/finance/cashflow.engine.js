import { ACCOUNTS } from "../../core/ledger/ledger-engine.js";

export function calculateCashFlow(entries) {
  let cashIn = 0;
  let cashOut = 0;

  for (const e of entries) {
    // Cash debit = money in
    if (e.debitAccount === ACCOUNTS.CASH) {
      cashIn += e.amount;
    }

    // Cash credit = money out
    if (e.creditAccount === ACCOUNTS.CASH) {
      cashOut += e.amount;
    }
  }

  return {
    cashIn,
    cashOut,
    net: cashIn - cashOut
  };
}
