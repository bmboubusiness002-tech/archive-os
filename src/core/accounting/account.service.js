// -------------------------------------
// ACCOUNT SERVICE (RESOLVE IDS)
// -------------------------------------

import { AccountRepo } from "../../domain/account/account.repo.js";

const cache = new Map();

// -------------------------------------

export async function resolveAccountId(key) {
  if (cache.has(key)) return cache.get(key);

  const repo = new AccountRepo();
  const accounts = await repo.getAll();

  const found = accounts.find(a => a.code === key);

  if (!found) {
    throw new Error(`Account not found: ${key}`);
  }

  cache.set(key, found.id);

  return found.id;
}
