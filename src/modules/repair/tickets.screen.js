// Repair tickets list with optional device-type filter + status update + ticket detail drawer.
import { db } from "../pos/pos.db.js";
import { ensureRepairSeed, REPAIR_STATUSES, STATUS_COLOR, DEVICE_TYPES, getTechnicians, newTicketCode } from "./repair.db.js";
import { fmtMoney, fmtDate, statsBar, panel, emptyState, escapeHtml } from "../_shared/ui.js";

export function renderRepairTickets(filterDevice) {
  return async (view) => {
    await ensureRepairSeed();
    await draw(view, filterDevice);
  };
}

async function draw(view, filterDevice) {
  let tickets = await db.repair_tickets.orderBy("createdAt").reverse().toArray();
  if (filterDevice) tickets = tickets.filter(t => t.deviceType === filterDevice);

  const counts = REPAIR_STATUSES.reduce((m, s) => (m[s] = 0, m), {});
  tickets.forEach(t => counts[t.status] = (counts[t.status] || 0) + 1);

  view.innerHTML = `
    ${statsBar([
      { label: filterDevice ? `${filterDevice} tickets` : "Total tickets", value: tickets.length },
      { label: "Open",     value: tickets.filter(t => !["delivered","cancelled"].includes(t.status)).length, color: "#3b82f6" },
      { label: "Ready",    value: counts.ready, color: "#4ade80" },
      { label: "Awaiting parts", value: counts.awaiting_parts, color: "#fbbf24" },
    ])}

    ${panel(filterDevice ? `${filterDevice.toUpperCase()} tickets` : "All tickets",
      tickets.length ? `
        <table>
          <thead><tr>
            <th>Code</th><th>Date</th><th>Customer</th><th>Device</th><th>Issue</th>
            <th>Tech</th><th>Status</th><th>Cost</th><th></th>
          </tr></thead>
          <tbody>${tickets.map(t => `
            <tr data-id="${t.id}" style="cursor:pointer;">
              <td><b>${t.code}</b></td>
              <td>${fmtDate(t.createdAt)}</td>
              <td>${escapeHtml(t.customer)}<br><small style="color:#64748b;">${escapeHtml(t.phone || "")}</small></td>
              <td>${escapeHtml(t.deviceType)} · ${escapeHtml(t.brand || "")} ${escapeHtml(t.model || "")}</td>
              <td style="max-width:200px;font-size:12px;color:#cbd5f5;">${escapeHtml(t.issue || "")}</td>
              <td>${escapeHtml(t.technician || "—")}</td>
              <td><span style="padding:2px 8px;border-radius:10px;font-size:11px;background:${STATUS_COLOR[t.status]}33;color:${STATUS_COLOR[t.status]};">${t.status}</span></td>
              <td>${fmtMoney(t.finalCost ?? t.estCost ?? 0)}</td>
              <td><button data-open="${t.id}" style="background:#3b82f6;padding:3px 8px;font-size:11px;">Open</button></td>
            </tr>
          `).join("")}</tbody>
        </table>
      ` : emptyState("No tickets yet."),
      `<button id="new-tk" style="background:#22c55e;">+ New ticket</button>`)}
  `;

  view.querySelector("#new-tk").onclick = () => openNew(view, filterDevice);
  view.querySelectorAll("[data-open]").forEach(b => {
    b.onclick = (e) => { e.stopPropagation(); openDetail(view, Number(b.dataset.open)); };
  });
}

function openNew(view, presetDevice) {
  const techs = getTechnicians();
  const w = createModal(`New repair ticket`, `
    <label>Customer name<input name="customer" required></label>
    <label>Phone<input name="phone"></label>
    <label>Device type
      <select name="deviceType">${DEVICE_TYPES.map(d => `<option ${d===presetDevice?"selected":""}>${d}</option>`).join("")}</select>
    </label>
    <div style="display:flex;gap:8px;">
      <label style="flex:1;">Brand<input name="brand"></label>
      <label style="flex:1;">Model<input name="model"></label>
    </div>
    <label>Serial / IMEI<input name="serial"></label>
    <label>Reported issue<textarea name="issue" rows="3" required></textarea></label>
    <div style="display:flex;gap:8px;">
      <label style="flex:1;">Estimated cost<input name="estCost" type="number" step="0.01" value="0"></label>
      <label style="flex:1;">Technician
        <select name="technician"><option value="">—</option>${techs.map(t => `<option>${t}</option>`).join("")}</select>
      </label>
    </div>
  `, async (d) => {
    await db.repair_tickets.add({
      code: newTicketCode(),
      createdAt: Date.now(),
      customer: d.customer, phone: d.phone,
      deviceType: d.deviceType, brand: d.brand, model: d.model, serial: d.serial,
      issue: d.issue,
      estCost: Number(d.estCost) || 0,
      finalCost: null,
      technician: d.technician || "",
      status: "new",
      deliveredAt: null
    });
    draw(view, presetDevice);
  });
}

