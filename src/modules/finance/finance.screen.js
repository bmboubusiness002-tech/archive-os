// Cash / Bank, Installments, Journal Entries, Chart of Accounts
import { db } from "../pos/pos.db.js";
import { fmtMoney, fmtDate, statsBar, panel, emptyState, modal, escapeHtml } from "../_shared/ui.js";

// ===== CASH / BANK =====
export async function renderCashBank(view) { await drawCash(view); }
async function drawCash(view) {
  const [accounts, txs] = await Promise.all([
    db.bank_accounts.toArray(),
    db.bank_transactions.orderBy("createdAt").reverse().limit(100).toArray()
  ]);
  const totalBal = accounts.reduce((s,a) => s + (a.balance||0), 0);
  view.innerHTML = `
    ${statsBar([
      { label: "Accounts", value: accounts.length },
      { label: "Total balance", value: fmtMoney(totalBal), color: "#4ade80" },
      { label: "Recent transactions", value: txs.length },
    ])}
    ${panel("Accounts", accounts.length ? `
      <table>
        <thead><tr><th>Name</th><th>Type</th><th>Balance</th><th></th></tr></thead>
        <tbody>${accounts.map(a => `
          <tr>
            <td><b>${escapeHtml(a.name)}</b></td>
            <td><span style="background:#1e293b;padding:2px 8px;border-radius:10px;font-size:11px;">${a.type}</span></td>
            <td style="color:#4ade80;">${fmtMoney(a.balance)}</td>
            <td>
              <button data-tx="${a.id}:in" style="background:#22c55e;padding:3px 8px;font-size:11px;">Deposit</button>
              <button data-tx="${a.id}:out" style="background:#ef4444;padding:3px 8px;font-size:11px;">Withdraw</button>
            </td>
          </tr>
        `).join("")}</tbody>
      </table>
    ` : emptyState("No accounts yet."), `<button id="new-acc" style="background:#22c55e;">+ Add account</button>`)}

    ${panel("Recent transactions", txs.length ? `
      <table>
        <thead><tr><th>Date</th><th>Account</th><th>Type</th><th>Amount</th><th>Note</th></tr></thead>
        <tbody>${txs.map(t => {
          const acc = accounts.find(a => a.id === t.accountId);
          return `
            <tr>
              <td>${fmtDate(t.createdAt)}</td>
              <td>${escapeHtml(acc?.name||"—")}</td>
              <td>${t.type}</td>
              <td style="color:${t.type==="in"?"#4ade80":"#f87171"};">${t.type==="in"?"+":"−"}${fmtMoney(t.amount)}</td>
              <td style="font-size:12px;color:#94a3b8;">${escapeHtml(t.note||"")}</td>
            </tr>
          `;
        }).join("")}</tbody>
      </table>
    ` : emptyState("No transactions."))}
  `;
  view.querySelector("#new-acc").onclick = () => modal("Add account", `
    <label>Name<input name="name" required></label>
    <label>Type
      <select name="type"><option>cash</option><option>bank</option><option>card</option><option>wallet</option></select>
    </label>
    <label>Opening balance<input name="balance" type="number" step="0.01" value="0"></label>
  `, async (d) => {
    await db.bank_accounts.add({ name: d.name, type: d.type, balance: Number(d.balance)||0 });
    drawCash(view);
  });
  view.querySelectorAll("[data-tx]").forEach(b => b.onclick = () => {
    const [id, type] = b.dataset.tx.split(":");
    modal(type==="in"?"Deposit":"Withdraw", `
      <label>Amount<input name="amount" type="number" step="0.01" required></label>
      <label>Note<input name="note"></label>
    `, async (d) => {
      const amt = Number(d.amount);
      const acc = await db.bank_accounts.get(Number(id));
      const newBal = (acc.balance||0) + (type==="in"?amt:-amt);
      await db.bank_accounts.update(Number(id), { balance: newBal });
      await db.bank_transactions.add({
        createdAt: Date.now(), accountId: Number(id), type, amount: amt, note: d.note
      });
      drawCash(view);
    });
  });
}

