// -------------------------------------
// STOCK BALANCE SERVICE (FINAL FULL)
// -------------------------------------

export class StockBalanceService {
  constructor(balanceRepo) {
    this.balanceRepo = balanceRepo;
  }

  // -------------------------------------
  // INCREASE STOCK
  // -------------------------------------
  async increase(db, productId, qty) {
    if (!productId) throw new Error("productId required");
    if (!qty || qty <= 0) throw new Error("qty must be > 0");

    return new Promise((resolve, reject) => {
      try {
        const tx = db.transaction(["stock_balance"], "readwrite");
        const store = tx.objectStore("stock_balance");

        const req = store.get(productId);

        req.onsuccess = () => {
          const current = req.result;
          const currentQty = Number(current?.quantity || 0);

          store.put({
            id: productId,
            productId,
            quantity: currentQty + qty,
            updatedAt: Date.now()
          });
        };

        req.onerror = () => reject(req.error);

        tx.oncomplete = () => resolve(true);
        tx.onerror = () => reject(tx.error);
        tx.onabort = () => reject(tx.error);

      } catch (err) {
        reject(err);
      }
    });
  }

  // -------------------------------------
  // 🔥 DECREASE STOCK (CRITICAL)
  // -------------------------------------
  async decrease(db, productId, qty) {
    if (!productId) throw new Error("productId required");
    if (!qty || qty <= 0) throw new Error("qty must be > 0");

    return new Promise((resolve, reject) => {
      try {
        const tx = db.transaction(["stock_balance"], "readwrite");
        const store = tx.objectStore("stock_balance");

        const req = store.get(productId);

        req.onsuccess = () => {
          const current = req.result;
          const currentQty = Number(current?.quantity || 0);

          const newQty = currentQty - qty;

          if (newQty < 0) {
            tx.abort();
            return reject(new Error("Stock cannot be negative"));
          }

          store.put({
            id: productId,
            productId,
            quantity: newQty,
            updatedAt: Date.now()
          });
        };

        req.onerror = () => reject(req.error);

        tx.oncomplete = () => resolve(true);
        tx.onerror = () => reject(tx.error);
        tx.onabort = () => reject(tx.error);

      } catch (err) {
        reject(err);
      }
    });
  }
}
