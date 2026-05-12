// Purchase Returns — return items to a supplier (deducts from stock).
import { db } from "../pos/pos.db.js";
import { fmtMoney, fmtDate, statsBar, panel, emptyState, escapeHtml } from "../_shared/ui.js";

const STORE_KEY = "purchase_returns_v1";

export async function renderPurchaseReturns(view) { await draw(view); }

async function draw(view) {
  const orders = await db.purchase_orders.where("status").equals("received").toArray();
  const [products, suppliers] = await Promise.all([db.products.toArray(), db.suppliers.toArray()]);
  const log = JSON.parse(localStorage.getItem(STORE_KEY) || "[]");

  view.innerHTML = `
    ${statsBar([
      { label: "Returnable POs", value: orders.length },
      { label: "Returns recorded", value: log.length, color: "#f87171" },
      { label: "Refund value", value: fmtMoney(log.reduce((s, r) => s + r.total, 0)) },
    ])}

    ${panel("Received POs (return items)", orders.length ? `
      <table>
        <thead><tr><th>PO #</th><th>Date</th><th>Supplier</th><th>Items</th><th>Total</th><th></th></tr></thead>
        <tbody>${orders.map(o => {
          const sup = suppliers.find(s => s.id === o.supplierId);
          return `
            <tr>
              <td>PO-${String(o.id).padStart(4, "0")}</td>
              <td>${fmtDate(o.createdAt)}</td>
              <td>${escapeHtml(sup?.name || "—")}</td>
              <td>${(o.items || []).length}</td>
              <td>${fmtMoney(o.total)}</td>
              <td><button data-ret="${o.id}" style="background:#ef4444;padding:3px 8px;font-size:11px;">Return…</button></td>
            </tr>
          `;
        }).join("")}</tbody>
      </table>
    ` : emptyState("Receive a PO first to enable returns."))}

    ${panel("Returns history", log.length ? `
      <table>
        <thead><tr><th>#</th><th>Date</th><th>PO</th><th>Refund</th></tr></thead>
        <tbody>${log.slice().reverse().map(r => `
          <tr><td>R-${r.id}</td><td>${fmtDate(r.createdAt)}</td><td>PO-${String(r.poId).padStart(4, "0")}</td><td style="color:#f87171;">${fmtMoney(r.total)}</td></tr>
        `).join("")}</tbody>
      </table>
    ` : emptyState("No returns recorded yet."))}
  `;

  view.querySelectorAll("[data-ret]").forEach(b => {
    b.onclick = () => openReturnModal(view, Number(b.dataset.ret), products);
  });
}

async function openReturnModal(view, poId, products) {
  const po = await db.purchase_orders.get(poId);
  const wrap = document.createElement("div");
  wrap.style.cssText = "position:fixed;inset:0;background:rgba(0,0,0,0.65);z-index:9999;display:flex;align-items:center;justify-content:center;padding:20px;";
  wrap.innerHTML = `
    <div style="background:#0f172a;border:1px solid #1e293b;border-radius:14px;padding:20px;max-width:520px;width:100%;color:#e2e8f0;">
      <h3 style="margin:0 0 14px;">Return items to supplier — PO-${String(poId).padStart(4, "0")}</h3>
      <table>
        <thead><tr><th></th><th>Product</th><th>Bought</th><th>Return qty</th></tr></thead>
        <tbody>${(po.items || []).map(it => {
          const p = products.find(x => x.id === it.productId);
          return `
            <tr data-pid="${it.productId}" data-cost="${it.cost}">
              <td><input type="checkbox" class="pick"></td>
              <td>${escapeHtml(p?.name || "—")}</td>
              <td>${it.qty}</td>
              <td><input type="number" class="rqty" min="1" max="${it.qty}" value="${it.qty}" style="width:64px;"></td>
            </tr>
          `;
        }).join("")}</tbody>
      </table>
      <div style="display:flex;gap:8px;justify-content:flex-end;margin-top:16px;">
        <button data-act="cancel" style="background:#334155;">Cancel</button>
        <button data-act="save" style="background:#ef4444;">Confirm return</button>
      </div>
    </div>
  `;
  document.body.appendChild(wrap);
  wrap.querySelector("[data-act=cancel]").onclick = () => wrap.remove();
  wrap.querySelector("[data-act=save]").onclick = async () => {
    const lines = [];
    wrap.querySelectorAll("tr[data-pid]").forEach(tr => {
      if (!tr.querySelector(".pick").checked) return;
      lines.push({
        productId: Number(tr.dataset.pid),
        qty: Number(tr.querySelector(".rqty").value) || 0,
        cost: Number(tr.dataset.cost) || 0
      });
    });
    if (!lines.length) { wrap.remove(); return; }

    const total = lines.reduce((s, l) => s + l.qty * l.cost, 0);
    await db.transaction("rw", db.stock_balance, async () => {
      for (const l of lines) {
        const sb = await db.stock_balance.get(l.productId);
        await db.stock_balance.put({ productId: l.productId, qty: Math.max(0, (sb?.qty || 0) - l.qty) });
      }
    });
    const log = JSON.parse(localStorage.getItem(STORE_KEY) || "[]");
    log.push({ id: log.length + 1, createdAt: Date.now(), poId, total, items: lines });
    localStorage.setItem(STORE_KEY, JSON.stringify(log));
    wrap.remove();
    draw(view);
  };
}
