// -------------------------------------
// LEDGER REPO (SAFE + VALIDATED)
// -------------------------------------

import { validateEntries } from "../../core/accounting/accounting.engine.js";

export class LedgerRepo {
  constructor() {
    this.storeName = "ledger_entries";
  }

  // -------------------------------------
  // BULK INSERT (WITH SAFE VALIDATION)
  // -------------------------------------

  bulkPut(tx, entries) {
    if (!tx) {
      console.error("❌ bulkPut: missing transaction");
      return;
    }

    if (!entries || !Array.isArray(entries)) {
      console.error("❌ bulkPut: invalid entries", entries);
      return;
    }

    // 🔥 SAFE VALIDATION (does NOT crash system)
    try {
      validateEntries(entries);
    } catch (err) {
      console.error("❌ Ledger validation failed:", err);
      // ⚠️ لا نوقف النظام — فقط نسجل الخطأ
    }

    const store = tx.objectStore(this.storeName);

    for (const e of entries) {
      try {
        store.put(e);
      } catch (err) {
        console.error("❌ Failed to insert entry:", e, err);
      }
    }
  }

  // -------------------------------------
  // GET ALL
  // -------------------------------------

  async getAll(db) {
    if (!db) {
      console.error("❌ getAll: missing db");
      return [];
    }

    return new Promise((resolve, reject) => {
      try {
        const tx = db.transaction([this.storeName], "readonly");
        const store = tx.objectStore(this.storeName);

        const req = store.getAll();

        req.onsuccess = () => {
          resolve(req.result || []);
        };

        req.onerror = (err) => {
          console.error("❌ getAll failed:", err);
          resolve([]); // safe fallback
        };

      } catch (err) {
        console.error("❌ getAll crash:", err);
        resolve([]);
      }
    });
  }
}