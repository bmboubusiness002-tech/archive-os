// -------------------------------------
// IndexedDB Config (FINAL STABLE FIXED)
// -------------------------------------

const DB_NAME = "pos_erp_db";

// 🔥 bump لإجبار إنشاء customers
const DB_VERSION = 11;

let dbInstance = null;

// -------------------------------------
// FULL STORE MAP
// -------------------------------------

const STORES = [
  "ledger_entries",
  "sales",
  "stock_movements",
  "products",
  "expenses",

  "stock_balance",

  "repairs",
  "receipts",

  // 🔥 NEW
  "customers",

  "decision_logs",

  "adaptive_profile",
  "system_memory"
];

// -------------------------------------

export function openDB() {
  if (dbInstance) return Promise.resolve(dbInstance);

  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onupgradeneeded = (event) => {
      const db = event.target.result;

      console.warn("🛠 DB Upgrade running");

      for (const name of STORES) {
        if (!db.objectStoreNames.contains(name)) {
          db.createObjectStore(name, { keyPath: "id" });
          console.log("➕ Created store:", name);
        }
      }

      console.log("✅ DB Schema Ready");
    };

    request.onsuccess = () => {
      dbInstance = request.result;

      dbInstance.onclose = () => {
        dbInstance = null;
      };

      console.log("📦 DB Connected");

      resolve(dbInstance);
    };

    request.onerror = () => reject(request.error);
  });
}

// -------------------------------------

export function withTransaction(db, storeNames, callback) {
  return new Promise((resolve, reject) => {
    try {
      const tx = db.transaction(storeNames, "readwrite");

      tx.oncomplete = () => resolve(true);
      tx.onerror = () => reject(tx.error);

      callback(db);

    } catch (err) {
      reject(err);
    }
  });
}

// -------------------------------------

export function resetDB() {
  return new Promise((resolve, reject) => {
    const request = indexedDB.deleteDatabase(DB_NAME);

    request.onsuccess = () => {
      dbInstance = null;
      resolve(true);
    };

    request.onerror = () => reject(request.error);
  });
}
