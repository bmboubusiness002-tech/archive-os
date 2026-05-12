import { BaseRepo } from "../../infra/repos/base.repo.js"

export class RepairRepo extends BaseRepo {
  constructor() {
    super("repairs")
  }

  async getAll(db) {
    return new Promise((resolve, reject) => {
      const tx = db.transaction(["repairs"], "readonly")
      const store = tx.objectStore("repairs")

      const req = store.getAll()

      req.onsuccess = () => resolve(req.result)
      req.onerror = () => reject(req.error)
    })
  }
}
