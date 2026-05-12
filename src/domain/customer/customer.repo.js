import { BaseRepo } from "../../infra/repos/base.repo.js";

export class CustomerRepo extends BaseRepo {
  constructor() {
    super("customers");
  }

  async getAll(db) {
    return new Promise((resolve, reject) => {
      const tx = db.transaction(["customers"], "readonly");
      const store = tx.objectStore("customers");

      const req = store.getAll();

      req.onsuccess = () => resolve(req.result || []);
      req.onerror = () => reject(req.error);
    });
  }

  async getById(db, id) {
    return new Promise((resolve, reject) => {
      const tx = db.transaction(["customers"], "readonly");
      const store = tx.objectStore("customers");

      const req = store.get(id);

      req.onsuccess = () => resolve(req.result);
      req.onerror = () => reject(req.error);
    });
  }
}
