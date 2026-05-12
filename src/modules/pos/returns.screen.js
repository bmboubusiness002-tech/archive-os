// POS Returns — pick a sale, refund items, restock.
import { db } from "./pos.db.js";
import { emit } from "./pos.events.js";
import { fmtMoney, fmtDate, statsBar, panel, emptyState, escapeHtml } from "../_shared/ui.js";

export async function renderReturns(view) {
  await draw(view);
}

async function draw(view) {
  const [sales, returns] = await Promise.all([
    db.sales.orderBy("createdAt").reverse().limit(30).toArray(),
    db.returns.orderBy("createdAt").reverse().toArray()
  ]);

  const totalReturned = returns.reduce((s, r) => s + r.total, 0);

  view.innerHTML = `
    ${statsBar([
      { label: "Total returns", value: returns.length },
      { label: "Refunded amount", value: fmtMoney(totalReturned), color: "#f87171" },
      { label: "Recent sales available", value: sales.length },
    ])}

    ${panel("Recent sales (click to refund)", sales.length ? `
      <table>
        <thead><tr><th>#</th><th>Date</th><th>Total</th><th></th></tr></thead>
        <tbody>${sales.map(s => `
          <tr>
            <td>#${s.id}</td>
            <td>${fmtDate(s.createdAt)}</td>
            <td>${fmtMoney(s.total)}</td>
            <td><button data-refund="${s.id}" style="background:#ef4444;padding:4px 10px;font-size:12px;">Refund</button></td>
          </tr>
        `).join("")}</tbody>
      </table>
    ` : emptyState("No sales yet."))}

    ${panel("Returns history", returns.length ? `
      <table>
        <thead><tr><th>#</th><th>Date</th><th>Sale</th><th>Refunded</th></tr></thead>
        <tbody>${returns.map(r => `
          <tr>
            <td>#${r.id}</td>
            <td>${fmtDate(r.createdAt)}</td>
            <td>#${r.saleId}</td>
            <td style="color:#f87171;">${fmtMoney(r.total)}</td>
          </tr>
        `).join("")}</tbody>
      </table>
    ` : emptyState("No returns recorded."))}
  `;

  view.querySelectorAll("[data-refund]").forEach(b => {
    b.onclick = () => openRefund(view, Number(b.dataset.refund));
  });
}

async function openRefund(view, saleId) {
  const sale  = await db.sales.get(saleId);
  const items = await db.sale_items.where("saleId").equals(saleId).toArray();

  const wrap = document.createElement("div");
  wrap.style.cssText = "position:fixed;inset:0;background:rgba(0,0,0,0.65);z-index:9999;display:flex;align-items:center;justify-content:center;padding:20px;";
  wrap.innerHTML = `
    <div style="background:#0f172a;border:1px solid #1e293b;border-radius:14px;padding:20px;max-width:520px;width:100%;color:#e2e8f0;">
      <h3 style="margin:0 0 6px;">Refund sale #${sale.id}</h3>
      <div style="font-size:12px;color:#64748b;margin-bottom:14px;">${fmtDate(sale.createdAt)} · ${fmtMoney(sale.total)}</div>
      <table>
        <thead><tr><th></th><th>Item</th><th>Qty</th><th>Refund qty</th></tr></thead>
        <tbody>${items.map(it => `
          <tr data-pid="${it.productId}" data-price="${it.price}">
            <td><input type="checkbox" class="pick" checked></td>
            <td>${escapeHtml(it.name)}</td>
            <td>${it.qty}</td>
            <td><input type="number" class="rqty" min="0" max="${it.qty}" value="${it.qty}" style="width:64px;"></td>
          </tr>
        `).join("")}</tbody>
      </table>
      <div style="display:flex;gap:8px;justify-content:flex-end;margin-top:18px;">
        <button data-act="cancel" style="background:#334155;">Cancel</button>
        <button data-act="confirm" style="background:#ef4444;">Confirm refund</button>
      </div>
    </div>
  `;
  document.body.appendChild(wrap);
  wrap.querySelector("[data-act=cancel]").onclick = () => wrap.remove();
  wrap.querySelector("[data-act=confirm]").onclick = async () => {
    const lines = [];
    wrap.querySelectorAll("tr[data-pid]").forEach(tr => {
      const checked = tr.querySelector(".pick").checked;
      const qty = Number(tr.querySelector(".rqty").value) || 0;
      if (checked && qty > 0) {
        lines.push({
          productId: Number(tr.dataset.pid),
          price: Number(tr.dataset.price),
          qty
        });
      }
    });
    if (!lines.length) { wrap.remove(); return; }

    const total = lines.reduce((s, l) => s + l.price * l.qty, 0);
    await db.transaction("rw", db.returns, db.stock_balance, async () => {
      await db.returns.add({
        createdAt: Date.now(),
        saleId,
        total,
        items: lines
      });
      for (const l of lines) {
        const sb = await db.stock_balance.get(l.productId);
        const cur = sb ? sb.qty : 0;
        await db.stock_balance.put({ productId: l.productId, qty: cur + l.qty });
      }
    });
    emit("return:created", { saleId, total });
    wrap.remove();
    draw(view);
  };
}
