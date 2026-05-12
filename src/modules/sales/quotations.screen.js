// Quotations — create, list, convert to sale (status only).
import { db } from "../pos/pos.db.js";
import { fmtMoney, fmtDate, statsBar, panel, emptyState, modal, escapeHtml } from "../_shared/ui.js";

export async function renderQuotations(view) {
  await draw(view);
}

async function draw(view) {
  const quotes = await db.quotations.orderBy("createdAt").reverse().toArray();
  const open   = quotes.filter(q => q.status === "open");

  view.innerHTML = `
    ${statsBar([
      { label: "Quotations", value: quotes.length },
      { label: "Open", value: open.length, color: "#3b82f6" },
      { label: "Total value", value: fmtMoney(quotes.reduce((s, q) => s + q.total, 0)) },
    ])}

    ${panel("All quotations", quotes.length ? `
      <table>
        <thead><tr><th>#</th><th>Date</th><th>Customer</th><th>Total</th><th>Status</th><th></th></tr></thead>
        <tbody>${quotes.map(q => `
          <tr>
            <td>QT-${String(q.id).padStart(4, "0")}</td>
            <td>${fmtDate(q.createdAt)}</td>
            <td>${escapeHtml(q.customer)}</td>
            <td>${fmtMoney(q.total)}</td>
            <td><span style="padding:2px 8px;border-radius:10px;font-size:11px;background:${badge(q.status)};">${q.status}</span></td>
            <td>
              ${q.status === "open" ? `
                <button data-act="accept" data-id="${q.id}" style="background:#22c55e;padding:3px 8px;font-size:11px;">Accept</button>
                <button data-act="reject" data-id="${q.id}" style="background:#ef4444;padding:3px 8px;font-size:11px;">Reject</button>
              ` : "—"}
            </td>
          </tr>
        `).join("")}</tbody>
      </table>
    ` : emptyState("No quotations yet."), `<button id="new-q" style="background:#22c55e;">+ New quotation</button>`)}
  `;

  view.querySelector("#new-q").onclick = () => {
    modal("New quotation", `
      <label>Customer<input name="customer" required></label>
      <label>Description<textarea name="note" rows="2"></textarea></label>
      <label>Total<input name="total" type="number" step="0.01" required></label>
    `, async (d) => {
      await db.quotations.add({
        createdAt: Date.now(),
        customer: d.customer,
        note: d.note,
        total: Number(d.total),
        status: "open"
      });
      draw(view);
    });
  };

  view.querySelectorAll("[data-act]").forEach(b => {
    b.onclick = async () => {
      const id = Number(b.dataset.id);
      await db.quotations.update(id, { status: b.dataset.act === "accept" ? "accepted" : "rejected" });
      draw(view);
    };
  });
}

function badge(status) {
  if (status === "open") return "rgba(59,130,246,0.2);color:#60a5fa";
  if (status === "accepted") return "rgba(34,197,94,0.2);color:#4ade80";
  return "rgba(239,68,68,0.2);color:#f87171";
}
