// -------------------------------------
// BACKUP ENGINE (EXPORT + IMPORT)
// -------------------------------------

import { openDB, withTransaction } from "../../infra/db/db.js";

// -------------------------------------
// EXPORT
// -------------------------------------
export async function exportBackup() {
  const db = await openDB();

  const tables = [
    "products",
    "sales",
    "ledger_entries",
    "stock_movements",
    "repairs",
    "expenses"
  ];

  const backup = {};

  for (const table of tables) {
    backup[table] = await getAll(db, table);
  }

  const blob = new Blob(
    [JSON.stringify(backup, null, 2)],
    { type: "application/json" }
  );

  const url = URL.createObjectURL(blob);

  const a = document.createElement("a");
  a.href = url;
  a.download = `backup-${Date.now()}.json`;
  a.click();
}

// -------------------------------------
// IMPORT
// -------------------------------------
export async function importBackup(file) {
  const text = await file.text();
  const data = JSON.parse(text);

  const db = await openDB();

  await withTransaction(
    db,
    Object.keys(data),
    (tx) => {
      for (const table in data) {
        const store = tx.objectStore(table);

        for (const item of data[table]) {
          store.put(item);
        }
      }
    }
  );

  alert("✅ Backup restored");
}

// -------------------------------------
function getAll(db, storeName) {
  return new Promise((resolve, reject) => {
    const tx = db.transaction([storeName], "readonly");
    const store = tx.objectStore(storeName);

    const req = store.getAll();

    req.onsuccess = () => resolve(req.result || []);
    req.onerror = () => reject(req.error);
  });
}
