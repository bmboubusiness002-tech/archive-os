// Customer Payments — record incoming payments from customers.
import { db } from "../pos/pos.db.js";
import { fmtMoney, fmtDate, statsBar, panel, emptyState, modal, escapeHtml } from "../_shared/ui.js";

export async function renderPayments(view) { await draw(view); }

async function draw(view) {
  const pays = await db.customer_payments.orderBy("createdAt").reverse().toArray();
  const total = pays.reduce((s, p) => s + Number(p.amount || 0), 0);
  const byMethod = pays.reduce((m, p) => { m[p.method] = (m[p.method] || 0) + Number(p.amount || 0); return m; }, {});

  view.innerHTML = `
    ${statsBar([
      { label: "Payments", value: pays.length },
      { label: "Total received", value: fmtMoney(total), color: "#4ade80" },
      { label: "Cash", value: fmtMoney(byMethod.cash || 0) },
      { label: "Card",  value: fmtMoney(byMethod.card || 0) },
    ])}

    ${panel("All payments", pays.length ? `
      <table>
        <thead><tr><th>#</th><th>Date</th><th>Customer</th><th>Method</th><th>Amount</th><th>Note</th></tr></thead>
        <tbody>${pays.map(p => `
          <tr>
            <td>P-${String(p.id).padStart(4, "0")}</td>
            <td>${fmtDate(p.createdAt)}</td>
            <td>${escapeHtml(p.customer)}</td>
            <td><span style="background:#1e293b;padding:2px 8px;border-radius:10px;font-size:11px;">${p.method}</span></td>
            <td style="color:#4ade80;"><b>${fmtMoney(p.amount)}</b></td>
            <td style="color:#94a3b8;font-size:12px;">${escapeHtml(p.note || "")}</td>
          </tr>
        `).join("")}</tbody>
      </table>
    ` : emptyState("No payments recorded."), `<button id="new-p" style="background:#22c55e;">+ Record payment</button>`)}
  `;

  view.querySelector("#new-p").onclick = () => {
    modal("Record customer payment", `
      <label>Customer<input name="customer" required></label>
      <label>Amount<input name="amount" type="number" step="0.01" required></label>
      <label>Method
        <select name="method">
          <option value="cash">Cash</option>
          <option value="card">Card</option>
          <option value="transfer">Bank transfer</option>
        </select>
      </label>
      <label>Note<input name="note" placeholder="optional"></label>
    `, async (d) => {
      await db.customer_payments.add({
        createdAt: Date.now(),
        customer: d.customer,
        amount: Number(d.amount),
        method: d.method,
        note: d.note
      });
      draw(view);
    });
  };
}
