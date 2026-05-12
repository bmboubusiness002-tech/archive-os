// -------------------------------------
// BASE REPO (FINAL STABLE)
// -------------------------------------

export class BaseRepo {
  constructor(storeName) {
    this.storeName = storeName;
  }

  // -------------------------
  // INTERNAL TX HELPER
  // -------------------------
  _tx(db, mode = "readonly") {
    const tx = db.transaction([this.storeName], mode);
    return tx.objectStore(this.storeName);
  }

  // -------------------------
  // PUT
  // -------------------------
  async put(db, data) {
    return new Promise((resolve, reject) => {
      const store = this._tx(db, "readwrite");
      const req = store.put(data);

      req.onsuccess = () => resolve(data);
      req.onerror = () => reject(req.error);
    });
  }

  // -------------------------
  // BULK
  // -------------------------
  async bulkPut(db, list = []) {
    return new Promise((resolve, reject) => {
      const store = this._tx(db, "readwrite");

      for (const item of list) {
        store.put(item);
      }

      resolve(true);
    });
  }

  // -------------------------
  // DELETE (FIX)
  // -------------------------
  async delete(db, id) {
    return new Promise((resolve, reject) => {
      const store = this._tx(db, "readwrite");
      const req = store.delete(id);

      req.onsuccess = () => resolve(true);
      req.onerror = () => reject(req.error);
    });
  }

  // -------------------------
  // REMOVE (alias)
  // -------------------------
  async remove(db, id) {
    return this.delete(db, id);
  }

  // -------------------------
  // GET ALL
  // -------------------------
  async getAll(db) {
    return new Promise((resolve, reject) => {
      const store = this._tx(db);
      const req = store.getAll();

      req.onsuccess = () => resolve(req.result || []);
      req.onerror = () => reject(req.error);
    });
  }

  // -------------------------
  // GET BY ID
  // -------------------------
  async getById(db, id) {
    return new Promise((resolve, reject) => {
      const store = this._tx(db);
      const req = store.get(id);

      req.onsuccess = () => resolve(req.result || null);
      req.onerror = () => reject(req.error);
    });
  }
}
