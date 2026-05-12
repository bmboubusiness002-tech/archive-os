// Spare parts inventory + serial/IMEI lookup screens.
import { db } from "../pos/pos.db.js";
import { ensureRepairSeed } from "./repair.db.js";
import { fmtMoney, statsBar, panel, emptyState, modal, escapeHtml } from "../_shared/ui.js";

export async function renderParts(view) {
  await ensureRepairSeed();
  await draw(view);
}

async function draw(view) {
  const parts = await db.spare_parts.toArray();
  const totalQty = parts.reduce((s, p) => s + (p.qty || 0), 0);
  const totalVal = parts.reduce((s, p) => s + (p.qty || 0) * (p.cost || 0), 0);
  const low = parts.filter(p => (p.qty || 0) < 3).length;

  view.innerHTML = `
    ${statsBar([
      { label: "Parts SKUs", value: parts.length },
      { label: "Units in stock", value: totalQty },
      { label: "Inventory value", value: fmtMoney(totalVal) },
      { label: "Low stock", value: low, color: low ? "#fbbf24" : "#4ade80" },
    ])}

    ${panel("All spare parts", parts.length ? `
      <table>
        <thead><tr><th>SKU</th><th>Name</th><th>Device</th><th>Qty</th><th>Cost</th><th>Sell</th><th></th></tr></thead>
        <tbody>${parts.map(p => `
          <tr>
            <td><code style="background:#1e293b;padding:2px 6px;border-radius:4px;font-size:11px;">${escapeHtml(p.sku || "")}</code></td>
            <td><b>${escapeHtml(p.name)}</b></td>
            <td>${escapeHtml(p.deviceType || "")}</td>
            <td style="color:${(p.qty||0) < 3 ? "#fbbf24" : "#cbd5f5"};font-weight:600;">${p.qty||0}</td>
            <td>${fmtMoney(p.cost)}</td>
            <td style="color:#4ade80;">${fmtMoney(p.price)}</td>
            <td>
              <button data-edit="${p.id}" style="background:#3b82f6;padding:3px 8px;font-size:11px;">Edit</button>
              <button data-del="${p.id}" style="background:#ef4444;padding:3px 8px;font-size:11px;">Del</button>
            </td>
          </tr>
        `).join("")}</tbody>
      </table>
    ` : emptyState("No spare parts."), `<button id="new-pt" style="background:#22c55e;">+ Add part</button>`)}
  `;

  view.querySelector("#new-pt").onclick = () => openPartModal(view, null);
  view.querySelectorAll("[data-edit]").forEach(b => b.onclick = () => openPartModal(view, Number(b.dataset.edit)));
  view.querySelectorAll("[data-del]").forEach(b => b.onclick = async () => {
    if (!confirm("Delete this part?")) return;
    await db.spare_parts.delete(Number(b.dataset.del));
    draw(view);
  });
}

async function openPartModal(view, id) {
  const existing = id ? await db.spare_parts.get(id) : { name:"", sku:"", deviceType:"phone", qty:0, cost:0, price:0 };
  modal(id ? "Edit part" : "Add part", `
    <label>Name<input name="name" value="${escapeHtml(existing.name)}" required></label>
    <label>SKU<input name="sku" value="${escapeHtml(existing.sku || "")}"></label>
    <label>Device type
      <select name="deviceType">
        ${["phone","laptop","tv","console","other"].map(d => `<option ${d===existing.deviceType?"selected":""}>${d}</option>`).join("")}
      </select>
    </label>
    <div style="display:flex;gap:8px;">
      <label style="flex:1;">Qty<input name="qty" type="number" min="0" value="${existing.qty||0}"></label>
      <label style="flex:1;">Cost<input name="cost" type="number" step="0.01" value="${existing.cost||0}"></label>
      <label style="flex:1;">Sell price<input name="price" type="number" step="0.01" value="${existing.price||0}"></label>
    </div>
  `, async (d) => {
    const rec = {
      name: d.name, sku: d.sku, deviceType: d.deviceType,
      qty: Number(d.qty)||0, cost: Number(d.cost)||0, price: Number(d.price)||0
    };
    if (id) await db.spare_parts.update(id, rec);
    else await db.spare_parts.add(rec);
    draw(view);
  });
}

// ---- Serial / IMEI lookup ----
export async function renderSerialLookup(view) {
  view.innerHTML = `
    ${panel("Serial / IMEI lookup", `
      <label>Serial or IMEI<input id="sn-input" placeholder="Enter serial / IMEI…" autofocus></label>
      <button id="sn-go" style="background:#3b82f6;margin-top:6px;">Search</button>
    `)}
    <div id="sn-out"></div>
  `;
  const input = view.querySelector("#sn-input");
  const run = async () => {
    const q = input.value.trim().toLowerCase();
    if (!q) return;
    const all = await db.repair_tickets.toArray();
    const matches = all.filter(t => (t.serial || "").toLowerCase().includes(q));
    view.querySelector("#sn-out").innerHTML = panel(`Results (${matches.length})`,
      matches.length ? `
        <table>
          <thead><tr><th>Code</th><th>Customer</th><th>Device</th><th>Serial</th><th>Status</th></tr></thead>
          <tbody>${matches.map(t => `
            <tr>
              <td><b>${t.code}</b></td>
              <td>${escapeHtml(t.customer)}</td>
              <td>${escapeHtml(t.deviceType)} ${escapeHtml(t.brand||"")} ${escapeHtml(t.model||"")}</td>
              <td><code style="background:#1e293b;padding:2px 6px;border-radius:4px;font-size:11px;">${escapeHtml(t.serial)}</code></td>
              <td>${escapeHtml(t.status)}</td>
            </tr>
          `).join("")}</tbody>
        </table>
      ` : emptyState("No matching tickets.")
    );
  };
  view.querySelector("#sn-go").onclick = run;
  input.onkeydown = (e) => { if (e.key === "Enter") run(); };
}
