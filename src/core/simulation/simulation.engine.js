// -------------------------------------
// DATA SIMULATION ENGINE (FINAL FIX)
// -------------------------------------

import { openDB } from "../../infra/db/db.js";

function random(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function generateTrend(base, days, mode) {
  const data = [];
  let value = base;

  for (let i = 0; i < days; i++) {
    if (mode === "GROWTH") value *= 1.2;
    else if (mode === "DECLINE") value *= 0.8;
    else if (mode === "VOLATILE") value *= random(60, 140) / 100;
    else value *= 1 + Math.sin(i / 2) * 0.15;

    data.push(Math.max(200, Math.round(value)));
  }

  return data;
}

function buildSales(trend) {
  const now = Date.now();
  const dayMs = 86400000;

  return trend.map((value, i) => ({
    id: crypto.randomUUID(),
    total: value,
    date: now - (trend.length - i) * dayMs,
    items: [{ productId: "p1", qty: 1 }]
  }));
}

export async function simulateSales(mode = "REALISTIC") {
  const db = await openDB();

  // 🔥 تأكد أنه IndexedDB
  if (!db || !db.transaction) {
    console.error("❌ DB is not IndexedDB:", db);
    return;
  }

  const tx = db.transaction(["sales"], "readwrite");
  const store = tx.objectStore("sales");

  const trend = generateTrend(2000, 14, mode);
  const sales = buildSales(trend);

  sales.forEach(s => store.add(s)); // 🔥 بدون repo

  await new Promise((resolve, reject) => {
    tx.oncomplete = resolve;
    tx.onerror = reject;
  });

  console.log("✅ Simulation DONE:", mode);
}