// ===== INSTALLMENTS =====
export async function renderInstallments(view) { await drawInst(view); }
async function drawInst(view) {
  const list = await db.installments.orderBy("dueDate").toArray();
  const today = Date.now();
  const overdue = list.filter(i => i.status==="open" && i.dueDate < today).length;
  const totalDue = list.filter(i => i.status==="open").reduce((s,i) => s + (i.remaining||0), 0);
  view.innerHTML = `
    ${statsBar([
      { label: "Active plans", value: list.filter(i=>i.status==="open").length },
      { label: "Overdue", value: overdue, color: overdue ? "#f87171" : "#4ade80" },
      { label: "Outstanding", value: fmtMoney(totalDue), color: "#fbbf24" },
    ])}
    ${panel("Installment plans", list.length ? `
      <table>
        <thead><tr><th>#</th><th>Customer</th><th>Total</th><th>Paid</th><th>Remaining</th><th>Due</th><th>Status</th><th></th></tr></thead>
        <tbody>${list.map(i => {
          const od = i.status==="open" && i.dueDate < today;
          return `
            <tr>
              <td>I-${String(i.id).padStart(4,"0")}</td>
              <td>${escapeHtml(i.customer)}</td>
              <td>${fmtMoney(i.total)}</td>
              <td style="color:#4ade80;">${fmtMoney(i.paid)}</td>
              <td style="color:#fbbf24;">${fmtMoney(i.remaining)}</td>
              <td style="color:${od?"#f87171":"#cbd5f5"};">${fmtDate(i.dueDate).split(",")[0]}</td>
              <td>${i.status}</td>
              <td>${i.status==="open"?`<button data-pay="${i.id}" style="background:#22c55e;padding:3px 8px;font-size:11px;">Receive</button>`:"✓"}</td>
            </tr>
          `;
        }).join("")}</tbody>
      </table>
    ` : emptyState("No installments."), `<button id="new-i" style="background:#22c55e;">+ New plan</button>`)}
  `;
  view.querySelector("#new-i").onclick = () => modal("New installment plan", `
    <label>Customer<input name="customer" required></label>
    <label>Total amount<input name="total" type="number" step="0.01" required></label>
    <label>Due date<input name="dueDate" type="date" required></label>
  `, async (d) => {
    await db.installments.add({
      customer: d.customer,
      total: Number(d.total), paid: 0, remaining: Number(d.total),
      dueDate: new Date(d.dueDate).getTime(), status: "open"
    });
    drawInst(view);
  });
  view.querySelectorAll("[data-pay]").forEach(b => b.onclick = async () => {
    const id = Number(b.dataset.pay);
    const i = await db.installments.get(id);
    modal("Receive installment payment", `
      <label>Amount (max ${fmtMoney(i.remaining)})<input name="amount" type="number" step="0.01" max="${i.remaining}" required></label>
    `, async (d) => {
      const amt = Math.min(Number(d.amount), i.remaining);
      const newPaid = i.paid + amt;
      const newRem  = i.remaining - amt;
      await db.installments.update(id, {
        paid: newPaid, remaining: newRem,
        status: newRem <= 0 ? "completed" : "open"
      });
      drawInst(view);
    });
  });
}

