// Warehouses, Stock Movements, Smart Pricing
import { db, ensureSeed } from "../pos/pos.db.js";
import { fmtMoney, fmtDate, statsBar, panel, emptyState, modal, escapeHtml } from "../_shared/ui.js";

// ========== WAREHOUSES ==========
export async function renderWarehouses(view) {
  const list = await db.warehouses.toArray();
  view.innerHTML = `
    ${statsBar([{ label: "Warehouses", value: list.length }])}
    ${panel("All warehouses", list.length ? `
      <table>
        <thead><tr><th>#</th><th>Name</th><th>Location</th><th>Capacity</th><th></th></tr></thead>
        <tbody>${list.map(w => `
          <tr>
            <td>WH-${String(w.id).padStart(3,"0")}</td>
            <td><b>${escapeHtml(w.name)}</b></td>
            <td>${escapeHtml(w.location||"")}</td>
            <td>${w.capacity||"—"}</td>
            <td><button data-del="${w.id}" style="background:#ef4444;padding:3px 8px;font-size:11px;">Delete</button></td>
          </tr>
        `).join("")}</tbody>
      </table>
    ` : emptyState("No warehouses yet."), `<button id="new-wh" style="background:#22c55e;">+ Add warehouse</button>`)}
  `;
  view.querySelector("#new-wh").onclick = () => modal("Add warehouse", `
    <label>Name<input name="name" required></label>
    <label>Location<input name="location"></label>
    <label>Capacity (units)<input name="capacity" type="number" value="1000"></label>
  `, async (d) => {
    await db.warehouses.add({ name: d.name, location: d.location, capacity: Number(d.capacity)||0 });
    renderWarehouses(view);
  });
  view.querySelectorAll("[data-del]").forEach(b => b.onclick = async () => {
    if (!confirm("Delete warehouse?")) return;
    await db.warehouses.delete(Number(b.dataset.del));
    renderWarehouses(view);
  });
}

