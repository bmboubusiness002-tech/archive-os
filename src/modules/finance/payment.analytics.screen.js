// -------------------------------------
// PAYMENT ANALYTICS + CASH FLOW (PRO)
// -------------------------------------

import { openDB } from "../../infra/db/db.js";
import { LedgerRepo } from "../../domain/ledger/ledger.repo.js";

// -------------------------------------

export async function renderPaymentAnalytics(root) {
  const db = await openDB();
  const ledgerRepo = new LedgerRepo();

  const entries = await ledgerRepo.getAll(db);

  // -------------------------------------
  // FILTER PAYMENTS
  // -------------------------------------

  const payments = entries.filter(e => e.type === "PAYMENT");

  let cash = 0;
  let card = 0;
  let credit = 0;

  const timeline = {};

  for (const e of payments) {
    const amount = Number(e.amount || 0);

    // TYPE DETECTION
    if (e.debitAccount === "cash") {
      cash += amount;
    }

    else if (e.debitAccount === "accounts_receivable") {
      credit += amount;
    }

    else {
      card += amount;
    }

    // GROUP BY DAY
    const day = new Date(e.createdAt).toLocaleDateString();

    if (!timeline[day]) {
      timeline[day] = { in: 0 };
    }

    timeline[day].in += amount;
  }

  const total = cash + card + credit;

  // -------------------------------------
  // UI
  // -------------------------------------

  root.innerHTML = `
    <div class="payment-analytics">

      <h2>💳 Payment Analytics</h2>

      <div class="cards">

        <div class="card">
          <span>Cash</span>
          <b>${format(cash)}</b>
        </div>

        <div class="card">
          <span>Card</span>
          <b>${format(card)}</b>
        </div>

        <div class="card">
          <span>Credit</span>
          <b>${format(credit)}</b>
        </div>

        <div class="card">
          <span>Total</span>
          <b>${format(total)}</b>
        </div>

      </div>

      <div class="section">
        <h3>📊 Distribution</h3>

        <div class="bar">
          <div style="width:${percent(cash,total)}%" class="cash"></div>
          <div style="width:${percent(card,total)}%" class="card"></div>
          <div style="width:${percent(credit,total)}%" class="credit"></div>
        </div>

      </div>

      <div class="section">
        <h3>📈 Cash Flow Timeline</h3>

        ${Object.entries(timeline).map(([day, v]) => `
          <div class="row">
            <span>${day}</span>
            <b>${format(v.in)}</b>
          </div>
        `).join("")}

      </div>

      <div class="section">
        <h3>🧠 Signals</h3>
        ${generateSignals(cash, card, credit)}
      </div>

    </div>
  `;
}

// -------------------------------------

function percent(v, total) {
  if (!total) return 0;
  return (v / total) * 100;
}

function format(n) {
  return new Intl.NumberFormat().format(n || 0);
}

// -------------------------------------

function generateSignals(cash, card, credit) {
  const signals = [];

  const total = cash + card + credit;

  if (credit > total * 0.4) {
    signals.push("⚠ High credit usage");
  }

  if (cash > total * 0.7) {
    signals.push("💰 Strong cash flow");
  }

  if (!signals.length) {
    signals.push("✔ Balanced payment distribution");
  }

  return signals.map(s => `<div class="signal">${s}</div>`).join("");
}
