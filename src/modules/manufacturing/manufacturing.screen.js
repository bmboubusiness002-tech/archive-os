// BOM, Production Orders, Work Centers
import { db, ensureSeed } from "../pos/pos.db.js";
import { fmtMoney, fmtDate, statsBar, panel, emptyState, modal, escapeHtml } from "../_shared/ui.js";

// ============ BOM ============
export async function renderBOM(view) {
  await ensureSeed();
  await drawBOM(view);
}
async function drawBOM(view) {
  const [boms, products] = await Promise.all([db.bom.toArray(), db.products.toArray()]);
  const idx = Object.fromEntries(products.map(p => [p.id, p]));

  view.innerHTML = `
    ${statsBar([
      { label: "BOMs defined", value: boms.length },
      { label: "Products", value: products.length },
    ])}
    ${panel("Bills of Materials", boms.length ? `
      <table>
        <thead><tr><th>Product</th><th>Components</th><th>Total cost</th><th></th></tr></thead>
        <tbody>${boms.map(b => {
          const totalCost = (b.items||[]).reduce((s,i) => s + (idx[i.partId]?.cost || 0) * i.qty, 0);
          return `
            <tr>
              <td><b>${escapeHtml(idx[b.productId]?.name || "—")}</b></td>
              <td style="font-size:12px;color:#94a3b8;">${(b.items||[]).map(i => `${escapeHtml(idx[i.partId]?.name||"?")} ×${i.qty}`).join(", ")}</td>
              <td>${fmtMoney(totalCost)}</td>
              <td><button data-del="${b.id}" style="background:#ef4444;padding:3px 8px;font-size:11px;">Delete</button></td>
            </tr>
          `;
        }).join("")}</tbody>
      </table>
    ` : emptyState("No BOMs yet."), `<button id="new-bom" style="background:#22c55e;">+ New BOM</button>`)}
  `;
  view.querySelector("#new-bom").onclick = () => openBOMModal(view, products);
  view.querySelectorAll("[data-del]").forEach(b => b.onclick = async () => {
    await db.bom.delete(Number(b.dataset.del));
    drawBOM(view);
  });
}
function openBOMModal(view, products) {
  const wrap = document.createElement("div");
  wrap.style.cssText = "position:fixed;inset:0;background:rgba(0,0,0,0.65);z-index:9999;display:flex;align-items:center;justify-content:center;padding:20px;";
  wrap.innerHTML = `
    <div style="background:#0f172a;border:1px solid #1e293b;border-radius:14px;padding:20px;max-width:520px;width:100%;color:#e2e8f0;max-height:90vh;overflow:auto;">
      <h3 style="margin:0 0 14px;">New Bill of Materials</h3>
      <label>Finished product
        <select id="bom-prod">${products.map(p => `<option value="${p.id}">${escapeHtml(p.name)}</option>`).join("")}</select>
      </label>
      <h4 style="font-size:13px;color:#94a3b8;margin:14px 0 6px;">Components</h4>
      <table>
        <thead><tr><th></th><th>Component</th><th>Qty</th></tr></thead>
        <tbody>${products.map(p => `
          <tr data-pid="${p.id}">
            <td><input type="checkbox" class="pick"></td>
            <td>${escapeHtml(p.name)}</td>
            <td><input type="number" class="qty" value="1" min="1" style="width:64px;"></td>
          </tr>
        `).join("")}</tbody>
      </table>
      <div style="display:flex;gap:8px;justify-content:flex-end;margin-top:16px;">
        <button data-act="cancel" style="background:#334155;">Cancel</button>
        <button data-act="save" style="background:#22c55e;">Save</button>
      </div>
    </div>
  `;
  document.body.appendChild(wrap);
  wrap.querySelector("[data-act=cancel]").onclick = () => wrap.remove();
  wrap.querySelector("[data-act=save]").onclick = async () => {
    const items = [];
    wrap.querySelectorAll("tr[data-pid]").forEach(tr => {
      if (tr.querySelector(".pick").checked)
        items.push({ partId: Number(tr.dataset.pid), qty: Number(tr.querySelector(".qty").value)||1 });
    });
    if (!items.length) { wrap.remove(); return; }
    await db.bom.add({ productId: Number(wrap.querySelector("#bom-prod").value), items });
    wrap.remove();
    drawBOM(view);
  };
}

