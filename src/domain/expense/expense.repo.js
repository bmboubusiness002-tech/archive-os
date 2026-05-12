import { BaseRepo } from "../../infra/repos/base.repo.js"

export class ExpenseRepo extends BaseRepo {
  constructor() {
    super("expenses")
  }

  async getAll(db) {
    return new Promise((resolve, reject) => {
      const tx = db.transaction(["expenses"], "readonly")
      const store = tx.objectStore("expenses")

      const req = store.getAll()

      req.onsuccess = () => resolve(req.result)
      req.onerror = () => reject(req.error)
    })
  }
}
