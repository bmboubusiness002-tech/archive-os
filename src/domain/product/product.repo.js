// -------------------------------------
// PRODUCT REPO (FINAL FULL)
// -------------------------------------

import { BaseRepo } from "../../infra/repos/base.repo.js";

export class ProductRepo extends BaseRepo {
  constructor() {
    super("products");
  }

  // -------------------------------------
  // GET BY ID
  // -------------------------------------
  async getById(db, id) {
    return new Promise((resolve, reject) => {
      try {
        const tx = db.transaction(["products"], "readonly");
        const store = tx.objectStore("products");

        const req = store.get(id);

        req.onsuccess = () => resolve(req.result || null);
        req.onerror = () => reject(req.error);

      } catch (err) {
        reject(err);
      }
    });
  }

  // -------------------------------------
  // GET ALL
  // -------------------------------------
  async getAll(db) {
    return new Promise((resolve, reject) => {
      try {
        const tx = db.transaction(["products"], "readonly");
        const store = tx.objectStore("products");

        const req = store.getAll();

        req.onsuccess = () => resolve(req.result || []);
        req.onerror = () => reject(req.error);

      } catch (err) {
        reject(err);
      }
    });
  }

  // -------------------------------------
  // EXISTS
  // -------------------------------------
  async exists(db, id) {
    const p = await this.getById(db, id);
    return !!p;
  }

  // -------------------------------------
  // 🔥 UPDATE (CRITICAL FIX)
  // -------------------------------------
  async update(db, productId, updates = {}) {
    if (!productId) throw new Error("productId required");

    return new Promise((resolve, reject) => {
      try {
        const tx = db.transaction(["products"], "readwrite");
        const store = tx.objectStore("products");

        const getReq = store.get(productId);

        getReq.onsuccess = () => {
          const existing = getReq.result;

          if (!existing) {
            tx.abort();
            return reject(new Error("Product not found"));
          }

          const updated = {
            ...existing,
            ...updates,
            updatedAt: Date.now()
          };

          store.put(updated);
        };

        getReq.onerror = () => reject(getReq.error);

        tx.oncomplete = () => resolve(updatedSafe(updates));
        tx.onerror = () => reject(tx.error);
        tx.onabort = () => reject(tx.error);

      } catch (err) {
        reject(err);
      }
    });
  }
}

// -------------------------------------
// INTERNAL SAFE RETURN (optional)
// -------------------------------------
function updatedSafe(updates) {
  return {
    success: true,
    updatedFields: Object.keys(updates || {})
  };
}
