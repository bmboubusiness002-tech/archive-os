import { BaseRepo } from "../../infra/repos/base.repo.js";

export class ReceiptRepo extends BaseRepo {
  constructor() {
    super("receipts");
  }

  async getAll(db) {
    return new Promise((resolve, reject) => {
      const tx = db.transaction(["receipts"], "readonly");
      const store = tx.objectStore("receipts");

      const req = store.getAll();

      req.onsuccess = () => resolve(req.result || []);
      req.onerror = () => reject(req.error);
    });
  }
}
