// Sales History — list of sales with expandable line items.
import { db } from "../pos/pos.db.js";
import { fmtMoney, fmtDate, statsBar, panel, emptyState, escapeHtml } from "../_shared/ui.js";

export async function renderSalesHistory(view) {
  const sales = await db.sales.orderBy("createdAt").reverse().toArray();
  const all   = await db.sale_items.toArray();
  const itemsBySale = {};
  for (const i of all) (itemsBySale[i.saleId] = itemsBySale[i.saleId] || []).push(i);

  const totalRev = sales.reduce((s, x) => s + x.total, 0);
  const avg      = sales.length ? totalRev / sales.length : 0;

  view.innerHTML = `
    ${statsBar([
      { label: "Total sales", value: sales.length },
      { label: "Revenue", value: fmtMoney(totalRev), color: "#4ade80" },
      { label: "Avg ticket", value: fmtMoney(avg) },
    ])}

    ${panel("All sales", sales.length ? `
      <table>
        <thead><tr><th>#</th><th>Date</th><th>Items</th><th>Total</th></tr></thead>
        <tbody>${sales.map(s => {
          const items = itemsBySale[s.id] || [];
          return `
            <tr class="exp" data-id="${s.id}" style="cursor:pointer;">
              <td>#${s.id}</td>
              <td>${fmtDate(s.createdAt)}</td>
              <td>${items.length}</td>
              <td><b>${fmtMoney(s.total)}</b></td>
            </tr>
            <tr class="det" data-for="${s.id}" style="display:none;background:#0b1220;">
              <td colspan="4" style="padding:10px 14px;">
                <table style="margin:0;">
                  <thead><tr><th>Item</th><th>Qty</th><th>Price</th><th>Subtotal</th></tr></thead>
                  <tbody>${items.map(i => `
                    <tr><td>${escapeHtml(i.name)}</td><td>${i.qty}</td><td>${fmtMoney(i.price)}</td><td>${fmtMoney(i.subtotal)}</td></tr>
                  `).join("")}</tbody>
                </table>
              </td>
            </tr>
          `;
        }).join("")}</tbody>
      </table>
    ` : emptyState("No sales yet. Open POS and complete a checkout."))}
  `;

  view.querySelectorAll(".exp").forEach(row => {
    row.onclick = () => {
      const det = view.querySelector(`.det[data-for="${row.dataset.id}"]`);
      det.style.display = det.style.display === "none" ? "table-row" : "none";
    };
  });
}
