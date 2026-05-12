// Add Customer, Customer CRM, Credit & Pay
import { db } from "../pos/pos.db.js";
import { fmtMoney, fmtDate, statsBar, panel, emptyState, modal, escapeHtml } from "../_shared/ui.js";

// ===== ADD CUSTOMER =====
export async function renderAddCustomer(view) { await drawCustList(view); }

async function drawCustList(view) {
  const list = await db.customers_v2.toArray();
  view.innerHTML = `
    ${statsBar([{ label: "Customers (v2)", value: list.length }])}
    ${panel("Customers list", list.length ? `
      <table>
        <thead><tr><th>#</th><th>Name</th><th>Phone</th><th>Email</th><th>Balance</th><th></th></tr></thead>
        <tbody>${list.map(c => `
          <tr>
            <td>C-${String(c.id).padStart(4,"0")}</td>
            <td><b>${escapeHtml(c.name)}</b></td>
            <td>${escapeHtml(c.phone||"")}</td>
            <td>${escapeHtml(c.email||"")}</td>
            <td style="color:${(c.balance||0) > 0 ? "#fbbf24" : "#4ade80"};">${fmtMoney(c.balance||0)}</td>
            <td><button data-del="${c.id}" style="background:#ef4444;padding:3px 8px;font-size:11px;">Del</button></td>
          </tr>
        `).join("")}</tbody>
      </table>
    ` : emptyState("No customers added yet."), `<button id="new-c" style="background:#22c55e;">+ Add customer</button>`)}
  `;
  view.querySelector("#new-c").onclick = () => modal("Add customer", `
    <label>Full name<input name="name" required></label>
    <label>Phone<input name="phone"></label>
    <label>Email<input name="email" type="email"></label>
    <label>Address<input name="address"></label>
    <label>Opening balance (debt)<input name="balance" type="number" step="0.01" value="0"></label>
  `, async (d) => {
    await db.customers_v2.add({
      name: d.name, phone: d.phone, email: d.email, address: d.address,
      balance: Number(d.balance)||0, createdAt: Date.now()
    });
    drawCustList(view);
  });
  view.querySelectorAll("[data-del]").forEach(b => b.onclick = async () => {
    if (!confirm("Delete customer?")) return;
    await db.customers_v2.delete(Number(b.dataset.del));
    drawCustList(view);
  });
}

// ===== CUSTOMER CRM =====
export async function renderCustomerCRM(view) {
  const [customers, sales, items, payments] = await Promise.all([
    db.customers_v2.toArray(),
    db.sales.toArray(),
    db.sale_items.toArray(),
    db.customer_payments.toArray()
  ]);
  // Aggregate spend per customer name (joined informally)
  const spendByName = {};
  for (const p of payments) spendByName[p.customer] = (spendByName[p.customer]||0) + Number(p.amount||0);

  const totalCust = customers.length;
  const totalRev = customers.reduce((s,c) => s + (spendByName[c.name]||0), 0);
  const debtors = customers.filter(c => (c.balance||0) > 0).length;

  view.innerHTML = `
    ${statsBar([
      { label: "Total customers", value: totalCust },
      { label: "Active payers", value: Object.keys(spendByName).length, color: "#4ade80" },
      { label: "Total received", value: fmtMoney(totalRev) },
      { label: "With debt", value: debtors, color: debtors ? "#fbbf24" : "#4ade80" },
    ])}
    ${panel("Customer 360°", customers.length ? `
      <table>
        <thead><tr><th>Customer</th><th>Phone</th><th>Lifetime spend</th><th>Last contact</th><th>Balance</th><th>Tier</th></tr></thead>
        <tbody>${customers.map(c => {
          const spend = spendByName[c.name] || 0;
          const tier = spend >= 1000 ? { label: "Gold", color: "#fbbf24" }
                     : spend >= 250  ? { label: "Silver", color: "#cbd5f5" }
                     : { label: "Bronze", color: "#a78bfa" };
          return `
            <tr>
              <td><b>${escapeHtml(c.name)}</b></td>
              <td>${escapeHtml(c.phone||"")}</td>
              <td style="color:#4ade80;">${fmtMoney(spend)}</td>
              <td style="font-size:12px;color:#94a3b8;">${c.createdAt ? fmtDate(c.createdAt) : "—"}</td>
              <td style="color:${(c.balance||0)>0?"#fbbf24":"#cbd5f5"};">${fmtMoney(c.balance||0)}</td>
              <td><span style="padding:2px 8px;border-radius:10px;font-size:11px;color:${tier.color};background:${tier.color}22;">${tier.label}</span></td>
            </tr>
          `;
        }).join("")}</tbody>
      </table>
    ` : emptyState("Add customers first to see CRM."))}
  `;
}

