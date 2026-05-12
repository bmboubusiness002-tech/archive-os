// Purchase Orders — create PO, receive (adds to stock).
import { db } from "../pos/pos.db.js";
import { fmtMoney, fmtDate, statsBar, panel, emptyState, modal, escapeHtml } from "../_shared/ui.js";

export async function renderPurchaseOrders(view) { await draw(view); }

async function draw(view) {
  const [orders, suppliers, products] = await Promise.all([
    db.purchase_orders.orderBy("createdAt").reverse().toArray(),
    db.suppliers.toArray(),
    db.products.toArray(),
  ]);

  view.innerHTML = `
    ${statsBar([
      { label: "Purchase orders", value: orders.length },
      { label: "Pending", value: orders.filter(o => o.status === "pending").length, color: "#fbbf24" },
      { label: "Received", value: orders.filter(o => o.status === "received").length, color: "#4ade80" },
      { label: "Total spend", value: fmtMoney(orders.reduce((s, o) => s + o.total, 0)) },
    ])}

    ${panel("All POs", orders.length ? `
      <table>
        <thead><tr><th>PO #</th><th>Date</th><th>Supplier</th><th>Items</th><th>Total</th><th>Status</th><th></th></tr></thead>
        <tbody>${orders.map(o => {
          const sup = suppliers.find(s => s.id === o.supplierId);
          return `
            <tr>
              <td>PO-${String(o.id).padStart(4, "0")}</td>
              <td>${fmtDate(o.createdAt)}</td>
              <td>${escapeHtml(sup ? sup.name : "—")}</td>
              <td>${(o.items || []).length}</td>
              <td>${fmtMoney(o.total)}</td>
              <td><span style="padding:2px 8px;border-radius:10px;font-size:11px;background:${o.status === "pending" ? "rgba(251,191,36,0.2);color:#fbbf24" : "rgba(34,197,94,0.2);color:#4ade80"};">${o.status}</span></td>
              <td>${o.status === "pending" ? `<button data-recv="${o.id}" style="background:#22c55e;padding:3px 8px;font-size:11px;">Receive</button>` : "✓"}</td>
            </tr>
          `;
        }).join("")}</tbody>
      </table>
    ` : emptyState(suppliers.length ? "No purchase orders yet." : "Add a supplier first (Purchases → Suppliers)."), suppliers.length && products.length ? `<button id="new-po" style="background:#22c55e;">+ New PO</button>` : "")}
  `;

  view.querySelector("#new-po")?.addEventListener("click", () => openPOModal(view, suppliers, products));

  view.querySelectorAll("[data-recv]").forEach(b => {
    b.onclick = async () => {
      const id = Number(b.dataset.recv);
      const po = await db.purchase_orders.get(id);
      await db.transaction("rw", db.purchase_orders, db.stock_balance, async () => {
        for (const it of (po.items || [])) {
          const sb = await db.stock_balance.get(it.productId);
          await db.stock_balance.put({ productId: it.productId, qty: (sb?.qty || 0) + it.qty });
        }
        await db.purchase_orders.update(id, { status: "received", receivedAt: Date.now() });
      });
      draw(view);
    };
  });
}

function openPOModal(view, suppliers, products) {
  const wrap = document.createElement("div");
  wrap.style.cssText = "position:fixed;inset:0;background:rgba(0,0,0,0.65);z-index:9999;display:flex;align-items:center;justify-content:center;padding:20px;";
  wrap.innerHTML = `
    <div style="background:#0f172a;border:1px solid #1e293b;border-radius:14px;padding:20px;max-width:560px;width:100%;color:#e2e8f0;max-height:90vh;overflow:auto;">
      <h3 style="margin:0 0 14px;">New purchase order</h3>
      <label>Supplier
        <select id="po-sup">${suppliers.map(s => `<option value="${s.id}">${escapeHtml(s.name)}</option>`).join("")}</select>
      </label>
      <h4 style="margin:14px 0 8px;font-size:13px;color:#94a3b8;">Items</h4>
      <table>
        <thead><tr><th></th><th>Product</th><th>Qty</th><th>Cost</th></tr></thead>
        <tbody>${products.map(p => `
          <tr data-pid="${p.id}">
            <td><input type="checkbox" class="pick"></td>
            <td>${escapeHtml(p.name)}</td>
            <td><input type="number" class="qty" value="10" min="1" style="width:70px;"></td>
            <td><input type="number" class="cost" value="${p.cost || 0}" step="0.01" style="width:80px;"></td>
          </tr>
        `).join("")}</tbody>
      </table>
      <div style="display:flex;gap:8px;justify-content:flex-end;margin-top:16px;">
        <button data-act="cancel" style="background:#334155;">Cancel</button>
        <button data-act="save" style="background:#22c55e;">Create PO</button>
      </div>
    </div>
  `;
  document.body.appendChild(wrap);
  wrap.querySelector("[data-act=cancel]").onclick = () => wrap.remove();
  wrap.querySelector("[data-act=save]").onclick = async () => {
    const items = [];
    wrap.querySelectorAll("tr[data-pid]").forEach(tr => {
      if (!tr.querySelector(".pick").checked) return;
      items.push({
        productId: Number(tr.dataset.pid),
        qty: Number(tr.querySelector(".qty").value) || 0,
        cost: Number(tr.querySelector(".cost").value) || 0,
      });
    });
    if (!items.length) { wrap.remove(); return; }
    const total = items.reduce((s, l) => s + l.qty * l.cost, 0);
    await db.purchase_orders.add({
      createdAt: Date.now(),
      supplierId: Number(wrap.querySelector("#po-sup").value),
      items, total, status: "pending"
    });
    wrap.remove();
    draw(view);
  };
}