async function openDetail(view, id) {
  const t = await db.repair_tickets.get(id);
  const techs = getTechnicians();
  const w = createModal(`Ticket ${t.code}`, `
    <div style="font-size:12px;color:#94a3b8;">${escapeHtml(t.customer)} · ${escapeHtml(t.phone || "")}</div>
    <div style="font-size:12px;color:#94a3b8;margin-bottom:8px;">${escapeHtml(t.deviceType)} ${escapeHtml(t.brand || "")} ${escapeHtml(t.model || "")} ${t.serial ? "· "+escapeHtml(t.serial):""}</div>
    <div style="background:#1e293b;padding:10px;border-radius:8px;font-size:13px;color:#cbd5f5;">${escapeHtml(t.issue || "")}</div>
    <label>Status
      <select name="status">${REPAIR_STATUSES.map(s => `<option ${s===t.status?"selected":""}>${s}</option>`).join("")}</select>
    </label>
    <label>Technician
      <select name="technician"><option value="">—</option>${techs.map(x => `<option ${x===t.technician?"selected":""}>${x}</option>`).join("")}</select>
    </label>
    <div style="display:flex;gap:8px;">
      <label style="flex:1;">Estimated<input name="estCost" type="number" step="0.01" value="${t.estCost||0}"></label>
      <label style="flex:1;">Final cost<input name="finalCost" type="number" step="0.01" value="${t.finalCost ?? ""}"></label>
    </div>
  `, async (d) => {
    const upd = {
      status: d.status,
      technician: d.technician,
      estCost: Number(d.estCost) || 0,
      finalCost: d.finalCost === "" ? null : Number(d.finalCost)
    };
    if (d.status === "delivered" && !t.deliveredAt) upd.deliveredAt = Date.now();
    await db.repair_tickets.update(id, upd);
    draw(view, null);
  }, [
    { label: "Delete", color: "#ef4444", action: async () => {
        if (!confirm("Delete this ticket?")) return;
        await db.repair_tickets.delete(id);
        draw(view, null);
      } }
  ]);
}

function createModal(title, body, onSubmit, extraButtons = []) {
  const wrap = document.createElement("div");
  wrap.style.cssText = "position:fixed;inset:0;background:rgba(0,0,0,0.65);z-index:9999;display:flex;align-items:center;justify-content:center;padding:20px;";
  wrap.innerHTML = `
    <form style="background:#0f172a;border:1px solid #1e293b;border-radius:14px;padding:20px;max-width:500px;width:100%;color:#e2e8f0;max-height:90vh;overflow:auto;">
      <h3 style="margin:0 0 14px;">${title}</h3>
      <div style="display:flex;flex-direction:column;gap:10px;">${body}</div>
      <div style="display:flex;gap:8px;justify-content:flex-end;margin-top:18px;">
        ${extraButtons.map((b,i) => `<button type="button" data-extra="${i}" style="background:${b.color};margin-right:auto;">${b.label}</button>`).join("")}
        <button type="button" data-cancel style="background:#334155;">Cancel</button>
        <button type="submit" style="background:#22c55e;">Save</button>
      </div>
    </form>
  `;
  document.body.appendChild(wrap);
  wrap.querySelector("[data-cancel]").onclick = () => wrap.remove();
  extraButtons.forEach((b, i) => {
    wrap.querySelector(`[data-extra="${i}"]`).onclick = async () => {
      await b.action();
      wrap.remove();
    };
  });
  wrap.querySelector("form").onsubmit = async (e) => {
    e.preventDefault();
    const data = {};
    wrap.querySelectorAll("[name]").forEach(el => data[el.name] = el.value);
    await onSubmit(data);
    wrap.remove();
  };
  return wrap;
}