// ========== STOCK MOVEMENTS ==========
export async function renderMovements(view) {
  await ensureSeed();
  await drawMov(view);
}
async function drawMov(view) {
  const [moves, products] = await Promise.all([
    db.stock_movements.orderBy("createdAt").reverse().limit(200).toArray(),
    db.products.toArray()
  ]);
  const idx = Object.fromEntries(products.map(p => [p.id, p]));
  const totalIn = moves.filter(m => m.qty > 0).reduce((s,m) => s + m.qty, 0);
  const totalOut = -moves.filter(m => m.qty < 0).reduce((s,m) => s + m.qty, 0);

  view.innerHTML = `
    ${statsBar([
      { label: "Movements", value: moves.length },
      { label: "Units in", value: totalIn, color: "#4ade80" },
      { label: "Units out", value: totalOut, color: "#f87171" },
    ])}
    ${panel("Movement log", moves.length ? `
      <table>
        <thead><tr><th>Date</th><th>Product</th><th>Type</th><th>Qty</th><th>Note</th></tr></thead>
        <tbody>${moves.map(m => `
          <tr>
            <td>${fmtDate(m.createdAt)}</td>
            <td>${escapeHtml(idx[m.productId]?.name || `#${m.productId}`)}</td>
            <td><span style="background:#1e293b;padding:2px 8px;border-radius:10px;font-size:11px;">${m.type}</span></td>
            <td style="color:${m.qty >= 0 ? "#4ade80" : "#f87171"};font-weight:700;">${m.qty > 0 ? "+" : ""}${m.qty}</td>
            <td style="font-size:12px;color:#94a3b8;">${escapeHtml(m.note||"")}</td>
          </tr>
        `).join("")}</tbody>
      </table>
    ` : emptyState("No movements yet."), `<button id="new-mv" style="background:#22c55e;">+ Record movement</button>`)}
  `;
  view.querySelector("#new-mv").onclick = () => modal("Record stock movement", `
    <label>Product
      <select name="productId" required>${products.map(p => `<option value="${p.id}">${escapeHtml(p.name)}</option>`).join("")}</select>
    </label>
    <label>Type
      <select name="type">
        <option value="in">Stock In</option>
        <option value="out">Stock Out</option>
        <option value="adjust">Adjustment</option>
        <option value="transfer">Transfer</option>
      </select>
    </label>
    <label>Quantity (use negative for out)<input name="qty" type="number" required></label>
    <label>Note<input name="note"></label>
  `, async (d) => {
    const qty = Number(d.qty);
    const productId = Number(d.productId);
    await db.transaction("rw", db.stock_movements, db.stock_balance, async () => {
      await db.stock_movements.add({
        createdAt: Date.now(), productId, type: d.type, qty, note: d.note
      });
      const sb = await db.stock_balance.get(productId);
      await db.stock_balance.put({ productId, qty: Math.max(0, (sb?.qty || 0) + qty) });
    });
    drawMov(view);
  });
}

// ========== SMART PRICING ==========
export async function renderPricing(view) {
  await ensureSeed();
  const [products, items, stock] = await Promise.all([
    db.products.toArray(), db.sale_items.toArray(), db.stock_balance.toArray()
  ]);
  const sIdx = {}; stock.forEach(s => sIdx[s.productId] = s.qty);
  const sold = {}; items.forEach(i => sold[i.productId] = (sold[i.productId]||0) + i.qty);

  const rows = products.map(p => {
    const margin = p.price ? ((p.price - (p.cost||0)) / p.price) * 100 : 0;
    const qty = sIdx[p.id] || 0;
    const soldQty = sold[p.id] || 0;
    let action = "Hold", color = "#94a3b8", suggested = p.price;
    if (soldQty >= 5 && margin < 30) { action = "Raise +10%"; color = "#4ade80"; suggested = p.price * 1.10; }
    else if (soldQty === 0 && qty > 10) { action = "Discount −15%"; color = "#fbbf24"; suggested = p.price * 0.85; }
    else if (margin < 15) { action = "Raise +5%"; color = "#3b82f6"; suggested = p.price * 1.05; }
    return { p, margin, qty, soldQty, action, color, suggested };
  });

  view.innerHTML = `
    ${statsBar([
      { label: "Products analysed", value: rows.length },
      { label: "Raise suggested", value: rows.filter(r => r.action.startsWith("Raise")).length, color: "#4ade80" },
      { label: "Discount suggested", value: rows.filter(r => r.action.startsWith("Discount")).length, color: "#fbbf24" },
    ])}
    ${panel("Smart pricing suggestions", `
      <table>
        <thead><tr><th>Product</th><th>Cost</th><th>Price</th><th>Margin</th><th>Sold</th><th>Stock</th><th>Suggestion</th><th>New price</th><th></th></tr></thead>
        <tbody>${rows.map(r => `
          <tr data-id="${r.p.id}">
            <td><b>${escapeHtml(r.p.name)}</b></td>
            <td>${fmtMoney(r.p.cost)}</td>
            <td>${fmtMoney(r.p.price)}</td>
            <td style="color:${r.margin < 20 ? "#fbbf24" : "#4ade80"};">${r.margin.toFixed(1)}%</td>
            <td>${r.soldQty}</td>
            <td>${r.qty}</td>
            <td style="color:${r.color};font-weight:600;">${r.action}</td>
            <td style="color:#3b82f6;">${fmtMoney(r.suggested)}</td>
            <td>${r.suggested !== r.p.price ? `<button data-apply="${r.p.id}" data-price="${r.suggested.toFixed(2)}" style="background:#22c55e;padding:3px 8px;font-size:11px;">Apply</button>` : "—"}</td>
          </tr>
        `).join("")}</tbody>
      </table>
    `)}
  `;
  view.querySelectorAll("[data-apply]").forEach(b => b.onclick = async () => {
    await db.products.update(Number(b.dataset.apply), { price: Number(b.dataset.price) });
    renderPricing(view);
  });
}
