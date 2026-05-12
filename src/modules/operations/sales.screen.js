// -------------------------------------
// LEDGER TIMELINE SCREEN (PRO UI + COGS FIX)
// -------------------------------------

import { openDB } from "../../infra/db/db.js";
import { LedgerRepo } from "../../domain/ledger/ledger.repo.js";

export async function loadSalesScreen() {
  const view = document.getElementById("view");

  view.innerHTML = `
    <div style="padding:20px;">
      <h2 style="margin-bottom:16px;">🧾 Ledger Timeline</h2>
      <div id="timeline"></div>
    </div>
  `;

  const db = await openDB();
  const repo = new LedgerRepo();

  const timeline = await repo.getTimelineGrouped(db);
  const container = document.getElementById("timeline");

  if (!timeline.length) {
    container.innerHTML = `<div style="opacity:.6">No operations yet</div>`;
    return;
  }

  for (const op of timeline) {
    let cashIn = 0;
    let cashOut = 0;
    let cogsAmount = 0;

    let type = "UNKNOWN";

    // -------------------------------------
    // LOOP ENTRIES (FIXED)
    // -------------------------------------
    for (const e of op.entries) {
      if (e.debitAccount === "cash") cashIn += e.amount;
      if (e.creditAccount === "cash") cashOut += e.amount;

      if (e.type === "COGS") {
        cogsAmount += e.amount;
      }

      // TYPE DETECTION
      if (e.source === "sale") type = "SALE";
      if (e.source === "purchase") type = "PURCHASE";
      if (e.source === "expense") type = "EXPENSE";
      if (e.type === "COGS") type = "COGS";
    }

    const net = cashIn - cashOut;

    const colorMap = {
      SALE: "#22c55e",
      PURCHASE: "#ef4444",
      EXPENSE: "#f97316",
      COGS: "#a855f7",
      UNKNOWN: "#64748b"
    };

    const labelMap = {
      SALE: "🟢 SALE",
      PURCHASE: "🔴 PURCHASE",
      EXPENSE: "🟠 EXPENSE",
      COGS: "🟣 COGS",
      UNKNOWN: "⚪ UNKNOWN"
    };

    const color = colorMap[type] || "#64748b";
    const label = labelMap[type] || "UNKNOWN";

    // -------------------------------------
    // 🔥 DETAILS (FIXED)
    // -------------------------------------
    let details = `
      💰 In: <span style="color:#22c55e;font-weight:bold">${cashIn}</span><br/>
      💸 Out: <span style="color:#ef4444;font-weight:bold">${cashOut}</span><br/>
    `;

    if (type === "COGS") {
      details = `
        📦 Cost: <span style="color:#a855f7;font-weight:bold">${cogsAmount}</span>
      `;
    }

    const card = document.createElement("div");

    card.style = `
      background:#0f172a;
      border:1px solid #1e293b;
      padding:16px;
      margin-bottom:14px;
      border-radius:12px;
      box-shadow:0 4px 10px rgba(0,0,0,0.2);
    `;

    card.innerHTML = `
      <div style="display:flex;justify-content:space-between;align-items:center;">
        <div style="
          font-size:12px;
          padding:4px 10px;
          border-radius:20px;
          background:${color}20;
          color:${color};
          font-weight:bold;
        ">
          ${label}
        </div>

        <div style="opacity:.6;font-size:12px;">
          ${new Date(op.createdAt).toLocaleString()}
        </div>
      </div>

      <div style="margin-top:12px;font-size:14px;line-height:1.6;">
        ${details}

        ${
          type !== "COGS"
            ? `
          📊 Net: <span style="font-weight:bold;color:${net >= 0 ? "#22c55e" : "#ef4444"}">
            ${net}
          </span>
        `
            : ""
        }
      </div>
    `;

    container.appendChild(card);
  }
}
