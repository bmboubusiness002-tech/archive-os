// Repair invoices: any ticket with finalCost set is billable.
import { db } from "../pos/pos.db.js";
import { fmtMoney, fmtDate, statsBar, panel, emptyState, escapeHtml } from "../_shared/ui.js";

export async function renderRepairBilling(view) {
  const tickets = await db.repair_tickets.orderBy("createdAt").reverse().toArray();
  const billable = tickets.filter(t => Number(t.finalCost) > 0);
  const paid     = billable.filter(t => t.status === "delivered");
  const unpaid   = billable.filter(t => t.status !== "delivered");

  const totalRev   = paid.reduce((s, t) => s + Number(t.finalCost), 0);
  const totalDue   = unpaid.reduce((s, t) => s + Number(t.finalCost), 0);

  view.innerHTML = `
    ${statsBar([
      { label: "Repair invoices", value: billable.length },
      { label: "Collected", value: fmtMoney(totalRev), color: "#4ade80" },
      { label: "Outstanding", value: fmtMoney(totalDue), color: "#fbbf24" },
    ])}

    ${panel("Outstanding (mark delivered to collect)", unpaid.length ? table(unpaid, true, view) : emptyState("Nothing outstanding."))}
    ${panel("Collected", paid.length ? table(paid, false, view) : emptyState("No collected invoices yet."))}
  `;

  view.querySelectorAll("[data-print]").forEach(b => b.onclick = () => printInvoice(Number(b.dataset.print)));
  view.querySelectorAll("[data-pay]").forEach(b => b.onclick = async () => {
    const id = Number(b.dataset.pay);
    await db.repair_tickets.update(id, { status: "delivered", deliveredAt: Date.now() });
    renderRepairBilling(view);
  });
}

function table(rows, withPay) {
  return `
    <table>
      <thead><tr><th>Invoice</th><th>Date</th><th>Customer</th><th>Device</th><th>Tech</th><th>Total</th><th></th></tr></thead>
      <tbody>${rows.map(t => `
        <tr>
          <td><b>RI-${String(t.id).padStart(5, "0")}</b><br><small style="color:#64748b;">${t.code}</small></td>
          <td>${fmtDate(t.createdAt)}</td>
          <td>${escapeHtml(t.customer)}</td>
          <td>${escapeHtml(t.deviceType)} ${escapeHtml(t.brand||"")} ${escapeHtml(t.model||"")}</td>
          <td>${escapeHtml(t.technician || "—")}</td>
          <td style="color:#4ade80;"><b>${fmtMoney(t.finalCost)}</b></td>
          <td>
            <button data-print="${t.id}" style="background:#3b82f6;padding:3px 8px;font-size:11px;">Print</button>
            ${withPay ? `<button data-pay="${t.id}" style="background:#22c55e;padding:3px 8px;font-size:11px;">Mark paid</button>` : ""}
          </td>
        </tr>
      `).join("")}</tbody>
    </table>
  `;
}

async function printInvoice(id) {
  const t = await db.repair_tickets.get(id);
  const uses = await db.repair_part_uses.where("ticketId").equals(id).toArray();
  const parts = await db.spare_parts.toArray();
  const pIdx = Object.fromEntries(parts.map(p => [p.id, p]));
  const partsTotal = uses.reduce((s, u) => s + (u.qty * u.price), 0);
  const labour = Math.max(0, (t.finalCost || 0) - partsTotal);

  const w = window.open("", "_blank", "width=620,height=720");
  w.document.write(`
    <html><head><title>RI-${String(id).padStart(5,"0")}</title>
    <style>
      body{font-family:system-ui,sans-serif;padding:30px;color:#222;}
      .head{display:flex;justify-content:space-between;border-bottom:2px solid #222;padding-bottom:10px;}
      table{width:100%;border-collapse:collapse;margin-top:20px;}
      th,td{padding:8px;border-bottom:1px solid #ddd;text-align:left;}
      .total{text-align:right;margin-top:14px;font-size:18px;font-weight:700;}
      @media print{button{display:none;}}
    </style></head><body>
      <div class="head">
        <div><h1 style="margin:0;">REPAIR INVOICE</h1><div>RI-${String(id).padStart(5,"0")} · Ticket ${t.code}</div></div>
        <div style="text-align:right;"><b>POS · ERP — Repair</b><br>${fmtDate(t.createdAt)}</div>
      </div>
      <div style="margin-top:14px;">
        <b>${escapeHtml(t.customer)}</b> · ${escapeHtml(t.phone || "")}<br>
        ${escapeHtml(t.deviceType)} ${escapeHtml(t.brand||"")} ${escapeHtml(t.model||"")} ${t.serial?"· "+escapeHtml(t.serial):""}
      </div>
      <table>
        <thead><tr><th>Description</th><th>Qty</th><th>Price</th><th style="text-align:right;">Subtotal</th></tr></thead>
        <tbody>
          ${uses.map(u => `
            <tr><td>${escapeHtml(pIdx[u.partId]?.name || "Part")}</td><td>${u.qty}</td><td>${fmtMoney(u.price)}</td><td style="text-align:right;">${fmtMoney(u.qty*u.price)}</td></tr>
          `).join("")}
          <tr><td>Labour / service</td><td>1</td><td>${fmtMoney(labour)}</td><td style="text-align:right;">${fmtMoney(labour)}</td></tr>
        </tbody>
      </table>
      <div class="total">TOTAL: ${fmtMoney(t.finalCost)}</div>
      <button onclick="window.print()" style="margin-top:20px;padding:8px 16px;">Print</button>
    </body></html>
  `);
  w.document.close();
}
