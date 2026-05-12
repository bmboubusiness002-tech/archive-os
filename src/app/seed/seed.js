// -------------------------------------
// SEED (EMPTY SYSTEM MODE)
// -------------------------------------

import { openDB } from "../../infra/db/db.js";

export async function seed() {
  console.log("🌱 Seeding (EMPTY MODE)...");

  const db = await openDB();

  // 🔍 فقط تحقق (اختياري)
  const tx = db.transaction(["products"], "readonly");
  const store = tx.objectStore("products");

  const count = await new Promise((res, rej) => {
    const r = store.count();
    r.onsuccess = () => res(r.result);
    r.onerror = () => rej(r.error);
  });

  if (count > 0) {
    console.log("⛔ Seed skipped (data exists)");
    return;
  }

  // 🔥 لا نضيف أي بيانات
  console.log("✅ System initialized (NO DATA)");

  return true;
}
