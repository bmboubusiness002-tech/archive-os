// -------------------------------------
// FINANCIAL REPORTS (P&L + BALANCE + CASH FLOW)
// -------------------------------------

import { openDB } from "../../infra/db/db.js";
import { LedgerRepo } from "../../domain/ledger/ledger.repo.js";

// -------------------------------------

export async function renderFinancialReports(root) {
  const db = await openDB();
  const ledgerRepo = new LedgerRepo();

  const entries = await ledgerRepo.getAll(db);

  // -------------------------------------
  // CLASSIFICATION
  // -------------------------------------

  let revenue = 0;
  let cogs = 0;
  let expenses = 0;

  let cash = 0;
  let inventory = 0;
  let receivable = 0;

  for (const e of entries) {
    const amount = Number(e.amount || 0);

    // -------- P&L --------
    if (e.creditAccount === "revenue") revenue += amount;
    if (e.debitAccount === "cogs") cogs += amount;
    if (e.debitAccount === "expenses") expenses += amount;

    // -------- BALANCE --------
    if (e.debitAccount === "cash") cash += amount;
    if (e.creditAccount === "cash") cash -= amount;

    if (e.debitAccount === "inventory") inventory += amount;
    if (e.creditAccount === "inventory") inventory -= amount;

    if (e.debitAccount === "accounts_receivable") receivable += amount;
    if (e.creditAccount === "accounts_receivable") receivable -= amount;
  }

  const grossProfit = revenue - cogs;
  const netProfit = grossProfit - expenses;

  // -------------------------------------
  // CASH FLOW (REAL)
  // -------------------------------------

  let cashIn = 0;
  let cashOut = 0;

  for (const e of entries) {
    if (e.debitAccount === "cash") cashIn += e.amount;
    if (e.creditAccount === "cash") cashOut += e.amount;
  }

  const netCash = cashIn - cashOut;

  // -------------------------------------
  // UI
  // -------------------------------------

  root.innerHTML = `
    <div class="financial-reports">

      <h2>📊 Financial Reports</h2>

      <!-- P&L -->
      <div class="section">
        <h3>📈 Profit & Loss</h3>

        ${row("Revenue", revenue)}
        ${row("COGS", -cogs)}
        ${row("Expenses", -expenses)}

        <hr/>

        ${row("Gross Profit", grossProfit, true)}
        ${row("Net Profit", netProfit, true)}
      </div>

      <!-- BALANCE -->
      <div class="section">
        <h3>📊 Balance Sheet</h3>

        ${row("Cash", cash)}
        ${row("Inventory", inventory)}
        ${row("Receivable", receivable)}
      </div>

      <!-- CASH FLOW -->
      <div class="section">
        <h3>💸 Cash Flow</h3>

        ${row("Cash In", cashIn)}
        ${row("Cash Out", -cashOut)}
        ${row("Net Cash", netCash, true)}
      </div>

      <!-- INSIGHTS -->
      <div class="section">
        <h3>🧠 Insights</h3>

        ${generateInsights({
          revenue,
          netProfit,
          cash,
          receivable
        }).map(i => `<div class="insight">${i}</div>`).join("")}

      </div>

    </div>
  `;
}

// -------------------------------------

function row(label, value, strong = false) {
  return `
    <div class="row ${strong ? "strong" : ""}">
      <span>${label}</span>
      <b>${format(value)}</b>
    </div>
  `;
}

function format(n) {
  return new Intl.NumberFormat().format(n || 0);
}

// -------------------------------------

function generateInsights({ revenue, netProfit, cash, receivable }) {
  const insights = [];

  if (netProfit < 0) {
    insights.push("❌ Business is losing money");
  }

  if (cash < 0) {
    insights.push("⚠ Negative cash position");
  }

  if (receivable > revenue * 0.5) {
    insights.push("⚠ High unpaid customer debt");
  }

  if (netProfit > revenue * 0.3) {
    insights.push("💰 Strong profitability");
  }

  if (!insights.length) {
    insights.push("✔ Financials look stable");
  }

  return insights;
}
