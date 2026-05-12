// Customer-facing tracking: enter ticket code → see status timeline.
import { db } from "../pos/pos.db.js";
import { STATUS_COLOR, REPAIR_STATUSES } from "./repair.db.js";
import { fmtDate, panel, emptyState, escapeHtml } from "../_shared/ui.js";

export async function renderPortal(view) {
  view.innerHTML = `
    ${panel("Track your repair", `
      <label>Ticket code (e.g. RT-2604-1234)<input id="pp-code" placeholder="RT-…" autofocus></label>
      <button id="pp-go" style="background:#3b82f6;margin-top:6px;">Track</button>
    `)}
    <div id="pp-out"></div>
  `;
  const go = async () => {
    const code = view.querySelector("#pp-code").value.trim().toUpperCase();
    if (!code) return;
    const t = await db.repair_tickets.where("code").equals(code).first();
    const out = view.querySelector("#pp-out");
    if (!t) { out.innerHTML = panel("Result", emptyState("No ticket found with that code.")); return; }

    const statuses = REPAIR_STATUSES.filter(s => s !== "cancelled");
    const idx = statuses.indexOf(t.status);

    out.innerHTML = panel(`Ticket ${t.code}`, `
      <div style="font-size:13px;color:#cbd5f5;margin-bottom:6px;"><b>${escapeHtml(t.customer)}</b></div>
      <div style="font-size:12px;color:#94a3b8;margin-bottom:14px;">
        ${escapeHtml(t.deviceType)} ${escapeHtml(t.brand||"")} ${escapeHtml(t.model||"")} · opened ${fmtDate(t.createdAt)}
      </div>
      <div style="display:flex;align-items:center;justify-content:space-between;gap:6px;">
        ${statuses.map((s, i) => `
          <div style="flex:1;text-align:center;">
            <div style="width:28px;height:28px;border-radius:50%;margin:0 auto;line-height:28px;
                        background:${i <= idx ? STATUS_COLOR[s] : "#1e293b"};
                        color:${i <= idx ? "#0f172a" : "#475569"};font-weight:700;font-size:13px;">${i+1}</div>
            <div style="font-size:10px;margin-top:6px;color:${i <= idx ? "#f1f5f9" : "#475569"};">${s}</div>
          </div>
          ${i < statuses.length - 1 ? `<div style="flex:1;height:2px;background:${i < idx ? STATUS_COLOR[statuses[i+1]] : "#1e293b"};"></div>` : ""}
        `).join("")}
      </div>
      <div style="margin-top:18px;background:#1e293b;padding:12px;border-radius:8px;font-size:13px;">
        <b>Current status:</b> <span style="color:${STATUS_COLOR[t.status]};">${t.status}</span><br>
        ${t.technician ? `<b>Technician:</b> ${escapeHtml(t.technician)}<br>` : ""}
        ${t.finalCost ? `<b>Final cost:</b> ${Number(t.finalCost).toFixed(2)}` : ""}
      </div>
    `);
  };
  view.querySelector("#pp-go").onclick = go;
  view.querySelector("#pp-code").onkeydown = (e) => { if (e.key === "Enter") go(); };
}
