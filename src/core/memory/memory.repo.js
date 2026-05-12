// -------------------------------------
// MEMORY REPO (IndexedDB Layer)
// -------------------------------------

import { openDB } from "../../infra/db/db.js";

const STORE = "system_memory";

export async function saveMemory(snapshot) {
  const db = await openDB();

  const tx = db.transaction(STORE, "readwrite");
  const store = tx.objectStore(STORE);

  const record = {
    id: Date.now(),
    ...snapshot
  };

  await store.add(record);
  await tx.done;

  return record;
}

export async function getMemory(limit = 50) {
  const db = await openDB();

  const tx = db.transaction(STORE, "readonly");
  const store = tx.objectStore(STORE);

  const all = await store.getAll();

  return all
    .sort((a, b) => b.id - a.id)
    .slice(0, limit);
}

export async function clearMemory() {
  const db = await openDB();

  const tx = db.transaction(STORE, "readwrite");
  const store = tx.objectStore(STORE);

  await store.clear();
  await tx.done;
}
