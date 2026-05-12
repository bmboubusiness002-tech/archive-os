// Invoices — printable view of any sale.
import { db } from "../pos/pos.db.js";
import { fmtMoney, fmtDate, statsBar, panel, emptyState, escapeHtml } from "../_shared/ui.js";

export async function renderInvoices(view) {
  const sales = await db.sales.orderBy("createdAt").reverse().toArray();
  const total = sales.reduce((s, x) => s + x.total, 0);

  view.innerHTML = `
    ${statsBar([
      { label: "Invoices", value: sales.length },
      { label: "Total billed", value: fmtMoney(total), color: "#4ade80" },
    ])}
    ${panel("All invoices", sales.length ? `
      <table>
        <thead><tr><th>Invoice #</th><th>Date</th><th>Total</th><th></th></tr></thead>
        <tbody>${sales.map(s => `
          <tr>
            <td>INV-${String(s.id).padStart(5, "0")}</td>
            <td>${fmtDate(s.createdAt)}</td>
            <td>${fmtMoney(s.total)}</td>
            <td><button data-view="${s.id}" style="background:#3b82f6;padding:4px 10px;font-size:12px;">View</button></td>
          </tr>
        `).join("")}</tbody>
      </table>
    ` : emptyState("No invoices yet."))}
  `;

  view.querySelectorAll("[data-view]").forEach(b => {
    b.onclick = () => openInvoice(Number(b.dataset.view));
  });
}

async function openInvoice(saleId) {
  const sale  = await db.sales.get(saleId);
  const items = await db.sale_items.where("saleId").equals(saleId).toArray();

  const w = window.open("", "_blank", "width=600,height=700");
  w.document.write(`
    <html><head><title>INV-${String(saleId).padStart(5, "0")}</title>
    <style>
      body{font-family:system-ui,sans-serif;padding:30px;color:#222;}
      h1{margin:0;}
      .head{display:flex;justify-content:space-between;border-bottom:2px solid #222;padding-bottom:10px;}
      table{width:100%;border-collapse:collapse;margin-top:20px;}
      th,td{padding:8px;border-bottom:1px solid #ddd;text-align:left;}
      .total{text-align:right;margin-top:14px;font-size:18px;font-weight:700;}
      @media print{button{display:none;}}
    </style></head><body>
      <div class="head">
        <div><h1>INVOICE</h1><div>INV-${String(saleId).padStart(5, "0")}</div></div>
        <div style="text-align:right;"><b>POS · ERP</b><br>${fmtDate(sale.createdAt)}</div>
      </div>
      <table>
        <thead><tr><th>Item</th><th>Qty</th><th>Price</th><th style="text-align:right;">Subtotal</th></tr></thead>
        <tbody>${items.map(i => `
          <tr><td>${escapeHtml(i.name)}</td><td>${i.qty}</td><td>${fmtMoney(i.price)}</td><td style="text-align:right;">${fmtMoney(i.subtotal)}</td></tr>
        `).join("")}</tbody>
      </table>
      <div class="total">TOTAL: ${fmtMoney(sale.total)}</div>
      <button onclick="window.print()" style="margin-top:20px;padding:8px 16px;">Print</button>
    </body></html>
  `);
  w.document.close();
}
