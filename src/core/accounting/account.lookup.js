// -------------------------------------
// ACCOUNT LOOKUP (ID + FALLBACK STRING)
// -------------------------------------

import { AccountRepo } from "../../domain/account/account.repo.js";

let cache = null;

// -------------------------------------

async function loadMap() {
  if (cache) return cache;

  const repo = new AccountRepo();
  const accounts = await repo.getAll();

  const byId = {};
  const byCode = {};

  for (const a of accounts) {
    byId[a.id] = a;
    byCode[a.code] = a;
  }

  cache = { byId, byCode };
  return cache;
}

// -------------------------------------

export async function resolveAccount(entry, side) {
  const map = await loadMap();

  const idKey = side === "debit"
    ? entry.debitAccountId
    : entry.creditAccountId;

  const strKey = side === "debit"
    ? entry.debitAccount
    : entry.creditAccount;

  // 🔥 أولًا: ID
  if (idKey && map.byId[idKey]) {
    return map.byId[idKey];
  }

  // 🔥 fallback: string
  if (strKey && map.byCode[strKey]) {
    return map.byCode[strKey];
  }

  return null;
}
