// Technician kanban board: columns by status, group by technician.
import { db } from "../pos/pos.db.js";
import { ensureRepairSeed, REPAIR_STATUSES, STATUS_COLOR, getTechnicians } from "./repair.db.js";
import { fmtDate, panel, emptyState, escapeHtml } from "../_shared/ui.js";

const COLUMNS = ["new", "diagnosing", "awaiting_parts", "repairing", "ready"];

export async function renderBoard(view) {
  await ensureRepairSeed();
  await draw(view);
}

async function draw(view) {
  const tickets = await db.repair_tickets.where("status").anyOf(COLUMNS).toArray();
  const techs = ["unassigned", ...getTechnicians()];
  const byTech = {};
  techs.forEach(t => byTech[t] = []);
  tickets.forEach(t => {
    const k = t.technician || "unassigned";
    (byTech[k] = byTech[k] || []).push(t);
  });

  view.innerHTML = `
    <div style="display:grid;grid-template-columns:repeat(${COLUMNS.length},1fr);gap:10px;">
      ${COLUMNS.map(col => `
        <div style="background:#0f172a;border:1px solid #1e293b;border-radius:10px;padding:10px;min-height:120px;">
          <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:10px;">
            <span style="font-size:12px;font-weight:600;color:${STATUS_COLOR[col]};text-transform:uppercase;">${col}</span>
            <span style="font-size:11px;color:#64748b;">${tickets.filter(t => t.status === col).length}</span>
          </div>
          <div style="display:flex;flex-direction:column;gap:8px;">
            ${tickets.filter(t => t.status === col).map(t => card(t)).join("") || `<div style="color:#475569;font-size:12px;text-align:center;padding:14px 0;">—</div>`}
          </div>
        </div>
      `).join("")}
    </div>

    ${panel("Workload by technician", `
      <table>
        <thead><tr><th>Technician</th>${COLUMNS.map(c => `<th style="color:${STATUS_COLOR[c]};font-size:11px;">${c}</th>`).join("")}<th>Total</th></tr></thead>
        <tbody>${techs.map(tech => {
          const list = byTech[tech] || [];
          const counts = COLUMNS.map(c => list.filter(t => t.status === c).length);
          return `
            <tr>
              <td><b>${escapeHtml(tech)}</b></td>
              ${counts.map(n => `<td>${n}</td>`).join("")}
              <td><b>${list.length}</b></td>
            </tr>
          `;
        }).join("")}</tbody>
      </table>
    `)}
  `;

  view.querySelectorAll("[data-adv]").forEach(b => b.onclick = async () => {
    const [id, dir] = b.dataset.adv.split(":");
    const t = await db.repair_tickets.get(Number(id));
    const i = REPAIR_STATUSES.indexOf(t.status);
    const next = dir === "fwd" ? Math.min(REPAIR_STATUSES.length - 1, i + 1) : Math.max(0, i - 1);
    const upd = { status: REPAIR_STATUSES[next] };
    if (REPAIR_STATUSES[next] === "delivered" && !t.deliveredAt) upd.deliveredAt = Date.now();
    await db.repair_tickets.update(t.id, upd);
    draw(view);
  });
}

function card(t) {
  return `
    <div style="background:#1e293b;border-radius:8px;padding:10px;border-left:3px solid ${STATUS_COLOR[t.status]};">
      <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:4px;">
        <b style="font-size:12px;">${t.code}</b>
        <span style="font-size:10px;color:#64748b;">${fmtDate(t.createdAt).split(",")[0]}</span>
      </div>
      <div style="font-size:12px;font-weight:600;color:#f1f5f9;">${escapeHtml(t.customer)}</div>
      <div style="font-size:11px;color:#94a3b8;margin:4px 0;">${escapeHtml(t.deviceType)} ${escapeHtml(t.brand||"")} ${escapeHtml(t.model||"")}</div>
      <div style="font-size:11px;color:#cbd5f5;line-height:1.3;max-height:32px;overflow:hidden;">${escapeHtml(t.issue || "")}</div>
      <div style="display:flex;justify-content:space-between;margin-top:8px;font-size:10px;">
        <span style="color:#64748b;">${escapeHtml(t.technician || "unassigned")}</span>
        <span>
          <button data-adv="${t.id}:back" style="background:#334155;padding:1px 6px;font-size:10px;">◀</button>
          <button data-adv="${t.id}:fwd" style="background:#3b82f6;padding:1px 6px;font-size:10px;">▶</button>
        </span>
      </div>
    </div>
  `;
}