// ===== JOURNAL ENTRIES =====
export async function renderJournal(view) { await drawJ(view); }
async function drawJ(view) {
  const entries = await db.journal_entries.orderBy("createdAt").reverse().limit(200).toArray();
  const totalDebit = entries.reduce((s,e) => s + Number(e.debit||0), 0);
  const totalCredit = entries.reduce((s,e) => s + Number(e.credit||0), 0);
  view.innerHTML = `
    ${statsBar([
      { label: "Entries", value: entries.length },
      { label: "Total debit", value: fmtMoney(totalDebit) },
      { label: "Total credit", value: fmtMoney(totalCredit) },
      { label: "Balanced?", value: totalDebit===totalCredit?"✓ Yes":"✗ No", color: totalDebit===totalCredit?"#4ade80":"#f87171" },
    ])}
    ${panel("Journal entries", entries.length ? `
      <table>
        <thead><tr><th>#</th><th>Date</th><th>Reference</th><th>Account</th><th>Debit</th><th>Credit</th><th>Note</th></tr></thead>
        <tbody>${entries.map(e => `
          <tr>
            <td>JE-${String(e.id).padStart(4,"0")}</td>
            <td>${fmtDate(e.createdAt)}</td>
            <td>${escapeHtml(e.ref||"")}</td>
            <td>${escapeHtml(e.account||"")}</td>
            <td style="color:${e.debit>0?"#4ade80":"#475569"};">${e.debit ? fmtMoney(e.debit) : "—"}</td>
            <td style="color:${e.credit>0?"#f87171":"#475569"};">${e.credit ? fmtMoney(e.credit) : "—"}</td>
            <td style="font-size:12px;color:#94a3b8;">${escapeHtml(e.note||"")}</td>
          </tr>
        `).join("")}</tbody>
      </table>
    ` : emptyState("No journal entries."), `<button id="new-je" style="background:#22c55e;">+ Add entry</button>`)}
  `;
  view.querySelector("#new-je").onclick = () => modal("New journal entry", `
    <label>Reference<input name="ref" placeholder="INV-001 / SAL-002"></label>
    <label>Account<input name="account" placeholder="Sales / Cash / ..." required></label>
    <div style="display:flex;gap:8px;">
      <label style="flex:1;">Debit<input name="debit" type="number" step="0.01" value="0"></label>
      <label style="flex:1;">Credit<input name="credit" type="number" step="0.01" value="0"></label>
    </div>
    <label>Note<input name="note"></label>
  `, async (d) => {
    await db.journal_entries.add({
      createdAt: Date.now(), ref: d.ref, account: d.account,
      debit: Number(d.debit)||0, credit: Number(d.credit)||0, note: d.note
    });
    drawJ(view);
  });
}

// ===== CHART OF ACCOUNTS =====
const DEFAULT_ACCOUNTS = [
  { code: "1000", name: "Cash on Hand",      type: "asset" },
  { code: "1100", name: "Bank Account",      type: "asset" },
  { code: "1200", name: "Accounts Receivable", type: "asset" },
  { code: "1300", name: "Inventory",         type: "asset" },
  { code: "2000", name: "Accounts Payable",  type: "liability" },
  { code: "3000", name: "Owner's Equity",    type: "equity" },
  { code: "4000", name: "Sales Revenue",     type: "revenue" },
  { code: "4100", name: "Service Revenue",   type: "revenue" },
  { code: "5000", name: "Cost of Goods Sold",type: "expense" },
  { code: "6000", name: "Operating Expenses",type: "expense" },
];

export async function renderAccounts(view) {
  if (await db.accounts.count() === 0) await db.accounts.bulkAdd(DEFAULT_ACCOUNTS);
  await drawAcc(view);
}
async function drawAcc(view) {
  const accounts = await db.accounts.toArray();
  const byType = {};
  accounts.forEach(a => (byType[a.type] = byType[a.type] || []).push(a));
  view.innerHTML = `
    ${statsBar([
      { label: "Accounts", value: accounts.length },
      ...Object.keys(byType).map(t => ({ label: t, value: byType[t].length }))
    ])}
    ${Object.entries(byType).map(([type, list]) => panel(type.toUpperCase(), `
      <table>
        <thead><tr><th>Code</th><th>Name</th><th></th></tr></thead>
        <tbody>${list.map(a => `
          <tr>
            <td><code style="background:#1e293b;padding:2px 6px;border-radius:4px;font-size:11px;">${a.code}</code></td>
            <td>${escapeHtml(a.name)}</td>
            <td><button data-del="${a.id}" style="background:#ef4444;padding:3px 8px;font-size:11px;">Del</button></td>
          </tr>
        `).join("")}</tbody>
      </table>
    `)).join("")}
    ${panel("New account", `<button id="new-ac" style="background:#22c55e;">+ Add account</button>`, "")}
  `;
  view.querySelector("#new-ac").onclick = () => modal("New account", `
    <label>Code<input name="code" required></label>
    <label>Name<input name="name" required></label>
    <label>Type
      <select name="type">
        <option>asset</option><option>liability</option><option>equity</option><option>revenue</option><option>expense</option>
      </select>
    </label>
  `, async (d) => {
    await db.accounts.add({ code: d.code, name: d.name, type: d.type });
    drawAcc(view);
  });
  view.querySelectorAll("[data-del]").forEach(b => b.onclick = async () => {
    await db.accounts.delete(Number(b.dataset.del));
    drawAcc(view);
  });
}
