// -------------------------------------
// FULL FINANCIAL DASHBOARD (P&L + CASH FLOW + BALANCE)
// -------------------------------------

import { openDB } from "../../infra/db/db.js";
import { LedgerRepo } from "../../domain/ledger/ledger.repo.js";

// -------------------------------------

export async function renderFinanceDashboard(root) {
  const db = await openDB();
  const ledgerRepo = new LedgerRepo();

  const entries = await ledgerRepo.getAll(db);

  // -------------------------------------
  // P&L
  // -------------------------------------

  let revenue = 0;
  let cogs = 0;
  let expenses = 0;

  // -------------------------------------
  // CASH FLOW
  // -------------------------------------

  let cashIn = 0;
  let cashOut = 0;

  const cashTimeline = {};

  // -------------------------------------
  // BALANCE SHEET
  // -------------------------------------

  let cashBalance = 0;
  let receivable = 0;
  let inventory = 0;

  for (const e of entries) {
    const amount = Number(e.amount || 0);

    // ---------------- P&L ----------------

    if (e.creditAccount === "revenue") revenue += amount;

    if (e.debitAccount === "cogs") cogs += amount;

    if (e.debitAccount === "expenses") expenses += amount;

    // ---------------- CASH FLOW ----------------

    if (e.debitAccount === "cash") {
      cashIn += amount;

      const day = new Date(e.createdAt).toLocaleDateString();
      if (!cashTimeline[day]) cashTimeline[day] = { in: 0, out: 0 };

      cashTimeline[day].in += amount;
    }

    if (e.creditAccount === "cash") {
      cashOut += amount;

      const day = new Date(e.createdAt).toLocaleDateString();
      if (!cashTimeline[day]) cashTimeline[day] = { in: 0, out: 0 };

      cashTimeline[day].out += amount;
    }

    // ---------------- BALANCE ----------------

    if (e.debitAccount === "cash") cashBalance += amount;
    if (e.creditAccount === "cash") cashBalance -= amount;

    if (e.debitAccount === "accounts_receivable") receivable += amount;
    if (e.creditAccount === "accounts_receivable") receivable -= amount;

    if (e.debitAccount === "inventory") inventory += amount;
    if (e.creditAccount === "inventory") inventory -= amount;
  }

  const grossProfit = revenue - cogs;
  const netProfit = grossProfit - expenses;

  const netCash = cashIn - cashOut;

  // -------------------------------------
  // UI
  // -------------------------------------

  root.innerHTML = `
    <div class="finance-dashboard">

      <h2>💰 Financial Dashboard</h2>

      <!-- P&L -->
      <div class="section">
        <h3>📊 Profit & Loss</h3>

        <div class="grid">
          <div>Revenue <b>${f(revenue)}</b></div>
          <div>COGS <b>${f(cogs)}</b></div>
          <div>Expenses <b>${f(expenses)}</b></div>
          <div>Gross Profit <b>${f(grossProfit)}</b></div>
          <div>Net Profit <b>${f(netProfit)}</b></div>
        </div>
      </div>

      <!-- CASH FLOW -->
      <div class="section">
        <h3>💸 Cash Flow</h3>

        <div class="grid">
          <div>Cash In <b>${f(cashIn)}</b></div>
          <div>Cash Out <b>${f(cashOut)}</b></div>
          <div>Net Cash <b>${f(netCash)}</b></div>
        </div>

        <h4>Timeline</h4>
        ${Object.entries(cashTimeline).map(([d, v]) => `
          <div class="row">
            <span>${d}</span>
            <span>+${f(v.in)} / -${f(v.out)}</span>
          </div>
        `).join("")}
      </div>

      <!-- BALANCE SHEET -->
      <div class="section">
        <h3>📑 Balance Sheet</h3>

        <div class="grid">
          <div>Cash <b>${f(cashBalance)}</b></div>
          <div>Receivable <b>${f(receivable)}</b></div>
          <div>Inventory <b>${f(inventory)}</b></div>
          <div>Equity (Est.) <b>${f(cashBalance + receivable + inventory)}</b></div>
        </div>
      </div>

      <!-- SIGNALS -->
      <div class="section">
        <h3>🧠 Signals</h3>
        ${signals({ netProfit, netCash, receivable })}
      </div>

    </div>
  `;
}

// -------------------------------------

function f(n) {
  return new Intl.NumberFormat().format(n || 0);
}

// -------------------------------------

function signals({ netProfit, netCash, receivable }) {
  const s = [];

  if (netProfit < 0) s.push("❌ Business losing money");
  if (netCash < 0) s.push("⚠ Negative cash flow");
  if (receivable > netCash) s.push("⚠ High credit risk");

  if (!s.length) s.push("✔ Financial state healthy");

  return s.map(x => `<div class="signal">${x}</div>`).join("");
}