// ============ PRODUCTION ORDERS ============
export async function renderProductionOrders(view) {
  await drawPO(view);
}
async function drawPO(view) {
  const [orders, products, boms] = await Promise.all([
    db.production_orders.orderBy("createdAt").reverse().toArray(),
    db.products.toArray(),
    db.bom.toArray()
  ]);
  const idx = Object.fromEntries(products.map(p => [p.id, p]));
  const bomIdx = Object.fromEntries(boms.map(b => [b.productId, b]));
  view.innerHTML = `
    ${statsBar([
      { label: "Production orders", value: orders.length },
      { label: "In progress", value: orders.filter(o => o.status==="in_progress").length, color: "#22d3ee" },
      { label: "Completed", value: orders.filter(o => o.status==="completed").length, color: "#4ade80" },
    ])}
    ${panel("All production orders", orders.length ? `
      <table>
        <thead><tr><th>PRO #</th><th>Date</th><th>Product</th><th>Qty</th><th>Status</th><th></th></tr></thead>
        <tbody>${orders.map(o => `
          <tr>
            <td><b>PRO-${String(o.id).padStart(4,"0")}</b></td>
            <td>${fmtDate(o.createdAt)}</td>
            <td>${escapeHtml(idx[o.productId]?.name||"—")}</td>
            <td>${o.qty}</td>
            <td><span style="padding:2px 8px;border-radius:10px;font-size:11px;background:#1e293b;">${o.status}</span></td>
            <td>
              ${o.status === "planned" ? `<button data-start="${o.id}" style="background:#22d3ee;padding:3px 8px;font-size:11px;">Start</button>` : ""}
              ${o.status === "in_progress" ? `<button data-complete="${o.id}" style="background:#22c55e;padding:3px 8px;font-size:11px;">Complete</button>` : ""}
            </td>
          </tr>
        `).join("")}</tbody>
      </table>
    ` : emptyState("No production orders."), `<button id="new-po" style="background:#22c55e;">+ New order</button>`)}
  `;
  view.querySelector("#new-po").onclick = () => modal("New production order", `
    <label>Product
      <select name="productId">${products.map(p => `<option value="${p.id}">${escapeHtml(p.name)}</option>`).join("")}</select>
    </label>
    <label>Quantity<input name="qty" type="number" min="1" value="10"></label>
  `, async (d) => {
    await db.production_orders.add({
      createdAt: Date.now(),
      productId: Number(d.productId), qty: Number(d.qty)||1,
      status: "planned"
    });
    drawPO(view);
  });
  view.querySelectorAll("[data-start]").forEach(b => b.onclick = async () => {
    await db.production_orders.update(Number(b.dataset.start), { status: "in_progress", startedAt: Date.now() });
    drawPO(view);
  });
  view.querySelectorAll("[data-complete]").forEach(b => b.onclick = async () => {
    const id = Number(b.dataset.complete);
    const o = await db.production_orders.get(id);
    await db.transaction("rw", db.production_orders, db.stock_balance, db.stock_movements, async () => {
      // Add to stock
      const sb = await db.stock_balance.get(o.productId);
      await db.stock_balance.put({ productId: o.productId, qty: (sb?.qty||0) + o.qty });
      await db.stock_movements.add({
        createdAt: Date.now(), productId: o.productId,
        type: "in", qty: o.qty, note: `Production PRO-${String(id).padStart(4,"0")}`
      });
      await db.production_orders.update(id, { status: "completed", completedAt: Date.now() });
    });
    drawPO(view);
  });
}

// ============ WORK CENTERS ============
export async function renderWorkCenters(view) {
  await drawWC(view);
}
async function drawWC(view) {
  const list = await db.work_centers.toArray();
  view.innerHTML = `
    ${statsBar([
      { label: "Work centers", value: list.length },
      { label: "Active", value: list.filter(w => w.status==="active").length, color: "#4ade80" },
      { label: "Capacity total", value: list.reduce((s,w) => s + (w.capacity||0), 0) },
    ])}
    ${panel("All work centers", list.length ? `
      <table>
        <thead><tr><th>#</th><th>Name</th><th>Capacity (u/day)</th><th>Operators</th><th>Status</th><th></th></tr></thead>
        <tbody>${list.map(w => `
          <tr>
            <td>WC-${String(w.id).padStart(3,"0")}</td>
            <td><b>${escapeHtml(w.name)}</b></td>
            <td>${w.capacity||0}</td>
            <td>${w.operators||0}</td>
            <td><span style="padding:2px 8px;border-radius:10px;font-size:11px;background:${w.status==="active"?"rgba(34,197,94,0.2);color:#4ade80":"rgba(239,68,68,0.2);color:#f87171"};">${w.status}</span></td>
            <td><button data-del="${w.id}" style="background:#ef4444;padding:3px 8px;font-size:11px;">Del</button></td>
          </tr>
        `).join("")}</tbody>
      </table>
    ` : emptyState("No work centers."), `<button id="new-wc" style="background:#22c55e;">+ Add work center</button>`)}
  `;
  view.querySelector("#new-wc").onclick = () => modal("Add work center", `
    <label>Name<input name="name" required></label>
    <label>Capacity (units/day)<input name="capacity" type="number" value="100"></label>
    <label>Operators<input name="operators" type="number" value="2"></label>
    <label>Status
      <select name="status">
        <option value="active">Active</option>
        <option value="maintenance">Maintenance</option>
        <option value="offline">Offline</option>
      </select>
    </label>
  `, async (d) => {
    await db.work_centers.add({
      name: d.name, capacity: Number(d.capacity)||0,
      operators: Number(d.operators)||0, status: d.status
    });
    drawWC(view);
  });
  view.querySelectorAll("[data-del]").forEach(b => b.onclick = async () => {
    await db.work_centers.delete(Number(b.dataset.del));
    drawWC(view);
  });
}
