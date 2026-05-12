// -------------------------------------
// AUDIT REPO
// -------------------------------------

import { openDB } from "../../infra/db/db.js";

export class AuditRepo {
  async log(entry) {
    const db = await openDB();

    return new Promise(res => {
      const tx = db.transaction(["audit_logs"], "readwrite");
      const store = tx.objectStore("audit_logs");

      store.add({
        id: crypto.randomUUID(),
        ...entry,
        createdAt: Date.now()
      });

      tx.oncomplete = () => res(true);
    });
  }
}
