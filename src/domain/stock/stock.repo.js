import { BaseRepo } from "../../infra/repos/base.repo.js";

export class StockRepo extends BaseRepo {
  constructor() {
    super("stock_movements");
  }

  async getAll(db) {
    return new Promise((resolve, reject) => {
      const tx = db.transaction(["stock_movements"], "readonly");
      const store = tx.objectStore("stock_movements");

      const req = store.getAll();

      req.onsuccess = () => resolve(req.result || []);
      req.onerror = () => reject(req.error);
    });
  }
}
