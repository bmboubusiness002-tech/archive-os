// Suppliers — CRUD list.
import { db } from "../pos/pos.db.js";
import { statsBar, panel, emptyState, modal, escapeHtml } from "../_shared/ui.js";

export async function renderSuppliers(view) { await draw(view); }

async function draw(view) {
  const suppliers = await db.suppliers.toArray();
  const orders    = await db.purchase_orders.toArray();

  view.innerHTML = `
    ${statsBar([
      { label: "Suppliers", value: suppliers.length },
      { label: "Active POs", value: orders.length },
    ])}

    ${panel("All suppliers", suppliers.length ? `
      <table>
        <thead><tr><th>#</th><th>Name</th><th>Phone</th><th>Email</th><th>Orders</th><th></th></tr></thead>
        <tbody>${suppliers.map(s => `
          <tr>
            <td>S-${String(s.id).padStart(3, "0")}</td>
            <td><b>${escapeHtml(s.name)}</b></td>
            <td>${escapeHtml(s.phone || "")}</td>
            <td>${escapeHtml(s.email || "")}</td>
            <td>${orders.filter(o => o.supplierId === s.id).length}</td>
            <td><button data-del="${s.id}" style="background:#ef4444;padding:3px 8px;font-size:11px;">Delete</button></td>
          </tr>
        `).join("")}</tbody>
      </table>
    ` : emptyState("No suppliers yet."), `<button id="new-s" style="background:#22c55e;">+ Add supplier</button>`)}
  `;

  view.querySelector("#new-s").onclick = () => {
    modal("Add supplier", `
      <label>Name<input name="name" required></label>
      <label>Phone<input name="phone"></label>
      <label>Email<input name="email" type="email"></label>
    `, async (d) => {
      await db.suppliers.add({ name: d.name, phone: d.phone, email: d.email });
      draw(view);
    });
  };

  view.querySelectorAll("[data-del]").forEach(b => {
    b.onclick = async () => {
      if (!confirm("Delete this supplier?")) return;
      await db.suppliers.delete(Number(b.dataset.del));
      draw(view);
    };
  });
}
