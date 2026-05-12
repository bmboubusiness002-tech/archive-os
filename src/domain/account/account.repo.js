// -------------------------------------
// ACCOUNT REPO
// -------------------------------------

import { openDB } from "../../infra/db/db.js";

export class AccountRepo {
  async getAll() {
    const db = await openDB();

    return new Promise((res) => {
      const tx = db.transaction(["accounts"], "readonly");
      const store = tx.objectStore("accounts");

      const req = store.getAll();
      req.onsuccess = () => res(req.result || []);
    });
  }

  async put(account) {
    const db = await openDB();

    return new Promise((res) => {
      const tx = db.transaction(["accounts"], "readwrite");
      const store = tx.objectStore("accounts");

      store.put(account);
      tx.oncomplete = () => res(true);
    });
  }
}