// ===== CREDIT & PAY =====
export async function renderCredit(view) {
  await drawCredit(view);
}
async function drawCredit(view) {
  const customers = await db.customers_v2.toArray();
  const debtors = customers.filter(c => (c.balance||0) > 0);
  const totalDebt = debtors.reduce((s,c) => s + (c.balance||0), 0);

  view.innerHTML = `
    ${statsBar([
      { label: "Customers with debt", value: debtors.length, color: debtors.length ? "#fbbf24" : "#4ade80" },
      { label: "Total receivable", value: fmtMoney(totalDebt), color: "#f87171" },
    ])}
    ${panel("Outstanding balances", debtors.length ? `
      <table>
        <thead><tr><th>Customer</th><th>Phone</th><th>Balance</th><th></th></tr></thead>
        <tbody>${debtors.map(c => `
          <tr>
            <td><b>${escapeHtml(c.name)}</b></td>
            <td>${escapeHtml(c.phone||"")}</td>
            <td style="color:#f87171;font-weight:700;">${fmtMoney(c.balance)}</td>
            <td>
              <button data-pay="${c.id}" style="background:#22c55e;padding:3px 8px;font-size:11px;">Receive payment</button>
              <button data-add="${c.id}" style="background:#fbbf24;color:#1e293b;padding:3px 8px;font-size:11px;">+ Add credit</button>
            </td>
          </tr>
        `).join("")}</tbody>
      </table>
    ` : emptyState("No outstanding balances. All clear ✅"), `<button id="all-cust" style="background:#3b82f6;">Show all customers</button>`)}
    <div id="all-cust-out"></div>
  `;
  view.querySelector("#all-cust").onclick = () => {
    view.querySelector("#all-cust-out").innerHTML = panel("All customers", customers.length ? `
      <table>
        <thead><tr><th>Name</th><th>Balance</th><th></th></tr></thead>
        <tbody>${customers.map(c => `
          <tr>
            <td>${escapeHtml(c.name)}</td>
            <td>${fmtMoney(c.balance||0)}</td>
            <td>
              <button data-pay="${c.id}" style="background:#22c55e;padding:3px 8px;font-size:11px;">Pay</button>
              <button data-add="${c.id}" style="background:#fbbf24;color:#1e293b;padding:3px 8px;font-size:11px;">+ Credit</button>
            </td>
          </tr>
        `).join("")}</tbody>
      </table>
    ` : emptyState("No customers."));
    bindBtns();
  };
  function bindBtns() {
    view.querySelectorAll("[data-pay]").forEach(b => b.onclick = () => openTx(view, Number(b.dataset.pay), -1));
    view.querySelectorAll("[data-add]").forEach(b => b.onclick = () => openTx(view, Number(b.dataset.add), 1));
  }
  bindBtns();
}
async function openTx(view, customerId, sign) {
  const c = await db.customers_v2.get(customerId);
  modal(sign > 0 ? `Add credit for ${c.name}` : `Receive payment from ${c.name}`, `
    <label>Amount<input name="amount" type="number" step="0.01" required></label>
    <label>Note<input name="note"></label>
  `, async (d) => {
    const amt = Number(d.amount) * (sign > 0 ? 1 : -1);
    await db.customers_v2.update(customerId, { balance: Math.max(0, (c.balance||0) + amt) });
    if (sign < 0) {
      await db.customer_payments.add({
        createdAt: Date.now(), customer: c.name,
        amount: Number(d.amount), method: "cash", note: d.note
      });
    }
    drawCredit(view);
  });
}
